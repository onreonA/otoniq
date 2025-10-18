import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatsCards from './components/StatsCards';
import AIAssistant from './components/AIAssistant';
import RecentActivity from './components/RecentActivity';
import QuickActions from './components/QuickActions';
import PerformanceChart from './components/PerformanceChart';
import AutomationWidget from './components/AutomationWidget';

export default function Dashboard() {
  const [user] = useState({
    name: 'Ahmet Yılmaz',
    email: 'ahmet@sirket.com',
    company: 'TechCorp A.Ş.',
    plan: 'Pro',
    avatar:
      'https://readdy.ai/api/search-image?query=professional%20business%20person%20headshot%2C%20clean%20background%2C%20modern%20corporate%20style%2C%20confident%20expression%2C%20high%20quality%20portrait&width=100&height=100&seq=user-avatar-1&orientation=squarish',
  });

  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Günaydın');
    else if (hour < 18) setGreeting('İyi günler');
    else setGreeting('İyi akşamlar');
  }, []);

  return (
    <div className='relative z-10'>
      <main className='max-w-5xl mx-auto px-2 sm:px-3 lg:px-4 py-6'>
        {/* Welcome Section */}
        <div className='mb-6'>
          <div className='bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-3'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-2xl font-bold text-white mb-1'>
                  {greeting}, {user.name}! 👋
                </h1>
                <p className='text-gray-300'>
                  Otoniq.ai ile işletmenizin dijital dönüşümünü yönetin
                </p>
              </div>
              <div className='hidden md:block'>
                <div className='w-16 h-16 rounded-full overflow-hidden border-4 border-gradient-to-r from-blue-400 to-purple-400'>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className='w-full h-full object-cover'
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Main Content Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8'>
          {/* Left Column - Charts & Analytics */}
          <div className='lg:col-span-2 space-y-8'>
            <PerformanceChart />
            <RecentActivity />
          </div>

          {/* Right Column - AI Assistant, Automation & Quick Actions */}
          <div className='space-y-8'>
            <AIAssistant />
            <AutomationWidget />
            <QuickActions />
          </div>
        </div>

        {/* AI Insights Section */}
        <div className='bg-gradient-to-r from-cyan-600/20 to-blue-600/20 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8'>
          <div className='flex items-center mb-6'>
            <div className='w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mr-4'>
              <i className='ri-brain-line text-white text-2xl'></i>
            </div>
            <div>
              <h3 className='text-2xl font-bold text-white'>AI Öngörüleri</h3>
              <p className='text-gray-300'>Yapay zeka destekli iş analizleri</p>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            <div className='bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10'>
              <div className='flex items-center mb-4'>
                <i className='ri-trending-up-line text-green-400 text-2xl mr-3'></i>
                <h4 className='text-white font-semibold'>Büyüme Tahmini</h4>
              </div>
              <p className='text-3xl font-bold text-green-400 mb-2'>+24%</p>
              <p className='text-gray-300 text-sm'>
                Gelecek ay için öngörülen büyüme
              </p>
            </div>

            <div className='bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10'>
              <div className='flex items-center mb-4'>
                <i className='ri-user-heart-line text-blue-400 text-2xl mr-3'></i>
                <h4 className='text-white font-semibold'>
                  Müşteri Memnuniyeti
                </h4>
              </div>
              <p className='text-3xl font-bold text-blue-400 mb-2'>94%</p>
              <p className='text-gray-300 text-sm'>AI analizi sonucu</p>
            </div>

            <div className='bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10'>
              <div className='flex items-center mb-4'>
                <i className='ri-lightbulb-line text-yellow-400 text-2xl mr-3'></i>
                <h4 className='text-white font-semibold'>Optimizasyon</h4>
              </div>
              <p className='text-3xl font-bold text-yellow-400 mb-2'>12</p>
              <p className='text-gray-300 text-sm'>İyileştirme önerisi</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
