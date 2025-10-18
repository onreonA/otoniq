/**
 * Workflow Analytics Dashboard
 * AI-powered insights and performance analytics
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  workflowAnalyticsService,
  WorkflowHealthScore,
  WorkflowInsight,
  WorkflowAnomaly,
  WorkflowOptimizationSuggestion,
} from '../../../../infrastructure/services/WorkflowAnalyticsService';
import AnalyticsOverview from './components/AnalyticsOverview';
import WorkflowHealthCard from './components/WorkflowHealthCard';
import InsightsPanel from './components/InsightsPanel';
import AnomaliesPanel from './components/AnomaliesPanel';
import OptimizationSuggestions from './components/OptimizationSuggestions';
import CostAnalytics from './components/CostAnalytics';
import PerformanceCharts from './components/PerformanceCharts';

export default function WorkflowAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [healthScore, setHealthScore] = useState<WorkflowHealthScore | null>(
    null
  );
  const [insights, setInsights] = useState<WorkflowInsight[]>([]);
  const [anomalies, setAnomalies] = useState<WorkflowAnomaly[]>([]);
  const [suggestions, setSuggestions] = useState<
    WorkflowOptimizationSuggestion[]
  >([]);
  const [overviewData, setOverviewData] = useState({
    totalWorkflows: 0,
    totalExecutions: 0,
    avgSuccessRate: 0,
    totalCost: 0,
    healthScore: 0,
  });

  // Load analytics data
  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Load overview data
      const overview =
        await workflowAnalyticsService.getTenantAnalyticsSummary(
          'mock-tenant-id'
        );
      setOverviewData(overview);

      // Load insights
      const insightsData =
        await workflowAnalyticsService.getWorkflowInsights(selectedWorkflow);
      setInsights(insightsData);

      // Load anomalies
      const anomaliesData =
        await workflowAnalyticsService.getWorkflowAnomalies(selectedWorkflow);
      setAnomalies(anomaliesData);

      // Load optimization suggestions
      const suggestionsData =
        await workflowAnalyticsService.getWorkflowOptimizationSuggestions(
          selectedWorkflow
        );
      setSuggestions(suggestionsData);

      // Load health score
      if (selectedWorkflow !== 'all') {
        const health =
          await workflowAnalyticsService.getWorkflowHealthScore(
            selectedWorkflow
          );
        setHealthScore(health);
      } else {
        setHealthScore(null);
      }
    } catch (error) {
      console.error('Load analytics data error:', error);
      toast.error('Analytics verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    loadAnalyticsData();
  }, [selectedWorkflow, timeRange]);

  // Handle workflow selection
  const handleWorkflowChange = (workflowId: string) => {
    setSelectedWorkflow(workflowId);
  };

  // Handle time range change
  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
  };

  // Handle insight resolution
  const handleResolveInsight = async (insightId: string) => {
    try {
      await workflowAnalyticsService.resolveInsight(insightId);
      toast.success('Insight çözüldü olarak işaretlendi');
      loadAnalyticsData(); // Refresh data
    } catch (error) {
      console.error('Resolve insight error:', error);
      toast.error('Insight çözülemedi');
    }
  };

  // Handle suggestion application
  const handleApplySuggestion = async (suggestionId: string) => {
    try {
      await workflowAnalyticsService.applyOptimizationSuggestion(suggestionId);
      toast.success('Optimizasyon önerisi uygulandı');
      loadAnalyticsData(); // Refresh data
    } catch (error) {
      console.error('Apply suggestion error:', error);
      toast.error('Öneri uygulanamadı');
    }
  };

  // Generate AI insights
  const handleGenerateAIInsights = async () => {
    try {
      if (selectedWorkflow === 'all') {
        toast.error('Lütfen belirli bir workflow seçin');
        return;
      }

      const aiInsights =
        await workflowAnalyticsService.generateAIInsights(selectedWorkflow);
      setInsights(prev => [...aiInsights, ...prev]);
      toast.success('AI insights oluşturuldu');
    } catch (error) {
      console.error('Generate AI insights error:', error);
      toast.error('AI insights oluşturulamadı');
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4'></div>
          <p className='text-gray-400 text-lg'>Analytics yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'>
      {/* Header */}
      <div className='bg-black/20 backdrop-blur-sm border-b border-white/10'>
        <div className='max-w-7xl mx-auto px-4 py-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <Link
                to='/automation'
                className='text-gray-400 hover:text-white transition-colors'
              >
                <i className='ri-arrow-left-line text-xl'></i>
              </Link>
              <div>
                <h1 className='text-3xl font-bold text-white'>
                  Workflow Analytics
                </h1>
                <p className='text-gray-300 mt-1'>
                  AI-powered insights and performance analytics
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <button
                onClick={handleGenerateAIInsights}
                disabled={selectedWorkflow === 'all'}
                className='bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <i className='ri-robot-line mr-2'></i>
                AI Insights Oluştur
              </button>
              <button className='bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors'>
                <i className='ri-download-line mr-2'></i>
                Rapor İndir
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className='max-w-7xl mx-auto px-4 py-4'>
        <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-4'>
          <div className='flex items-center gap-6'>
            {/* Workflow Filter */}
            <div className='flex items-center gap-2'>
              <label className='text-gray-300 text-sm font-medium'>
                Workflow:
              </label>
              <select
                value={selectedWorkflow}
                onChange={e => handleWorkflowChange(e.target.value)}
                className='bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400'
              >
                <option value='all'>Tüm Workflow'lar</option>
                <option value='workflow-1'>Günlük Satış Raporu</option>
                <option value='workflow-2'>Düşük Stok Uyarısı</option>
                <option value='workflow-3'>Müşteri Bildirimi</option>
              </select>
            </div>

            {/* Time Range Filter */}
            <div className='flex items-center gap-2'>
              <label className='text-gray-300 text-sm font-medium'>
                Zaman Aralığı:
              </label>
              <select
                value={timeRange}
                onChange={e => handleTimeRangeChange(e.target.value)}
                className='bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400'
              >
                <option value='7d'>Son 7 Gün</option>
                <option value='30d'>Son 30 Gün</option>
                <option value='90d'>Son 90 Gün</option>
                <option value='1y'>Son 1 Yıl</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={loadAnalyticsData}
              className='bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors'
            >
              <i className='ri-refresh-line mr-2'></i>
              Yenile
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-4 pb-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left Column - Overview & Health */}
          <div className='lg:col-span-1 space-y-6'>
            {/* Analytics Overview */}
            <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <AnalyticsOverview data={overviewData} />
            </div>

            {/* Workflow Health Score */}
            {healthScore && (
              <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
                <WorkflowHealthCard healthScore={healthScore} />
              </div>
            )}
          </div>

          {/* Right Column - Insights & Analytics */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Performance Charts */}
            <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <PerformanceCharts
                workflowId={selectedWorkflow}
                timeRange={timeRange}
              />
            </div>

            {/* Insights Panel */}
            <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <InsightsPanel
                insights={insights}
                onResolveInsight={handleResolveInsight}
              />
            </div>

            {/* Anomalies Panel */}
            <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <AnomaliesPanel anomalies={anomalies} />
            </div>

            {/* Optimization Suggestions */}
            <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <OptimizationSuggestions
                suggestions={suggestions}
                onApplySuggestion={handleApplySuggestion}
              />
            </div>

            {/* Cost Analytics */}
            <div className='bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
              <CostAnalytics
                workflowId={selectedWorkflow}
                timeRange={timeRange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
