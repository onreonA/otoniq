import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface Role {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  isSystemRole: boolean;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  description?: string;
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  tenantId: string;
  assignedBy?: string;
  assignedAt: string;
  expiresAt?: string;
}

export interface Team {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  managerId?: string;
  isActive: boolean;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

export class RBACService {
  /**
   * Get all roles for a tenant
   */
  static async getRoles(tenantId: string): Promise<Role[]> {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .or(`tenant_id.eq.${tenantId},tenant_id.is.null`)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  /**
   * Create custom role
   */
  static async createRole(
    tenantId: string,
    roleData: {
      name: string;
      description?: string;
      permissions: string[];
    }
  ): Promise<Role> {
    const { data, error } = await supabase
      .from('roles')
      .insert({
        tenant_id: tenantId,
        name: roleData.name,
        description: roleData.description,
        is_system_role: false,
        permissions: roleData.permissions,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Assign role to user
   */
  static async assignRoleToUser(
    userId: string,
    roleId: string,
    tenantId: string,
    expiresAt?: string
  ): Promise<UserRole> {
    const { data, error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: roleId,
        tenant_id: tenantId,
        assigned_by: (await supabase.auth.getUser()).data.user?.id,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Remove role from user
   */
  static async removeRoleFromUser(userRoleId: string): Promise<void> {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('id', userRoleId);

    if (error) throw error;
  }

  /**
   * Check if user has permission
   */
  static async checkPermission(
    userId: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    const { data, error } = await supabase.rpc('check_user_permission', {
      p_user_id: userId,
      p_resource: resource,
      p_action: action,
    });

    if (error) throw error;
    return data || false;
  }

  /**
   * Get user permissions
   */
  static async getUserPermissions(userId: string): Promise<Permission[]> {
    const { data, error } = await supabase.rpc('get_user_permissions', {
      p_user_id: userId,
    });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get all available permissions
   */
  static async getAllPermissions(): Promise<Permission[]> {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('resource, action');

    if (error) throw error;
    return data || [];
  }

  /**
   * Create team
   */
  static async createTeam(
    tenantId: string,
    teamData: {
      name: string;
      description?: string;
      managerId?: string;
    }
  ): Promise<Team> {
    const { data, error } = await supabase
      .from('teams')
      .insert({
        tenant_id: tenantId,
        name: teamData.name,
        description: teamData.description,
        manager_id: teamData.managerId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Add user to team
   */
  static async addUserToTeam(
    teamId: string,
    userId: string,
    role: 'manager' | 'member' | 'viewer' = 'member'
  ): Promise<void> {
    const { error } = await supabase.from('team_members').insert({
      team_id: teamId,
      user_id: userId,
      role,
    });

    if (error) throw error;
  }

  /**
   * Remove user from team
   */
  static async removeUserFromTeam(
    teamId: string,
    userId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  /**
   * Get teams for tenant
   */
  static async getTeams(tenantId: string): Promise<Team[]> {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  /**
   * Get team members
   */
  static async getTeamMembers(teamId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*, user:users(*)')
      .eq('team_id', teamId);

    if (error) throw error;
    return data || [];
  }
}
