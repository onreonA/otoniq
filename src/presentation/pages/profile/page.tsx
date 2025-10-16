import { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Save,
  X,
} from 'lucide-react';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({
    name: 'Ahmet Yılmaz',
    email: 'ahmet@sirket.com',
    phone: '+90 532 123 45 67',
    position: 'CEO',
    company: 'ABC Teknoloji A.Ş.',
    location: 'İstanbul, Türkiye',
    joinDate: '15 Mart 2024',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  });

  const [formData, setFormData] = useState(user);

  const handleSave = () => {
    setUser(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
  };

  return (
    <div className='max-w-4xl mx-auto p-6'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-white mb-2'>Profil</h1>
        <p className='text-gray-400'>
          Kişisel bilgilerinizi görüntüleyin ve düzenleyin
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Profile Card */}
        <div className='lg:col-span-1'>
          <div className='bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
            <div className='text-center'>
              <div className='relative inline-block'>
                <img
                  src={user.avatar}
                  alt={user.name}
                  className='w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white/20'
                />
                {isEditing && (
                  <button className='absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors'>
                    <Edit3 className='w-4 h-4' />
                  </button>
                )}
              </div>
              <h2 className='text-xl font-semibold text-white mb-1'>
                {user.name}
              </h2>
              <p className='text-gray-400 mb-2'>{user.position}</p>
              <p className='text-sm text-gray-500'>{user.company}</p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className='lg:col-span-2'>
          <div className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-xl font-semibold text-white'>
                Kişisel Bilgiler
              </h3>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                >
                  <Edit3 className='w-4 h-4' />
                  Düzenle
                </button>
              ) : (
                <div className='flex gap-2'>
                  <button
                    onClick={handleSave}
                    className='flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
                  >
                    <Save className='w-4 h-4' />
                    Kaydet
                  </button>
                  <button
                    onClick={handleCancel}
                    className='flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
                  >
                    <X className='w-4 h-4' />
                    İptal
                  </button>
                </div>
              )}
            </div>

            <div className='space-y-6'>
              {/* Name */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Ad Soyad
                </label>
                {isEditing ? (
                  <input
                    type='text'
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className='w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                ) : (
                  <div className='flex items-center gap-3'>
                    <User className='w-5 h-5 text-gray-400' />
                    <span className='text-white'>{user.name}</span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  E-posta
                </label>
                {isEditing ? (
                  <input
                    type='email'
                    value={formData.email}
                    onChange={e =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className='w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                ) : (
                  <div className='flex items-center gap-3'>
                    <Mail className='w-5 h-5 text-gray-400' />
                    <span className='text-white'>{user.email}</span>
                  </div>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Telefon
                </label>
                {isEditing ? (
                  <input
                    type='tel'
                    value={formData.phone}
                    onChange={e =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className='w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                ) : (
                  <div className='flex items-center gap-3'>
                    <Phone className='w-5 h-5 text-gray-400' />
                    <span className='text-white'>{user.phone}</span>
                  </div>
                )}
              </div>

              {/* Position */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Pozisyon
                </label>
                {isEditing ? (
                  <input
                    type='text'
                    value={formData.position}
                    onChange={e =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    className='w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                ) : (
                  <div className='flex items-center gap-3'>
                    <User className='w-5 h-5 text-gray-400' />
                    <span className='text-white'>{user.position}</span>
                  </div>
                )}
              </div>

              {/* Company */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Şirket
                </label>
                {isEditing ? (
                  <input
                    type='text'
                    value={formData.company}
                    onChange={e =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    className='w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                ) : (
                  <div className='flex items-center gap-3'>
                    <User className='w-5 h-5 text-gray-400' />
                    <span className='text-white'>{user.company}</span>
                  </div>
                )}
              </div>

              {/* Location */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Konum
                </label>
                {isEditing ? (
                  <input
                    type='text'
                    value={formData.location}
                    onChange={e =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className='w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                ) : (
                  <div className='flex items-center gap-3'>
                    <MapPin className='w-5 h-5 text-gray-400' />
                    <span className='text-white'>{user.location}</span>
                  </div>
                )}
              </div>

              {/* Join Date */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Katılım Tarihi
                </label>
                <div className='flex items-center gap-3'>
                  <Calendar className='w-5 h-5 text-gray-400' />
                  <span className='text-white'>{user.joinDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

