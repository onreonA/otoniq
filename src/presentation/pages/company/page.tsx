import { useState } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Edit3,
  Save,
  X,
  Users,
  DollarSign,
} from 'lucide-react';

export default function CompanyPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [company, setCompany] = useState({
    name: 'ABC Teknoloji A.Ş.',
    taxNumber: '1234567890',
    address: 'Maslak Mahallesi, Büyükdere Caddesi No: 123, Sarıyer/İstanbul',
    phone: '+90 212 123 45 67',
    email: 'info@abcteknoloji.com',
    website: 'www.abcteknoloji.com',
    sector: 'Teknoloji',
    employeeCount: '50-100',
    foundedYear: '2020',
    description:
      'İleri teknoloji çözümleri sunan, e-ticaret ve dijital dönüşüm alanında uzmanlaşmış bir teknoloji şirketiyiz.',
  });

  const [formData, setFormData] = useState(company);

  const handleSave = () => {
    setCompany(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(company);
    setIsEditing(false);
  };

  return (
    <div className='max-w-6xl mx-auto p-6'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-white mb-2'>Firma Bilgileri</h1>
        <p className='text-gray-400'>
          Şirket bilgilerinizi görüntüleyin ve düzenleyin
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Company Overview */}
        <div className='lg:col-span-1'>
          <div className='bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
            <div className='text-center'>
              <div className='w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                <Building2 className='w-10 h-10 text-white' />
              </div>
              <h2 className='text-xl font-semibold text-white mb-1'>
                {company.name}
              </h2>
              <p className='text-gray-400 mb-4'>{company.sector}</p>
              <div className='space-y-2 text-sm'>
                <div className='flex items-center justify-center gap-2 text-gray-300'>
                  <Users className='w-4 h-4' />
                  <span>{company.employeeCount} çalışan</span>
                </div>
                <div className='flex items-center justify-center gap-2 text-gray-300'>
                  <Calendar className='w-4 h-4' />
                  <span>{company.foundedYear} yılında kuruldu</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Details */}
        <div className='lg:col-span-2'>
          <div className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6'>
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-xl font-semibold text-white'>
                Şirket Detayları
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
              {/* Company Name */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Şirket Adı
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
                    <Building2 className='w-5 h-5 text-gray-400' />
                    <span className='text-white'>{company.name}</span>
                  </div>
                )}
              </div>

              {/* Tax Number */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Vergi Numarası
                </label>
                {isEditing ? (
                  <input
                    type='text'
                    value={formData.taxNumber}
                    onChange={e =>
                      setFormData({ ...formData, taxNumber: e.target.value })
                    }
                    className='w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                ) : (
                  <div className='flex items-center gap-3'>
                    <DollarSign className='w-5 h-5 text-gray-400' />
                    <span className='text-white'>{company.taxNumber}</span>
                  </div>
                )}
              </div>

              {/* Address */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Adres
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.address}
                    onChange={e =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    rows={3}
                    className='w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                ) : (
                  <div className='flex items-start gap-3'>
                    <MapPin className='w-5 h-5 text-gray-400 mt-1' />
                    <span className='text-white'>{company.address}</span>
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
                    <span className='text-white'>{company.phone}</span>
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
                    <span className='text-white'>{company.email}</span>
                  </div>
                )}
              </div>

              {/* Website */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Website
                </label>
                {isEditing ? (
                  <input
                    type='url'
                    value={formData.website}
                    onChange={e =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    className='w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                ) : (
                  <div className='flex items-center gap-3'>
                    <Globe className='w-5 h-5 text-gray-400' />
                    <span className='text-white'>{company.website}</span>
                  </div>
                )}
              </div>

              {/* Sector */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Sektör
                </label>
                {isEditing ? (
                  <input
                    type='text'
                    value={formData.sector}
                    onChange={e =>
                      setFormData({ ...formData, sector: e.target.value })
                    }
                    className='w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                ) : (
                  <div className='flex items-center gap-3'>
                    <Building2 className='w-5 h-5 text-gray-400' />
                    <span className='text-white'>{company.sector}</span>
                  </div>
                )}
              </div>

              {/* Employee Count */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Çalışan Sayısı
                </label>
                {isEditing ? (
                  <select
                    value={formData.employeeCount}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        employeeCount: e.target.value,
                      })
                    }
                    className='w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                  >
                    <option value='1-10'>1-10</option>
                    <option value='11-50'>11-50</option>
                    <option value='51-100'>51-100</option>
                    <option value='101-500'>101-500</option>
                    <option value='500+'>500+</option>
                  </select>
                ) : (
                  <div className='flex items-center gap-3'>
                    <Users className='w-5 h-5 text-gray-400' />
                    <span className='text-white'>
                      {company.employeeCount} çalışan
                    </span>
                  </div>
                )}
              </div>

              {/* Founded Year */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Kuruluş Yılı
                </label>
                {isEditing ? (
                  <input
                    type='number'
                    value={formData.foundedYear}
                    onChange={e =>
                      setFormData({ ...formData, foundedYear: e.target.value })
                    }
                    className='w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                ) : (
                  <div className='flex items-center gap-3'>
                    <Calendar className='w-5 h-5 text-gray-400' />
                    <span className='text-white'>{company.foundedYear}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-2'>
                  Açıklama
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.description}
                    onChange={e =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    className='w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                ) : (
                  <div className='flex items-start gap-3'>
                    <Building2 className='w-5 h-5 text-gray-400 mt-1' />
                    <span className='text-white'>{company.description}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

