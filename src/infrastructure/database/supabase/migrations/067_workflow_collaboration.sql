-- Workflow Collaboration System
-- Team management and workflow collaboration

-- Workflow Teams
CREATE TABLE IF NOT EXISTS workflow_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  team_type TEXT NOT NULL CHECK (team_type IN ('development', 'operations', 'analytics', 'management', 'custom')),
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT 'ri-team-line',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Members
CREATE TABLE IF NOT EXISTS workflow_team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES workflow_teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer', 'contributor')),
  permissions JSONB DEFAULT '{}',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow Sharing
CREATE TABLE IF NOT EXISTS workflow_sharing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES n8n_workflows(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  shared_with_team_id UUID REFERENCES workflow_teams(id) ON DELETE CASCADE,
  permission_level TEXT NOT NULL CHECK (permission_level IN ('view', 'edit', 'admin', 'owner')),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_shared_with CHECK (
    (shared_with_user_id IS NOT NULL AND shared_with_team_id IS NULL) OR
    (shared_with_user_id IS NULL AND shared_with_team_id IS NOT NULL)
  )
);

-- Workflow Comments
CREATE TABLE IF NOT EXISTS workflow_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES n8n_workflows(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES workflow_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  comment_type TEXT NOT NULL CHECK (comment_type IN ('general', 'suggestion', 'question', 'bug_report', 'feature_request')),
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  mentions JSONB DEFAULT '[]',
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow Activity Log
CREATE TABLE IF NOT EXISTS workflow_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES n8n_workflows(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'created', 'updated', 'deleted', 'executed', 'shared', 'commented',
    'approved', 'rejected', 'published', 'archived', 'restored'
  )),
  activity_description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow Reviews
CREATE TABLE IF NOT EXISTS workflow_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES n8n_workflows(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  review_type TEXT NOT NULL CHECK (review_type IN ('code_review', 'security_review', 'performance_review', 'compliance_review')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'needs_changes')),
  review_notes TEXT,
  feedback JSONB DEFAULT '{}',
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow Approvals
CREATE TABLE IF NOT EXISTS workflow_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES n8n_workflows(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  approval_type TEXT NOT NULL CHECK (approval_type IN ('deployment', 'publish', 'share', 'delete', 'modify')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  approval_notes TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow Notifications
CREATE TABLE IF NOT EXISTS workflow_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES n8n_workflows(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'workflow_shared', 'workflow_updated', 'workflow_executed', 'workflow_failed',
    'comment_added', 'review_requested', 'approval_requested', 'approval_granted',
    'team_invitation', 'permission_changed'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow Templates (for team templates)
CREATE TABLE IF NOT EXISTS team_workflow_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES workflow_teams(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  template_description TEXT,
  workflow_data JSONB NOT NULL,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflow_teams_tenant ON workflow_teams(tenant_id);
CREATE INDEX IF NOT EXISTS idx_workflow_teams_active ON workflow_teams(is_active);

CREATE INDEX IF NOT EXISTS idx_workflow_team_members_team ON workflow_team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_workflow_team_members_user ON workflow_team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_team_members_active ON workflow_team_members(is_active);

CREATE INDEX IF NOT EXISTS idx_workflow_sharing_workflow ON workflow_sharing(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_sharing_user ON workflow_sharing(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_sharing_team ON workflow_sharing(shared_with_team_id);
CREATE INDEX IF NOT EXISTS idx_workflow_sharing_active ON workflow_sharing(is_active);

CREATE INDEX IF NOT EXISTS idx_workflow_comments_workflow ON workflow_comments(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_comments_user ON workflow_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_comments_parent ON workflow_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_workflow_comments_resolved ON workflow_comments(is_resolved);

CREATE INDEX IF NOT EXISTS idx_workflow_activity_workflow ON workflow_activity_log(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_activity_user ON workflow_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_activity_type ON workflow_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_workflow_activity_created ON workflow_activity_log(created_at);

CREATE INDEX IF NOT EXISTS idx_workflow_reviews_workflow ON workflow_reviews(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_reviews_reviewer ON workflow_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_workflow_reviews_status ON workflow_reviews(status);

CREATE INDEX IF NOT EXISTS idx_workflow_approvals_workflow ON workflow_approvals(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_approvals_approver ON workflow_approvals(approver_id);
CREATE INDEX IF NOT EXISTS idx_workflow_approvals_status ON workflow_approvals(status);

CREATE INDEX IF NOT EXISTS idx_workflow_notifications_user ON workflow_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_notifications_read ON workflow_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_workflow_notifications_type ON workflow_notifications(notification_type);

CREATE INDEX IF NOT EXISTS idx_team_workflow_templates_team ON team_workflow_templates(team_id);
CREATE INDEX IF NOT EXISTS idx_team_workflow_templates_public ON team_workflow_templates(is_public);

-- RLS Policies
ALTER TABLE workflow_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_sharing ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_workflow_templates ENABLE ROW LEVEL SECURITY;

-- Teams Policies
CREATE POLICY "Users can view their tenant teams" ON workflow_teams
  FOR SELECT USING (auth.jwt() ->> 'tenant_id' = tenant_id::text);

CREATE POLICY "Users can create teams in their tenant" ON workflow_teams
  FOR INSERT WITH CHECK (auth.jwt() ->> 'tenant_id' = tenant_id::text);

CREATE POLICY "Team owners can update their teams" ON workflow_teams
  FOR UPDATE USING (
    auth.jwt() ->> 'tenant_id' = tenant_id::text AND
    created_by = (auth.jwt() ->> 'sub')::uuid
  );

-- Team Members Policies
CREATE POLICY "Users can view team members of their teams" ON workflow_team_members
  FOR SELECT USING (
    team_id IN (
      SELECT id FROM workflow_teams 
      WHERE tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    )
  );

CREATE POLICY "Team owners can manage team members" ON workflow_team_members
  FOR ALL USING (
    team_id IN (
      SELECT id FROM workflow_teams 
      WHERE tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
      AND created_by = (auth.jwt() ->> 'sub')::uuid
    )
  );

-- Workflow Sharing Policies
CREATE POLICY "Users can view shared workflows" ON workflow_sharing
  FOR SELECT USING (
    shared_with_user_id = (auth.jwt() ->> 'sub')::uuid OR
    shared_with_team_id IN (
      SELECT team_id FROM workflow_team_members 
      WHERE user_id = (auth.jwt() ->> 'sub')::uuid
    )
  );

CREATE POLICY "Users can share workflows they own" ON workflow_sharing
  FOR INSERT WITH CHECK (
    shared_by = (auth.jwt() ->> 'sub')::uuid AND
    workflow_id IN (
      SELECT id FROM n8n_workflows 
      WHERE tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    )
  );

-- Comments Policies
CREATE POLICY "Users can view comments on accessible workflows" ON workflow_comments
  FOR SELECT USING (
    workflow_id IN (
      SELECT id FROM n8n_workflows 
      WHERE tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    )
  );

CREATE POLICY "Users can create comments on accessible workflows" ON workflow_comments
  FOR INSERT WITH CHECK (
    user_id = (auth.jwt() ->> 'sub')::uuid AND
    workflow_id IN (
      SELECT id FROM n8n_workflows 
      WHERE tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    )
  );

-- Activity Log Policies
CREATE POLICY "Users can view activity for their tenant workflows" ON workflow_activity_log
  FOR SELECT USING (
    workflow_id IN (
      SELECT id FROM n8n_workflows 
      WHERE tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    )
  );

-- Reviews Policies
CREATE POLICY "Users can view reviews for their tenant workflows" ON workflow_reviews
  FOR SELECT USING (
    workflow_id IN (
      SELECT id FROM n8n_workflows 
      WHERE tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    )
  );

CREATE POLICY "Users can create reviews for accessible workflows" ON workflow_reviews
  FOR INSERT WITH CHECK (
    reviewer_id = (auth.jwt() ->> 'sub')::uuid AND
    workflow_id IN (
      SELECT id FROM n8n_workflows 
      WHERE tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    )
  );

-- Approvals Policies
CREATE POLICY "Users can view approvals for their tenant workflows" ON workflow_approvals
  FOR SELECT USING (
    workflow_id IN (
      SELECT id FROM n8n_workflows 
      WHERE tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    )
  );

CREATE POLICY "Users can create approvals for accessible workflows" ON workflow_approvals
  FOR INSERT WITH CHECK (
    approver_id = (auth.jwt() ->> 'sub')::uuid AND
    workflow_id IN (
      SELECT id FROM n8n_workflows 
      WHERE tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    )
  );

-- Notifications Policies
CREATE POLICY "Users can view their own notifications" ON workflow_notifications
  FOR SELECT USING (user_id = (auth.jwt() ->> 'sub')::uuid);

CREATE POLICY "Users can update their own notifications" ON workflow_notifications
  FOR UPDATE USING (user_id = (auth.jwt() ->> 'sub')::uuid);

-- Team Templates Policies
CREATE POLICY "Users can view team templates" ON team_workflow_templates
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM workflow_team_members 
      WHERE user_id = (auth.jwt() ->> 'sub')::uuid
    ) OR is_public = true
  );

CREATE POLICY "Team members can create templates" ON team_workflow_templates
  FOR INSERT WITH CHECK (
    created_by = (auth.jwt() ->> 'sub')::uuid AND
    team_id IN (
      SELECT team_id FROM workflow_team_members 
      WHERE user_id = (auth.jwt() ->> 'sub')::uuid
    )
  );

-- Functions for collaboration
CREATE OR REPLACE FUNCTION get_workflow_collaborators(
  p_workflow_id UUID
)
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  role TEXT,
  permission_level TEXT,
  joined_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.full_name as user_name,
    p.email as user_email,
    COALESCE(wtm.role, 'viewer') as role,
    COALESCE(ws.permission_level, 'view') as permission_level,
    COALESCE(wtm.joined_at, ws.created_at) as joined_at
  FROM profiles p
  LEFT JOIN workflow_team_members wtm ON p.id = wtm.user_id
  LEFT JOIN workflow_teams wt ON wtm.team_id = wt.id
  LEFT JOIN workflow_sharing ws ON p.id = ws.shared_with_user_id
  WHERE ws.workflow_id = p_workflow_id OR wt.id IN (
    SELECT team_id FROM workflow_sharing 
    WHERE workflow_id = p_workflow_id AND shared_with_team_id IS NOT NULL
  )
  GROUP BY p.id, p.full_name, p.email, wtm.role, ws.permission_level, wtm.joined_at, ws.created_at;
END;
$$ LANGUAGE plpgsql;

-- Function to get workflow activity feed
CREATE OR REPLACE FUNCTION get_workflow_activity_feed(
  p_workflow_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  activity_type TEXT,
  activity_description TEXT,
  user_name TEXT,
  user_email TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wal.id,
    wal.activity_type,
    wal.activity_description,
    p.full_name as user_name,
    p.email as user_email,
    wal.metadata,
    wal.created_at
  FROM workflow_activity_log wal
  JOIN profiles p ON wal.user_id = p.id
  WHERE wal.workflow_id = p_workflow_id
  ORDER BY wal.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get user notifications
CREATE OR REPLACE FUNCTION get_user_notifications(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  notification_type TEXT,
  title TEXT,
  message TEXT,
  is_read BOOLEAN,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wn.id,
    wn.notification_type,
    wn.title,
    wn.message,
    wn.is_read,
    wn.action_url,
    wn.created_at
  FROM workflow_notifications wn
  WHERE wn.user_id = p_user_id
  ORDER BY wn.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to create team invitation
CREATE OR REPLACE FUNCTION create_team_invitation(
  p_team_id UUID,
  p_invited_user_id UUID,
  p_role TEXT,
  p_invited_by UUID
)
RETURNS UUID AS $$
DECLARE
  v_member_id UUID;
BEGIN
  INSERT INTO workflow_team_members (
    team_id,
    user_id,
    role,
    invited_by
  ) VALUES (
    p_team_id,
    p_invited_user_id,
    p_role,
    p_invited_by
  ) RETURNING id INTO v_member_id;

  -- Create notification
  INSERT INTO workflow_notifications (
    user_id,
    notification_type,
    title,
    message,
    action_url
  ) VALUES (
    p_invited_user_id,
    'team_invitation',
    'Team Daveti',
    'Yeni bir takıma davet edildiniz',
    '/teams/' || p_team_id
  );

  RETURN v_member_id;
END;
$$ LANGUAGE plpgsql;

-- Function to log workflow activity
CREATE OR REPLACE FUNCTION log_workflow_activity(
  p_workflow_id UUID,
  p_user_id UUID,
  p_activity_type TEXT,
  p_activity_description TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO workflow_activity_log (
    workflow_id,
    user_id,
    activity_type,
    activity_description,
    metadata
  ) VALUES (
    p_workflow_id,
    p_user_id,
    p_activity_type,
    p_activity_description,
    p_metadata
  ) RETURNING id INTO v_activity_id;

  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql;
