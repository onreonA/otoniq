/**
 * Run Details Tab
 * Step-by-step execution details for selected run
 */

interface RunDetailsTabProps {
  workflow: any;
}

export default function RunDetailsTab({ workflow }: RunDetailsTabProps) {
  const steps = [
    {
      step: 1,
      name: 'Trigger: Cron Schedule',
      status: 'success',
      duration: 0.5,
      input: { time: '09:00:00', date: '2024-01-16' },
      output: { triggered: true },
    },
    {
      step: 2,
      name: 'Fetch Sales Data',
      status: 'success',
      duration: 2.3,
      input: { query: 'SELECT * FROM orders WHERE date = ...' },
      output: { rows: 45, total_sales: 125000 },
    },
    {
      step: 3,
      name: 'Process & Analyze',
      status: 'success',
      duration: 1.5,
      input: { data: '...' },
      output: { analyzed: true, metrics: '...' },
    },
    {
      step: 4,
      name: 'Generate PDF Report',
      status: 'success',
      duration: 3.2,
      input: { template: 'daily-report', data: '...' },
      output: { pdf_url: 'https://...' },
    },
    {
      step: 5,
      name: 'Send Email',
      status: 'success',
      duration: 1.8,
      input: { to: 'admin@example.com', subject: '...' },
      output: { sent: true, message_id: 'msg_123' },
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Run Summary */}
      <div className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
        <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
          <i className='ri-information-line'></i>
          Çalışma Özeti
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div>
            <p className='text-sm text-gray-400 mb-1'>Toplam Süre</p>
            <p className='text-white font-bold text-xl'>9.3s</p>
          </div>
          <div>
            <p className='text-sm text-gray-400 mb-1'>Tamamlanan Adım</p>
            <p className='text-white font-bold text-xl'>5/5</p>
          </div>
          <div>
            <p className='text-sm text-gray-400 mb-1'>Durum</p>
            <span className='inline-block px-3 py-1 rounded-lg text-xs font-medium bg-green-500/20 text-green-400'>
              ✓ BAŞARILI
            </span>
          </div>
          <div>
            <p className='text-sm text-gray-400 mb-1'>Çalışma ID</p>
            <p className='text-white font-mono text-sm'>run_abc123</p>
          </div>
        </div>
      </div>

      {/* Step Timeline */}
      <div className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
        <h3 className='text-lg font-semibold text-white mb-6 flex items-center gap-2'>
          <i className='ri-time-line'></i>
          Adım Adım Detaylar
        </h3>
        <div className='space-y-6 relative'>
          {/* Vertical Line */}
          <div className='absolute left-[15px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500'></div>

          {steps.map((step, index) => (
            <div key={index} className='relative pl-12'>
              {/* Step Number */}
              <div
                className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10 ${
                  step.status === 'success'
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                }`}
              >
                {step.step}
              </div>

              {/* Step Content */}
              <div className='bg-gray-800/30 rounded-lg p-4'>
                <div className='flex items-center justify-between mb-2'>
                  <h4 className='text-white font-medium'>{step.name}</h4>
                  <div className='flex items-center gap-3 text-sm'>
                    <span className='text-gray-400'>
                      <i className='ri-time-line'></i> {step.duration}s
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        step.status === 'success'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {step.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Input/Output Accordions */}
                <details className='mt-3'>
                  <summary className='cursor-pointer text-sm text-blue-400 hover:text-blue-300'>
                    <i className='ri-arrow-right-s-line inline'></i> Input Data
                  </summary>
                  <pre className='mt-2 p-2 bg-gray-900/50 rounded text-xs text-green-400 overflow-x-auto font-mono'>
                    {JSON.stringify(step.input, null, 2)}
                  </pre>
                </details>

                <details className='mt-2'>
                  <summary className='cursor-pointer text-sm text-purple-400 hover:text-purple-300'>
                    <i className='ri-arrow-right-s-line inline'></i> Output Data
                  </summary>
                  <pre className='mt-2 p-2 bg-gray-900/50 rounded text-xs text-purple-400 overflow-x-auto font-mono'>
                    {JSON.stringify(step.output, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
