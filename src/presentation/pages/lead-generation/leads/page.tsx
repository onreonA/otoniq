/**
 * Leads Page
 * İşletme lead'leri yönetimi ve detay görünümü
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Filter,
  Search,
  MapPin,
  Star,
  Phone,
  Globe,
  Mail,
  Linkedin,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
} from 'lucide-react';
import {
  mockBusinessLeads,
  type BusinessLead,
} from '../../../mocks/leadGeneration';

export default function LeadsPage() {
  const [leads] = useState<BusinessLead[]>(mockBusinessLeads);
  const [selectedLead, setSelectedLead] = useState<BusinessLead | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    'all' | BusinessLead['leadStatus']
  >('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLeads = leads.filter(
    lead =>
      (statusFilter === 'all' || lead.leadStatus === statusFilter) &&
      lead.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: BusinessLead['leadStatus']) => {
    const colors = {
      new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      contacted: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      responded: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      qualified: 'bg-green-500/20 text-green-400 border-green-500/30',
      proposal: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      won: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      lost: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[status];
  };

  const getPriorityColor = (priority: BusinessLead['priority']) => {
    const colors = {
      low: 'text-gray-400',
      medium: 'text-yellow-400',
      high: 'text-orange-400',
      urgent: 'text-red-400',
    };
    return colors[priority];
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900'>
      {/* Header */}
      <div className='bg-gradient-to-r from-blue-600/20 via-cyan-600/20 to-blue-600/20 border-b border-white/10'>
        <div className='container mx-auto px-6 py-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg'>
                <Users size={28} className='text-white' />
              </div>
              <div>
                <h1 className='text-2xl font-bold text-white'>Lead Yönetimi</h1>
                <p className='text-sm text-gray-300 mt-1'>
                  {filteredLeads.length} işletme bulundu
                </p>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <div className='relative'>
                <Search
                  size={18}
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                />
                <input
                  type='text'
                  placeholder='İşletme ara...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='pl-10 pr-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='container mx-auto px-6 py-6'>
        <div className='grid grid-cols-12 gap-6'>
          {/* Left - Filters & Stats */}
          <div className='col-span-3 space-y-4'>
            {/* Stats */}
            <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'>
              <h3 className='text-sm font-semibold text-white mb-4'>
                Durum Özeti
              </h3>
              <div className='space-y-2'>
                {[
                  {
                    status: 'all',
                    label: 'Tümü',
                    count: leads.length,
                    icon: Users,
                  },
                  {
                    status: 'new',
                    label: 'Yeni',
                    count: leads.filter(l => l.leadStatus === 'new').length,
                    icon: AlertCircle,
                  },
                  {
                    status: 'contacted',
                    label: 'İletişime Geçildi',
                    count: leads.filter(l => l.leadStatus === 'contacted')
                      .length,
                    icon: Mail,
                  },
                  {
                    status: 'responded',
                    label: 'Yanıt Verdi',
                    count: leads.filter(l => l.leadStatus === 'responded')
                      .length,
                    icon: CheckCircle,
                  },
                  {
                    status: 'qualified',
                    label: 'Nitelikli',
                    count: leads.filter(l => l.leadStatus === 'qualified')
                      .length,
                    icon: Target,
                  },
                ].map(item => (
                  <button
                    key={item.status}
                    onClick={() =>
                      setStatusFilter(item.status as typeof statusFilter)
                    }
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      statusFilter === item.status
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <span className='flex items-center gap-2'>
                      <item.icon size={14} />
                      {item.label}
                    </span>
                    <span className='font-bold'>{item.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'>
              <h3 className='text-sm font-semibold text-white mb-4 flex items-center gap-2'>
                <Filter size={16} className='text-purple-400' />
                Filtreler
              </h3>
              <div className='space-y-3'>
                <div>
                  <label className='block text-xs text-gray-400 mb-2'>
                    Kategori
                  </label>
                  <select className='w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'>
                    <option>Tümü</option>
                    <option>Restoran</option>
                    <option>Cafe</option>
                    <option>Otel</option>
                  </select>
                </div>
                <div>
                  <label className='block text-xs text-gray-400 mb-2'>
                    Öncelik
                  </label>
                  <select className='w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'>
                    <option>Tümü</option>
                    <option>Urgent</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Center - Leads List */}
          <div className='col-span-6 space-y-3'>
            {filteredLeads.map((lead, index) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedLead(lead)}
                className={`bg-black/30 backdrop-blur-sm border rounded-xl p-5 cursor-pointer transition-all ${
                  selectedLead?.id === lead.id
                    ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className='flex items-start justify-between mb-3'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-2'>
                      <h3 className='text-base font-semibold text-white'>
                        {lead.name}
                      </h3>
                      <span className='text-lg'>
                        {lead.category === 'Restoran'
                          ? '🍽️'
                          : lead.category === 'Cafe'
                            ? '☕'
                            : '🏨'}
                      </span>
                    </div>
                    <div className='flex items-center gap-3 text-xs text-gray-400'>
                      <span className='flex items-center gap-1'>
                        <MapPin size={12} />
                        {lead.address.split(',')[1]}
                      </span>
                      <span className='flex items-center gap-1'>
                        <Star size={12} className='text-yellow-400' />
                        {lead.rating}
                      </span>
                      <span>({lead.reviewCount} yorum)</span>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(lead.leadStatus)}`}
                    >
                      {lead.leadStatus}
                    </span>
                  </div>
                </div>

                <div className='flex items-center gap-4 mb-3'>
                  <div className='flex items-center gap-1 text-xs text-gray-400'>
                    <Phone size={12} className='text-green-400' />
                    <span className='text-white'>
                      {lead.phone.slice(0, 15)}
                    </span>
                  </div>
                  {lead.website && (
                    <div className='flex items-center gap-1 text-xs text-gray-400'>
                      <Globe size={12} className='text-blue-400' />
                      <span className='text-white'>Website ✓</span>
                    </div>
                  )}
                </div>

                <div className='grid grid-cols-3 gap-2 mb-3'>
                  <div className='bg-white/5 rounded-lg p-2'>
                    <p className='text-xs text-gray-400'>Dijital Olgunluk</p>
                    <div className='flex items-center gap-2 mt-1'>
                      <div className='flex-1 bg-gray-700 rounded-full h-1.5'>
                        <div
                          className='bg-gradient-to-r from-blue-500 to-cyan-500 h-1.5 rounded-full'
                          style={{
                            width: `${lead.analysis.digitalMaturity}%`,
                          }}
                        />
                      </div>
                      <span className='text-xs font-bold text-white'>
                        {lead.analysis.digitalMaturity}%
                      </span>
                    </div>
                  </div>
                  <div className='bg-white/5 rounded-lg p-2'>
                    <p className='text-xs text-gray-400'>Potansiyel</p>
                    <div className='flex items-center gap-2 mt-1'>
                      <div className='flex-1 bg-gray-700 rounded-full h-1.5'>
                        <div
                          className='bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full'
                          style={{ width: `${lead.analysis.potentialScore}%` }}
                        />
                      </div>
                      <span className='text-xs font-bold text-white'>
                        {lead.analysis.potentialScore}%
                      </span>
                    </div>
                  </div>
                  <div className='bg-white/5 rounded-lg p-2'>
                    <p className='text-xs text-gray-400'>Öncelik</p>
                    <p
                      className={`text-sm font-bold mt-1 ${getPriorityColor(lead.priority)}`}
                    >
                      {lead.priority}
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  {lead.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className='px-2 py-1 bg-white/10 rounded text-xs text-gray-300'
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right - Lead Detail */}
          <div className='col-span-3'>
            {selectedLead ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5 sticky top-6'
              >
                <h3 className='text-sm font-semibold text-white mb-4'>
                  Lead Detayları
                </h3>

                <div className='space-y-4'>
                  <div>
                    <p className='text-xs text-gray-400 mb-1'>İhtiyaçlar</p>
                    <ul className='space-y-1'>
                      {selectedLead.analysis.needsIdentified.map(
                        (need, idx) => (
                          <li
                            key={idx}
                            className='text-xs text-white flex items-start gap-2'
                          >
                            <AlertCircle
                              size={12}
                              className='text-orange-400 mt-0.5'
                            />
                            {need}
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  <div>
                    <p className='text-xs text-gray-400 mb-2'>Önerilen Pitch</p>
                    <p className='text-xs text-white bg-blue-500/10 border border-blue-500/30 rounded-lg p-3'>
                      {selectedLead.analysis.recommendedPitch}
                    </p>
                  </div>

                  <div>
                    <p className='text-xs text-gray-400 mb-2'>LinkedIn</p>
                    <div className='bg-white/5 rounded-lg p-3'>
                      <p className='text-xs text-white mb-1'>
                        {selectedLead.linkedinData.employeeCount} çalışan
                      </p>
                      <p className='text-xs text-gray-400'>
                        {selectedLead.linkedinData.decisionMakers.length} karar
                        verici bulundu
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className='text-xs text-gray-400 mb-2'>Notlar</p>
                    <p className='text-xs text-white'>{selectedLead.notes}</p>
                  </div>

                  <button className='w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all'>
                    <Mail size={16} />
                    Email Gönder
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center'>
                <Users size={48} className='text-gray-600 mx-auto mb-3' />
                <p className='text-sm text-gray-400'>
                  Detayları görmek için bir lead seçin
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
