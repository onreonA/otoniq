import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { SuperAdminGuard } from '../components/auth/SuperAdminGuard';
import { SidebarLayout } from '../components/layout/SidebarLayout';
import { PublicLayout } from '../components/layout/PublicLayout';
import { AuthLayout } from '../components/layout/AuthLayout';

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
const AnalyticsPage = lazy(() => import('../pages/analytics/page'));
const AutomationPage = lazy(() => import('../pages/automation/page'));
const CreativePage = lazy(() => import('../pages/creative/page'));
const AdminPage = lazy(() => import('../pages/admin/page'));
const NotFoundPage = lazy(() => import('../pages/NotFound'));

import ComponentsLibrary from '../pages/components/page';

const routes: RouteObject[] = [
  // Public routes with PublicLayout
  {
    element: <PublicLayout />,
    children: [
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
        path: '/demo',
        element: <DemoPage />,
      },
      {
        path: '/components',
        element: <ComponentsLibrary />,
      },
    ],
  },

  // Auth routes with AuthLayout
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/signup',
        element: <SignupPage />,
      },
    ],
  },

  // Protected routes with SidebarLayout
  {
    element: (
      <ProtectedRoute>
        <SidebarLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/products',
        element: <ProductManagementPage />,
      },
      {
        path: '/marketplace',
        element: <MarketplaceConnectionsPage />,
      },
      {
        path: '/analytics',
        element: <AnalyticsPage />,
      },
      {
        path: '/automation',
        element: <AutomationPage />,
      },
      {
        path: '/creative',
        element: <CreativePage />,
      },

      // Super admin only routes (still inside SidebarLayout)
      {
        path: '/admin',
        element: (
          <SuperAdminGuard>
            <AdminPage />
          </SuperAdminGuard>
        ),
      },
    ],
  },

  // 404
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

export default routes;
