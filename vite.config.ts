import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'node:path';
import AutoImport from 'unplugin-auto-import/vite';
import { visualizer } from 'rollup-plugin-visualizer';

const base = process.env.BASE_PATH || '/';
const isPreview = process.env.IS_PREVIEW ? true : false;
// https://vite.dev/config/
export default defineConfig({
  define: {
    __BASE_PATH__: JSON.stringify(base),
    __IS_PREVIEW__: JSON.stringify(isPreview),
  },
  plugins: [
    react(),
    AutoImport({
      imports: [
        {
          react: [
            'React',
            'useState',
            'useEffect',
            'useContext',
            'useReducer',
            'useCallback',
            'useMemo',
            'useRef',
            'useImperativeHandle',
            'useLayoutEffect',
            'useDebugValue',
            'useDeferredValue',
            'useId',
            'useInsertionEffect',
            'useSyncExternalStore',
            'useTransition',
            'startTransition',
            'lazy',
            'memo',
            'forwardRef',
            'createContext',
            'createElement',
            'cloneElement',
            'isValidElement',
          ],
        },
        {
          'react-router-dom': [
            'useNavigate',
            'useLocation',
            'useParams',
            'useSearchParams',
            'Link',
            'NavLink',
            'Navigate',
            'Outlet',
          ],
        },
        // React i18n
        {
          'react-i18next': ['useTranslation', 'Trans'],
        },
      ],
      dts: true,
    }),
    // Bundle analyzer
    visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  base,
  build: {
    sourcemap: true,
    outDir: 'out',
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['lucide-react', 'framer-motion'],
          'store-vendor': ['zustand'],
          'utils-vendor': ['axios', 'date-fns', 'immer'],
          // Feature chunks
          auth: [
            './src/presentation/components/auth/ProtectedRoute',
            './src/presentation/components/auth/SuperAdminGuard',
            './src/presentation/hooks/useAuth',
          ],
          layout: [
            './src/presentation/components/layout/Sidebar',
            './src/presentation/components/layout/TopHeader',
            './src/presentation/components/layout/SidebarLayout',
          ],
          pages: [
            './src/presentation/pages/dashboard/page',
            './src/presentation/pages/admin/page',
            './src/presentation/pages/products/page',
          ],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});
