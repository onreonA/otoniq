import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { productService } from '../../../infrastructure/services/ProductService';
import { Product } from '../../../domain/entities/Product';
import ProductModal from './components/ProductModal';
import toast from 'react-hot-toast';

export default function ProductManagement() {
  const { userProfile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStock, setFilterStock] = useState('all');

  // Removed Odoo integration states - products page only manages local products
  const [filterPriceRange, setFilterPriceRange] = useState({
    min: '',
    max: '',
  });
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState({ from: '', to: '' });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
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
          category: filterCategory === 'all' ? undefined : filterCategory,
          stock_status: filterStock === 'all' ? undefined : filterStock,
          price_min: filterPriceRange.min
            ? parseFloat(filterPriceRange.min)
            : undefined,
          price_max: filterPriceRange.max
            ? parseFloat(filterPriceRange.max)
            : undefined,
          platform: filterPlatform === 'all' ? undefined : filterPlatform,
          date_from: filterDateRange.from || undefined,
          date_to: filterDateRange.to || undefined,
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

  // Removed Odoo product loading - this page only manages local products

  // İlk yükleme ve filtre değişikliklerinde yükle
  useEffect(() => {
    loadProducts();
  }, [
    userProfile?.tenant_id,
    searchTerm,
    filterStatus,
    filterType,
    filterCategory,
    filterStock,
    filterPriceRange.min,
    filterPriceRange.max,
    filterPlatform,
    filterDateRange.from,
    filterDateRange.to,
    currentPage,
  ]);

  // Removed Odoo product loading useEffect

  // Filtreleme
  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || product.status === filterStatus;
    const matchesType =
      filterType === 'all' || product.product_type === filterType;
    const matchesCategory =
      filterCategory === 'all' || product.categories?.includes(filterCategory);
    const matchesStock = (() => {
      if (filterStock === 'all') return true;
      const totalStock = product.getTotalStock();
      switch (filterStock) {
        case 'in_stock':
          return totalStock > 0;
        case 'low_stock':
          return totalStock > 0 && totalStock <= 10;
        case 'out_of_stock':
          return totalStock === 0;
        default:
          return true;
      }
    })();
    const matchesPrice = (() => {
      if (!filterPriceRange.min && !filterPriceRange.max) return true;
      const minPrice = product.getMinPrice();
      const maxPrice = product.getMaxPrice();
      if (!minPrice && !maxPrice) return true;
      const price = minPrice || maxPrice || 0;
      const min = filterPriceRange.min ? parseFloat(filterPriceRange.min) : 0;
      const max = filterPriceRange.max
        ? parseFloat(filterPriceRange.max)
        : Infinity;
      return price >= min && price <= max;
    })();
    const matchesPlatform = (() => {
      if (filterPlatform === 'all') return true;
      const source = product.metadata?.source;
      switch (filterPlatform) {
        case 'manual':
          return !source;
        case 'odoo':
          return source === 'odoo';
        case 'shopify':
          return source === 'shopify';
        default:
          return true;
      }
    })();
    const matchesDate = (() => {
      if (!filterDateRange.from && !filterDateRange.to) return true;
      const productDate = new Date(product.created_at);
      const fromDate = filterDateRange.from
        ? new Date(filterDateRange.from)
        : new Date(0);
      const toDate = filterDateRange.to
        ? new Date(filterDateRange.to)
        : new Date();
      return productDate >= fromDate && productDate <= toDate;
    })();

    return (
      matchesSearch &&
      matchesStatus &&
      matchesType &&
      matchesCategory &&
      matchesStock &&
      matchesPrice &&
      matchesPlatform &&
      matchesDate
    );
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

  // Filtreleri temizle
  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterType('all');
    setFilterCategory('all');
    setFilterStock('all');
    setFilterPriceRange({ min: '', max: '' });
    setFilterPlatform('all');
    setFilterDateRange({ from: '', to: '' });
    setShowAdvancedFilters(false);
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

  // Toplu silme
  const handleBulkDelete = async () => {
    if (
      !confirm(
        `${selectedProducts.length} ürünü silmek istediğinizden emin misiniz?`
      )
    ) {
      return;
    }

    try {
      await productService.bulkDeleteProducts(selectedProducts);
      toast.success(`${selectedProducts.length} ürün silindi`);
      setSelectedProducts([]);
      loadProducts();
    } catch (error) {
      console.error('Toplu silme hatası:', error);
      toast.error('Ürünler silinirken hata oluştu');
    }
  };

  // Toplu kategori atama
  const handleBulkCategoryUpdate = async (category: string) => {
    if (!category) return;

    try {
      await productService.bulkUpdateCategories(selectedProducts, category);
      toast.success(`${selectedProducts.length} ürünün kategorisi güncellendi`);
      setSelectedProducts([]);
      loadProducts();
    } catch (error) {
      console.error('Toplu kategori güncelleme hatası:', error);
      toast.error('Kategoriler güncellenirken hata oluştu');
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    try {
      const csvData = filteredProducts.map(product => ({
        SKU: product.sku,
        'Ürün Adı': product.name,
        Açıklama: product.description || '',
        'Kısa Açıklama': product.short_description || '',
        Durum: getStatusText(product.status),
        Tip: getTypeText(product.product_type),
        Fiyat: product.getMinPrice() || 0,
        Stok: product.getTotalStock(),
        Kategoriler: product.categories?.join(', ') || '',
        Etiketler: product.tags?.join(', ') || '',
        'Oluşturulma Tarihi': new Date(product.created_at).toLocaleDateString(
          'tr-TR'
        ),
        'Güncelleme Tarihi': new Date(product.updated_at).toLocaleDateString(
          'tr-TR'
        ),
      }));

      const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row =>
          Object.values(row)
            .map(value => `"${value}"`)
            .join(',')
        ),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `urunler_${new Date().toISOString().split('T')[0]}.csv`
      );
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('CSV dosyası indirildi');
    } catch (error) {
      console.error('CSV export hatası:', error);
      toast.error('CSV dosyası oluşturulurken hata oluştu');
    }
  };

  // Excel Export
  const handleExportExcel = () => {
    // Excel export için xlsx kütüphanesi gerekli
    toast.info('Excel export özelliği yakında eklenecek');
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
            <div className='flex items-center space-x-3'>
              {/* Export Buttons */}
              <div className='flex space-x-2'>
                <button
                  onClick={handleExportCSV}
                  className='bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 border border-green-500/30 hover:border-green-500/50 flex items-center gap-2'
                >
                  <i className='ri-file-download-line'></i>
                  <span className='text-sm'>CSV İndir</span>
                </button>
                <button
                  onClick={handleExportExcel}
                  className='bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 border border-orange-500/30 hover:border-orange-500/50 flex items-center gap-2'
                >
                  <i className='ri-file-excel-line'></i>
                  <span className='text-sm'>Excel İndir</span>
                </button>
              </div>

              <Link
                to='/integrations'
                className='bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 border border-purple-500/30 hover:border-purple-500/50 flex items-center gap-2'
              >
                <i className='ri-plug-line'></i>
                <span className='text-sm'>Entegrasyonları Yönet</span>
              </Link>
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
          {/* Basic Filters */}
          <div className='flex flex-col md:flex-row gap-4 mb-4'>
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

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className='bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 text-purple-400 px-4 py-3 rounded-xl transition-colors cursor-pointer flex items-center gap-2'
            >
              <i
                className={`ri-filter-3-line ${showAdvancedFilters ? 'rotate-180' : ''} transition-transform`}
              ></i>
              <span className='text-sm'>Gelişmiş</span>
            </button>

            {/* Clear Filters */}
            <button
              onClick={clearAllFilters}
              className='bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl transition-colors cursor-pointer flex items-center gap-2'
            >
              <i className='ri-refresh-line'></i>
              <span className='text-sm'>Temizle</span>
            </button>
          </div>

          {/* Removed Odoo Product Type Filters - this page only manages local products */}

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className='border-t border-white/10 pt-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                {/* Category Filter */}
                <div>
                  <label className='block text-gray-300 text-sm mb-2'>
                    Kategori
                  </label>
                  <select
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                    className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400 transition-colors pr-8'
                  >
                    <option value='all'>Tüm Kategoriler</option>
                    <option value='electronics'>Elektronik</option>
                    <option value='clothing'>Giyim</option>
                    <option value='home'>Ev & Yaşam</option>
                    <option value='sports'>Spor</option>
                    <option value='books'>Kitap</option>
                  </select>
                </div>

                {/* Stock Filter */}
                <div>
                  <label className='block text-gray-300 text-sm mb-2'>
                    Stok Durumu
                  </label>
                  <select
                    value={filterStock}
                    onChange={e => setFilterStock(e.target.value)}
                    className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400 transition-colors pr-8'
                  >
                    <option value='all'>Tüm Stoklar</option>
                    <option value='in_stock'>Stokta Var</option>
                    <option value='low_stock'>Düşük Stok</option>
                    <option value='out_of_stock'>Stokta Yok</option>
                  </select>
                </div>

                {/* Platform Filter */}
                <div>
                  <label className='block text-gray-300 text-sm mb-2'>
                    Platform
                  </label>
                  <select
                    value={filterPlatform}
                    onChange={e => setFilterPlatform(e.target.value)}
                    className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400 transition-colors pr-8'
                  >
                    <option value='all'>Tüm Platformlar</option>
                    <option value='manual'>Manuel</option>
                    <option value='odoo'>Odoo</option>
                    <option value='shopify'>Shopify</option>
                  </select>
                </div>

                {/* Date Range */}
                <div>
                  <label className='block text-gray-300 text-sm mb-2'>
                    Tarih Aralığı
                  </label>
                  <div className='flex gap-2'>
                    <input
                      type='date'
                      value={filterDateRange.from}
                      onChange={e =>
                        setFilterDateRange(prev => ({
                          ...prev,
                          from: e.target.value,
                        }))
                      }
                      className='flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400 transition-colors'
                      placeholder='Başlangıç'
                    />
                    <input
                      type='date'
                      value={filterDateRange.to}
                      onChange={e =>
                        setFilterDateRange(prev => ({
                          ...prev,
                          to: e.target.value,
                        }))
                      }
                      className='flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400 transition-colors'
                      placeholder='Bitiş'
                    />
                  </div>
                </div>
              </div>

              {/* Price Range */}
              <div className='mt-4'>
                <label className='block text-gray-300 text-sm mb-2'>
                  Fiyat Aralığı (₺)
                </label>
                <div className='flex gap-4 items-center'>
                  <input
                    type='number'
                    placeholder='Min Fiyat'
                    value={filterPriceRange.min}
                    onChange={e =>
                      setFilterPriceRange(prev => ({
                        ...prev,
                        min: e.target.value,
                      }))
                    }
                    className='w-32 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
                  />
                  <span className='text-gray-400'>-</span>
                  <input
                    type='number'
                    placeholder='Max Fiyat'
                    value={filterPriceRange.max}
                    onChange={e =>
                      setFilterPriceRange(prev => ({
                        ...prev,
                        max: e.target.value,
                      }))
                    }
                    className='w-32 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          {selectedProducts.length > 0 && (
            <div className='border-t border-white/10 pt-4 mt-4'>
              <div className='flex items-center justify-between'>
                <div className='text-gray-300 text-sm'>
                  {selectedProducts.length} ürün seçildi
                </div>
                <div className='flex flex-wrap gap-2'>
                  {/* Status Actions */}
                  <div className='flex space-x-2'>
                    <button
                      onClick={() => handleBulkStatusUpdate('active')}
                      className='bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 px-3 py-2 rounded-lg transition-colors cursor-pointer text-sm'
                    >
                      <i className='ri-check-line mr-1'></i>
                      Aktifleştir
                    </button>
                    <button
                      onClick={() => handleBulkStatusUpdate('inactive')}
                      className='bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/50 text-gray-400 px-3 py-2 rounded-lg transition-colors cursor-pointer text-sm'
                    >
                      <i className='ri-pause-line mr-1'></i>
                      Pasifleştir
                    </button>
                    <button
                      onClick={() => handleBulkStatusUpdate('archived')}
                      className='bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 px-3 py-2 rounded-lg transition-colors cursor-pointer text-sm'
                    >
                      <i className='ri-archive-line mr-1'></i>
                      Arşivle
                    </button>
                  </div>

                  {/* Category Actions */}
                  <div className='flex space-x-2'>
                    <select
                      onChange={e => handleBulkCategoryUpdate(e.target.value)}
                      className='bg-blue-500/20 border border-blue-500/50 text-blue-400 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-400'
                    >
                      <option value=''>Kategori Ata</option>
                      <option value='electronics'>Elektronik</option>
                      <option value='clothing'>Giyim</option>
                      <option value='home'>Ev & Yaşam</option>
                      <option value='sports'>Spor</option>
                      <option value='books'>Kitap</option>
                    </select>
                  </div>

                  {/* Export Actions */}
                  <div className='flex space-x-2'>
                    <button
                      onClick={handleExportCSV}
                      className='bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-400 px-3 py-2 rounded-lg transition-colors cursor-pointer text-sm'
                    >
                      <i className='ri-file-download-line mr-1'></i>
                      CSV
                    </button>
                    <button
                      onClick={handleExportExcel}
                      className='bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 text-orange-400 px-3 py-2 rounded-lg transition-colors cursor-pointer text-sm'
                    >
                      <i className='ri-file-excel-line mr-1'></i>
                      Excel
                    </button>
                  </div>

                  {/* Delete Action */}
                  <button
                    onClick={handleBulkDelete}
                    className='bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 px-3 py-2 rounded-lg transition-colors cursor-pointer text-sm'
                  >
                    <i className='ri-delete-bin-line mr-1'></i>
                    Sil
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Removed Odoo Products Table - this page only manages local products */}

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
                    Barkod
                  </th>
                  <th className='text-left p-4 text-gray-300 font-medium'>
                    Tedarikçi
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
                    Platform
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
                    <td className='p-4 text-gray-300 font-mono text-sm'>
                      {product.barcode || '-'}
                    </td>
                    <td className='p-4 text-gray-300'>
                      {product.vendor || '-'}
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
                    <td className='p-4'>
                      <div className='flex gap-1'>
                        {product.metadata?.source === 'shopify' && (
                          <span className='px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs'>
                            Shopify
                          </span>
                        )}
                        {product.metadata?.source === 'odoo' && (
                          <span className='px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs'>
                            Odoo
                          </span>
                        )}
                        {!product.metadata?.source && (
                          <span className='px-2 py-1 bg-gray-600/20 text-gray-400 rounded text-xs'>
                            Manuel
                          </span>
                        )}
                      </div>
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
              {products.length} ürün bulundu
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
    </div>
  );
}
