import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { SuperAdminGuard } from '../components/auth/SuperAdminGuard';

// Lazy load components
const HomePage = lazy(() => import('../pages/home/page'));
const AboutPage = lazy(() => import('../pages/about/page'));
const PricingPage = lazy(() => import('../pages/pricing/page'));
const LoginPage = lazy(() => import('../pages/login/page'));
const SignupPage = lazy(() => import('../pages/signup/page'));
const DemoPage = lazy(() => import('../pages/demo/page'));
const DashboardPage = lazy(() => import('../pages/dashboard/page'));
const ProductManagementPage = lazy(() => import('../pages/products/page'));
const MarketplaceConnectionsPage = lazy(
  () => import('../pages/marketplace/page')
);
const AdminPage = lazy(() => import('../pages/admin/page'));
const NotFoundPage = lazy(() => import('../pages/NotFound'));

import ComponentsLibrary from '../pages/components/page';

const routes: RouteObject[] = [
  // Public routes
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/about',
    element: <AboutPage />,
  },
  {
    path: '/pricing',
    element: <PricingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    path: '/demo',
    element: <DemoPage />,
  },
  {
    path: '/components',
    element: <ComponentsLibrary />,
  },

  // Protected routes (Require authentication)
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/products',
    element: (
      <ProtectedRoute>
        <ProductManagementPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/marketplace',
    element: (
      <ProtectedRoute>
        <MarketplaceConnectionsPage />
      </ProtectedRoute>
    ),
  },

  // Super admin only routes
  {
    path: '/admin',
    element: (
      <SuperAdminGuard>
        <AdminPage />
      </SuperAdminGuard>
    ),
  },

  // 404
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

export default routes;
