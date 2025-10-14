# Theme Store

Zustand-based theme management for the Otoniq.ai platform with system theme detection and persistence.

## Overview

The Theme Store manages application themes including light, dark, minimal, and system themes. It provides automatic system theme detection, theme persistence, and CSS class management for seamless theme switching.

## Features

- **Multiple Themes**: Light, dark, minimal, and system themes
- **System Detection**: Automatic system theme detection
- **Persistence**: Theme preference persistence to localStorage
- **CSS Integration**: Automatic CSS class management
- **TypeScript Support**: Full type safety
- **Zustand Integration**: Lightweight state management

## Usage

```tsx
import { useThemeStore } from '@/presentation/store/theme/themeStore';

function ThemeToggle() {
  const { mode, setMode, currentTheme } = useThemeStore();

  return (
    <select value={mode} onChange={e => setMode(e.target.value)}>
      <option value='light'>Light</option>
      <option value='dark'>Dark</option>
      <option value='minimal'>Minimal</option>
      <option value='system'>System</option>
    </select>
  );
}
```

## State Interface

```tsx
interface ThemeState {
  // State
  mode: ThemeMode;
  systemTheme: 'light' | 'dark';

  // Actions
  setMode: (mode: ThemeMode) => void;
  setSystemTheme: (theme: 'light' | 'dark') => void;

  // Computed
  currentTheme: () => 'light' | 'dark' | 'minimal';
}

type ThemeMode = 'light' | 'dark' | 'minimal' | 'system';
```

## Actions

### Theme Mode Management

```tsx
const { mode, setMode } = useThemeStore();

// Set specific theme mode
setMode('light');
setMode('dark');
setMode('minimal');
setMode('system');

// Check current mode
if (mode === 'system') {
  // Handle system theme mode
}
```

### System Theme Management

```tsx
const { systemTheme, setSystemTheme } = useThemeStore();

// Set system theme
setSystemTheme('light');
setSystemTheme('dark');

// Check system theme
if (systemTheme === 'dark') {
  // Handle dark system theme
}
```

### Current Theme Computation

```tsx
const { currentTheme } = useThemeStore();

// Get computed current theme
const theme = currentTheme(); // 'light' | 'dark' | 'minimal'

// Use in components
const isDark = theme === 'dark';
const isLight = theme === 'light';
const isMinimal = theme === 'minimal';
```

## CSS Integration

The store automatically manages CSS classes on the document element:

```css
/* Light theme */
.theme-light {
  --bg-primary: #ffffff;
  --text-primary: #000000;
}

/* Dark theme */
.theme-dark {
  --bg-primary: #1a1a1a;
  --text-primary: #ffffff;
}

/* Minimal theme */
.theme-minimal {
  --bg-primary: #f8f9fa;
  --text-primary: #495057;
}
```

## Persistence

The store automatically persists theme preferences:

```tsx
// Persisted state
{
  mode: ThemeMode;
}

// Not persisted (computed)
{
  systemTheme: 'light' | 'dark';
}
```

### Storage Key

- **Storage Key**: `otoniq-theme-storage`
- **Persisted Fields**: `mode`

## Examples

### Basic Usage

```tsx
import { useThemeStore } from '@/presentation/store/theme/themeStore';

function ThemeButton() {
  const { mode, setMode } = useThemeStore();

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'minimal', 'system'] as const;
    const currentIndex = themes.indexOf(mode);
    const nextIndex = (currentIndex + 1) % themes.length;
    setMode(themes[nextIndex]);
  };

  return <button onClick={cycleTheme}>Current: {mode}</button>;
}
```

### Theme-Aware Components

```tsx
function ThemedComponent() {
  const { currentTheme } = useThemeStore();
  const theme = currentTheme();

  return (
    <div className={`theme-${theme}`}>
      <h1 className='text-primary bg-primary'>Themed Content</h1>
    </div>
  );
}
```

### System Theme Detection

```tsx
function SystemThemeIndicator() {
  const { systemTheme, mode } = useThemeStore();

  return (
    <div>
      <p>System Theme: {systemTheme}</p>
      <p>Current Mode: {mode}</p>
      <p>Effective Theme: {mode === 'system' ? systemTheme : mode}</p>
    </div>
  );
}
```

## Initialization

The theme system must be initialized in your app:

```tsx
import { initializeThemeSystem } from '@/presentation/store/theme/themeStore';

// In your main.tsx or App.tsx
initializeThemeSystem();
```

This function:

- Applies initial theme classes
- Sets up theme change listeners
- Handles system theme changes

## Testing

The store includes comprehensive tests:

```bash
npm run test src/presentation/store/theme/__tests__/themeStore.test.ts
```

Test coverage includes:

- State initialization
- Theme mode changes
- System theme detection
- Persistence behavior
- Error handling

## Best Practices

### 1. Use Computed Values

```tsx
// Good: Use computed current theme
const theme = currentTheme();

// Avoid: Manual theme computation
const theme = mode === 'system' ? systemTheme : mode;
```

### 2. Handle Loading States

```tsx
function ThemedComponent() {
  const { currentTheme } = useThemeStore();

  // Handle loading state
  const theme = currentTheme();
  if (!theme) {
    return <div>Loading theme...</div>;
  }

  return <div className={`theme-${theme}`}>Content</div>;
}
```

### 3. CSS Variable Usage

```tsx
// Good: Use CSS variables
<div className="bg-primary text-primary">

// Avoid: Hardcoded colors
<div className="bg-white text-black">
```

## Troubleshooting

### Common Issues

1. **Theme not applying**: Check if `initializeThemeSystem()` is called
2. **CSS classes not updating**: Verify CSS variable definitions
3. **System theme not detecting**: Check browser support for `prefers-color-scheme`

### Debug Mode

Enable debug logging:

```tsx
// In development
localStorage.setItem('otoniq-debug', 'true');

// Check current state
console.log(useThemeStore.getState());

// Check computed theme
console.log(useThemeStore.getState().currentTheme());
```

## Related Stores

- `useUIStore`: UI state management
- `useAuth`: Authentication state
- `usePermissionStore`: Role-based permissions
