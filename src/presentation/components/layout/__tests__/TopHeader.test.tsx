import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TopHeader } from '../TopHeader';
import { useUIStore } from '../../../store/ui/uiStore';
import { useAuth } from '../../../hooks/useAuth';

// Mock the stores
vi.mock('../../../store/ui/uiStore');
vi.mock('../../../hooks/useAuth');

const mockUseUIStore = vi.mocked(useUIStore);
const mockUseAuth = vi.mocked(useAuth);

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('TopHeader Component', () => {
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
  });

  it('renders header with navigation elements', () => {
    render(
      <TestWrapper>
        <TopHeader />
      </TestWrapper>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Genel Bakış')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Ürün, sipariş veya müşteri ara...')
    ).toBeInTheDocument();
  });

  it('shows user profile information', () => {
    render(
      <TestWrapper>
        <TopHeader />
      </TestWrapper>
    );

    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('Tenant Admin')).toBeInTheDocument();
  });

  it('displays notification badge with correct count', () => {
    render(
      <TestWrapper>
        <TopHeader />
      </TestWrapper>
    );

    expect(screen.getByText('2')).toBeInTheDocument(); // Notification count
  });

  it('toggles mobile sidebar when mobile menu button is clicked', async () => {
    const mockToggleMobileSidebar = vi.fn();
    mockUseUIStore.mockReturnValue({
      sidebarCollapsed: false,
      toggleSidebar: vi.fn(),
      collapseSidebar: vi.fn(),
      mobileSidebarOpen: false,
      toggleMobileSidebar: mockToggleMobileSidebar,
      setMobileSidebarOpen: vi.fn(),
    });

    render(
      <TestWrapper>
        <TopHeader />
      </TestWrapper>
    );

    const mobileMenuButton = screen.getByLabelText('Toggle mobile menu');
    fireEvent.click(mobileMenuButton);

    expect(mockToggleMobileSidebar).toHaveBeenCalledTimes(1);
  });

  it('toggles sidebar when desktop toggle button is clicked', async () => {
    const mockToggleSidebar = vi.fn();
    mockUseUIStore.mockReturnValue({
      sidebarCollapsed: false,
      toggleSidebar: mockToggleSidebar,
      collapseSidebar: vi.fn(),
      mobileSidebarOpen: false,
      toggleMobileSidebar: vi.fn(),
      setMobileSidebarOpen: vi.fn(),
    });

    render(
      <TestWrapper>
        <TopHeader />
      </TestWrapper>
    );

    const toggleButton = screen.getByLabelText('Toggle sidebar');
    fireEvent.click(toggleButton);

    expect(mockToggleSidebar).toHaveBeenCalledTimes(1);
  });

  it('shows user menu when user profile is clicked', async () => {
    render(
      <TestWrapper>
        <TopHeader />
      </TestWrapper>
    );

    const userProfileButton = screen.getByLabelText('User menu');
    fireEvent.click(userProfileButton);

    await waitFor(() => {
      expect(screen.getByText('Profil')).toBeInTheDocument();
      expect(screen.getByText('Ayarlar')).toBeInTheDocument();
      expect(screen.getByText('Çıkış Yap')).toBeInTheDocument();
    });
  });

  it('shows notifications when notification button is clicked', async () => {
    render(
      <TestWrapper>
        <TopHeader />
      </TestWrapper>
    );

    const notificationButton = screen.getByLabelText('Notifications');
    fireEvent.click(notificationButton);

    await waitFor(() => {
      expect(screen.getByText('Bildirimler')).toBeInTheDocument();
      expect(screen.getByText('Yeni Sipariş')).toBeInTheDocument();
      expect(screen.getByText('Stok Uyarısı')).toBeInTheDocument();
    });
  });
});
