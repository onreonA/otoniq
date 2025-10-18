/**
 * WorkflowToolbar Component
 * Top toolbar for workflow management
 */

import React from 'react';

interface WorkflowToolbarProps {
  workflowName: string;
  workflowDescription: string;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onClearCanvas: () => void;
  nodeCount: number;
}

export default function WorkflowToolbar({
  workflowName,
  workflowDescription,
  onNameChange,
  onDescriptionChange,
  onClearCanvas,
  nodeCount,
}: WorkflowToolbarProps) {
  return (
    <div className='bg-black/20 backdrop-blur-sm border-b border-white/10 p-4'>
      <div className='flex items-center justify-between'>
        {/* Workflow Info */}
        <div className='flex items-center gap-6'>
          <div>
            <label className='block text-gray-300 text-sm mb-1'>
              Workflow Adı
            </label>
            <input
              type='text'
              value={workflowName}
              onChange={e => onNameChange(e.target.value)}
              className='bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400 w-64'
              placeholder='Workflow adı...'
            />
          </div>
          <div>
            <label className='block text-gray-300 text-sm mb-1'>Açıklama</label>
            <input
              type='text'
              value={workflowDescription}
              onChange={e => onDescriptionChange(e.target.value)}
              className='bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400 w-80'
              placeholder='Workflow açıklaması...'
            />
          </div>
        </div>

        {/* Actions */}
        <div className='flex items-center gap-3'>
          {/* Stats */}
          <div className='flex items-center gap-4 text-sm text-gray-300'>
            <div className='flex items-center gap-1'>
              <i className='ri-node-tree'></i>
              <span>{nodeCount} node</span>
            </div>
            <div className='flex items-center gap-1'>
              <i className='ri-link'></i>
              <span>0 bağlantı</span>
            </div>
          </div>

          {/* Divider */}
          <div className='w-px h-6 bg-white/20'></div>

          {/* Clear Button */}
          <button
            onClick={onClearCanvas}
            disabled={nodeCount === 0}
            className='bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <i className='ri-delete-bin-line mr-2'></i>
            Temizle
          </button>
        </div>
      </div>
    </div>
  );
}
