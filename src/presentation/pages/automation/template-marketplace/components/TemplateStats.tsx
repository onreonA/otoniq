/**
 * TemplateStats Component
 * Statistics and insights for template marketplace
 */

import React, { useState, useEffect } from 'react';
import { templateMarketplaceService } from '../../../../../infrastructure/services/TemplateMarketplaceService';

export default function TemplateStats() {
  const [stats, setStats] = useState({
    totalTemplates: 0,
    totalDownloads: 0,
    totalLikes: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Mock stats for now - in real implementation, this would come from API
      setStats({
        totalTemplates: 156,
        totalDownloads: 2847,
        totalLikes: 892,
        averageRating: 4.3,
      });
    } catch (error) {
      console.error('Load stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h3 className='text-white font-semibold mb-3'>İstatistikler</h3>
        <div className='space-y-3'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className='animate-pulse'>
              <div className='h-12 bg-white/10 rounded-lg'></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className='text-white font-semibold mb-3'>İstatistikler</h3>
      <div className='space-y-3'>
        {/* Total Templates */}
        <div className='bg-white/5 border border-white/10 rounded-lg p-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center'>
                <i className='ri-template-line text-blue-400 text-sm'></i>
              </div>
              <div>
                <p className='text-white font-medium text-sm'>
                  Toplam Template
                </p>
                <p className='text-gray-400 text-xs'>Community</p>
              </div>
            </div>
            <div className='text-right'>
              <p className='text-white font-bold text-lg'>
                {stats.totalTemplates}
              </p>
            </div>
          </div>
        </div>

        {/* Total Downloads */}
        <div className='bg-white/5 border border-white/10 rounded-lg p-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 rounded bg-green-500/20 flex items-center justify-center'>
                <i className='ri-download-line text-green-400 text-sm'></i>
              </div>
              <div>
                <p className='text-white font-medium text-sm'>Toplam İndirme</p>
                <p className='text-gray-400 text-xs'>Bu ay</p>
              </div>
            </div>
            <div className='text-right'>
              <p className='text-white font-bold text-lg'>
                {stats.totalDownloads.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Total Likes */}
        <div className='bg-white/5 border border-white/10 rounded-lg p-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 rounded bg-red-500/20 flex items-center justify-center'>
                <i className='ri-heart-line text-red-400 text-sm'></i>
              </div>
              <div>
                <p className='text-white font-medium text-sm'>Toplam Beğeni</p>
                <p className='text-gray-400 text-xs'>Community</p>
              </div>
            </div>
            <div className='text-right'>
              <p className='text-white font-bold text-lg'>
                {stats.totalLikes.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Average Rating */}
        <div className='bg-white/5 border border-white/10 rounded-lg p-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 rounded bg-yellow-500/20 flex items-center justify-center'>
                <i className='ri-star-line text-yellow-400 text-sm'></i>
              </div>
              <div>
                <p className='text-white font-medium text-sm'>Ortalama Puan</p>
                <p className='text-gray-400 text-xs'>Template kalitesi</p>
              </div>
            </div>
            <div className='text-right'>
              <p className='text-white font-bold text-lg'>
                {stats.averageRating}
              </p>
              <div className='flex items-center gap-1'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <i
                    key={i}
                    className={`text-xs ${
                      i < Math.floor(stats.averageRating)
                        ? 'ri-star-fill text-yellow-400'
                        : 'ri-star-line text-gray-400'
                    }`}
                  ></i>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
