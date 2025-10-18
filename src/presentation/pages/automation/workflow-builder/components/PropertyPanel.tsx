/**
 * PropertyPanel Component
 * Right sidebar for editing selected node properties
 */

import React, { useState, useEffect } from 'react';
import { WorkflowNode } from '../../../../../domain/entities/WorkflowNode';

interface PropertyPanelProps {
  selectedNode: WorkflowNode | null;
  onUpdateNode: (node: WorkflowNode) => void;
}

export default function PropertyPanel({
  selectedNode,
  onUpdateNode,
}: PropertyPanelProps) {
  const [nodeName, setNodeName] = useState('');
  const [nodeParameters, setNodeParameters] = useState<
    WorkflowNode['parameters']
  >([]);

  // Update local state when selected node changes
  useEffect(() => {
    if (selectedNode) {
      setNodeName(selectedNode.name);
      setNodeParameters([...selectedNode.parameters]);
    }
  }, [selectedNode]);

  // Handle parameter change
  const handleParameterChange = (index: number, value: any) => {
    const updatedParameters = [...nodeParameters];
    updatedParameters[index] = {
      ...updatedParameters[index],
      value: value,
    };
    setNodeParameters(updatedParameters);
  };

  // Handle parameter type change
  const handleParameterTypeChange = (index: number, type: string) => {
    const updatedParameters = [...nodeParameters];
    updatedParameters[index] = {
      ...updatedParameters[index],
      type: type as any,
      value: getDefaultValueForType(type),
    };
    setNodeParameters(updatedParameters);
  };

  // Get default value for parameter type
  const getDefaultValueForType = (type: string): any => {
    switch (type) {
      case 'string':
        return '';
      case 'number':
        return 0;
      case 'boolean':
        return false;
      case 'object':
        return {};
      case 'array':
        return [];
      default:
        return '';
    }
  };

  // Add new parameter
  const handleAddParameter = () => {
    const newParameter = {
      name: `param_${nodeParameters.length + 1}`,
      type: 'string' as const,
      value: '',
      required: false,
      description: '',
    };
    setNodeParameters([...nodeParameters, newParameter]);
  };

  // Remove parameter
  const handleRemoveParameter = (index: number) => {
    const updatedParameters = nodeParameters.filter((_, i) => i !== index);
    setNodeParameters(updatedParameters);
  };

  // Save changes
  const handleSave = () => {
    if (!selectedNode) return;

    const updatedNode = selectedNode.updateParameters(nodeParameters);
    onUpdateNode(updatedNode);
  };

  // Reset changes
  const handleReset = () => {
    if (selectedNode) {
      setNodeName(selectedNode.name);
      setNodeParameters([...selectedNode.parameters]);
    }
  };

  if (!selectedNode) {
    return (
      <div className='h-full flex flex-col'>
        <div className='p-4 border-b border-white/10'>
          <h3 className='text-lg font-semibold text-white'>Özellikler</h3>
        </div>
        <div className='flex-1 flex items-center justify-center'>
          <div className='text-center'>
            <div className='w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
              <i className='ri-settings-3-line text-gray-400 text-2xl'></i>
            </div>
            <p className='text-gray-400 text-sm'>
              Düzenlemek için bir node seçin
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col'>
      {/* Header */}
      <div className='p-4 border-b border-white/10'>
        <div className='flex items-center gap-3 mb-3'>
          <div
            className={`w-8 h-8 rounded-lg bg-${selectedNode.getColor()}-500/20 flex items-center justify-center`}
          >
            <i
              className={`${selectedNode.getIcon()} text-${selectedNode.getColor()}-400 text-sm`}
            ></i>
          </div>
          <div>
            <h3 className='text-lg font-semibold text-white'>
              Node Özellikleri
            </h3>
            <p className='text-gray-400 text-xs'>{selectedNode.type}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto p-4 space-y-6'>
        {/* Basic Properties */}
        <div>
          <h4 className='text-white font-medium mb-3'>Temel Özellikler</h4>
          <div className='space-y-3'>
            <div>
              <label className='block text-gray-300 text-sm mb-1'>
                Node Adı
              </label>
              <input
                type='text'
                value={nodeName}
                onChange={e => setNodeName(e.target.value)}
                className='w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400'
                placeholder='Node adı...'
              />
            </div>
            <div>
              <label className='block text-gray-300 text-sm mb-1'>
                Node Tipi
              </label>
              <input
                type='text'
                value={selectedNode.type}
                disabled
                className='w-full bg-gray-500/20 border border-gray-500/50 rounded-lg px-3 py-2 text-gray-400 text-sm cursor-not-allowed'
              />
            </div>
          </div>
        </div>

        {/* Parameters */}
        <div>
          <div className='flex items-center justify-between mb-3'>
            <h4 className='text-white font-medium'>Parametreler</h4>
            <button
              onClick={handleAddParameter}
              className='bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 px-2 py-1 rounded text-xs transition-colors'
            >
              <i className='ri-add-line mr-1'></i>
              Ekle
            </button>
          </div>

          <div className='space-y-3'>
            {nodeParameters.map((param, index) => (
              <div
                key={index}
                className='bg-white/5 border border-white/10 rounded-lg p-3'
              >
                <div className='flex items-center gap-2 mb-2'>
                  <input
                    type='text'
                    value={param.name}
                    onChange={e => {
                      const updated = [...nodeParameters];
                      updated[index] = {
                        ...updated[index],
                        name: e.target.value,
                      };
                      setNodeParameters(updated);
                    }}
                    className='flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-400'
                    placeholder='Parametre adı...'
                  />
                  <select
                    value={param.type}
                    onChange={e =>
                      handleParameterTypeChange(index, e.target.value)
                    }
                    className='bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-400'
                  >
                    <option value='string'>String</option>
                    <option value='number'>Number</option>
                    <option value='boolean'>Boolean</option>
                    <option value='object'>Object</option>
                    <option value='array'>Array</option>
                  </select>
                  <button
                    onClick={() => handleRemoveParameter(index)}
                    className='text-red-400 hover:text-red-300 transition-colors'
                  >
                    <i className='ri-delete-bin-line text-sm'></i>
                  </button>
                </div>

                <div className='space-y-2'>
                  <input
                    type='text'
                    value={param.description || ''}
                    onChange={e => {
                      const updated = [...nodeParameters];
                      updated[index] = {
                        ...updated[index],
                        description: e.target.value,
                      };
                      setNodeParameters(updated);
                    }}
                    className='w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-400'
                    placeholder='Açıklama...'
                  />

                  <div className='flex items-center gap-2'>
                    <input
                      type='checkbox'
                      checked={param.required || false}
                      onChange={e => {
                        const updated = [...nodeParameters];
                        updated[index] = {
                          ...updated[index],
                          required: e.target.checked,
                        };
                        setNodeParameters(updated);
                      }}
                      className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500'
                    />
                    <label className='text-gray-300 text-xs'>Gerekli</label>
                  </div>

                  {/* Parameter Value Input */}
                  {param.type === 'string' && (
                    <input
                      type='text'
                      value={param.value || ''}
                      onChange={e =>
                        handleParameterChange(index, e.target.value)
                      }
                      className='w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-400'
                      placeholder='Değer...'
                    />
                  )}

                  {param.type === 'number' && (
                    <input
                      type='number'
                      value={param.value || 0}
                      onChange={e =>
                        handleParameterChange(
                          index,
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className='w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-400'
                    />
                  )}

                  {param.type === 'boolean' && (
                    <select
                      value={param.value ? 'true' : 'false'}
                      onChange={e =>
                        handleParameterChange(index, e.target.value === 'true')
                      }
                      className='w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-400'
                    >
                      <option value='false'>False</option>
                      <option value='true'>True</option>
                    </select>
                  )}

                  {(param.type === 'object' || param.type === 'array') && (
                    <textarea
                      value={JSON.stringify(param.value, null, 2)}
                      onChange={e => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          handleParameterChange(index, parsed);
                        } catch {
                          // Invalid JSON, keep the text
                        }
                      }}
                      className='w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-400'
                      rows={3}
                      placeholder='JSON formatında...'
                    />
                  )}
                </div>
              </div>
            ))}

            {nodeParameters.length === 0 && (
              <div className='text-center py-8'>
                <div className='w-12 h-12 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-3'>
                  <i className='ri-settings-line text-gray-400 text-xl'></i>
                </div>
                <p className='text-gray-400 text-sm'>Henüz parametre yok</p>
                <p className='text-gray-500 text-xs mt-1'>
                  Yeni parametre ekleyin
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Node Info */}
        <div>
          <h4 className='text-white font-medium mb-3'>Node Bilgileri</h4>
          <div className='bg-white/5 border border-white/10 rounded-lg p-3 space-y-2'>
            <div className='flex justify-between text-sm'>
              <span className='text-gray-400'>ID:</span>
              <span className='text-white font-mono'>{selectedNode.id}</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-gray-400'>Kategori:</span>
              <span className='text-white'>{selectedNode.getCategory()}</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-gray-400'>Bağlantılar:</span>
              <span className='text-white'>
                {selectedNode.connections.length}
              </span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-gray-400'>Pozisyon:</span>
              <span className='text-white'>
                {selectedNode.position.x}, {selectedNode.position.y}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className='p-4 border-t border-white/10'>
        <div className='flex gap-2'>
          <button
            onClick={handleSave}
            className='flex-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors'
          >
            <i className='ri-save-line mr-2'></i>
            Kaydet
          </button>
          <button
            onClick={handleReset}
            className='flex-1 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/50 text-gray-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors'
          >
            <i className='ri-refresh-line mr-2'></i>
            Sıfırla
          </button>
        </div>
      </div>
    </div>
  );
}
