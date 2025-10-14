import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { productService } from '../../../infrastructure/services/ProductService';
import { Product } from '../../../domain/entities/Product';
import ProductModal from './components/ProductModal';
import OdooSyncModal from './components/OdooSyncModal';
import ShopifySyncModal from './components/ShopifySyncModal';
import toast from 'react-hot-toast';

export default function ProductManagement() {
  const { userProfile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOdooSyncModal, setShowOdooSyncModal] = useState(false);
  const [showShopifySyncModal, setShowShopifySyncModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Products'ları yükle
  const loadProducts = async () => {
    // Super admin için tüm ürünleri göster, tenant admin için sadece kendi ürünlerini
    const tenantId =
      userProfile?.role === 'super_admin' ? undefined : userProfile?.tenant_id;

    if (!tenantId && userProfile?.role !== 'super_admin') {
      console.log('No tenant_id found for user:', userProfile);
      return;
    }

    try {
      setLoading(true);
      const response = await productService.getProducts({
        tenant_id: tenantId || 'all', // Super admin için 'all'
        filters: {
          status: filterStatus === 'all' ? undefined : (filterStatus as any),
          product_type: filterType === 'all' ? undefined : (filterType as any),
          search: searchTerm || undefined,
        },
        pagination: {
          page: currentPage,
          limit: 20,
        },
      });

      if (response.success && response.products) {
        setProducts(response.products.data);
        setTotalPages(response.products.totalPages);
      } else {
        toast.error('Ürünler yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Product yükleme hatası:', error);
      toast.error('Ürünler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // İlk yükleme ve filtre değişikliklerinde yükle
  useEffect(() => {
    loadProducts();
  }, [
    userProfile?.tenant_id,
    searchTerm,
    filterStatus,
    filterType,
    currentPage,
  ]);

  // Filtreleme
  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || product.status === filterStatus;
    const matchesType =
      filterType === 'all' || product.product_type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Durum rengi
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400';
      case 'inactive':
        return 'bg-gray-500/20 text-gray-400';
      case 'draft':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'archived':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  // Durum metni
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'inactive':
        return 'Pasif';
      case 'draft':
        return 'Taslak';
      case 'archived':
        return 'Arşiv';
      default:
        return 'Bilinmiyor';
    }
  };

  // Tip rengi
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'simple':
        return 'bg-blue-500/20 text-blue-400';
      case 'variable':
        return 'bg-purple-500/20 text-purple-400';
      case 'grouped':
        return 'bg-orange-500/20 text-orange-400';
      case 'external':
        return 'bg-pink-500/20 text-pink-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  // Tip metni
  const getTypeText = (type: string) => {
    switch (type) {
      case 'simple':
        return 'Basit';
      case 'variable':
        return 'Varyantlı';
      case 'grouped':
        return 'Gruplu';
      case 'external':
        return 'Harici';
      default:
        return 'Bilinmiyor';
    }
  };

  // Ürün seçimi
  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Toplu işlemler
  const handleBulkStatusUpdate = async (status: string) => {
    try {
      await productService.bulkUpdateStatus(selectedProducts, status as any);
      toast.success(`${selectedProducts.length} ürün durumu güncellendi`);
      setSelectedProducts([]);
      loadProducts();
    } catch (error) {
      console.error('Toplu durum güncelleme hatası:', error);
      toast.error('Durum güncellenirken hata oluştu');
    }
  };

  // Ürün silme
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await productService.deleteProduct(
        { id: productId },
        userProfile?.id || ''
      );
      toast.success('Ürün başarıyla silindi');
      loadProducts();
    } catch (error) {
      console.error('Product silme hatası:', error);
      toast.error('Ürün silinirken hata oluştu');
    }
  };

  // Loading durumu
  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-white text-lg'>Ürünler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='relative z-10'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-white mb-2'>
                Ürün Yönetimi
              </h1>
              <p className='text-gray-300'>
                Ürünlerinizi görüntüleyin ve yönetin
              </p>
            </div>
            <div className='flex space-x-3'>
              <button
                onClick={() => setShowOdooSyncModal(true)}
                className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 cursor-pointer'
              >
                <i className='ri-download-line mr-2'></i>
                Odoo Sync
              </button>
              <button
                onClick={() => setShowShopifySyncModal(true)}
                className='bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 cursor-pointer'
              >
                <i className='ri-store-line mr-2'></i>
                Shopify Sync
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className='bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 cursor-pointer'
              >
                <i className='ri-add-line mr-2'></i>
                Yeni Ürün
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8'>
          <div className='flex flex-col md:flex-row gap-4'>
            {/* Search */}
            <div className='flex-1'>
              <div className='relative'>
                <input
                  type='text'
                  placeholder='Ürün ara...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pl-12 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
                />
                <i className='ri-search-line absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400'></i>
              </div>
            </div>

            {/* Status Filter */}
            <div className='md:w-48'>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400 transition-colors pr-8'
              >
                <option value='all'>Tüm Durumlar</option>
                <option value='active'>Aktif</option>
                <option value='inactive'>Pasif</option>
                <option value='draft'>Taslak</option>
                <option value='archived'>Arşiv</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className='md:w-48'>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400 transition-colors pr-8'
              >
                <option value='all'>Tüm Tipler</option>
                <option value='simple'>Basit</option>
                <option value='variable'>Varyantlı</option>
                <option value='grouped'>Gruplu</option>
                <option value='external'>Harici</option>
              </select>
            </div>

            {/* Bulk Actions */}
            {selectedProducts.length > 0 && (
              <div className='flex space-x-2'>
                <button
                  onClick={() => handleBulkStatusUpdate('active')}
                  className='bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 px-4 py-3 rounded-xl transition-colors cursor-pointer'
                >
                  <i className='ri-check-line mr-2'></i>
                  Aktifleştir
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('inactive')}
                  className='bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/50 text-gray-400 px-4 py-3 rounded-xl transition-colors cursor-pointer'
                >
                  <i className='ri-pause-line mr-2'></i>
                  Pasifleştir
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('archived')}
                  className='bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl transition-colors cursor-pointer'
                >
                  <i className='ri-archive-line mr-2'></i>
                  Arşivle
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Products Table */}
        <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-white/5 border-b border-white/10'>
                <tr>
                  <th className='text-left p-4'>
                    <input
                      type='checkbox'
                      className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500'
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedProducts(
                            filteredProducts.map(product => product.id)
                          );
                        } else {
                          setSelectedProducts([]);
                        }
                      }}
                    />
                  </th>
                  <th className='text-left p-4 text-gray-300 font-medium'>
                    Ürün
                  </th>
                  <th className='text-left p-4 text-gray-300 font-medium'>
                    SKU
                  </th>
                  <th className='text-left p-4 text-gray-300 font-medium'>
                    Tip
                  </th>
                  <th className='text-left p-4 text-gray-300 font-medium'>
                    Durum
                  </th>
                  <th className='text-left p-4 text-gray-300 font-medium'>
                    Stok
                  </th>
                  <th className='text-left p-4 text-gray-300 font-medium'>
                    Fiyat
                  </th>
                  <th className='text-left p-4 text-gray-300 font-medium'>
                    Oluşturulma
                  </th>
                  <th className='text-left p-4 text-gray-300 font-medium'>
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr
                    key={product.id}
                    className='border-b border-white/5 hover:bg-white/5 transition-colors'
                  >
                    <td className='p-4'>
                      <input
                        type='checkbox'
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500'
                      />
                    </td>
                    <td className='p-4'>
                      <div className='flex items-center space-x-3'>
                        <div className='w-12 h-12 rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center'>
                          {product.getPrimaryImageUrl() ? (
                            <img
                              src={product.getPrimaryImageUrl() || ''}
                              alt={product.name}
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            <i className='ri-image-line text-gray-400 text-xl'></i>
                          )}
                        </div>
                        <div>
                          <div className='text-white font-medium'>
                            {product.name}
                          </div>
                          <div className='text-gray-400 text-sm line-clamp-1'>
                            {product.short_description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='p-4 text-gray-300 font-mono text-sm'>
                      {product.sku}
                    </td>
                    <td className='p-4'>
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${getTypeColor(product.product_type)}`}
                      >
                        {getTypeText(product.product_type)}
                      </span>
                    </td>
                    <td className='p-4'>
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${getStatusColor(product.status)}`}
                      >
                        {getStatusText(product.status)}
                      </span>
                    </td>
                    <td className='p-4'>
                      <div className='text-gray-300'>
                        {product.getTotalStock()}
                        {product.getTotalStock() <= 10 && (
                          <span className='text-red-400 text-xs ml-1'>
                            (Düşük)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className='p-4 text-gray-300'>
                      {product.getMinPrice() && product.getMaxPrice()
                        ? product.getMinPrice() === product.getMaxPrice()
                          ? `₺${product.getMinPrice()}`
                          : `₺${product.getMinPrice()} - ₺${product.getMaxPrice()}`
                        : '-'}
                    </td>
                    <td className='p-4 text-gray-400 text-sm'>
                      {new Date(product.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td className='p-4'>
                      <div className='flex space-x-2'>
                        <button
                          onClick={() => setEditingProduct(product)}
                          className='text-blue-400 hover:text-blue-300 transition-colors cursor-pointer'
                          title='Düzenle'
                        >
                          <i className='ri-edit-line'></i>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className='text-red-400 hover:text-red-300 transition-colors cursor-pointer'
                          title='Sil'
                        >
                          <i className='ri-delete-bin-line'></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className='p-4 border-t border-white/10 flex items-center justify-between'>
            <div className='text-gray-400 text-sm'>
              {filteredProducts.length} ürün gösteriliyor
            </div>
            <div className='flex space-x-2'>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className='bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 px-3 py-2 rounded-lg transition-colors cursor-pointer'
              >
                <i className='ri-arrow-left-line'></i>
              </button>
              <span className='bg-blue-500 text-white px-3 py-2 rounded-lg'>
                {currentPage}
              </span>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className='bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 px-3 py-2 rounded-lg transition-colors cursor-pointer'
              >
                <i className='ri-arrow-right-line'></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={showCreateModal || !!editingProduct}
        onClose={() => {
          setShowCreateModal(false);
          setEditingProduct(null);
        }}
        onSuccess={() => {
          loadProducts();
        }}
        editingProduct={editingProduct}
        tenantId={userProfile?.tenant_id || undefined}
      />

      {/* Odoo Sync Modal */}
      <OdooSyncModal
        isOpen={showOdooSyncModal}
        onClose={() => setShowOdooSyncModal(false)}
        onSuccess={() => {
          loadProducts();
        }}
        tenantId={userProfile?.tenant_id || ''}
      />

      {/* Shopify Sync Modal */}
      <ShopifySyncModal
        isOpen={showShopifySyncModal}
        onClose={() => setShowShopifySyncModal(false)}
        onSuccess={() => {
          loadProducts();
        }}
        tenantId={userProfile?.tenant_id || ''}
      />
    </div>
  );
}
