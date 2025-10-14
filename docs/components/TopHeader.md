# TopHeader Component

Main header component for the Otoniq.ai platform with navigation, search, and user controls.

## Overview

The `TopHeader` component provides the main navigation header with search functionality, notifications, user profile, and responsive design. It integrates with the sidebar system and provides consistent navigation across the platform.

## Features

- **Search Functionality**: Global search with placeholder text
- **Notifications**: Notification center with badge count
- **User Profile**: User menu with profile actions
- **Responsive Design**: Adapts to different screen sizes
- **Theme Integration**: Supports light/dark/minimal themes
- **Mobile Support**: Mobile-optimized layout

## Usage

```tsx
import { TopHeader } from '@/presentation/components/layout/TopHeader';

function Layout() {
  return (
    <div className='flex flex-col h-screen'>
      <TopHeader />
      <main className='flex-1'>{/* Your main content */}</main>
    </div>
  );
}
```

## Props

The TopHeader component doesn't accept any props. It uses the following stores:

- `useUIStore`: For sidebar state management
- `useAuth`: For user authentication and profile information

## State Management

### UI Store Integration

```tsx
const {
  sidebarCollapsed,
  toggleSidebar,
  mobileSidebarOpen,
  toggleMobileSidebar,
} = useUIStore();

// Toggle desktop sidebar
toggleSidebar();

// Toggle mobile sidebar
toggleMobileSidebar();
```

### Auth Integration

```tsx
const { userProfile, logout } = useAuth();

// Access user information
const { name, email, role } = userProfile;

// Handle logout
const handleLogout = () => {
  logout();
};
```

## Components Structure

### Search Bar

- Global search input with placeholder
- Search icon for visual clarity
- Responsive design

### Notifications

- Notification bell icon with badge
- Dropdown menu with notification items
- Real-time notification updates

### User Profile

- User avatar and name
- Dropdown menu with profile actions
- Role-based menu items

## Responsive Behavior

### Desktop (md and up)

- Full header with all elements
- Sidebar toggle button
- Complete user menu

### Mobile (below md)

- Compact layout
- Mobile menu toggle
- Simplified user controls

## Styling

The header uses Tailwind CSS classes:

- **Background**: `bg-gray-900` (dark theme)
- **Borders**: `border-b border-gray-800`
- **Search**: `bg-gray-800 border-gray-700`
- **Dropdowns**: `bg-gray-900 border-gray-800`

## Accessibility

- **ARIA Labels**: Proper labeling for all interactive elements
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Proper focus handling
- **Screen Reader Support**: Semantic HTML structure

## Testing

The component includes comprehensive tests:

```bash
npm run test src/presentation/components/layout/__tests__/TopHeader.test.tsx
```

Test coverage includes:

- Rendering with different states
- User profile display
- Notification functionality
- Mobile responsiveness
- Dropdown interactions

## Examples

### Basic Usage

```tsx
import { TopHeader } from '@/presentation/components/layout/TopHeader';

function Layout() {
  return (
    <div className='flex flex-col h-screen'>
      <TopHeader />
      <main className='flex-1 p-6'>{/* Content */}</main>
    </div>
  );
}
```

### With Custom Styling

```tsx
<div className='flex flex-col h-screen bg-gray-50'>
  <div className='bg-white shadow-sm'>
    <TopHeader />
  </div>
  <main className='flex-1'>{/* Content */}</main>
</div>
```

## Search Functionality

The search bar provides global search capabilities:

```tsx
// Search implementation
const handleSearch = (query: string) => {
  // Implement search logic
  console.log('Searching for:', query);
};
```

## Notifications

Notification system with real-time updates:

```tsx
const notifications = [
  {
    id: '1',
    title: 'New Order',
    message: 'Order #12345 has been placed',
    time: '2 minutes ago',
    unread: true,
  },
];
```

## User Menu

User profile dropdown with actions:

```tsx
const userMenuItems = [
  { label: 'Profile', icon: 'User', action: () => {} },
  { label: 'Settings', icon: 'Settings', action: () => {} },
  { label: 'Logout', icon: 'LogOut', action: logout },
];
```

## Troubleshooting

### Common Issues

1. **Search not working**: Check search implementation
2. **Notifications not showing**: Verify notification data
3. **User menu not opening**: Check click handlers
4. **Mobile layout issues**: Check responsive breakpoints

### Debug Mode

Enable debug logging:

```tsx
// In development
localStorage.setItem('otoniq-debug', 'true');
```

## Related Components

- `Sidebar`: Main navigation sidebar
- `MobileSidebar`: Mobile-specific sidebar
- `Breadcrumb`: Navigation breadcrumbs
- `PageTransition`: Page transition animations
