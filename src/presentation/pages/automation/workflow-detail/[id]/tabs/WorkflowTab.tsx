/**
 * Workflow Tab
 * Visual workflow diagram with React Flow
 */

import { useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  Connection,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface WorkflowTabProps {
  workflow: any;
}

export default function WorkflowTab({ workflow }: WorkflowTabProps) {
  // Define workflow nodes
  const initialNodes: Node[] = [
    {
      id: '1',
      type: 'input',
      data: {
        label: (
          <div className='text-center'>
            <div className='font-bold text-blue-600'>⏰ Trigger</div>
            <div className='text-xs text-gray-600 mt-1'>Cron Schedule</div>
            <div className='text-xs text-gray-500'>Daily at 09:00</div>
          </div>
        ),
      },
      position: { x: 250, y: 50 },
      style: {
        background: '#3b82f6',
        color: 'white',
        border: '2px solid #2563eb',
        borderRadius: '12px',
        padding: '16px',
        minWidth: '180px',
      },
    },
    {
      id: '2',
      data: {
        label: (
          <div className='text-center'>
            <div className='font-bold text-purple-600'>📊 Fetch Data</div>
            <div className='text-xs text-gray-600 mt-1'>Supabase Query</div>
            <div className='text-xs text-gray-500'>Get sales data</div>
          </div>
        ),
      },
      position: { x: 250, y: 180 },
      style: {
        background: '#a855f7',
        color: 'white',
        border: '2px solid #9333ea',
        borderRadius: '12px',
        padding: '16px',
        minWidth: '180px',
      },
    },
    {
      id: '3',
      data: {
        label: (
          <div className='text-center'>
            <div className='font-bold text-purple-600'>⚙️ Process</div>
            <div className='text-xs text-gray-600 mt-1'>Data Analysis</div>
            <div className='text-xs text-gray-500'>Calculate metrics</div>
          </div>
        ),
      },
      position: { x: 250, y: 310 },
      style: {
        background: '#a855f7',
        color: 'white',
        border: '2px solid #9333ea',
        borderRadius: '12px',
        padding: '16px',
        minWidth: '180px',
      },
    },
    {
      id: '4',
      data: {
        label: (
          <div className='text-center'>
            <div className='font-bold text-purple-600'>📄 Generate</div>
            <div className='text-xs text-gray-600 mt-1'>PDF Report</div>
            <div className='text-xs text-gray-500'>Format data</div>
          </div>
        ),
      },
      position: { x: 250, y: 440 },
      style: {
        background: '#a855f7',
        color: 'white',
        border: '2px solid #9333ea',
        borderRadius: '12px',
        padding: '16px',
        minWidth: '180px',
      },
    },
    {
      id: '5',
      type: 'output',
      data: {
        label: (
          <div className='text-center'>
            <div className='font-bold text-green-600'>✉️ Send Email</div>
            <div className='text-xs text-gray-600 mt-1'>Email Service</div>
            <div className='text-xs text-gray-500'>Deliver report</div>
          </div>
        ),
      },
      position: { x: 250, y: 570 },
      style: {
        background: '#10b981',
        color: 'white',
        border: '2px solid #059669',
        borderRadius: '12px',
        padding: '16px',
        minWidth: '180px',
      },
    },
  ];

  // Define edges (connections)
  const initialEdges: Edge[] = [
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
    },
    {
      id: 'e2-3',
      source: '2',
      target: '3',
      animated: true,
      style: { stroke: '#a855f7', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' },
    },
    {
      id: 'e3-4',
      source: '3',
      target: '4',
      animated: true,
      style: { stroke: '#a855f7', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' },
    },
    {
      id: 'e4-5',
      source: '4',
      target: '5',
      animated: true,
      style: { stroke: '#10b981', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges(eds => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className='space-y-6'>
      <div className='bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl p-6'>
        <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
          <i className='ri-flow-chart'></i>
          Workflow Diyagramı
        </h3>
        <div
          style={{
            height: '500px',
            backgroundColor: '#1a1a1a',
            borderRadius: '12px',
            border: '1px solid #333',
          }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            attributionPosition='bottom-left'
          >
            <Background color='#333' gap={16} />
            <Controls />
            <MiniMap
              nodeColor={node => {
                if (node.type === 'input') return '#3b82f6';
                if (node.type === 'output') return '#10b981';
                return '#a855f7';
              }}
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
            />
          </ReactFlow>
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
