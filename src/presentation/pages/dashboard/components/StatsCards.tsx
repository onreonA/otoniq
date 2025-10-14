import { useState, useEffect } from 'react';

export default function StatsCards() {
  const [stats] = useState([
    {
      title: 'Toplam Gelir',
      value: '₺847,250',
      change: '+12.5%',
      changeType: 'positive',
      icon: 'ri-money-dollar-circle-line',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-600/20 to-emerald-600/20',
    },
    {
      title: 'Aktif Projeler',
      value: '24',
      change: '+3',
      changeType: 'positive',
      icon: 'ri-folder-line',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-600/20 to-cyan-600/20',
    },
    {
      title: 'AI İşlemleri',
      value: '15,847',
      change: '+28.2%',
      changeType: 'positive',
      icon: 'ri-robot-line',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-600/20 to-pink-600/20',
    },
    {
      title: 'Müşteri Memnuniyeti',
      value: '98.5%',
      change: '+2.1%',
      changeType: 'positive',
      icon: 'ri-heart-line',
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-600/20 to-red-600/20',
    },
  ]);

  const [animatedValues, setAnimatedValues] = useState(stats.map(() => 0));

  useEffect(() => {
    const timers = stats.map((stat, index) => {
      return setTimeout(() => {
        const targetValue = parseFloat(stat.value.replace(/[^\d.]/g, ''));
        let currentValue = 0;
        const increment = targetValue / 50;

        const interval = setInterval(() => {
          currentValue += increment;
          if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(interval);
          }

          setAnimatedValues(prev => {
            const newValues = [...prev];
            newValues[index] = currentValue;
            return newValues;
          });
        }, 30);
      }, index * 200);
    });

    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  const formatValue = (value: number, originalValue: string) => {
    if (originalValue.includes('₺')) {
      return `₺${Math.round(value).toLocaleString()}`;
    } else if (originalValue.includes('%')) {
      return `${value.toFixed(1)}%`;
    } else {
      return Math.round(value).toLocaleString();
    }
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br ${stat.bgColor} backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer group`}
        >
          <div className='flex items-center justify-between mb-4'>
            <div
              className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
            >
              <i className={`${stat.icon} text-white text-2xl`}></i>
            </div>
            <div
              className={`text-sm font-medium px-2 py-1 rounded-full ${
                stat.changeType === 'positive'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {stat.change}
            </div>
          </div>

          <div>
            <h3 className='text-gray-300 text-sm font-medium mb-2'>
              {stat.title}
            </h3>
            <p className='text-3xl font-bold text-white'>
              {formatValue(animatedValues[index], stat.value)}
            </p>
          </div>

          {/* Animated Progress Bar */}
          <div className='mt-4 h-1 bg-white/10 rounded-full overflow-hidden'>
            <div
              className={`h-full bg-gradient-to-r ${stat.color} transition-all duration-1000 ease-out`}
              style={{
                width: `${(animatedValues[index] / parseFloat(stat.value.replace(/[^\d.]/g, ''))) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}
