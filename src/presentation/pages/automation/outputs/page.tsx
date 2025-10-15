/**
 * Workflow Outputs Page
 * Display and manage all generated outputs from workflows (reports, images, emails, etc.)
 */

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import FeatureIntro from '../../../components/common/FeatureIntro';

interface WorkflowOutput {
  id: string;
  workflowId: string;
  workflowName: string;
  executionId: string;
  outputType: 'report' | 'image' | 'video' | 'email' | 'document' | 'data';
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  outputData: any;
  metadata: any;
  createdAt: string;
}

export default function WorkflowOutputsPage() {
  const [outputs, setOutputs] = useState<WorkflowOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('all');
  const [previewOutput, setPreviewOutput] = useState<WorkflowOutput | null>(
    null
  );

  useEffect(() => {
    loadOutputs();
  }, [selectedType, selectedWorkflow]);

  const loadOutputs = async () => {
    setLoading(true);
    // Mock data for now
    setTimeout(() => {
      setOutputs(getMockOutputs());
      setLoading(false);
    }, 500);
  };

  const getMockOutputs = (): WorkflowOutput[] => {
    return [
      {
        id: '1',
        workflowId: 'wf-daily-report',
        workflowName: 'Günlük Satış Raporu',
        executionId: 'exec-001',
        outputType: 'report',
        fileName: 'daily-sales-report-2024-01-15.pdf',
        fileUrl: '#',
        fileSize: 2450000,
        mimeType: 'application/pdf',
        outputData: {
          totalSales: 125000,
          totalOrders: 45,
          averageOrderValue: 2777.78,
        },
        metadata: { generatedAt: new Date().toISOString() },
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: '2',
        workflowId: 'wf-social-media',
        workflowName: 'Sosyal Medya Otomasyonu',
        executionId: 'exec-002',
        outputType: 'image',
        fileName: 'instagram-post-product-123.jpg',
        fileUrl: 'https://picsum.photos/400/400',
        fileSize: 850000,
        mimeType: 'image/jpeg',
        outputData: {
          platform: 'instagram',
          postId: 'ig-12345',
          likes: 125,
        },
        metadata: { productId: '123', platform: 'instagram' },
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: '3',
        workflowId: 'wf-email-campaign',
        workflowName: 'E-posta Kampanyası',
        executionId: 'exec-003',
        outputType: 'email',
        fileName: 'campaign-new-products-jan.html',
        fileUrl: '#',
        fileSize: 125000,
        mimeType: 'text/html',
        outputData: {
          recipients: 250,
          sent: 248,
          opened: 125,
          clicked: 35,
        },
        metadata: { campaignId: 'camp-001' },
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ];
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getOutputTypeIcon = (type: string): string => {
    switch (type) {
      case 'report':
        return 'ri-file-chart-line';
      case 'image':
        return 'ri-image-line';
      case 'video':
        return 'ri-video-line';
      case 'email':
        return 'ri-mail-line';
      case 'document':
        return 'ri-file-text-line';
      default:
        return 'ri-file-line';
    }
  };

  const getOutputTypeColor = (type: string): string => {
    switch (type) {
      case 'report':
        return 'bg-blue-500/20 text-blue-400';
      case 'image':
        return 'bg-purple-500/20 text-purple-400';
      case 'video':
        return 'bg-pink-500/20 text-pink-400';
      case 'email':
        return 'bg-cyan-500/20 text-cyan-400';
      case 'document':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleDownload = (output: WorkflowOutput) => {
    toast.success(`İndiriliyor: ${output.fileName}`);
    // Implement download logic
  };

  const handleBulkDownload = () => {
    if (outputs.length === 0) {
      toast.error('İndirilecek çıktı bulunamadı');
      return;
    }
    toast.success(`${outputs.length} dosya ZIP olarak indiriliyor...`);
    // Implement bulk download logic
  };

  const handleDelete = (outputId: string) => {
    if (confirm('Bu çıktıyı silmek istediğinizden emin misiniz?')) {
      setOutputs(outputs.filter(o => o.id !== outputId));
      toast.success('Çıktı silindi');
    }
  };

  const filteredOutputs = outputs.filter(output => {
    if (selectedType !== 'all' && output.outputType !== selectedType)
      return false;
    if (selectedWorkflow !== 'all' && output.workflowId !== selectedWorkflow)
      return false;
    return true;
  });

  return (
    <div className='relative z-10'>
      <div className='max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-6'>
        {/* Feature Introduction */}
        <FeatureIntro
          storageKey='automation-outputs'
          title='📦 Otomasyon Çıktıları: Üretilen tüm içeriklere erişin'
          subtitle="Workflow'ların oluşturduğu raporlar, görseller, e-postalar ve daha fazlası"
          items={[
            'PDF raporlar, Excel dosyaları, analizler',
            'Sosyal medya görselleri ve videolar',
            'E-posta kampanya sonuçları',
            'Toplu indirme ve önizleme özellikleri',
          ]}
          actions={[
            {
              label: 'Toplu İndir (ZIP)',
              onClick: handleBulkDownload,
              variant: 'primary',
            },
          ]}
          variant='indigo'
          icon='ri-archive-line'
        />

        {/* Page Header */}
        <div className='mb-6'>
          <div className='bg-gradient-to-r from-indigo-600/20 to-purple-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-2xl font-bold text-white mb-1'>
                  📦 Otomasyon Çıktıları
                </h1>
                <p className='text-gray-300'>
                  Toplam {filteredOutputs.length} çıktı
                </p>
              </div>
              <div className='hidden md:block'>
                <div className='w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg'>
                  <i className='ri-folder-download-line text-white text-2xl'></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-4 mb-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {/* Type Filter */}
            <div>
              <label className='text-sm text-gray-300 mb-2 block'>
                Çıktı Tipi
              </label>
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className='w-full bg-gray-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500'
              >
                <option value='all'>Tümü</option>
                <option value='report'>Rapor</option>
                <option value='image'>Görsel</option>
                <option value='video'>Video</option>
                <option value='email'>E-posta</option>
                <option value='document'>Doküman</option>
              </select>
            </div>

            {/* Workflow Filter */}
            <div>
              <label className='text-sm text-gray-300 mb-2 block'>
                Workflow
              </label>
              <select
                value={selectedWorkflow}
                onChange={e => setSelectedWorkflow(e.target.value)}
                className='w-full bg-gray-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500'
              >
                <option value='all'>Tüm Workflow'lar</option>
                <option value='wf-daily-report'>Günlük Satış Raporu</option>
                <option value='wf-social-media'>Sosyal Medya Otomasyonu</option>
                <option value='wf-email-campaign'>E-posta Kampanyası</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className='text-sm text-gray-300 mb-2 block'>Ara</label>
              <div className='relative'>
                <input
                  type='text'
                  placeholder='Dosya adı...'
                  className='w-full bg-gray-800/50 border border-white/10 rounded-lg px-4 py-2 pl-10 text-white focus:outline-none focus:border-indigo-500'
                />
                <i className='ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'></i>
              </div>
            </div>
          </div>
        </div>

        {/* Outputs Grid */}
        {loading ? (
          <div className='flex items-center justify-center py-12'>
            <div className='text-gray-400'>Yükleniyor...</div>
          </div>
        ) : filteredOutputs.length === 0 ? (
          <div className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center'>
            <i className='ri-folder-open-line text-6xl text-gray-600 mb-4'></i>
            <p className='text-gray-400 text-lg mb-2'>Henüz çıktı yok</p>
            <p className='text-gray-500 text-sm'>
              Workflow çalıştırıldığında çıktılar burada görünecek
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {filteredOutputs.map(output => (
              <div
                key={output.id}
                className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:border-indigo-500/50 transition-all group'
              >
                {/* Preview */}
                {output.outputType === 'image' && (
                  <div className='mb-3 rounded-lg overflow-hidden'>
                    <img
                      src={output.fileUrl}
                      alt={output.fileName}
                      className='w-full h-40 object-cover'
                    />
                  </div>
                )}

                {/* Type Badge */}
                <div className='flex items-center gap-2 mb-3'>
                  <span
                    className={`${getOutputTypeColor(output.outputType)} px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1`}
                  >
                    <i className={getOutputTypeIcon(output.outputType)}></i>
                    {output.outputType.toUpperCase()}
                  </span>
                </div>

                {/* File Info */}
                <h3 className='text-white font-medium text-sm mb-2 truncate'>
                  {output.fileName}
                </h3>
                <p className='text-gray-400 text-xs mb-3'>
                  {output.workflowName}
                </p>

                {/* Metadata */}
                <div className='flex items-center justify-between text-xs text-gray-500 mb-4'>
                  <span>{formatFileSize(output.fileSize)}</span>
                  <span>
                    {new Date(output.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>

                {/* Actions */}
                <div className='flex gap-2'>
                  <button
                    onClick={() => setPreviewOutput(output)}
                    className='flex-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1'
                  >
                    <i className='ri-eye-line'></i>
                    Önizle
                  </button>
                  <button
                    onClick={() => handleDownload(output)}
                    className='flex-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1'
                  >
                    <i className='ri-download-line'></i>
                    İndir
                  </button>
                  <button
                    onClick={() => handleDelete(output.id)}
                    className='bg-red-600/20 hover:bg-red-600/30 text-red-400 px-3 py-2 rounded-lg text-xs font-medium transition-colors'
                  >
                    <i className='ri-delete-bin-line'></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Preview Modal */}
        {previewOutput && (
          <div className='fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
            <div className='bg-gray-900 border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
              {/* Modal Header */}
              <div className='flex items-center justify-between p-4 border-b border-white/10'>
                <h3 className='text-white font-semibold'>
                  {previewOutput.fileName}
                </h3>
                <button
                  onClick={() => setPreviewOutput(null)}
                  className='text-gray-400 hover:text-white transition-colors'
                >
                  <i className='ri-close-line text-2xl'></i>
                </button>
              </div>

              {/* Modal Body */}
              <div className='p-6'>
                {previewOutput.outputType === 'image' && (
                  <img
                    src={previewOutput.fileUrl}
                    alt={previewOutput.fileName}
                    className='w-full rounded-lg'
                  />
                )}
                {previewOutput.outputType === 'report' && (
                  <div className='text-gray-300 space-y-4'>
                    <p>PDF önizlemesi yakında eklenecek...</p>
                    <div className='bg-gray-800/50 rounded-lg p-4'>
                      <pre className='text-sm'>
                        {JSON.stringify(previewOutput.outputData, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
                {previewOutput.outputType === 'email' && (
                  <div className='text-gray-300 space-y-4'>
                    <div className='bg-gray-800/50 rounded-lg p-4'>
                      <p className='font-semibold mb-2'>
                        E-posta İstatistikleri:
                      </p>
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <p className='text-sm text-gray-400'>Alıcı</p>
                          <p className='text-lg font-bold'>
                            {previewOutput.outputData.recipients}
                          </p>
                        </div>
                        <div>
                          <p className='text-sm text-gray-400'>Gönderildi</p>
                          <p className='text-lg font-bold'>
                            {previewOutput.outputData.sent}
                          </p>
                        </div>
                        <div>
                          <p className='text-sm text-gray-400'>Açıldı</p>
                          <p className='text-lg font-bold'>
                            {previewOutput.outputData.opened}
                          </p>
                        </div>
                        <div>
                          <p className='text-sm text-gray-400'>Tıklandı</p>
                          <p className='text-lg font-bold'>
                            {previewOutput.outputData.clicked}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className='flex gap-3 p-4 border-t border-white/10'>
                <button
                  onClick={() => handleDownload(previewOutput)}
                  className='flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2'
                >
                  <i className='ri-download-line'></i>
                  İndir
                </button>
                <button
                  onClick={() => setPreviewOutput(null)}
                  className='flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors'
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
