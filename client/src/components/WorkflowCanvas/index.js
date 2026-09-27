import { useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Handle,
  Position
} from '@xyflow/react';
import { Zap, Cpu, Mail, MessageSquare, Bot, FileSpreadsheet } from 'lucide-react';

// Custom Node Types
const CustomNode = ({ data, selected }) => {
  const getIcon = () => {
    const label = (data.label || '').toLowerCase();
    if (label.includes('trigger')) return Zap;
    if (label.includes('ai') || label.includes('summarizer')) return Cpu;
    if (label.includes('gmail') || label.includes('email')) return Mail;
    if (label.includes('slack')) return MessageSquare;
    if (label.includes('discord')) return Bot;
    if (label.includes('sheet')) return FileSpreadsheet;
    return Cpu;
  };

  const Icon = getIcon();

  return (
    <div
      className={`px-4 py-3 rounded-xl bg-slate-900 border-2 min-w-[200px] shadow-xl transition-all ${
        selected ? 'border-indigo-500 ring-4 ring-indigo-500/20' : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-indigo-500 border-2 border-slate-900" />
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-semibold text-white">{data.label}</h4>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{data.provider || data.model || 'Node'}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-indigo-500 border-2 border-slate-900" />
    </div>
  );
};

const nodeTypes = {
  triggerNode: CustomNode,
  aiNode: CustomNode,
  actionNode: CustomNode,
  default: CustomNode
};

export default function WorkflowCanvas({ nodes, edges, onNodesChange, onEdgesChange, onConnect, onNodeClick }) {
  return (
    <div className="w-full h-full bg-slate-950 touch-none select-none">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => onNodeClick && onNodeClick(node)}
        fitView
        panOnDrag={true}
        zoomOnPinch={true}
        preventScrolling={true}
      >
        <Background color="#334155" gap={20} size={1} />
        <Controls className="bg-slate-900 border border-slate-800 fill-slate-300" />
      </ReactFlow>
    </div>
  );
}
