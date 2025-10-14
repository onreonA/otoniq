# UI Store

Zustand-based state management for UI components in the Otoniq.ai platform.

## Overview

The UI Store manages global UI state including sidebar collapse/expand, mobile menu visibility, and other UI-related state. It provides a centralized way to manage UI state across the application.

## Features

- **Sidebar Management**: Collapse/expand functionality
- **Mobile Menu**: Mobile sidebar state management
- **Persistence**: State persistence to localStorage
- **TypeScript Support**: Full type safety
- **Zustand Integration**: Lightweight state management

## Usage

```tsx
import { useUIStore } from '@/presentation/store/ui/uiStore';

function MyComponent() {
  const {
    sidebarCollapsed,
    toggleSidebar,
    mobileSidebarOpen,
    toggleMobileSidebar,
  } = useUIStore();

  return (
    <div>
      <button onClick={toggleSidebar}>
        {sidebarCollapsed ? 'Expand' : 'Collapse'}
      </button>
    </div>
  );
}
```

## State Interface

```tsx
interface UIState {
  // State
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleMobileSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
}
```

## Actions

### Sidebar Management

```tsx
const { sidebarCollapsed, toggleSidebar, setSidebarCollapsed } = useUIStore();

// Toggle sidebar state
toggleSidebar();

// Set specific state
setSidebarCollapsed(true);
setSidebarCollapsed(false);

// Check current state
if (sidebarCollapsed) {
  // Handle collapsed state
}
```

### Mobile Menu Management

```tsx
const { mobileSidebarOpen, toggleMobileSidebar, setMobileSidebarOpen } =
  useUIStore();

// Toggle mobile menu
toggleMobileSidebar();

// Set specific state
setMobileSidebarOpen(true);
setMobileSidebarOpen(false);

// Check current state
if (mobileSidebarOpen) {
  // Handle mobile menu open
}
```

## Persistence

The store automatically persists certain state to localStorage:

```tsx
// Persisted state
{
  sidebarCollapsed: boolean;
}

// Not persisted (session-only)
{
  sidebarMobileOpen: boolean;
}
```

### Storage Key

- **Storage Key**: `otoniq-ui-storage`
- **Persisted Fields**: `sidebarCollapsed`

## Examples

### Basic Usage

```tsx
import { useUIStore } from '@/presentation/store/ui/uiStore';

function SidebarToggle() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <button
      onClick={toggleSidebar}
      className='p-2 rounded-lg hover:bg-gray-800'
    >
      {sidebarCollapsed ? '→' : '←'}
    </button>
  );
}
```

### Conditional Rendering

```tsx
function Sidebar() {
  const { sidebarCollapsed } = useUIStore();

  return (
    <aside
      className={`transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Sidebar content */}
    </aside>
  );
}
```

### Mobile Menu

```tsx
function MobileMenu() {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useUIStore();

  const closeMenu = () => setMobileSidebarOpen(false);

  return (
    <>
      {mobileSidebarOpen && (
        <div className='fixed inset-0 z-50'>
          <div className='absolute inset-0 bg-black/50' onClick={closeMenu} />
          <div className='relative z-10'>{/* Mobile menu content */}</div>
        </div>
      )}
    </>
  );
}
```

## Testing

The store includes comprehensive tests:

```bash
npm run test src/presentation/store/ui/__tests__/uiStore.test.ts
```

Test coverage includes:

- State initialization
- Action functionality
- Persistence behavior
- Error handling

## Best Practices

### 1. Use Selectors for Performance

```tsx
// Good: Only subscribe to specific state
const sidebarCollapsed = useUIStore(state => state.sidebarCollapsed);

// Avoid: Subscribing to entire state
const { sidebarCollapsed } = useUIStore();
```

### 2. Batch Updates

```tsx
// Good: Single state update
setSidebarCollapsed(true);

// Avoid: Multiple separate updates
toggleSidebar();
toggleSidebar();
```

### 3. Handle Loading States

```tsx
function MyComponent() {
  const { sidebarCollapsed } = useUIStore();

  // Handle loading state
  if (typeof sidebarCollapsed === 'undefined') {
    return <div>Loading...</div>;
  }

  return <div>{sidebarCollapsed ? 'Collapsed' : 'Expanded'}</div>;
}
```

## Troubleshooting

### Common Issues

1. **State not updating**: Check if component is wrapped in provider
2. **Persistence not working**: Verify localStorage is available
3. **Type errors**: Ensure proper TypeScript configuration

### Debug Mode

Enable debug logging:

```tsx
// In development
localStorage.setItem('otoniq-debug', 'true');

// Check current state
console.log(useUIStore.getState());
```

## Related Stores

- `useThemeStore`: Theme management
- `useAuth`: Authentication state
- `usePermissionStore`: Role-based permissions
