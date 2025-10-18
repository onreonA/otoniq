import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import VariantManager from '../VariantManager';
import { ProductVariant } from '../../../../../domain/entities/Product';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('VariantManager', () => {
  const mockOnVariantsChange = vi.fn();
  const mockVariants: ProductVariant[] = [
    {
      id: '1',
      product_id: 'product-1',
      name: 'Kırmızı, M',
      sku: 'SKU-001',
      price: 100,
      cost: 50,
      stock_quantity: 10,
      weight: 0.5,
      attributes: { color: 'Kırmızı', size: 'M', material: 'Pamuk' },
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: '2',
      product_id: 'product-1',
      name: 'Mavi, L',
      sku: 'SKU-002',
      price: 120,
      cost: 60,
      stock_quantity: 5,
      weight: 0.6,
      attributes: { color: 'Mavi', size: 'L', material: 'Pamuk' },
      is_active: false,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  const defaultProps = {
    variants: mockVariants,
    onVariantsChange: mockOnVariantsChange,
    productType: 'variable' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders variants list correctly', () => {
    render(<VariantManager {...defaultProps} />);

    expect(screen.getByText('Ürün Varyantları')).toBeInTheDocument();
    expect(screen.getByText('2 varyant tanımlı')).toBeInTheDocument();
    expect(screen.getByText('Kırmızı, M')).toBeInTheDocument();
    expect(screen.getByText('Mavi, L')).toBeInTheDocument();
  });

  it('shows empty state for simple products', () => {
    render(<VariantManager {...defaultProps} productType='simple' />);

    expect(
      screen.getByText('Basit ürünler için varyant yönetimi gerekmez')
    ).toBeInTheDocument();
  });

  it('opens add form when add button is clicked', () => {
    render(<VariantManager {...defaultProps} />);

    const addButton = screen.getByText('Varyant Ekle');
    fireEvent.click(addButton);

    expect(screen.getByText('Yeni Varyant')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Kırmızı, M, Pamuk')
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('URUN-KIRMIZI-M')).toBeInTheDocument();
  });

  it('handles form input changes', () => {
    render(<VariantManager {...defaultProps} />);

    const addButton = screen.getByText('Varyant Ekle');
    fireEvent.click(addButton);

    const nameInput = screen.getByPlaceholderText('Kırmızı, M, Pamuk');
    const skuInput = screen.getByPlaceholderText('URUN-KIRMIZI-M');

    fireEvent.change(nameInput, { target: { value: 'Test Variant' } });
    fireEvent.change(skuInput, { target: { value: 'TEST-SKU' } });

    expect(nameInput).toHaveValue('Test Variant');
    expect(skuInput).toHaveValue('TEST-SKU');
  });

  it('validates required fields', async () => {
    render(<VariantManager {...defaultProps} />);

    const addButton = screen.getByText('Varyant Ekle');
    fireEvent.click(addButton);

    const submitButton = screen.getByText('Ekle');
    fireEvent.click(submitButton);

    // Component should not call onVariantsChange when required fields are missing
    expect(mockOnVariantsChange).not.toHaveBeenCalled();
  });

  it('handles variant deletion', () => {
    // Mock window.confirm
    window.confirm = vi.fn(() => true);

    render(<VariantManager {...defaultProps} />);

    const deleteButtons = screen.getAllByTitle('Sil');
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith(
      'Bu varyantı silmek istediğinizden emin misiniz?'
    );
    expect(mockOnVariantsChange).toHaveBeenCalledWith([mockVariants[1]]);
  });

  it('handles variant status toggle', () => {
    render(<VariantManager {...defaultProps} />);

    const toggleButtons = screen.getAllByTitle('Aktifleştir');
    if (toggleButtons.length > 0) {
      fireEvent.click(toggleButtons[0]); // Toggle first inactive variant

      expect(mockOnVariantsChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: '2', is_active: true }),
        ])
      );
    }
  });

  it('handles variant editing', () => {
    render(<VariantManager {...defaultProps} />);

    const editButtons = screen.getAllByTitle('Düzenle');
    fireEvent.click(editButtons[0]);

    expect(screen.getByText('Varyant Düzenle')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Kırmızı, M')).toBeInTheDocument();
    expect(screen.getByDisplayValue('SKU-001')).toBeInTheDocument();
  });

  it('shows variant attributes correctly', () => {
    render(<VariantManager {...defaultProps} />);

    expect(screen.getByText('Renk: Kırmızı')).toBeInTheDocument();
    expect(screen.getByText('Beden: M')).toBeInTheDocument();
    expect(screen.getAllByText('Malzeme: Pamuk')).toHaveLength(2); // Two variants have same material
  });

  it('shows variant status correctly', () => {
    render(<VariantManager {...defaultProps} />);

    expect(screen.getByText('Aktif')).toBeInTheDocument();
    expect(screen.getByText('Pasif')).toBeInTheDocument();
  });

  it('shows empty state when no variants', () => {
    render(<VariantManager {...defaultProps} variants={[]} />);

    expect(screen.getByText('Henüz varyant tanımlanmamış')).toBeInTheDocument();
    expect(screen.getByText('İlk Varyantı Ekle')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <VariantManager {...defaultProps} className='custom-class' />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
