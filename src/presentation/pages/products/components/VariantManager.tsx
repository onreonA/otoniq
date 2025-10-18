import { useState } from 'react';
import { ProductVariant } from '../../../../domain/entities/Product';
import toast from 'react-hot-toast';

interface VariantManagerProps {
  variants: ProductVariant[];
  onVariantsChange: (variants: ProductVariant[]) => void;
  productType: 'simple' | 'variable' | 'grouped' | 'external';
  className?: string;
}

export default function VariantManager({
  variants,
  onVariantsChange,
  productType,
  className = '',
}: VariantManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(
    null
  );

  // New variant form data
  const [newVariant, setNewVariant] = useState({
    name: '',
    sku: '',
    price: 0,
    cost: 0,
    stock_quantity: 0,
    weight: 0,
    attributes: {
      color: '',
      size: '',
      material: '',
    },
    is_active: true,
  });

  // Reset form
  const resetForm = () => {
    setNewVariant({
      name: '',
      sku: '',
      price: 0,
      cost: 0,
      stock_quantity: 0,
      weight: 0,
      attributes: {
        color: '',
        size: '',
        material: '',
      },
      is_active: true,
    });
    setShowAddForm(false);
    setEditingVariant(null);
  };

  // Add new variant
  const handleAddVariant = () => {
    if (!newVariant.name || !newVariant.sku) {
      toast.error('Varyant adı ve SKU gereklidir');
      return;
    }

    // Check for duplicate SKU
    const existingVariant = variants.find(v => v.sku === newVariant.sku);
    if (existingVariant) {
      toast.error('Bu SKU zaten kullanılıyor');
      return;
    }

    const variant: ProductVariant = {
      id: crypto.randomUUID(),
      product_id: '', // Will be set when product is created
      name: newVariant.name,
      sku: newVariant.sku,
      price: newVariant.price,
      cost: newVariant.cost,
      stock_quantity: newVariant.stock_quantity,
      weight: newVariant.weight || undefined,
      attributes: newVariant.attributes,
      is_active: newVariant.is_active,
      created_at: new Date(),
      updated_at: new Date(),
    };

    onVariantsChange([...variants, variant]);
    resetForm();
    toast.success('Varyant eklendi');
  };

  // Update existing variant
  const handleUpdateVariant = () => {
    if (!editingVariant) return;

    if (!newVariant.name || !newVariant.sku) {
      toast.error('Varyant adı ve SKU gereklidir');
      return;
    }

    // Check for duplicate SKU (excluding current variant)
    const existingVariant = variants.find(
      v => v.sku === newVariant.sku && v.id !== editingVariant.id
    );
    if (existingVariant) {
      toast.error('Bu SKU zaten kullanılıyor');
      return;
    }

    const updatedVariants = variants.map(v =>
      v.id === editingVariant.id
        ? {
            ...v,
            name: newVariant.name,
            sku: newVariant.sku,
            price: newVariant.price,
            cost: newVariant.cost,
            stock_quantity: newVariant.stock_quantity,
            weight: newVariant.weight || undefined,
            attributes: newVariant.attributes,
            is_active: newVariant.is_active,
            updated_at: new Date(),
          }
        : v
    );

    onVariantsChange(updatedVariants);
    resetForm();
    toast.success('Varyant güncellendi');
  };

  // Delete variant
  const handleDeleteVariant = (variantId: string) => {
    if (!confirm('Bu varyantı silmek istediğinizden emin misiniz?')) {
      return;
    }

    const updatedVariants = variants.filter(v => v.id !== variantId);
    onVariantsChange(updatedVariants);
    toast.success('Varyant silindi');
  };

  // Edit variant
  const handleEditVariant = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setNewVariant({
      name: variant.name,
      sku: variant.sku,
      price: variant.price,
      cost: variant.cost,
      stock_quantity: variant.stock_quantity,
      weight: variant.weight || 0,
      attributes: variant.attributes,
      is_active: variant.is_active,
    });
    setShowAddForm(true);
  };

  // Toggle variant status
  const handleToggleVariantStatus = (variantId: string) => {
    const updatedVariants = variants.map(v =>
      v.id === variantId
        ? { ...v, is_active: !v.is_active, updated_at: new Date() }
        : v
    );
    onVariantsChange(updatedVariants);
  };

  // Don't show for simple products
  if (productType === 'simple') {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className='text-gray-400 text-lg mb-2'>
          <i className='ri-information-line'></i>
        </div>
        <p className='text-gray-400'>
          Basit ürünler için varyant yönetimi gerekmez
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h4 className='text-white font-medium'>Ürün Varyantları</h4>
          <p className='text-gray-400 text-sm'>
            {variants.length} varyant tanımlı
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className='bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-2'
        >
          <i className='ri-add-line'></i>
          Varyant Ekle
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className='bg-white/5 border border-white/10 rounded-xl p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h5 className='text-white font-medium'>
              {editingVariant ? 'Varyant Düzenle' : 'Yeni Varyant'}
            </h5>
            <button
              onClick={resetForm}
              className='text-gray-400 hover:text-white transition-colors'
            >
              <i className='ri-close-line'></i>
            </button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* Variant Name */}
            <div>
              <label className='block text-white font-medium mb-2'>
                Varyant Adı *
              </label>
              <input
                type='text'
                value={newVariant.name}
                onChange={e =>
                  setNewVariant(prev => ({ ...prev, name: e.target.value }))
                }
                className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
                placeholder='Kırmızı, M, Pamuk'
              />
            </div>

            {/* SKU */}
            <div>
              <label className='block text-white font-medium mb-2'>SKU *</label>
              <input
                type='text'
                value={newVariant.sku}
                onChange={e =>
                  setNewVariant(prev => ({ ...prev, sku: e.target.value }))
                }
                className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors font-mono'
                placeholder='URUN-KIRMIZI-M'
              />
            </div>

            {/* Price */}
            <div>
              <label className='block text-white font-medium mb-2'>
                Fiyat (₺) *
              </label>
              <input
                type='number'
                step='0.01'
                min='0'
                value={newVariant.price}
                onChange={e =>
                  setNewVariant(prev => ({
                    ...prev,
                    price: parseFloat(e.target.value) || 0,
                  }))
                }
                className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
                placeholder='99.99'
              />
            </div>

            {/* Cost */}
            <div>
              <label className='block text-white font-medium mb-2'>
                Maliyet (₺)
              </label>
              <input
                type='number'
                step='0.01'
                min='0'
                value={newVariant.cost}
                onChange={e =>
                  setNewVariant(prev => ({
                    ...prev,
                    cost: parseFloat(e.target.value) || 0,
                  }))
                }
                className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
                placeholder='50.00'
              />
            </div>

            {/* Stock */}
            <div>
              <label className='block text-white font-medium mb-2'>
                Stok Miktarı
              </label>
              <input
                type='number'
                min='0'
                value={newVariant.stock_quantity}
                onChange={e =>
                  setNewVariant(prev => ({
                    ...prev,
                    stock_quantity: parseInt(e.target.value) || 0,
                  }))
                }
                className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
                placeholder='100'
              />
            </div>

            {/* Weight */}
            <div>
              <label className='block text-white font-medium mb-2'>
                Ağırlık (kg)
              </label>
              <input
                type='number'
                step='0.01'
                min='0'
                value={newVariant.weight}
                onChange={e =>
                  setNewVariant(prev => ({
                    ...prev,
                    weight: parseFloat(e.target.value) || 0,
                  }))
                }
                className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
                placeholder='0.5'
              />
            </div>

            {/* Color */}
            <div>
              <label className='block text-white font-medium mb-2'>Renk</label>
              <input
                type='text'
                value={newVariant.attributes.color}
                onChange={e =>
                  setNewVariant(prev => ({
                    ...prev,
                    attributes: { ...prev.attributes, color: e.target.value },
                  }))
                }
                className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
                placeholder='Kırmızı'
              />
            </div>

            {/* Size */}
            <div>
              <label className='block text-white font-medium mb-2'>Beden</label>
              <input
                type='text'
                value={newVariant.attributes.size}
                onChange={e =>
                  setNewVariant(prev => ({
                    ...prev,
                    attributes: { ...prev.attributes, size: e.target.value },
                  }))
                }
                className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
                placeholder='M'
              />
            </div>

            {/* Material */}
            <div>
              <label className='block text-white font-medium mb-2'>
                Malzeme
              </label>
              <input
                type='text'
                value={newVariant.attributes.material}
                onChange={e =>
                  setNewVariant(prev => ({
                    ...prev,
                    attributes: {
                      ...prev.attributes,
                      material: e.target.value,
                    },
                  }))
                }
                className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors'
                placeholder='Pamuk'
              />
            </div>

            {/* Active Status */}
            <div className='md:col-span-2'>
              <label className='flex items-center space-x-3'>
                <input
                  type='checkbox'
                  checked={newVariant.is_active}
                  onChange={e =>
                    setNewVariant(prev => ({
                      ...prev,
                      is_active: e.target.checked,
                    }))
                  }
                  className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500'
                />
                <span className='text-white'>Aktif</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className='flex space-x-3 mt-6'>
            <button
              onClick={resetForm}
              className='flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer'
            >
              İptal
            </button>
            <button
              onClick={editingVariant ? handleUpdateVariant : handleAddVariant}
              className='flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer'
            >
              {editingVariant ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </div>
      )}

      {/* Variants List */}
      {variants.length > 0 && (
        <div className='space-y-3'>
          {variants.map(variant => (
            <div
              key={variant.id}
              className='bg-white/5 border border-white/10 rounded-xl p-4'
            >
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center space-x-3 mb-2'>
                    <h6 className='text-white font-medium'>{variant.name}</h6>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        variant.is_active
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {variant.is_active ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                    <div>
                      <span className='text-gray-400'>SKU:</span>
                      <span className='text-white ml-2 font-mono'>
                        {variant.sku}
                      </span>
                    </div>
                    <div>
                      <span className='text-gray-400'>Fiyat:</span>
                      <span className='text-white ml-2'>₺{variant.price}</span>
                    </div>
                    <div>
                      <span className='text-gray-400'>Stok:</span>
                      <span className='text-white ml-2'>
                        {variant.stock_quantity}
                      </span>
                    </div>
                    <div>
                      <span className='text-gray-400'>Ağırlık:</span>
                      <span className='text-white ml-2'>
                        {variant.weight || 0}kg
                      </span>
                    </div>
                  </div>
                  {Object.values(variant.attributes).some(attr => attr) && (
                    <div className='mt-2'>
                      <span className='text-gray-400 text-sm'>Özellikler:</span>
                      <div className='flex flex-wrap gap-2 mt-1'>
                        {variant.attributes.color && (
                          <span className='bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs'>
                            Renk: {variant.attributes.color}
                          </span>
                        )}
                        {variant.attributes.size && (
                          <span className='bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs'>
                            Beden: {variant.attributes.size}
                          </span>
                        )}
                        {variant.attributes.material && (
                          <span className='bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs'>
                            Malzeme: {variant.attributes.material}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className='flex space-x-2'>
                  <button
                    onClick={() => handleToggleVariantStatus(variant.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      variant.is_active
                        ? 'bg-gray-500/20 hover:bg-gray-500/30 text-gray-400'
                        : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                    }`}
                    title={variant.is_active ? 'Pasifleştir' : 'Aktifleştir'}
                  >
                    <i
                      className={
                        variant.is_active ? 'ri-pause-line' : 'ri-play-line'
                      }
                    ></i>
                  </button>
                  <button
                    onClick={() => handleEditVariant(variant)}
                    className='bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 p-2 rounded-lg transition-colors'
                    title='Düzenle'
                  >
                    <i className='ri-edit-line'></i>
                  </button>
                  <button
                    onClick={() => handleDeleteVariant(variant.id)}
                    className='bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-lg transition-colors'
                    title='Sil'
                  >
                    <i className='ri-delete-bin-line'></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {variants.length === 0 && !showAddForm && (
        <div className='text-center py-8'>
          <div className='text-gray-400 text-4xl mb-4'>
            <i className='ri-shopping-bag-line'></i>
          </div>
          <p className='text-gray-400 mb-4'>Henüz varyant tanımlanmamış</p>
          <button
            onClick={() => setShowAddForm(true)}
            className='bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 px-4 py-2 rounded-lg transition-colors cursor-pointer'
          >
            İlk Varyantı Ekle
          </button>
        </div>
      )}
    </div>
  );
}
