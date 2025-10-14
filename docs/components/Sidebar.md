# Sidebar Component

Collapsible sidebar with role-based navigation for the Otoniq.ai platform.

## Overview

The `Sidebar` component provides a responsive, collapsible navigation sidebar that adapts to different user roles and screen sizes. It includes role-based menu rendering, theme support, and mobile responsiveness.

## Features

- **Role-based Navigation**: Different menu items based on user role (super_admin, tenant_admin)
- **Collapsible Design**: Can be collapsed to save screen space
- **Mobile Responsive**: Automatically adapts to mobile screens
- **Theme Support**: Integrates with the theme system
- **Nested Menus**: Supports multi-level menu structures
- **Active State**: Highlights current page/route

## Usage

```tsx
import { Sidebar } from '@/presentation/components/layout/Sidebar';

function App() {
  return (
    <div className='flex'>
      <Sidebar />
      <main>{/* Your main content */}</main>
    </div>
  );
}
```

## Props

The Sidebar component doesn't accept any props. It uses the following stores:

- `useUIStore`: For sidebar state management
- `useAuth`: For user authentication and role information
- `usePermissionStore`: For role-based access control

## State Management

### UI Store Integration

```tsx
const { sidebarCollapsed, toggleSidebar } = useUIStore();

// Toggle sidebar
toggleSidebar();

// Check if collapsed
if (sidebarCollapsed) {
  // Handle collapsed state
}
```

### Theme Integration

The sidebar automatically adapts to the current theme:

```tsx
const { currentTheme } = useThemeStore();

// Themes: 'light', 'dark', 'minimal'
const theme = currentTheme();
```

## Menu Configuration

Menus are configured in `src/presentation/config/menuConfig.ts`:

```tsx
export const getMenuConfig = (role: string) => {
  const configs = {
    super_admin: [
      {
        id: 'dashboard',
        name: 'Dashboard',
        icon: 'LayoutDashboard',
        path: '/dashboard',
        // ... other properties
      },
    ],
    tenant_admin: [
      // ... tenant-specific menu items
    ],
  };

  return configs[role] || [];
};
```

## Responsive Behavior

### Desktop (md and up)

- Full sidebar with text labels
- Collapsible to icon-only mode
- Fixed positioning

### Mobile (below md)

- Hidden by default
- Toggleable via mobile menu button
- Overlay positioning

## Styling

The sidebar uses Tailwind CSS classes and supports:

- **Background**: `bg-gray-900` (dark theme)
- **Borders**: `border-r border-gray-800`
- **Transitions**: Smooth animations for collapse/expand
- **Hover Effects**: Interactive states for menu items

## Accessibility

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Proper focus handling
- **Color Contrast**: Meets WCAG guidelines

## Testing

The component includes comprehensive tests:

```bash
npm run test src/presentation/components/layout/__tests__/Sidebar.test.tsx
```

Test coverage includes:

- Rendering with different states
- Role-based menu rendering
- User profile display
- Responsive behavior

## Examples

### Basic Usage

```tsx
import { Sidebar } from '@/presentation/components/layout/Sidebar';

function Layout() {
  return (
    <div className='flex h-screen'>
      <Sidebar />
      <main className='flex-1'>{/* Content */}</main>
    </div>
  );
}
```

### With Custom Styling

```tsx
<div className='flex h-screen'>
  <div className='w-64'>
    <Sidebar />
  </div>
  <main className='flex-1 bg-gray-50'>{/* Content */}</main>
</div>
```

## Troubleshooting

### Common Issues

1. **Menu items not showing**: Check user role and permissions
2. **Sidebar not collapsing**: Verify UI store integration
3. **Mobile menu not working**: Check responsive breakpoints

### Debug Mode

Enable debug logging:

```tsx
// In development
localStorage.setItem('otoniq-debug', 'true');
```

## Related Components

- `TopHeader`: Main header component
- `MobileSidebar`: Mobile-specific sidebar
- `Breadcrumb`: Navigation breadcrumbs
- `PageTransition`: Page transition animations
