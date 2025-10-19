import { useState, useEffect } from 'react';
import {
  TenantService,
  Tenant,
} from '../../../../infrastructure/database/supabase/tenant.service';
import CreateTenantModal from './CreateTenantModal';
import TenantModal from './TenantModal';
import ViewTenantModal from './ViewTenantModal';
import toast from 'react-hot-toast';

export default function TenantManagement() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [viewingTenant, setViewingTenant] = useState<string | null>(null);

  // Tenant'ları yükle
  const loadTenants = async () => {
    try {
      setLoading(true);
      const data = await TenantService.getAllTenants();
      setTenants(data);
    } catch (error) {
      console.error('Tenant yükleme hatası:', error);
      toast.error('Müşteriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // İlk yükleme
  useEffect(() => {
    loadTenants();
  }, []);

  // Filtreleme
  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch =
      tenant.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.domain?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || tenant.subscription_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Durum rengi
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400';
      case 'trial':
        return 'bg-blue-500/20 text-blue-400';
      case 'suspended':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'cancelled':
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
      case 'trial':
        return 'Deneme';
      case 'suspended':
        return 'Askıda';
      case 'cancelled':
        return 'İptal';
      default:
        return 'Bilinmiyor';
    }
  };

  // Plan rengi
  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'starter':
        return 'bg-blue-500/20 text-blue-400';
      case 'professional':
        return 'bg-purple-500/20 text-purple-400';
      case 'enterprise':
        return 'bg-orange-500/20 text-orange-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  // Tenant seçimi
  const toggleTenantSelection = (tenantId: string) => {
    setSelectedTenants(prev =>
      prev.includes(tenantId)
        ? prev.filter(id => id !== tenantId)
        : [...prev, tenantId]
    );
  };

  // Toplu işlemler
  const handleBulkStatusUpdate = async (status: string) => {
    try {
      const promises = selectedTenants.map(id =>
        TenantService.updateTenantStatus(id, status as any)
      );
      await Promise.all(promises);

      toast.success(`${selectedTenants.length} müşteri durumu güncellendi`);
      setSelectedTenants([]);
      loadTenants();
    } catch (error) {
      console.error('Toplu durum güncelleme hatası:', error);
      toast.error('Durum güncellenirken hata oluştu');
    }
  };

  // Tenant silme
  const handleDeleteTenant = async (tenantId: string) => {
    if (!confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await TenantService.deleteTenant(tenantId);
      toast.success('Müşteri başarıyla silindi');
      loadTenants();
    } catch (error) {
      console.error('Tenant silme hatası:', error);
      toast.error('Müşteri silinirken hata oluştu');
    }
  };

  // Loading durumu
  if (loading) {
    return (
      <div className='space-y-6'>
        <div className='bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
          <div className='animate-pulse'>
            <div className='h-8 bg-gray-700 rounded w-1/3 mb-4'></div>
            <div className='h-4 bg-gray-700 rounded w-1/2'></div>
          </div>
        </div>
        <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
          <div className='animate-pulse space-y-4'>
            {[...Array(5)].map((_, i) => (
              <div key={i} className='h-16 bg-gray-700 rounded'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold text-white mb-2'>
              Müşteri Yönetimi
            </h2>
            <p className='text-gray-300'>Tüm müşterileri görüntüle ve yönet</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className='bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 cursor-pointer'
          >
            <i className='ri-building-add-line mr-2'></i>
            Yeni Müşteri
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
        <div className='flex flex-col md:flex-row gap-4'>
          {/* Search */}
          <div className='flex-1'>
            <div className='relative'>
              <input
                type='text'
                placeholder='Müşteri ara...'
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
              <option value='trial'>Deneme</option>
              <option value='suspended'>Askıda</option>
              <option value='cancelled'>İptal</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedTenants.length > 0 && (
            <div className='flex space-x-2'>
              <button
                onClick={() => handleBulkStatusUpdate('active')}
                className='bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 px-4 py-3 rounded-xl transition-colors cursor-pointer'
              >
                <i className='ri-check-line mr-2'></i>
                Aktifleştir
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('suspended')}
                className='bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-400 px-4 py-3 rounded-xl transition-colors cursor-pointer'
              >
                <i className='ri-pause-line mr-2'></i>
                Askıya Al
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('cancelled')}
                className='bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl transition-colors cursor-pointer'
              >
                <i className='ri-close-line mr-2'></i>
                İptal Et
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tenants Table */}
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
                        setSelectedTenants(
                          filteredTenants.map(tenant => tenant.id)
                        );
                      } else {
                        setSelectedTenants([]);
                      }
                    }}
                  />
                </th>
                <th className='text-left p-4 text-gray-300 font-medium'>
                  Şirket
                </th>
                <th className='text-left p-4 text-gray-300 font-medium'>
                  Domain
                </th>
                <th className='text-left p-4 text-gray-300 font-medium'>
                  Plan
                </th>
                <th className='text-left p-4 text-gray-300 font-medium'>
                  Durum
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
              {filteredTenants.map(tenant => (
                <tr
                  key={tenant.id}
                  className='border-b border-white/5 hover:bg-white/5 transition-colors'
                >
                  <td className='p-4'>
                    <input
                      type='checkbox'
                      checked={selectedTenants.includes(tenant.id)}
                      onChange={() => toggleTenantSelection(tenant.id)}
                      className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500'
                    />
                  </td>
                  <td className='p-4'>
                    <div>
                      <div className='text-white font-medium'>
                        {tenant.company_name}
                      </div>
                      <div className='text-gray-400 text-sm'>
                        ID: {tenant.id.slice(0, 8)}...
                      </div>
                    </div>
                  </td>
                  <td className='p-4 text-gray-300'>
                    {tenant.domain ? (
                      <span className='text-blue-400'>{tenant.domain}</span>
                    ) : (
                      <span className='text-gray-500'>-</span>
                    )}
                  </td>
                  <td className='p-4'>
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${getPlanColor(tenant.subscription_plan)}`}
                    >
                      {tenant.subscription_plan}
                    </span>
                  </td>
                  <td className='p-4'>
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${getStatusColor(tenant.subscription_status)}`}
                    >
                      {getStatusText(tenant.subscription_status)}
                    </span>
                  </td>
                  <td className='p-4 text-gray-400 text-sm'>
                    {new Date(tenant.created_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td className='p-4'>
                    <div className='flex space-x-2'>
                      <button
                        onClick={() => setEditingTenant(tenant)}
                        className='text-blue-400 hover:text-blue-300 transition-colors cursor-pointer'
                        title='Düzenle'
                      >
                        <i className='ri-edit-line'></i>
                      </button>
                      <button
                        onClick={() => setViewingTenant(tenant.id)}
                        className='text-green-400 hover:text-green-300 transition-colors cursor-pointer'
                        title='Detay'
                      >
                        <i className='ri-eye-line'></i>
                      </button>
                      <button
                        onClick={() => handleDeleteTenant(tenant.id)}
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
            {filteredTenants.length} müşteri gösteriliyor
          </div>
          <div className='flex space-x-2'>
            <button className='bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-2 rounded-lg transition-colors cursor-pointer'>
              <i className='ri-arrow-left-line'></i>
            </button>
            <button className='bg-blue-500 text-white px-3 py-2 rounded-lg'>
              1
            </button>
            <button className='bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-2 rounded-lg transition-colors cursor-pointer'>
              2
            </button>
            <button className='bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-2 rounded-lg transition-colors cursor-pointer'>
              3
            </button>
            <button className='bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-2 rounded-lg transition-colors cursor-pointer'>
              <i className='ri-arrow-right-line'></i>
            </button>
          </div>
        </div>
      </div>

      {/* Create Tenant Modal */}
      <CreateTenantModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          loadTenants();
        }}
      />

      {/* Edit Tenant Modal */}
      {editingTenant && (
        <TenantModal
          isOpen={!!editingTenant}
          onClose={() => setEditingTenant(null)}
          onSuccess={() => {
            loadTenants();
          }}
          editingTenant={editingTenant}
        />
      )}

      {/* View Tenant Modal */}
      {viewingTenant && (
        <ViewTenantModal
          isOpen={!!viewingTenant}
          onClose={() => setViewingTenant(null)}
          tenantId={viewingTenant}
        />
      )}
    </div>
  );
}
