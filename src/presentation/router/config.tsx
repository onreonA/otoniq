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
const CategoriesPage = lazy(() => import('../pages/categories/page'));
const InventoryPage = lazy(() => import('../pages/inventory/page'));
const OrdersPage = lazy(() => import('../pages/orders/page'));
const CustomersPage = lazy(() => import('../pages/customers/page'));
const IntegrationsPage = lazy(() => import('../pages/integrations/page'));
const OdooIntegrationPage = lazy(
  () => import('../pages/integrations/odoo/page')
);
const ShopifyIntegrationPage = lazy(
  () => import('../pages/integrations/shopify/page')
);
const AlibabaIntegrationPage = lazy(
  () => import('../pages/integrations/alibaba/page')
);
const MarketplaceConnectionsPage = lazy(
  () => import('../pages/marketplace/page')
);
const AnalyticsPage = lazy(() => import('../pages/analytics/page'));
const AutomationPage = lazy(() => import('../pages/automation/page'));
const AutomationOutputsPage = lazy(
  () => import('../pages/automation/outputs/page')
);
const WorkflowDetailPage = lazy(
  () => import('../pages/automation/workflow-detail/[id]/page')
);
const FeedDoctorPage = lazy(() => import('../pages/feed-doctor/page'));
const CreativePage = lazy(() => import('../pages/creative/page'));
const ChatAutomationPage = lazy(() => import('../pages/chat-automation/page'));
const CompetitorAnalysisPage = lazy(
  () => import('../pages/competitor-analysis/page')
);
const MapScannerPage = lazy(
  () => import('../pages/lead-generation/map-scanner/page')
);
const CampaignsPage = lazy(
  () => import('../pages/lead-generation/campaigns/page')
);
const LeadsPage = lazy(() => import('../pages/lead-generation/leads/page'));
const ContactsPage = lazy(
  () => import('../pages/lead-generation/contacts/page')
);
const SequencesPage = lazy(
  () => import('../pages/lead-generation/sequences/page')
);
const LeadAnalyticsPage = lazy(
  () => import('../pages/lead-generation/analytics/page')
);
const ARVRPage = lazy(() => import('../pages/ar-vr/page'));
const IoTPage = lazy(() => import('../pages/iot/page'));
const AdminPage = lazy(() => import('../pages/admin/page'));
const SecuritySettingsPage = lazy(
  () => import('../pages/settings/security/page')
);
const NotificationsPage = lazy(() => import('../pages/notifications/page'));
const NotificationSettingsPage = lazy(
  () => import('../pages/settings/notifications/page')
);
const AuditLogsPage = lazy(() => import('../pages/settings/audit-logs/page'));
const SocialMediaPage = lazy(() => import('../pages/social-media/page'));
const EmailCampaignsPage = lazy(() => import('../pages/email-campaigns/page'));
const PitchDeckPage = lazy(() => import('../pages/pitch-deck/page'));
const OnePagerPage = lazy(() => import('../pages/one-pager/page'));
const SalesToolkitPage = lazy(() => import('../pages/sales-toolkit/page'));
const ProfilePage = lazy(() => import('../pages/profile/page'));
const CompanyPage = lazy(() => import('../pages/company/page'));
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
      {
        path: '/pitch-deck',
        element: <PitchDeckPage />,
      },
      {
        path: '/one-pager',
        element: <OnePagerPage />,
      },
      {
        path: '/sales-toolkit',
        element: <SalesToolkitPage />,
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
        path: '/categories',
        element: <CategoriesPage />,
      },
      {
        path: '/inventory',
        element: <InventoryPage />,
      },
      {
        path: '/orders',
        element: <OrdersPage />,
      },
      {
        path: '/customers',
        element: <CustomersPage />,
      },
      {
        path: '/integrations',
        element: <IntegrationsPage />,
      },
      {
        path: '/integrations/odoo',
        element: <OdooIntegrationPage />,
      },
      {
        path: '/integrations/shopify',
        element: <ShopifyIntegrationPage />,
      },
      {
        path: '/integrations/alibaba',
        element: <AlibabaIntegrationPage />,
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
        path: '/feed-doctor',
        element: <FeedDoctorPage />,
      },
      {
        path: '/social-media',
        element: <SocialMediaPage />,
      },
      {
        path: '/email-campaigns',
        element: <EmailCampaignsPage />,
      },
      {
        path: '/automation/outputs',
        element: <AutomationOutputsPage />,
      },
      {
        path: '/automation/workflow/:id',
        element: <WorkflowDetailPage />,
      },
      {
        path: '/creative',
        element: <CreativePage />,
      },
      {
        path: '/chat-automation',
        element: <ChatAutomationPage />,
      },
      {
        path: '/competitor-analysis',
        element: <CompetitorAnalysisPage />,
      },
      {
        path: '/lead-generation/map-scanner',
        element: <MapScannerPage />,
      },
      {
        path: '/lead-generation/campaigns',
        element: <CampaignsPage />,
      },
      {
        path: '/lead-generation/leads',
        element: <LeadsPage />,
      },
      {
        path: '/lead-generation/contacts',
        element: <ContactsPage />,
      },
      {
        path: '/lead-generation/sequences',
        element: <SequencesPage />,
      },
      {
        path: '/lead-generation/analytics',
        element: <LeadAnalyticsPage />,
      },
      {
        path: '/ar-vr',
        element: <ARVRPage />,
      },
      {
        path: '/iot',
        element: <IoTPage />,
      },
      {
        path: '/settings/security',
        element: <SecuritySettingsPage />,
      },
      {
        path: '/settings/audit-logs',
        element: <AuditLogsPage />,
      },
      {
        path: '/notifications',
        element: <NotificationsPage />,
      },
      {
        path: '/settings/notifications',
        element: <NotificationSettingsPage />,
      },
      {
        path: '/profile',
        element: <ProfilePage />,
      },
      {
        path: '/company',
        element: <CompanyPage />,
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
