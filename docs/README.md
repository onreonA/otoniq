# Otoniq.ai Documentation

Comprehensive documentation for the Otoniq.ai platform components, stores, and architecture.

## 📚 Documentation Structure

### Components

- [Sidebar Component](./components/Sidebar.md) - Collapsible navigation sidebar
- [TopHeader Component](./components/TopHeader.md) - Main header with search and user controls

### Stores

- [UI Store](./stores/UIStore.md) - UI state management with Zustand
- [Theme Store](./stores/ThemeStore.md) - Theme management with system detection

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Testing

```bash
npm run test
```

### Building

```bash
npm run build
```

## 🏗️ Architecture

### Component Structure

```
src/presentation/components/
├── layout/
│   ├── Sidebar.tsx
│   ├── TopHeader.tsx
│   ├── Breadcrumb.tsx
│   └── SidebarLayout.tsx
├── base/
│   └── Button.tsx
└── feature/
    ├── Header.tsx
    └── Footer.tsx
```

### Store Structure

```
src/presentation/store/
├── ui/
│   ├── uiStore.ts
│   └── uiStore.types.ts
├── theme/
│   └── themeStore.ts
└── auth/
    └── permissionStore.ts
```

## 🎨 Theme System

The platform supports multiple themes:

- **Light**: Clean, bright interface
- **Dark**: Modern dark interface
- **Minimal**: Simplified, minimal design
- **System**: Follows system preference

### Theme Usage

```tsx
import { useThemeStore } from '@/presentation/store/theme/themeStore';

function MyComponent() {
  const { mode, setMode, currentTheme } = useThemeStore();

  return <div className={`theme-${currentTheme()}`}>{/* Your content */}</div>;
}
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test Structure

```
src/presentation/
├── components/
│   └── layout/
│       └── __tests__/
│           ├── Sidebar.test.tsx
│           └── TopHeader.test.tsx
└── store/
    ├── ui/
    │   └── __tests__/
    │       └── uiStore.test.ts
    └── theme/
        └── __tests__/
            └── themeStore.test.ts
```

## 📱 Responsive Design

The platform is fully responsive with:

- **Mobile First**: Designed for mobile devices first
- **Breakpoints**: Tailwind CSS breakpoints
- **Touch Friendly**: Optimized for touch interactions
- **Accessibility**: WCAG compliant

### Breakpoints

```css
/* Mobile */
@media (max-width: 767px) {
}

/* Tablet */
@media (min-width: 768px) {
}

/* Desktop */
@media (min-width: 1024px) {
}
```

## 🔧 Development

### Code Style

- **Prettier**: Code formatting
- **ESLint**: Code linting
- **TypeScript**: Type safety

### Scripts

```bash
# Format code
npm run format

# Lint code
npm run lint

# Type check
npm run type-check

# Clean build
npm run clean
```

## 🚀 Deployment

### Vercel Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

## 📖 API Reference

### Components

#### Sidebar

```tsx
import { Sidebar } from '@/presentation/components/layout/Sidebar';

// Usage
<Sidebar />;
```

#### TopHeader

```tsx
import { TopHeader } from '@/presentation/components/layout/TopHeader';

// Usage
<TopHeader />;
```

### Stores

#### UI Store

```tsx
import { useUIStore } from '@/presentation/store/ui/uiStore';

const { sidebarCollapsed, toggleSidebar } = useUIStore();
```

#### Theme Store

```tsx
import { useThemeStore } from '@/presentation/store/theme/themeStore';

const { mode, setMode, currentTheme } = useThemeStore();
```

## 🤝 Contributing

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Run tests: `npm run test`

### Code Standards

- Follow TypeScript best practices
- Use Prettier for formatting
- Write comprehensive tests
- Document new components

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Check the documentation
- Review test files for examples
- Open an issue on GitHub
