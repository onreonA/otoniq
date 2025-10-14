/**
 * Marketplace Connections Page
 * Manages external marketplace integrations (Trendyol, Amazon, Hepsiburada, etc.)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Play,
  Pause,
  Trash2,
  Edit,
  AlertCircle,
} from 'lucide-react';
import { MarketplaceConnection } from '../../../domain/entities/MarketplaceConnection';
import { MarketplaceConnectionService } from '../../../infrastructure/services/MarketplaceConnectionService';
import { SupabaseMarketplaceConnectionRepository } from '../../../infrastructure/database/supabase/repositories/SupabaseMarketplaceConnectionRepository';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import TrendyolConnectionModal from './components/TrendyolConnectionModal';

export default function MarketplaceConnectionsPage() {
  const { user, tenantId } = useAuth();
  const [connections, setConnections] = useState<MarketplaceConnection[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMarketplace, setFilterMarketplace] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTrendyolModal, setShowTrendyolModal] = useState(false);
  const [selectedConnection, setSelectedConnection] =
    useState<MarketplaceConnection | null>(null);

  const marketplaceConnectionService = new MarketplaceConnectionService(
    new SupabaseMarketplaceConnectionRepository()
  );

  const loadConnections = useCallback(async () => {
    if (!tenantId) {
      return;
    }

    try {
      setLoading(true);

      const result = await marketplaceConnectionService.getConnections(
        tenantId,
        {
          search: searchTerm || undefined,
          status: filterStatus !== 'all' ? (filterStatus as any) : undefined,
          marketplace:
            filterMarketplace !== 'all'
              ? (filterMarketplace as any)
              : undefined,
        }
      );

      setConnections(result.data);
    } catch (error) {
      console.error('❌ Error loading marketplace connections:', error);
      toast.error('Marketplace bağlantıları yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  const fetchConnections = async () => {
    await loadConnections();
  };

  useEffect(() => {
    if (tenantId) {
      loadConnections();
    }
  }, [tenantId, loadConnections]);

  const handleTestConnection = async (connection: MarketplaceConnection) => {
    try {
      toast.loading(`${connection.name} bağlantısı test ediliyor...`);

      const result = await marketplaceConnectionService.testConnection({
        connectionId: connection.id,
      });

      if (result.success) {
        toast.success('Bağlantı testi başarılı!');
      } else {
        toast.error(`Bağlantı testi başarısız: ${result.error}`);
      }

      // Refresh connections to show updated status
      loadConnections();
    } catch (error) {
      console.error('Error testing connection:', error);
      toast.error('Bağlantı testi sırasında hata oluştu');
    }
  };

  const handleDeleteConnection = async (connection: MarketplaceConnection) => {
    if (
      !confirm(
        `"${connection.name}" bağlantısını silmek istediğinizden emin misiniz?`
      )
    ) {
      return;
    }

    try {
      toast.loading('Bağlantı siliniyor...');
      await marketplaceConnectionService.deleteConnection(connection.id);
      toast.success('Bağlantı başarıyla silindi');
      loadConnections();
    } catch (error) {
      console.error('Error deleting connection:', error);
      toast.error('Bağlantı silinirken hata oluştu');
    }
  };

  const getStatusColor = (status: MarketplaceConnection['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'testing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: MarketplaceConnection['status']) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'inactive':
        return 'Pasif';
      case 'error':
        return 'Hata';
      case 'testing':
        return 'Test Ediliyor';
      default:
        return status;
    }
  };

  const getMarketplaceIcon = (
    marketplace: MarketplaceConnection['marketplace']
  ) => {
    switch (marketplace) {
      case 'trendyol':
        return '🛍️';
      case 'amazon':
        return '📦';
      case 'hepsiburada':
        return '🏪';
      case 'n11':
        return '🛒';
      case 'gittigidiyor':
        return '🏷️';
      case 'ciceksepeti':
        return '🌸';
      default:
        return '🔗';
    }
  };

  return (
    <div className='relative z-10'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-3xl font-bold text-white mb-2'>
                  Marketplace Bağlantıları 🛍️
                </h1>
                <p className='text-gray-300 text-lg'>
                  Trendyol, Amazon, Hepsiburada ve diğer marketplace'lerle
                  entegrasyonlarınızı yönetin
                </p>
              </div>
              <div className='flex gap-3'>
                <button
                  onClick={() => setShowTrendyolModal(true)}
                  className='bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-orange-500/25'
                >
                  <Plus className='w-5 h-5' />
                  Trendyol Bağlantısı
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-blue-500/25'
                >
                  <Plus className='w-5 h-5' />
                  Diğer Marketplace
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <div className='bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:scale-105 transition-transform duration-300'>
            <div className='flex items-center'>
              <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4'>
                <Plus className='w-6 h-6 text-white' />
              </div>
              <div>
                <p className='text-sm font-medium text-gray-300'>
                  Toplam Bağlantı
                </p>
                <p className='text-2xl font-bold text-white'>
                  {connections.length}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:scale-105 transition-transform duration-300'>
            <div className='flex items-center'>
              <div className='w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4'>
                <Play className='w-6 h-6 text-white' />
              </div>
              <div>
                <p className='text-sm font-medium text-gray-300'>Aktif</p>
                <p className='text-2xl font-bold text-white'>
                  {connections.filter(c => c.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:scale-105 transition-transform duration-300'>
            <div className='flex items-center'>
              <div className='w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center mr-4'>
                <AlertCircle className='w-6 h-6 text-white' />
              </div>
              <div>
                <p className='text-sm font-medium text-gray-300'>Hata</p>
                <p className='text-2xl font-bold text-white'>
                  {connections.filter(c => c.status === 'error').length}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:scale-105 transition-transform duration-300'>
            <div className='flex items-center'>
              <div className='w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mr-4'>
                <Pause className='w-6 h-6 text-white' />
              </div>
              <div>
                <p className='text-sm font-medium text-gray-300'>Pasif</p>
                <p className='text-2xl font-bold text-white'>
                  {connections.filter(c => c.status === 'inactive').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className='bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6'>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                <input
                  type='text'
                  placeholder='Bağlantı ara...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm'
                />
              </div>
            </div>

            <div className='flex gap-4'>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className='px-4 py-3 bg-gray-800/50 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm'
              >
                <option value='all'>Tüm Durumlar</option>
                <option value='active'>Aktif</option>
                <option value='inactive'>Pasif</option>
                <option value='error'>Hata</option>
                <option value='testing'>Test Ediliyor</option>
              </select>

              <select
                value={filterMarketplace}
                onChange={e => setFilterMarketplace(e.target.value)}
                className='px-4 py-3 bg-gray-800/50 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm'
              >
                <option value='all'>Tüm Marketplace'ler</option>
                <option value='trendyol'>Trendyol</option>
                <option value='amazon'>Amazon</option>
                <option value='hepsiburada'>Hepsiburada</option>
                <option value='n11'>N11</option>
                <option value='gittigidiyor'>GittiGidiyor</option>
                <option value='ciceksepeti'>Çiçeksepeti</option>
              </select>
            </div>
          </div>
        </div>

        {/* Connections List */}
        <div className='bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden'>
          {loading ? (
            <div className='p-8 text-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto'></div>
              <p className='text-gray-300 mt-4'>Bağlantılar yükleniyor...</p>
            </div>
          ) : connections.length === 0 ? (
            <div className='p-8 text-center'>
              <div className='w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6'>
                <Plus className='w-10 h-10 text-white' />
              </div>
              <h3 className='text-xl font-bold text-white mb-3'>
                Henüz bağlantı yok
              </h3>
              <p className='text-gray-300 mb-6 max-w-md mx-auto'>
                Marketplace entegrasyonlarınızı başlatmak için ilk bağlantınızı
                oluşturun.
              </p>
              <div className='flex gap-3 justify-center'>
                <button
                  onClick={() => setShowTrendyolModal(true)}
                  className='bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-xl inline-flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-orange-500/25'
                >
                  <Plus className='w-5 h-5' />
                  Trendyol Bağlantısı
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl inline-flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-blue-500/25'
                >
                  <Plus className='w-5 h-5' />
                  Diğer Marketplace
                </button>
              </div>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-white/10'>
                <thead className='bg-gray-800/50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
                      Bağlantı
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
                      Marketplace
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
                      Durum
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
                      Son Senkronizasyon
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
                      Otomatik Senkronizasyon
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider'>
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-transparent divide-y divide-white/10'>
                  {connections.map(connection => (
                    <tr
                      key={connection.id}
                      className='hover:bg-white/5 transition-colors duration-200'
                    >
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div>
                          <div className='text-sm font-medium text-white'>
                            {connection.name}
                          </div>
                          {connection.last_error && (
                            <div className='text-sm text-red-400 mt-1'>
                              {connection.last_error}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <span className='text-2xl mr-3'>
                            {getMarketplaceIcon(connection.marketplace)}
                          </span>
                          <span className='text-sm text-gray-300'>
                            {connection.getDisplayName()}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(connection.status)}`}
                        >
                          {getStatusText(connection.status)}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                        {connection.last_sync_at
                          ? new Date(
                              connection.last_sync_at
                            ).toLocaleDateString('tr-TR')
                          : '-'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          {connection.sync_enabled ? (
                            <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30'>
                              <Play className='w-3 h-3 mr-1' />
                              Aktif
                            </span>
                          ) : (
                            <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30'>
                              <Pause className='w-3 h-3 mr-1' />
                              Pasif
                            </span>
                          )}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                        <div className='flex items-center justify-end gap-2'>
                          <button
                            onClick={() => handleTestConnection(connection)}
                            className='text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-500/20 transition-all duration-200'
                            title='Bağlantıyı Test Et'
                          >
                            <Play className='w-4 h-4' />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedConnection(connection);
                              setShowEditModal(true);
                            }}
                            className='text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-500/20 transition-all duration-200'
                            title='Düzenle'
                          >
                            <Edit className='w-4 h-4' />
                          </button>
                          <button
                            onClick={() => handleDeleteConnection(connection)}
                            className='text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/20 transition-all duration-200'
                            title='Sil'
                          >
                            <Trash2 className='w-4 h-4' />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Trendyol Connection Modal */}
      {showTrendyolModal && (
        <TrendyolConnectionModal
          isOpen={showTrendyolModal}
          onClose={() => setShowTrendyolModal(false)}
          onSuccess={() => {
            fetchConnections();
            setShowTrendyolModal(false);
          }}
        />
      )}

      {/* Create/Edit Modals will be added here */}
      {showCreateModal && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'>
          <div className='bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md'>
            <h2 className='text-xl font-bold text-white mb-4'>
              Yeni Marketplace Bağlantısı
            </h2>
            <p className='text-gray-300 mb-6'>
              Marketplace bağlantı modal'ı yakında eklenecek...
            </p>
            <div className='flex justify-end gap-3'>
              <button
                onClick={() => setShowCreateModal(false)}
                className='px-4 py-2 text-gray-400 hover:text-white transition-colors'
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedConnection && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'>
          <div className='bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md'>
            <h2 className='text-xl font-bold text-white mb-4'>
              Bağlantıyı Düzenle
            </h2>
            <p className='text-gray-300 mb-6'>
              Marketplace bağlantı düzenleme modal'ı yakında eklenecek...
            </p>
            <div className='flex justify-end gap-3'>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedConnection(null);
                }}
                className='px-4 py-2 text-gray-400 hover:text-white transition-colors'
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
