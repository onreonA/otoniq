/**
 * Sidebar Component
 * Collapsible sidebar with role-based navigation
 */

import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Shield,
  Building2,
  Users,
  Package,
  BarChart3,
  Settings,
  ShoppingCart,
  Store,
  Database,
  Workflow,
  Bot,
  Brain,
  Image,
  UserCircle,
  List,
  FolderTree,
  ShoppingBag,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Zap,
  Palette,
  MessageSquare,
  Glasses,
  Activity,
  Puzzle,
  Server,
  Building,
  Bell,
  Share2,
  Mail,
  Target,
  MapPin,
  Folder,
  Linkedin,
} from 'lucide-react';
import { useState, useEffect, memo, useMemo, useCallback } from 'react';
import { useUIStore } from '../../store/ui/uiStore';
import { useAuth } from '../../hooks/useAuth';
import { usePermissionStore } from '../../store/auth/permissionStore';
import { getMenuConfig } from '../../config/menuConfig';
import type { MenuItem, MenuGroup } from '../../store/ui/uiStore.types';

/**
 * Icon mapping for Lucide icons
 */
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Shield,
  Building2,
  Users,
  Package,
  BarChart3,
  Settings,
  ShoppingCart,
  Store,
  Database,
  Workflow,
  Bot,
  Brain,
  Image,
  UserCircle,
  Puzzle,
  Server,
  Building,
  List,
  FolderTree,
  ShoppingBag,
  TrendingUp,
  Zap,
  Palette,
  MessageSquare,
  Glasses,
  Activity,
  Bell,
  Share2,
  Mail,
  Target,
  MapPin,
  Folder,
  Linkedin,
};

/**
 * Menu Item Component
 */
function MenuItemComponent({
  item,
  collapsed,
  depth = 0,
}: {
  item: MenuItem;
  collapsed: boolean;
  depth?: number;
}) {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  // Check if this item or any of its children is active
  const isActive = location.pathname === item.path;
  const isChildActive =
    hasChildren &&
    item.children?.some(
      child =>
        location.pathname === child.path ||
        child.children?.some(
          grandchild => location.pathname === grandchild.path
        )
    );

  // Auto-expand parent items if a child is active
  useEffect(() => {
    if (isChildActive && !isExpanded) {
      setIsExpanded(true);
    }
  }, [isChildActive, location.pathname]);

  const Icon = iconMap[item.icon] || Package;

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const paddingLeft = collapsed ? 'pl-4' : `pl-${4 + depth * 4}`;

  // Determine active state styling
  const activeStyle = isActive
    ? 'bg-indigo-600 text-white'
    : isChildActive
      ? 'bg-gray-800 text-white'
      : 'text-gray-300 hover:bg-gray-800';

  return (
    <div>
      {item.path && !hasChildren ? (
        <Link
          to={item.path}
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
            ${activeStyle}
            ${collapsed ? 'justify-center' : ''}
          `}
          title={collapsed ? item.label : undefined}
        >
          <Icon className='w-5 h-5 flex-shrink-0' />
          <div
            className={`
              flex-1 flex items-center justify-between
              transition-all duration-300 ease-in-out overflow-hidden
              ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}
            `}
          >
            <span className='text-sm font-medium whitespace-nowrap'>
              {item.label}
            </span>
            {item.badge && (
              <span className='px-2 py-0.5 text-xs font-semibold bg-indigo-500 text-white rounded ml-1'>
                {typeof item.badge === 'string'
                  ? item.badge.toUpperCase()
                  : item.badge}
              </span>
            )}
          </div>
        </Link>
      ) : (
        <button
          onClick={handleClick}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
            ${isChildActive ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800'}
            ${collapsed ? 'justify-center' : ''}
          `}
          title={collapsed ? item.label : undefined}
        >
          <Icon className='w-5 h-5 flex-shrink-0' />
          <div
            className={`
              flex-1 flex items-center justify-between
              transition-all duration-300 ease-in-out overflow-hidden
              ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}
            `}
          >
            <span className='flex-1 text-sm font-medium text-left whitespace-nowrap'>
              {item.label}
            </span>
            {item.badge && (
              <span className='px-2 py-0.5 text-xs font-semibold bg-indigo-500 text-white rounded ml-1'>
                {typeof item.badge === 'string'
                  ? item.badge.toUpperCase()
                  : item.badge}
              </span>
            )}
            {hasChildren && (
              <div className='ml-1'>
                {isExpanded ? (
                  <ChevronDown className='w-4 h-4' />
                ) : (
                  <ChevronRight className='w-4 h-4' />
                )}
              </div>
            )}
          </div>
        </button>
      )}

      {/* Children */}
      {hasChildren && !collapsed && (
        <div
          className={`
            mt-1 space-y-1 pl-2 border-l border-gray-700 ml-4
            transition-all duration-300 ease-in-out origin-top
            ${
              isExpanded
                ? 'max-h-96 opacity-100 transform scale-y-100'
                : 'max-h-0 opacity-0 transform scale-y-0 overflow-hidden'
            }
          `}
        >
          {item.children!.map(child => (
            <MenuItemComponent
              key={child.id}
              item={child}
              collapsed={collapsed}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Menu Group Component
 */
function MenuGroupComponent({
  group,
  collapsed,
}: {
  group: MenuGroup;
  collapsed: boolean;
}) {
  return (
    <div className='mb-4'>
      <h3
        className={`
          px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider
          transition-all duration-300 ease-in-out
          ${
            collapsed
              ? 'opacity-0 max-h-0 overflow-hidden'
              : 'opacity-100 max-h-6'
          }
        `}
      >
        {group.label}
      </h3>
      <div className='space-y-1'>
        {group.items.map(item => (
          <MenuItemComponent key={item.id} item={item} collapsed={collapsed} />
        ))}
      </div>
    </div>
  );
}

/**
 * Sidebar Component
 */
const Sidebar = memo(function Sidebar() {
  const { sidebarCollapsed } = useUIStore();
  const { userProfile } = useAuth();
  const { hasRole } = usePermissionStore();

  // Get menu configuration based on user role
  const role = userProfile?.role || 'tenant_admin';
  const menuGroups = useMemo(() => getMenuConfig(role), [role]);

  // Filter menu groups and items based on roles
  const filteredMenuGroups = useMemo(
    () =>
      menuGroups
        .filter(group => !group.roles || group.roles.some(r => hasRole(r)))
        .map(group => ({
          ...group,
          items: group.items.filter(
            item => !item.roles || item.roles.some(r => hasRole(r))
          ),
        }))
        .filter(group => group.items.length > 0),
    [menuGroups, hasRole]
  );

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen bg-gray-900 border-r border-gray-800
        transition-all duration-300 ease-in-out z-30 flex flex-col
        ${sidebarCollapsed ? 'w-16' : 'w-64'}
        hidden md:flex
      `}
    >
      {/* Logo */}
      <div className='h-14 flex items-center justify-center border-b border-gray-800 flex-shrink-0'>
        <div className='flex items-center gap-2'>
          <div className='w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0'>
            <span className='text-white font-bold text-base'>O</span>
          </div>
          <span
            className={`
              text-white font-bold text-lg whitespace-nowrap
              transition-all duration-300 ease-in-out
              ${sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}
            `}
          >
            Otoniq.ai
          </span>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <nav className='flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900'>
        {filteredMenuGroups.map(group => (
          <MenuGroupComponent
            key={group.id}
            group={group}
            collapsed={sidebarCollapsed}
          />
        ))}
      </nav>

      {/* User Profile (Bottom) - Fixed */}
      <div
        className={`
          flex-shrink-0 border-t border-gray-800 bg-gray-900
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'p-2' : 'p-3'}
        `}
      >
        <div
          className={`
          flex items-center gap-2
          ${sidebarCollapsed ? 'justify-center' : ''}
        `}
        >
          <div className='w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0'>
            <span className='text-white font-semibold text-sm'>
              {userProfile?.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div
            className={`
              flex-1 min-w-0
              transition-all duration-300 ease-in-out
              ${sidebarCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}
            `}
          >
            <p className='text-sm font-medium text-white truncate'>
              {userProfile?.email || 'User'}
            </p>
            <p className='text-xs text-gray-400 truncate'>
              {role === 'super_admin' ? 'Super Admin' : 'Tenant Admin'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
});

export { Sidebar };
