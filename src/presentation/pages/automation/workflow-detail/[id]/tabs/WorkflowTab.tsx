/**
 * Workflow Tab
 * Visual workflow diagram (placeholder for React Flow integration)
 */

interface WorkflowTabProps {
  workflow: any;
}

export default function WorkflowTab({ workflow }: WorkflowTabProps) {
  return (
    <div className='space-y-6'>
      <div className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
        <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
          <i className='ri-flow-chart'></i>
          Workflow Diyagramı
        </h3>
        <div className='bg-gray-900/50 rounded-lg p-12 text-center border-2 border-dashed border-gray-700'>
          <i className='ri-node-tree text-6xl text-gray-600 mb-4'></i>
          <p className='text-gray-400 text-lg mb-2'>Visual Workflow Diagram</p>
          <p className='text-gray-500 text-sm mb-4'>
            React Flow entegrasyonu Week 7'de eklenecek
          </p>
          <div className='inline-flex items-center gap-2 text-sm text-indigo-400'>
            <i className='ri-information-line'></i>
            Trigger → Process → Action → Output
          </div>
        </div>
      </div>

      {/* Workflow Steps Preview */}
      <div className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
        <h3 className='text-lg font-semibold text-white mb-4'>
          Workflow Adımları (Mock)
        </h3>
        <div className='space-y-3'>
          {[
            {
              step: 1,
              name: 'Trigger: Cron Schedule',
              type: 'trigger',
              description: 'Her gün saat 09:00',
            },
            {
              step: 2,
              name: 'Fetch Sales Data',
              type: 'action',
              description: "Supabase'den veri çek",
            },
            {
              step: 3,
              name: 'Process & Analyze',
              type: 'action',
              description: 'Verileri işle ve analiz et',
            },
            {
              step: 4,
              name: 'Generate PDF Report',
              type: 'action',
              description: 'PDF rapor oluştur',
            },
            {
              step: 5,
              name: 'Send Email',
              type: 'output',
              description: 'E-posta gönder',
            },
          ].map(step => (
            <div
              key={step.step}
              className='flex items-center gap-4 p-4 bg-gray-800/30 rounded-lg'
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                  step.type === 'trigger'
                    ? 'bg-blue-500/20 text-blue-400'
                    : step.type === 'action'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-green-500/20 text-green-400'
                }`}
              >
                {step.step}
              </div>
              <div className='flex-1'>
                <p className='text-white font-medium'>{step.name}</p>
                <p className='text-gray-400 text-sm'>{step.description}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-lg text-xs font-medium ${
                  step.type === 'trigger'
                    ? 'bg-blue-500/20 text-blue-400'
                    : step.type === 'action'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-green-500/20 text-green-400'
                }`}
              >
                {step.type.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
