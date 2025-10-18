/**
 * Contacts (LinkedIn) Page
 * LinkedIn kişi yönetimi
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Linkedin,
  Search,
  Mail,
  Phone,
  MessageSquare,
  UserPlus,
  TrendingUp,
  CheckCircle,
  Clock,
  Send,
} from 'lucide-react';
import {
  mockLinkedInContacts,
  type LinkedInContact,
} from '../../../mocks/leadGeneration';

export default function ContactsPage() {
  const [contacts] = useState<LinkedInContact[]>(mockLinkedInContacts);
  const [selectedContact, setSelectedContact] =
    useState<LinkedInContact | null>(null);

  const getStatusColor = (status: LinkedInContact['contactStatus']) => {
    const colors = {
      not_contacted: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      connection_sent: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      connected: 'bg-green-500/20 text-green-400 border-green-500/30',
      messaged: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      responded: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    };
    return colors[status];
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900'>
      {/* Header */}
      <div className='bg-gradient-to-r from-blue-600/20 via-cyan-600/20 to-blue-600/20 border-b border-white/10'>
        <div className='container mx-auto px-6 py-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg'>
                <Linkedin size={28} className='text-white' />
              </div>
              <div>
                <h1 className='text-2xl font-bold text-white'>
                  LinkedIn Kişiler
                </h1>
                <p className='text-sm text-gray-300 mt-1'>
                  {contacts.length} karar verici bulundu
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
                  placeholder='Kişi ara...'
                  className='pl-10 pr-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                />
              </div>
              <button className='flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-4 py-2 rounded-lg font-medium transition-all'>
                <UserPlus size={18} />
                Yeni Kişi
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='container mx-auto px-6 py-6'>
        {/* Stats */}
        <div className='grid grid-cols-5 gap-4 mb-6'>
          {[
            {
              label: 'Toplam Kişi',
              value: contacts.length,
              icon: Linkedin,
              color: 'blue',
            },
            {
              label: 'Bağlantı Bekliyor',
              value: contacts.filter(c => c.contactStatus === 'connection_sent')
                .length,
              icon: Clock,
              color: 'yellow',
            },
            {
              label: 'Bağlı',
              value: contacts.filter(c => c.contactStatus === 'connected')
                .length,
              icon: CheckCircle,
              color: 'green',
            },
            {
              label: 'Mesajlaşılan',
              value: contacts.filter(c => c.contactStatus === 'messaged')
                .length,
              icon: MessageSquare,
              color: 'purple',
            },
            {
              label: 'Yanıt Oranı',
              value: `${Math.round((contacts.filter(c => c.contactStatus === 'responded').length / contacts.length) * 100)}%`,
              icon: TrendingUp,
              color: 'cyan',
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5'
            >
              <div className='flex items-center justify-between mb-3'>
                <stat.icon size={20} className={`text-${stat.color}-400`} />
              </div>
              <p className='text-2xl font-bold text-white'>{stat.value}</p>
              <p className='text-xs text-gray-400 mt-1'>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className='grid grid-cols-12 gap-6'>
          {/* Contacts List */}
          <div className='col-span-8'>
            <div className='space-y-3'>
              {contacts.map((contact, index) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedContact(contact)}
                  className={`bg-black/30 backdrop-blur-sm border rounded-xl p-5 cursor-pointer transition-all ${
                    selectedContact?.id === contact.id
                      ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className='flex items-start gap-4'>
                    {/* Avatar */}
                    <div className='text-4xl'>{contact.profilePhoto}</div>

                    {/* Info */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between mb-2'>
                        <div>
                          <h3 className='text-base font-semibold text-white'>
                            {contact.name}
                          </h3>
                          <p className='text-sm text-gray-400'>
                            {contact.position}
                          </p>
                        </div>
                        <span
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(contact.contactStatus)}`}
                        >
                          {contact.contactStatus.replace('_', ' ')}
                        </span>
                      </div>

                      <div className='grid grid-cols-3 gap-3 mb-3'>
                        <div className='bg-white/5 rounded-lg p-2'>
                          <p className='text-xs text-gray-400'>Deneyim</p>
                          <p className='text-sm font-bold text-white'>
                            {contact.experience} yıl
                          </p>
                        </div>
                        <div className='bg-white/5 rounded-lg p-2'>
                          <p className='text-xs text-gray-400'>
                            Ortak Bağlantı
                          </p>
                          <p className='text-sm font-bold text-white'>
                            {contact.mutualConnections}
                          </p>
                        </div>
                        <div className='bg-white/5 rounded-lg p-2'>
                          <p className='text-xs text-gray-400'>Yanıt Oranı</p>
                          <p className='text-sm font-bold text-green-400'>
                            {contact.responseRate}%
                          </p>
                        </div>
                      </div>

                      <div className='flex items-center gap-2'>
                        <button className='flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all'>
                          <Linkedin size={14} />
                          Profili Görüntüle
                        </button>
                        <button className='flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all'>
                          <Mail size={14} />
                          Email
                        </button>
                        <button className='flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all'>
                          <Send size={14} />
                          Mesaj Gönder
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Contact Detail Sidebar */}
          <div className='col-span-4'>
            {selectedContact ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-5 sticky top-6'
              >
                <h3 className='text-sm font-semibold text-white mb-4'>
                  Kişi Detayları
                </h3>

                <div className='space-y-4'>
                  <div className='text-center mb-4'>
                    <div className='text-5xl mb-2'>
                      {selectedContact.profilePhoto}
                    </div>
                    <h4 className='text-base font-semibold text-white'>
                      {selectedContact.name}
                    </h4>
                    <p className='text-sm text-gray-400'>
                      {selectedContact.position}
                    </p>
                  </div>

                  <div>
                    <p className='text-xs text-gray-400 mb-2'>İletişim</p>
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2 text-xs text-white'>
                        <Mail size={12} className='text-blue-400' />
                        {selectedContact.email}
                      </div>
                      <div className='flex items-center gap-2 text-xs text-white'>
                        <Phone size={12} className='text-green-400' />
                        {selectedContact.phone}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className='text-xs text-gray-400 mb-2'>Yetenekler</p>
                    <div className='flex flex-wrap gap-1'>
                      {selectedContact.skills.map(skill => (
                        <span
                          key={skill}
                          className='px-2 py-1 bg-white/10 rounded text-xs text-gray-300'
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className='text-xs text-gray-400 mb-2'>İlgi Alanları</p>
                    <div className='flex flex-wrap gap-1'>
                      {selectedContact.interests.map(interest => (
                        <span
                          key={interest}
                          className='px-2 py-1 bg-blue-500/10 rounded text-xs text-blue-300'
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className='text-xs text-gray-400 mb-2'>Son Aktivite</p>
                    <div className='space-y-2'>
                      {selectedContact.recentActivity.map((activity, idx) => (
                        <p
                          key={idx}
                          className='text-xs text-white bg-white/5 rounded-lg p-2'
                        >
                          {activity}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className='bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center'>
                <Linkedin size={48} className='text-gray-600 mx-auto mb-3' />
                <p className='text-sm text-gray-400'>
                  Detayları görmek için bir kişi seçin
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
