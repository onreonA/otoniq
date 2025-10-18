/**
 * OptimizationSuggestions Component
 * AI-powered optimization recommendations
 */

import React from 'react';
import { WorkflowOptimizationSuggestion } from '../../../../../infrastructure/services/WorkflowAnalyticsService';

interface OptimizationSuggestionsProps {
  suggestions: WorkflowOptimizationSuggestion[];
  onApplySuggestion: (suggestionId: string) => void;
}

export default function OptimizationSuggestions({
  suggestions,
  onApplySuggestion,
}: OptimizationSuggestionsProps) {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'green';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low':
        return 'green';
      case 'medium':
        return 'yellow';
      case 'high':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'performance':
        return 'ri-speed-up-line';
      case 'cost':
        return 'ri-money-dollar-circle-line';
      case 'reliability':
        return 'ri-shield-check-line';
      case 'scalability':
        return 'ri-expand-up-down-line';
      case 'maintainability':
        return 'ri-tools-line';
      default:
        return 'ri-lightbulb-line';
    }
  };

  if (suggestions.length === 0) {
    return (
      <div>
        <h3 className='text-white font-semibold text-lg mb-4'>
          Optimizasyon Önerileri
        </h3>
        <div className='text-center py-8'>
          <div className='w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
            <i className='ri-lightbulb-line text-gray-400 text-2xl'></i>
          </div>
          <p className='text-gray-400 text-lg mb-2'>Henüz öneri yok</p>
          <p className='text-gray-500 text-sm'>
            AI analiz sonuçları burada görünecek
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-white font-semibold text-lg'>
          Optimizasyon Önerileri
        </h3>
        <div className='flex items-center gap-2'>
          <span className='text-gray-400 text-sm'>
            {suggestions.length} öneri
          </span>
          <div className='w-2 h-2 bg-blue-400 rounded-full animate-pulse'></div>
        </div>
      </div>

      <div className='space-y-4'>
        {suggestions.map(suggestion => {
          const impactColor = getImpactColor(suggestion.potentialImpact);
          const effortColor = getEffortColor(suggestion.implementationEffort);
          const suggestionIcon = getSuggestionIcon(suggestion.suggestionType);

          return (
            <div
              key={suggestion.id}
              className={`bg-white/5 border border-white/10 rounded-lg p-4 ${
                suggestion.isApplied ? 'opacity-60' : ''
              }`}
            >
              <div className='flex items-start gap-3'>
                {/* Icon */}
                <div className='w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0'>
                  <i className={`${suggestionIcon} text-blue-400 text-lg`}></i>
                </div>

                {/* Content */}
                <div className='flex-1 min-w-0'>
                  <div className='flex items-start justify-between mb-2'>
                    <div>
                      <h4 className='text-white font-medium mb-1'>
                        {suggestion.title}
                      </h4>
                      <p className='text-gray-400 text-sm'>
                        {suggestion.description}
                      </p>
                    </div>
                    <div className='flex items-center gap-2 ml-4'>
                      {suggestion.aiGenerated && (
                        <span className='px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-400'>
                          AI
                        </span>
                      )}
                      {suggestion.isApplied && (
                        <span className='px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400'>
                          UYGULANDI
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Impact and Effort */}
                  <div className='flex items-center gap-4 mb-3'>
                    <div className='flex items-center gap-2'>
                      <span className='text-gray-400 text-xs'>Etki:</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium bg-${impactColor}-500/20 text-${impactColor}-400`}
                      >
                        {suggestion.potentialImpact.toUpperCase()}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='text-gray-400 text-xs'>Çaba:</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium bg-${effortColor}-500/20 text-${effortColor}-400`}
                      >
                        {suggestion.implementationEffort.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Estimated Savings */}
                  {suggestion.estimatedSavings && (
                    <div className='bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-3'>
                      <div className='flex items-center gap-2'>
                        <i className='ri-money-dollar-circle-line text-green-400'></i>
                        <span className='text-green-400 text-sm font-medium'>
                          Tahmini Tasarruf:{' '}
                          {suggestion.estimatedSavings.toFixed(2)}{' '}
                          {suggestion.savingsUnit || 'USD'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2 text-xs text-gray-500'>
                      <i className='ri-time-line'></i>
                      <span>
                        {new Date(suggestion.createdAt).toLocaleDateString(
                          'tr-TR'
                        )}
                      </span>
                    </div>

                    <div className='flex items-center gap-2'>
                      {!suggestion.isApplied && (
                        <button
                          onClick={() => onApplySuggestion(suggestion.id)}
                          className='bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 px-3 py-1 rounded text-xs font-medium transition-colors'
                        >
                          <i className='ri-check-line mr-1'></i>
                          Uygula
                        </button>
                      )}
                      <button className='bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 px-3 py-1 rounded text-xs font-medium transition-colors'>
                        <i className='ri-information-line mr-1'></i>
                        Detay
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
