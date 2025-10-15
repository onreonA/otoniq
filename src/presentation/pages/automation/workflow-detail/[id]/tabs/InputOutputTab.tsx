/**
 * Input/Output Tab
 * Example input and output data for the workflow
 */

interface InputOutputTabProps {
  workflow: any;
}

export default function InputOutputTab({ workflow }: InputOutputTabProps) {
  const exampleInput = {
    tenant_id: 'tenant_123',
    date_range: {
      start: '2024-01-15',
      end: '2024-01-15',
    },
    include_charts: true,
    recipients: ['admin@example.com'],
  };

  const exampleOutput = {
    report_id: 'rep_456',
    generated_at: '2024-01-16T09:00:00Z',
    total_sales: 125000,
    total_orders: 45,
    average_order_value: 2777.78,
    pdf_url: 'https://storage.example.com/reports/daily-2024-01-15.pdf',
    email_sent: true,
    recipients_count: 1,
  };

  return (
    <div className='space-y-6'>
      {/* Input Section */}
      <div className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-white flex items-center gap-2'>
            <i className='ri-arrow-right-circle-line text-blue-400'></i>
            Giriş Verisi (Input)
          </h3>
          <button className='text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1'>
            <i className='ri-file-copy-line'></i>
            Kopyala
          </button>
        </div>
        <div className='bg-gray-900/50 rounded-lg p-4 font-mono text-sm'>
          <pre className='text-green-400 overflow-x-auto'>
            {JSON.stringify(exampleInput, null, 2)}
          </pre>
        </div>
        <p className='text-gray-400 text-xs mt-2'>
          Bu veriler workflow'un başlangıcında gönderilir
        </p>
      </div>

      {/* Output Section */}
      <div className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-white flex items-center gap-2'>
            <i className='ri-arrow-left-circle-line text-purple-400'></i>
            Çıkış Verisi (Output)
          </h3>
          <button className='text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1'>
            <i className='ri-file-copy-line'></i>
            Kopyala
          </button>
        </div>
        <div className='bg-gray-900/50 rounded-lg p-4 font-mono text-sm'>
          <pre className='text-purple-400 overflow-x-auto'>
            {JSON.stringify(exampleOutput, null, 2)}
          </pre>
        </div>
        <p className='text-gray-400 text-xs mt-2'>
          Bu veriler workflow tamamlandığında döner
        </p>
      </div>

      {/* Schema Information */}
      <div className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
        <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
          <i className='ri-file-code-line'></i>
          Veri Şeması
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <h4 className='text-sm font-semibold text-blue-400 mb-2'>
              Input Fields
            </h4>
            <div className='space-y-2'>
              {Object.entries(exampleInput).map(([key, value]) => (
                <div
                  key={key}
                  className='flex items-center justify-between p-2 bg-gray-800/30 rounded'
                >
                  <span className='text-white text-sm font-mono'>{key}</span>
                  <span className='text-gray-400 text-xs'>
                    {typeof value === 'object' ? 'object' : typeof value}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className='text-sm font-semibold text-purple-400 mb-2'>
              Output Fields
            </h4>
            <div className='space-y-2'>
              {Object.entries(exampleOutput).map(([key, value]) => (
                <div
                  key={key}
                  className='flex items-center justify-between p-2 bg-gray-800/30 rounded'
                >
                  <span className='text-white text-sm font-mono'>{key}</span>
                  <span className='text-gray-400 text-xs'>
                    {typeof value === 'object' ? 'object' : typeof value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
