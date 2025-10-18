/**
 * Workflow Builder Page
 * Visual drag & drop workflow creation interface
 */

import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { WorkflowNode } from '../../../../domain/entities/WorkflowNode';
import { WorkflowTemplate } from '../../../../domain/entities/WorkflowTemplate';
import WorkflowCanvas from './components/WorkflowCanvas';
import NodeLibrary from './components/NodeLibrary';
import PropertyPanel from './components/PropertyPanel';
import WorkflowToolbar from './components/WorkflowToolbar';
import TemplateSelector from './components/TemplateSelector';

export default function WorkflowBuilderPage() {
  const navigate = useNavigate();
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Node library categories
  const nodeCategories = [
    {
      id: 'triggers',
      name: 'Tetikleyiciler',
      icon: 'ri-play-circle-line',
      color: 'green',
      nodes: [
        {
          type: 'webhook',
          name: 'Webhook',
          icon: 'ri-webhook-line',
          description: 'HTTP webhook tetikleyicisi',
        },
        {
          type: 'schedule',
          name: 'Zamanlama',
          icon: 'ri-time-line',
          description: 'Cron tabanlı zamanlama',
        },
        {
          type: 'manual',
          name: 'Manuel',
          icon: 'ri-hand-finger-line',
          description: 'Manuel tetikleme',
        },
      ],
    },
    {
      id: 'actions',
      name: 'Aksiyonlar',
      icon: 'ri-flashlight-line',
      color: 'blue',
      nodes: [
        {
          type: 'http-request',
          name: 'HTTP İsteği',
          icon: 'ri-global-line',
          description: 'HTTP API çağrısı',
        },
        {
          type: 'email',
          name: 'E-posta',
          icon: 'ri-mail-line',
          description: 'E-posta gönderimi',
        },
        {
          type: 'database',
          name: 'Veritabanı',
          icon: 'ri-database-line',
          description: 'Veritabanı işlemleri',
        },
        {
          type: 'file',
          name: 'Dosya',
          icon: 'ri-file-line',
          description: 'Dosya işlemleri',
        },
      ],
    },
    {
      id: 'logic',
      name: 'Mantık',
      icon: 'ri-flow-chart',
      color: 'purple',
      nodes: [
        {
          type: 'condition',
          name: 'Koşul',
          icon: 'ri-question-line',
          description: 'If/Else koşulları',
        },
        {
          type: 'loop',
          name: 'Döngü',
          icon: 'ri-repeat-line',
          description: 'Döngü işlemleri',
        },
        {
          type: 'switch',
          name: 'Switch',
          icon: 'ri-switch-line',
          description: 'Çoklu koşul',
        },
      ],
    },
    {
      id: 'integrations',
      name: 'Entegrasyonlar',
      icon: 'ri-plug-line',
      color: 'orange',
      nodes: [
        {
          type: 'supabase',
          name: 'Supabase',
          icon: 'ri-database-2-line',
          description: 'Supabase entegrasyonu',
        },
        {
          type: 'slack',
          name: 'Slack',
          icon: 'ri-slack-line',
          description: 'Slack bildirimi',
        },
        {
          type: 'telegram',
          name: 'Telegram',
          icon: 'ri-telegram-line',
          description: 'Telegram bot',
        },
      ],
    },
  ];

  // Add node to canvas
  const handleAddNode = useCallback((nodeType: string, nodeName: string) => {
    const newNode = new WorkflowNode(
      `node_${Date.now()}`,
      nodeType,
      nodeName,
      { x: 100, y: 100 },
      [],
      [],
      {
        category:
          nodeCategories.find(cat =>
            cat.nodes.some(node => node.type === nodeType)
          )?.id || 'general',
        icon:
          nodeCategories
            .flatMap(cat => cat.nodes)
            .find(node => node.type === nodeType)?.icon || 'ri-node-tree',
        color:
          nodeCategories.find(cat =>
            cat.nodes.some(node => node.type === nodeType)
          )?.color || 'blue',
      }
    );

    setNodes(prev => [...prev, newNode]);
    toast.success(`${nodeName} node'u eklendi`);
  }, []);

  // Select node
  const handleSelectNode = useCallback((node: WorkflowNode | null) => {
    setSelectedNode(node);
  }, []);

  // Update node
  const handleUpdateNode = useCallback((updatedNode: WorkflowNode) => {
    setNodes(prev =>
      prev.map(node => (node.id === updatedNode.id ? updatedNode : node))
    );
    setSelectedNode(updatedNode);
  }, []);

  // Delete node
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes(prev => prev.filter(node => node.id !== nodeId));
      if (selectedNode?.id === nodeId) {
        setSelectedNode(null);
      }
      toast.success('Node silindi');
    },
    [selectedNode]
  );

  // Connect nodes
  const handleConnectNodes = useCallback(
    (fromNodeId: string, toNodeId: string) => {
      setNodes(prev =>
        prev.map(node => {
          if (node.id === fromNodeId) {
            return node.addConnection({
              nodeId: toNodeId,
              outputIndex: 0,
              inputIndex: 0,
            });
          }
          return node;
        })
      );
      toast.success("Node'lar bağlandı");
    },
    []
  );

  // Disconnect nodes
  const handleDisconnectNodes = useCallback(
    (fromNodeId: string, toNodeId: string) => {
      setNodes(prev =>
        prev.map(node => {
          if (node.id === fromNodeId) {
            return node.removeConnection(toNodeId);
          }
          return node;
        })
      );
      toast.success('Bağlantı kaldırıldı');
    },
    []
  );

  // Load template
  const handleLoadTemplate = useCallback((template: WorkflowTemplate) => {
    // Parse template workflow data and create nodes
    // This would need to be implemented based on template format
    toast.success(`Template "${template.name}" yüklendi`);
    setIsTemplateOpen(false);
  }, []);

  // Save workflow
  const handleSaveWorkflow = useCallback(async () => {
    if (!workflowName.trim()) {
      toast.error('Workflow adı gerekli');
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Implement workflow saving logic
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      toast.success('Workflow kaydedildi');
    } catch (error) {
      toast.error('Workflow kaydedilemedi');
    } finally {
      setIsSaving(false);
    }
  }, [workflowName]);

  // Test workflow
  const handleTestWorkflow = useCallback(async () => {
    if (nodes.length === 0) {
      toast.error('Test edilecek node bulunamadı');
      return;
    }

    setIsTesting(true);
    try {
      // TODO: Implement workflow testing logic
      await new Promise(resolve => setTimeout(resolve, 2000)); // Mock delay
      toast.success('Workflow test edildi');
    } catch (error) {
      toast.error('Workflow test edilemedi');
    } finally {
      setIsTesting(false);
    }
  }, [nodes]);

  // Clear canvas
  const handleClearCanvas = useCallback(() => {
    if (confirm("Tüm node'lar silinecek. Emin misiniz?")) {
      setNodes([]);
      setSelectedNode(null);
      toast.success('Canvas temizlendi');
    }
  }, []);

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'>
      {/* Header */}
      <div className='bg-black/20 backdrop-blur-sm border-b border-white/10'>
        <div className='max-w-7xl mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <button
                onClick={() => navigate('/automation')}
                className='text-gray-400 hover:text-white transition-colors'
              >
                <i className='ri-arrow-left-line text-xl'></i>
              </button>
              <div>
                <h1 className='text-2xl font-bold text-white'>
                  Workflow Builder
                </h1>
                <p className='text-gray-300'>Görsel workflow oluşturucu</p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <button
                onClick={() => setIsTemplateOpen(true)}
                className='bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors'
              >
                <i className='ri-template-line mr-2'></i>
                Template Yükle
              </button>
              <button
                onClick={handleTestWorkflow}
                disabled={isTesting || nodes.length === 0}
                className='bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <i className='ri-play-line mr-2'></i>
                {isTesting ? 'Test Ediliyor...' : 'Test Et'}
              </button>
              <button
                onClick={handleSaveWorkflow}
                disabled={isSaving}
                className='bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <i className='ri-save-line mr-2'></i>
                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='flex h-[calc(100vh-80px)]'>
        {/* Node Library - Left Sidebar */}
        <div className='w-80 bg-black/20 backdrop-blur-sm border-r border-white/10 overflow-y-auto'>
          <NodeLibrary categories={nodeCategories} onAddNode={handleAddNode} />
        </div>

        {/* Canvas Area */}
        <div className='flex-1 flex flex-col'>
          {/* Toolbar */}
          <WorkflowToolbar
            workflowName={workflowName}
            workflowDescription={workflowDescription}
            onNameChange={setWorkflowName}
            onDescriptionChange={setWorkflowDescription}
            onClearCanvas={handleClearCanvas}
            nodeCount={nodes.length}
          />

          {/* Canvas */}
          <div className='flex-1 relative' ref={canvasRef}>
            <WorkflowCanvas
              nodes={nodes}
              selectedNode={selectedNode}
              onSelectNode={handleSelectNode}
              onUpdateNode={handleUpdateNode}
              onDeleteNode={handleDeleteNode}
              onConnectNodes={handleConnectNodes}
              onDisconnectNodes={handleDisconnectNodes}
            />
          </div>
        </div>

        {/* Property Panel - Right Sidebar */}
        <div className='w-80 bg-black/20 backdrop-blur-sm border-l border-white/10 overflow-y-auto'>
          <PropertyPanel
            selectedNode={selectedNode}
            onUpdateNode={handleUpdateNode}
          />
        </div>
      </div>

      {/* Template Selector Modal */}
      {isTemplateOpen && (
        <TemplateSelector
          isOpen={isTemplateOpen}
          onClose={() => setIsTemplateOpen(false)}
          onLoadTemplate={handleLoadTemplate}
        />
      )}
    </div>
  );
}
