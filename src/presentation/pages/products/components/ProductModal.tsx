import { useState, useEffect } from 'react';
import { productService } from '../../../../infrastructure/services/ProductService';
import { Product } from '../../../../domain/entities/Product';
import { CreateProductRequest } from '../../../../application/use-cases/product/CreateProductUseCase';
import { UpdateProductRequest } from '../../../../application/use-cases/product/UpdateProductUseCase';
import toast from 'react-hot-toast';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingProduct?: Product | null;
  tenantId?: string;
}

export default function ProductModal({
  isOpen,
  onClose,
  onSuccess,
  editingProduct,
  tenantId,
}: ProductModalProps) {
  const [loading, setLoading] = useState(false);

  // Super admin için varsayılan tenant ID - gerçek UUID kullan
  const defaultTenantId = '00000000-0000-0000-0000-000000000001';

  const [formData, setFormData] = useState<CreateProductRequest>({
    tenant_id: tenantId || defaultTenantId,
    name: '',
    description: '',
    short_description: '',
    sku: '',
    status: 'draft',
    product_type: 'simple',
    categories: [],
    tags: [],
    weight: undefined,
    dimensions: undefined,
    seo_title: '',
    seo_description: '',
    seo_keywords: [],
    metadata: {},
  });

  // Form reset
  useEffect(() => {
    if (isOpen) {
      if (editingProduct) {
        setFormData({
          tenant_id: editingProduct.tenant_id,
          name: editingProduct.name,
          description: editingProduct.description,
          short_description: editingProduct.short_description,
          sku: editingProduct.sku,
          status: editingProduct.status,
          product_type: editingProduct.product_type,
          categories: editingProduct.categories,
          tags: editingProduct.tags,
          weight: editingProduct.weight,
          dimensions: editingProduct.dimensions,
          seo_title: editingProduct.seo_title || '',
          seo_description: editingProduct.seo_description || '',
          seo_keywords: editingProduct.seo_keywords,
          metadata: editingProduct.metadata,
        });
      } else {
        setFormData({
          tenant_id: tenantId || defaultTenantId,
          name: '',
          description: '',
          short_description: '',
          sku: '',
          status: 'draft',
          product_type: 'simple',
          categories: [],
          tags: [],
          weight: undefined,
          dimensions: undefined,
          seo_title: '',
          seo_description: '',
          seo_keywords: [],
          metadata: {},
        });
      }
    }
  }, [isOpen, editingProduct, tenantId]);

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('Form submit başladı:', {
      formData,
      tenantId,
      editingProduct: !!editingProduct,
      authToken: localStorage.getItem('supabase.auth.token'),
    });

    try {
      if (editingProduct) {
        // Update existing product
        const updateRequest: UpdateProductRequest = {
          id: editingProduct.id,
          name: formData.name,
          description: formData.description,
          short_description: formData.short_description,
          sku: formData.sku,
          status: formData.status,
          categories: formData.categories,
          tags: formData.tags,
          weight: formData.weight,
          dimensions: formData.dimensions,
          seo_title: formData.seo_title,
          seo_description: formData.seo_description,
          seo_keywords: formData.seo_keywords,
          metadata: formData.metadata,
        };

        const response = await productService.updateProduct(
          updateRequest,
          'current-user'
        );
        if (response.success) {
          toast.success('Ürün başarıyla güncellendi');
        } else {
          toast.error(response.error || 'Ürün güncellenirken hata oluştu');
        }
      } else {
        // Create new product
        const response = await productService.createProduct(
          formData,
          'current-user'
        );
        if (response.success) {
          toast.success('Ürün başarıyla oluşturuldu');
        } else {
          toast.error(response.error || 'Ürün oluşturulurken hata oluştu');
        }
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Product save error:', error);
      toast.error('Ürün kaydedilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Form input change
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Array field helpers
  const handleArrayChange = (
    field: 'categories' | 'tags' | 'seo_keywords',
    value: string
  ) => {
    const array = value
      .split(',')
      .map(item => item.trim())
      .filter(item => item);
    setFormData(prev => ({
      ...prev,
      [field]: array,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">
              {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="md:col-span-2">
              <label className="block text-white font-medium mb-2">
                Ürün Adı *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                placeholder="Ürün adını girin"
              />
            </div>

            {/* SKU */}
            <div>
              <label className="block text-white font-medium mb-2">SKU *</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={e => handleInputChange('sku', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors font-mono"
                placeholder="ÜRÜN-SKU-001"
              />
            </div>

            {/* Product Type */}
            <div>
              <label className="block text-white font-medium mb-2">
                Ürün Tipi
              </label>
              <select
                value={formData.product_type}
                onChange={e =>
                  handleInputChange('product_type', e.target.value)
                }
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400 transition-colors"
              >
                <option value="simple">Basit</option>
                <option value="variable">Varyantlı</option>
                <option value="grouped">Gruplu</option>
                <option value="external">Harici</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-white font-medium mb-2">Durum</label>
              <select
                value={formData.status}
                onChange={e => handleInputChange('status', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400 transition-colors"
              >
                <option value="draft">Taslak</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
                <option value="archived">Arşiv</option>
              </select>
            </div>

            {/* Weight */}
            <div>
              <label className="block text-white font-medium mb-2">
                Ağırlık (kg)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.weight || ''}
                onChange={e =>
                  handleInputChange(
                    'weight',
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )
                }
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
                placeholder="0.5"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-white font-medium mb-2">
              Kısa Açıklama *
            </label>
            <textarea
              required
              value={formData.short_description}
              onChange={e =>
                handleInputChange('short_description', e.target.value)
              }
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
              placeholder="Ürünün kısa açıklaması..."
              rows={2}
            />
          </div>

          {/* Full Description */}
          <div>
            <label className="block text-white font-medium mb-2">
              Detaylı Açıklama *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={e => handleInputChange('description', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
              placeholder="Ürünün detaylı açıklaması..."
              rows={4}
            />
          </div>

          {/* Categories */}
          <div>
            <label className="block text-white font-medium mb-2">
              Kategoriler
            </label>
            <input
              type="text"
              value={formData.categories.join(', ')}
              onChange={e => handleArrayChange('categories', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
              placeholder="Elektronik, Telefon, Aksesuar"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-white font-medium mb-2">
              Etiketler
            </label>
            <input
              type="text"
              value={formData.tags.join(', ')}
              onChange={e => handleArrayChange('tags', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
              placeholder="popüler, indirim, yeni"
            />
          </div>

          {/* SEO Title */}
          <div>
            <label className="block text-white font-medium mb-2">
              SEO Başlığı
            </label>
            <input
              type="text"
              value={formData.seo_title}
              onChange={e => handleInputChange('seo_title', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
              placeholder="SEO için başlık..."
            />
          </div>

          {/* SEO Description */}
          <div>
            <label className="block text-white font-medium mb-2">
              SEO Açıklaması
            </label>
            <textarea
              value={formData.seo_description}
              onChange={e =>
                handleInputChange('seo_description', e.target.value)
              }
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
              placeholder="SEO için açıklama..."
              rows={2}
            />
          </div>

          {/* SEO Keywords */}
          <div>
            <label className="block text-white font-medium mb-2">
              SEO Anahtar Kelimeler
            </label>
            <input
              type="text"
              value={formData.seo_keywords.join(', ')}
              onChange={e => handleArrayChange('seo_keywords', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
              placeholder="telefon, akıllı telefon, iphone"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {editingProduct ? 'Güncelleniyor...' : 'Oluşturuluyor...'}
                </div>
              ) : editingProduct ? (
                'Güncelle'
              ) : (
                'Oluştur'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
