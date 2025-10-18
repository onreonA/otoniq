/**
 * WorkflowCanvas Component
 * Main canvas for drag & drop workflow creation
 */

import React, { useRef, useCallback, useState } from 'react';
import { WorkflowNode } from '../../../../../domain/entities/WorkflowNode';

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  selectedNode: WorkflowNode | null;
  onSelectNode: (node: WorkflowNode | null) => void;
  onUpdateNode: (node: WorkflowNode) => void;
  onDeleteNode: (nodeId: string) => void;
  onConnectNodes: (fromNodeId: string, toNodeId: string) => void;
  onDisconnectNodes: (fromNodeId: string, toNodeId: string) => void;
}

export default function WorkflowCanvas({
  nodes,
  selectedNode,
  onSelectNode,
  onUpdateNode,
  onDeleteNode,
  onConnectNodes,
  onDisconnectNodes,
}: WorkflowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);

  // Handle node click
  const handleNodeClick = useCallback(
    (node: WorkflowNode) => {
      onSelectNode(node);
    },
    [onSelectNode]
  );

  // Handle node drag start
  const handleNodeDragStart = useCallback(
    (node: WorkflowNode, event: React.MouseEvent) => {
      event.stopPropagation();
      setIsDragging(true);
      setDragStart({ x: event.clientX, y: event.clientY });
    },
    []
  );

  // Handle node drag
  const handleNodeDrag = useCallback(
    (node: WorkflowNode, event: React.MouseEvent) => {
      if (!isDragging) return;

      const deltaX = event.clientX - dragStart.x;
      const deltaY = event.clientY - dragStart.y;

      const updatedNode = node.updatePosition({
        x: node.position.x + deltaX,
        y: node.position.y + deltaY,
      });

      onUpdateNode(updatedNode);
      setDragStart({ x: event.clientX, y: event.clientY });
    },
    [isDragging, dragStart, onUpdateNode]
  );

  // Handle node drag end
  const handleNodeDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle connection start
  const handleConnectionStart = useCallback((nodeId: string) => {
    setIsConnecting(true);
    setConnectionStart(nodeId);
  }, []);

  // Handle connection end
  const handleConnectionEnd = useCallback(
    (nodeId: string) => {
      if (isConnecting && connectionStart && connectionStart !== nodeId) {
        onConnectNodes(connectionStart, nodeId);
      }
      setIsConnecting(false);
      setConnectionStart(null);
    },
    [isConnecting, connectionStart, onConnectNodes]
  );

  // Handle canvas click
  const handleCanvasClick = useCallback(() => {
    onSelectNode(null);
  }, [onSelectNode]);

  // Handle delete key
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Delete' && selectedNode) {
        onDeleteNode(selectedNode.id);
      }
    },
    [selectedNode, onDeleteNode]
  );

  return (
    <div
      ref={canvasRef}
      className='w-full h-full bg-gray-900/50 relative overflow-hidden'
      onClick={handleCanvasClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Grid Background */}
      <div className='absolute inset-0 opacity-20'>
        <svg width='100%' height='100%' className='text-gray-600'>
          <defs>
            <pattern
              id='grid'
              width='20'
              height='20'
              patternUnits='userSpaceOnUse'
            >
              <path
                d='M 20 0 L 0 0 0 20'
                fill='none'
                stroke='currentColor'
                strokeWidth='0.5'
              />
            </pattern>
          </defs>
          <rect width='100%' height='100%' fill='url(#grid)' />
        </svg>
      </div>

      {/* Connection Lines */}
      <svg className='absolute inset-0 pointer-events-none'>
        {nodes.map(node =>
          node.connections.map((connection, index) => {
            const targetNode = nodes.find(n => n.id === connection.nodeId);
            if (!targetNode) return null;

            return (
              <line
                key={`${node.id}-${connection.nodeId}-${index}`}
                x1={node.position.x + 100}
                y1={node.position.y + 50}
                x2={targetNode.position.x + 100}
                y2={targetNode.position.y + 50}
                stroke='#6366f1'
                strokeWidth='2'
                markerEnd='url(#arrowhead)'
                className='transition-all duration-200 hover:stroke-blue-400'
              />
            );
          })
        )}
        <defs>
          <marker
            id='arrowhead'
            markerWidth='10'
            markerHeight='7'
            refX='9'
            refY='3.5'
            orient='auto'
          >
            <polygon points='0 0, 10 3.5, 0 7' fill='#6366f1' />
          </marker>
        </defs>
      </svg>

      {/* Nodes */}
      {nodes.map(node => (
        <WorkflowNodeComponent
          key={node.id}
          node={node}
          isSelected={selectedNode?.id === node.id}
          isConnecting={isConnecting}
          connectionStart={connectionStart}
          onClick={() => handleNodeClick(node)}
          onDragStart={e => handleNodeDragStart(node, e)}
          onDrag={e => handleNodeDrag(node, e)}
          onDragEnd={handleNodeDragEnd}
          onConnectionStart={() => handleConnectionStart(node.id)}
          onConnectionEnd={() => handleConnectionEnd(node.id)}
        />
      ))}

      {/* Connection Mode Indicator */}
      {isConnecting && (
        <div className='absolute top-4 left-4 bg-blue-500/20 border border-blue-500/50 text-blue-400 px-3 py-2 rounded-lg text-sm font-medium'>
          <i className='ri-link mr-2'></i>
          Bağlantı modu - Hedef node'a tıklayın
        </div>
      )}

      {/* Empty State */}
      {nodes.length === 0 && (
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='text-center'>
            <div className='w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4'>
              <i className='ri-node-tree text-2xl text-gray-400'></i>
            </div>
            <h3 className='text-lg font-semibold text-white mb-2'>
              Workflow oluşturmaya başlayın
            </h3>
            <p className='text-gray-400 mb-4'>
              Sol panelden node'ları sürükleyerek workflow'unuzu oluşturun
            </p>
            <div className='flex items-center justify-center gap-2 text-sm text-gray-500'>
              <i className='ri-drag-drop-line'></i>
              <span>Node'ları sürükleyin</span>
              <i className='ri-arrow-right-line'></i>
              <span>Bağlayın</span>
              <i className='ri-arrow-right-line'></i>
              <span>Test edin</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface WorkflowNodeComponentProps {
  node: WorkflowNode;
  isSelected: boolean;
  isConnecting: boolean;
  connectionStart: string | null;
  onClick: () => void;
  onDragStart: (event: React.MouseEvent) => void;
  onDrag: (event: React.MouseEvent) => void;
  onDragEnd: () => void;
  onConnectionStart: () => void;
  onConnectionEnd: () => void;
}

function WorkflowNodeComponent({
  node,
  isSelected,
  isConnecting,
  connectionStart,
  onClick,
  onDragStart,
  onDrag,
  onDragEnd,
  onConnectionStart,
  onConnectionEnd,
}: WorkflowNodeComponentProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      setIsDragging(true);
      onDragStart(event);
    },
    [onDragStart]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (isDragging) {
        onDrag(event);
      }
    },
    [isDragging, onDrag]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onDragEnd();
    }
  }, [isDragging, onDragEnd]);

  const handleConnectionClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      if (isConnecting) {
        onConnectionEnd();
      } else {
        onConnectionStart();
      }
    },
    [isConnecting, onConnectionStart, onConnectionEnd]
  );

  return (
    <div
      className={`absolute w-48 bg-white/10 backdrop-blur-sm border-2 rounded-xl p-4 cursor-move transition-all duration-200 ${
        isSelected
          ? 'border-blue-400 shadow-lg shadow-blue-400/20'
          : 'border-white/20 hover:border-white/40'
      } ${
        isConnecting && connectionStart !== node.id
          ? 'border-green-400 shadow-lg shadow-green-400/20'
          : ''
      }`}
      style={{
        left: node.position.x,
        top: node.position.y,
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
      }}
      onClick={onClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Node Header */}
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center gap-2'>
          <div
            className={`w-8 h-8 rounded-lg bg-${node.getColor()}-500/20 flex items-center justify-center`}
          >
            <i
              className={`${node.getIcon()} text-${node.getColor()}-400 text-sm`}
            ></i>
          </div>
          <div>
            <h4 className='text-white font-medium text-sm'>
              {node.getDisplayName()}
            </h4>
            <p className='text-gray-400 text-xs'>{node.type}</p>
          </div>
        </div>
        <div className='flex items-center gap-1'>
          <button
            onClick={handleConnectionClick}
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${
              isConnecting && connectionStart !== node.id
                ? 'bg-green-500 text-white'
                : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/40'
            }`}
            title={isConnecting ? 'Bağlantıyı tamamla' : 'Bağlantı başlat'}
          >
            <i className='ri-link'></i>
          </button>
        </div>
      </div>

      {/* Node Content */}
      <div className='space-y-2'>
        {node.parameters.map((param, index) => (
          <div key={index} className='text-xs'>
            <span className='text-gray-400'>{param.name}:</span>
            <span className='text-white ml-1'>
              {typeof param.value === 'string'
                ? param.value
                : JSON.stringify(param.value)}
            </span>
          </div>
        ))}
      </div>

      {/* Connection Points */}
      <div className='absolute -right-2 top-1/2 transform -translate-y-1/2'>
        <div className='w-4 h-4 bg-blue-500 rounded-full border-2 border-white'></div>
      </div>
      <div className='absolute -left-2 top-1/2 transform -translate-y-1/2'>
        <div className='w-4 h-4 bg-gray-500 rounded-full border-2 border-white'></div>
      </div>
    </div>
  );
}
