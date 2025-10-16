import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { createClient } from '@supabase/supabase-js';
import { Clock, User, FileText, Filter, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface AuditLog {
  id: string;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id: string;
  old_values: any;
  new_values: any;
  metadata: any;
  ip_address: string;
  created_at: string;
}

export default function AuditLogsPage() {
  const { userProfile } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterResource, setFilterResource] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7');

  useEffect(() => {
    if (userProfile?.tenant_id) {
      loadAuditLogs();
    }
  }, [userProfile, filterAction, filterResource, dateRange]);

  const loadAuditLogs = async () => {
    try {
      setIsLoading(true);

      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('tenant_id', userProfile?.tenant_id)
        .order('created_at', { ascending: false })
        .limit(100);

      // Apply filters
      if (filterAction !== 'all') {
        query = query.eq('action', filterAction);
      }

      if (filterResource !== 'all') {
        query = query.eq('resource_type', filterResource);
      }

      // Date range filter
      if (dateRange !== 'all') {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));
        query = query.gte('created_at', daysAgo.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      setLogs(data || []);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast.error('Audit logları yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'text-green-400';
      case 'update':
        return 'text-blue-400';
      case 'delete':
        return 'text-red-400';
      case 'login':
        return 'text-purple-400';
      case 'logout':
        return 'text-gray-400';
      case 'export':
        return 'text-yellow-400';
      default:
        return 'text-gray-300';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return '➕';
      case 'update':
        return '✏️';
      case 'delete':
        return '🗑️';
      case 'login':
        return '🔓';
      case 'logout':
        return '🔒';
      case 'export':
        return '📤';
      default:
        return '📋';
    }
  };

  const exportLogs = () => {
    const csv = [
      ['Date', 'User', 'Action', 'Resource Type', 'Resource ID', 'IP Address'],
      ...logs.map(log => [
        new Date(log.created_at).toLocaleString(),
        log.user_email,
        log.action,
        log.resource_type,
        log.resource_id,
        log.ip_address,
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Audit logları dışa aktarıldı');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Audit Logları</h1>
          <p className="text-gray-400">Sistem aktivitelerini ve güvenlik olaylarını izleyin</p>
        </div>
        <button
          onClick={exportLogs}
          disabled={logs.length === 0}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          <Download size={18} />
          CSV Olarak İndir
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Filtreler</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Action Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Aksiyon
            </label>
            <select
              value={filterAction}
              onChange={e => setFilterAction(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tümü</option>
              <option value="create">Oluşturma</option>
              <option value="update">Güncelleme</option>
              <option value="delete">Silme</option>
              <option value="login">Giriş</option>
              <option value="logout">Çıkış</option>
              <option value="export">Dışa Aktarma</option>
            </select>
          </div>

          {/* Resource Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Kaynak Tipi
            </label>
            <select
              value={filterResource}
              onChange={e => setFilterResource(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tümü</option>
              <option value="product">Ürün</option>
              <option value="order">Sipariş</option>
              <option value="user">Kullanıcı</option>
              <option value="workflow">Workflow</option>
              <option value="integration">Entegrasyon</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Zaman Aralığı
            </label>
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
            >
              <option value="1">Son 24 Saat</option>
              <option value="7">Son 7 Gün</option>
              <option value="30">Son 30 Gün</option>
              <option value="90">Son 90 Gün</option>
              <option value="all">Tümü</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/10 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Zaman
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Kullanıcı
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Aksiyon
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Kaynak
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  IP Adresi
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Detaylar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      Yükleniyor...
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    Audit log bulunamadı
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-blue-400" />
                        {new Date(log.created_at).toLocaleString('tr-TR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-purple-400" />
                        {log.user_email || 'System'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className={`flex items-center gap-2 font-medium ${getActionColor(log.action)}`}>
                        <span>{getActionIcon(log.action)}</span>
                        {log.action}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-green-400" />
                        {log.resource_type}
                        {log.resource_id && (
                          <span className="text-gray-500 text-xs">
                            ({log.resource_id.slice(0, 8)}...)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 font-mono">
                      {log.ip_address || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {log.metadata && (
                        <button
                          onClick={() => {
                            toast(
                              <pre className="text-xs max-w-md overflow-auto">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>,
                              { duration: 5000 }
                            );
                          }}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          Görüntüle
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="text-gray-400 text-sm mb-2">Toplam Log</div>
          <div className="text-3xl font-bold text-white">{logs.length}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="text-gray-400 text-sm mb-2">Oluşturma</div>
          <div className="text-3xl font-bold text-green-400">
            {logs.filter(l => l.action === 'create').length}
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="text-gray-400 text-sm mb-2">Güncelleme</div>
          <div className="text-3xl font-bold text-blue-400">
            {logs.filter(l => l.action === 'update').length}
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="text-gray-400 text-sm mb-2">Silme</div>
          <div className="text-3xl font-bold text-red-400">
            {logs.filter(l => l.action === 'delete').length}
          </div>
        </div>
      </div>
    </div>
  );
}

