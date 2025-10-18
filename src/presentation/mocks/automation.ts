/**
 * Automation Mock Data
 * Mock data for Automation Center (N8N workflows, runs, logs)
 */

import { subHours, format } from 'date-fns';

// Workflow Data
export interface WorkflowData {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'error';
  category:
    | 'social-media'
    | 'email-marketing'
    | 'customer-support'
    | 'inventory'
    | 'analytics'
    | 'reports';
  lastRunAt: string;
  lastResult: 'success' | 'fail' | 'partial';
  totalRuns: number;
  successRate: number;
  icon: string;
  color: string;
  // N8N specific fields
  n8nWorkflowId?: string;
  schedule?: string; // Cron expression
  webhookUrl?: string;
  isN8NManaged?: boolean;
  // Configuration
  config?: {
    // Daily Report config
    reportTime?: string;
    reportRecipients?: string[];
    reportFormat?: 'email' | 'pdf' | 'html';
    // Low Stock Alert config
    stockThreshold?: number;
    checkInterval?: number; // minutes
    alertChannels?: Array<'email' | 'sms' | 'slack'>;
    productsToTrack?: string[];
  };
}

export const mockWorkflows: WorkflowData[] = [
  {
    id: '1',
    name: 'Sosyal Medya Post Otomasyonu',
    description:
      "Yeni ürünleri otomatik olarak Instagram, Facebook ve Twitter'a paylaş",
    status: 'active',
    category: 'social-media',
    lastRunAt: format(subHours(new Date(), 2), 'yyyy-MM-dd HH:mm:ss'),
    lastResult: 'success',
    totalRuns: 847,
    successRate: 98.5,
    icon: 'ri-share-line',
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: '2',
    name: 'E-posta Kampanya Otomasyonu',
    description: 'Müşteri segmentlerine özel e-posta kampanyaları gönder',
    status: 'active',
    category: 'email-marketing',
    lastRunAt: format(subHours(new Date(), 5), 'yyyy-MM-dd HH:mm:ss'),
    lastResult: 'success',
    totalRuns: 1245,
    successRate: 99.2,
    icon: 'ri-mail-send-line',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: '3',
    name: 'Müşteri Destek Bot',
    description: 'WhatsApp ve Telegram üzerinden müşteri sorularını yanıtla',
    status: 'active',
    category: 'customer-support',
    lastRunAt: format(subHours(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
    lastResult: 'success',
    totalRuns: 3421,
    successRate: 97.8,
    icon: 'ri-customer-service-line',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'low-stock-alert',
    name: '⚠️ Düşük Stok Uyarısı',
    description:
      'Stok seviyesi belirlenen eşiğin altına düştüğünde otomatik uyarı gönderir (N8N)',
    status: 'active',
    category: 'inventory',
    lastRunAt: format(subHours(new Date(), 0.08), 'yyyy-MM-dd HH:mm:ss'), // 5 minutes ago
    lastResult: 'success',
    totalRuns: 1247,
    successRate: 99.8,
    icon: 'ri-alarm-warning-line',
    color: 'from-orange-500 to-red-500',
    n8nWorkflowId: 'low-stock-alert-n8n',
    schedule: '*/5 * * * *', // Every 5 minutes
    webhookUrl: 'https://otoniq-n8n.app.n8n.cloud/webhook/low-stock-alert',
    isN8NManaged: true,
    config: {
      stockThreshold: 10,
      checkInterval: 5,
      alertChannels: ['email', 'slack'],
      productsToTrack: ['all'],
    },
  },
  {
    id: 'daily-report',
    name: '📊 Günlük Satış Raporu',
    description:
      "Her sabah saat 09:00'da günlük satış performans raporu oluşturur ve gönderir (N8N)",
    status: 'active',
    category: 'reports',
    lastRunAt: format(subHours(new Date(), 3), 'yyyy-MM-dd HH:mm:ss'), // 3 hours ago
    lastResult: 'success',
    totalRuns: 187,
    successRate: 100,
    icon: 'ri-file-chart-line',
    color: 'from-blue-500 to-purple-500',
    n8nWorkflowId: 'daily-sales-report-n8n',
    schedule: '0 9 * * *', // Daily at 9 AM
    webhookUrl: 'https://otoniq-n8n.app.n8n.cloud/webhook/daily-report',
    isN8NManaged: true,
    config: {
      reportTime: '09:00',
      reportRecipients: ['admin@otoniq.ai', 'bilgi@omerfarukunsal.com'],
      reportFormat: 'email',
    },
  },
  {
    id: '4',
    name: 'Stok Uyarı Sistemi',
    description: 'Düşük stok seviyelerinde otomatik bildirim gönder',
    status: 'active',
    category: 'inventory',
    lastRunAt: format(subHours(new Date(), 12), 'yyyy-MM-dd HH:mm:ss'),
    lastResult: 'partial',
    totalRuns: 542,
    successRate: 95.3,
    icon: 'ri-box-line',
    color: 'from-orange-500 to-amber-500',
  },
  {
    id: '5',
    name: 'Günlük Rapor Otomasyonu',
    description: "Her gün saat 09:00'da performans raporu oluştur ve gönder",
    status: 'paused',
    category: 'analytics',
    lastRunAt: format(subHours(new Date(), 24), 'yyyy-MM-dd HH:mm:ss'),
    lastResult: 'success',
    totalRuns: 187,
    successRate: 100,
    icon: 'ri-file-chart-line',
    color: 'from-purple-500 to-fuchsia-500',
  },
  {
    id: '6',
    name: 'Görsel Dönüşüm Otomasyonu',
    description:
      'Ürün görsellerini farklı platformlar için otomatik optimize et',
    status: 'error',
    category: 'social-media',
    lastRunAt: format(subHours(new Date(), 3), 'yyyy-MM-dd HH:mm:ss'),
    lastResult: 'fail',
    totalRuns: 92,
    successRate: 87.5,
    icon: 'ri-image-edit-line',
    color: 'from-red-500 to-orange-500',
  },
];

// Workflow Run Data
export interface WorkflowRunData {
  id: string;
  workflowId: string;
  startedAt: string;
  completedAt: string;
  duration: number; // seconds
  status: 'success' | 'fail' | 'running';
  itemsProcessed: number;
  errorMessage?: string;
}

export const generateWorkflowRuns = (
  workflowId: string,
  count: number = 24
): WorkflowRunData[] => {
  const runs: WorkflowRunData[] = [];

  for (let i = 0; i < count; i++) {
    const startedAt = subHours(new Date(), i);
    const duration = Math.floor(Math.random() * 120) + 10;
    const completedAt = new Date(startedAt.getTime() + duration * 1000);
    const success = Math.random() > 0.1; // 90% success rate

    runs.push({
      id: `run-${workflowId}-${i}`,
      workflowId,
      startedAt: format(startedAt, 'yyyy-MM-dd HH:mm:ss'),
      completedAt: format(completedAt, 'yyyy-MM-dd HH:mm:ss'),
      duration,
      status: success ? 'success' : 'fail',
      itemsProcessed: Math.floor(Math.random() * 50) + 1,
      errorMessage: success ? undefined : 'API rate limit exceeded',
    });
  }

  return runs;
};

// Workflow Log Data
export interface WorkflowLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  details?: string;
}

export const generateWorkflowLogs = (
  workflowId: string,
  count: number = 50
): WorkflowLogEntry[] => {
  const levels: Array<'info' | 'warning' | 'error' | 'success'> = [
    'info',
    'info',
    'info',
    'success',
    'success',
    'warning',
    'error',
  ];
  const messages = {
    info: [
      'Workflow başlatıldı',
      'Veri çekiliyor...',
      'API bağlantısı kuruldu',
      'Ürünler işleniyor',
    ],
    success: [
      'İşlem başarıyla tamamlandı',
      'Tüm öğeler işlendi',
      'Bildirim gönderildi',
    ],
    warning: [
      'Bazı öğeler atlandı',
      'API yanıt süresi yavaş',
      'Yeniden deneme yapılıyor',
    ],
    error: [
      'API bağlantı hatası',
      'Rate limit aşıldı',
      'Geçersiz veri formatı',
    ],
  };

  const logs: WorkflowLogEntry[] = [];

  for (let i = 0; i < count; i++) {
    const level = levels[Math.floor(Math.random() * levels.length)];
    const levelMessages = messages[level];
    const message =
      levelMessages[Math.floor(Math.random() * levelMessages.length)];

    logs.push({
      id: `log-${workflowId}-${i}`,
      timestamp: format(subHours(new Date(), i / 2), 'yyyy-MM-dd HH:mm:ss'),
      level,
      message,
      details:
        level === 'error'
          ? 'Stack trace: Error at line 42 in workflow.js'
          : undefined,
    });
  }

  return logs.reverse(); // Most recent first
};

// Automation Stats
export interface AutomationStats {
  totalWorkflows: number;
  activeWorkflows: number;
  totalRuns24h: number;
  successRate: number;
  avgDuration: number;
  itemsProcessed24h: number;
}

export const mockAutomationStats: AutomationStats = {
  totalWorkflows: mockWorkflows.length,
  activeWorkflows: mockWorkflows.filter(w => w.status === 'active').length,
  totalRuns24h: 342,
  successRate: 96.8,
  avgDuration: 45, // seconds
  itemsProcessed24h: 8547,
};
