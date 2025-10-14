export default function StatsSection() {
  const stats = [
    {
      number: '2.5M+',
      label: 'İşlem Hacmi',
      description: 'Aylık otomatik işlem',
      icon: 'ri-line-chart-line',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      number: '%87',
      label: 'Verimlilik Artışı',
      description: 'Ortalama performans iyileştirmesi',
      icon: 'ri-speed-up-line',
      color: 'from-green-500 to-emerald-500',
    },
    {
      number: '45dk',
      label: 'Kurulum Süresi',
      description: 'Hızlı entegrasyon',
      icon: 'ri-timer-line',
      color: 'from-purple-500 to-pink-500',
    },
    {
      number: '99.9%',
      label: 'Uptime Garantisi',
      description: 'Kesintisiz hizmet',
      icon: 'ri-shield-check-line',
      color: 'from-indigo-500 to-purple-500',
    },
  ];

  return (
    <section className='py-20 bg-gradient-to-r from-indigo-600 to-purple-600 relative overflow-hidden'>
      {/* Background Pattern */}
      <div className='absolute inset-0 opacity-10'>
        <div className='absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent'></div>
        <div className='absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full'></div>
        <div className='absolute bottom-20 right-20 w-48 h-48 bg-white/5 rounded-full'></div>
      </div>

      <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-16'>
          <h2 className='text-4xl font-bold text-white mb-4'>
            Rakamlarla Otoniq.ai
          </h2>
          <p className='text-xl text-indigo-100 max-w-3xl mx-auto'>
            Binlerce işletmenin güvendiği platform ile elde edilen sonuçlar
          </p>
        </div>

        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {stats.map((stat, index) => (
            <div key={index} className='text-center group'>
              <div
                className={`w-20 h-20 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                <i className={`${stat.icon} text-white text-3xl`}></i>
              </div>

              <div className='text-4xl font-bold text-white mb-2'>
                {stat.number}
              </div>

              <div className='text-xl font-semibold text-indigo-100 mb-2'>
                {stat.label}
              </div>

              <div className='text-indigo-200 text-sm'>{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
