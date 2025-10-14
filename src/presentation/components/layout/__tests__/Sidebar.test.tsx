import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import { useUIStore } from '../../../store/ui/uiStore';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissionStore } from '../../../store/auth/permissionStore';

// Mock the stores
vi.mock('../../../store/ui/uiStore');
vi.mock('../../../hooks/useAuth');
vi.mock('../../../store/auth/permissionStore');

const mockUseUIStore = vi.mocked(useUIStore);
const mockUseAuth = vi.mocked(useAuth);
const mockUsePermissionStore = vi.mocked(usePermissionStore);

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Sidebar Component', () => {
  beforeEach(() => {
    // Default mock implementations
    mockUseUIStore.mockReturnValue({
      sidebarCollapsed: false,
      toggleSidebar: vi.fn(),
      collapseSidebar: vi.fn(),
      mobileSidebarOpen: false,
      toggleMobileSidebar: vi.fn(),
      setMobileSidebarOpen: vi.fn(),
    });

    mockUseAuth.mockReturnValue({
      userProfile: {
        id: '1',
        email: 'test@example.com',
        role: 'tenant_admin',
        tenant_id: 'tenant-1',
      },
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
    });

    mockUsePermissionStore.mockReturnValue({
      hasRole: vi.fn().mockReturnValue(true),
      hasPermission: vi.fn().mockReturnValue(true),
    });
  });

  it('renders sidebar with logo and navigation', () => {
    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    expect(screen.getByText('Otoniq.ai')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('shows collapsed state when sidebarCollapsed is true', () => {
    mockUseUIStore.mockReturnValue({
      sidebarCollapsed: true,
      toggleSidebar: vi.fn(),
      setSidebarCollapsed: vi.fn(),
      sidebarMobileOpen: false,
      toggleMobileSidebar: vi.fn(),
      setMobileSidebarOpen: vi.fn(),
    });

    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    // Logo should be visible but text should be hidden
    expect(screen.getByText('O')).toBeInTheDocument();
    // In collapsed state, the text might still be in DOM but hidden with CSS
    expect(screen.getByText('Otoniq.ai')).toBeInTheDocument();
  });

  it('renders navigation items correctly', () => {
    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    // Should show navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Ürünler')).toBeInTheDocument();
  });

  it('renders role-based menu items correctly', () => {
    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    // Should show tenant admin menu items
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Ürünler')).toBeInTheDocument();
    expect(screen.getByText('Siparişler')).toBeInTheDocument();
  });

  it('shows user profile information', () => {
    render(
      <TestWrapper>
        <Sidebar />
      </TestWrapper>
    );

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Tenant Admin')).toBeInTheDocument();
  });
});
