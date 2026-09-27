import { create } from 'zustand';
import api from '../services/api';

export const useWorkflowStore = create((set, get) => ({
  workflows: [],
  activeWorkflow: null,
  selectedNode: null,
  executionLogs: [],
  currentExecution: null,
  isLoading: false,
  error: null,

  fetchWorkflows: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/workflows', { params: filters });
      set({ workflows: res.data.data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchWorkflowById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/workflows/${id}`);
      set({ activeWorkflow: res.data.data, isLoading: false });
      return res.data.data;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  setActiveWorkflow: (workflow) => {
    set({ activeWorkflow: workflow });
  },

  setSelectedNode: (node) => {
    set({ selectedNode: node });
  },

  updateNodeConfig: (nodeId, newConfig) => {
    const { activeWorkflow } = get();
    if (!activeWorkflow) return;

    const updatedNodes = (activeWorkflow.nodes || []).map(n => {
      if (n.id === nodeId) {
        return {
          ...n,
          data: {
            ...n.data,
            ...newConfig
          }
        };
      }
      return n;
    });

    const updatedWorkflow = { ...activeWorkflow, nodes: updatedNodes };
    set({ activeWorkflow: updatedWorkflow });
    if (get().selectedNode?.id === nodeId) {
      set({ selectedNode: updatedNodes.find(n => n.id === nodeId) });
    }
  },

  saveWorkflow: async (workflowData) => {
    set({ isLoading: true });
    try {
      let res;
      if (workflowData._id || workflowData.id) {
        const id = workflowData._id || workflowData.id;
        res = await api.put(`/workflows/${id}`, workflowData);
      } else {
        res = await api.post('/workflows', workflowData);
      }
      set({ activeWorkflow: res.data.data, isLoading: false });
      return res.data.data;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  generateWorkflowFromPrompt: async (prompt) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/workflows/generate', { prompt });
      set({ activeWorkflow: res.data.data, isLoading: false });
      return res.data.data;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  executeWorkflow: async (workflowId, inputs = {}) => {
    set({ isLoading: true, executionLogs: [], currentExecution: null });
    try {
      const res = await api.post(`/workflows/${workflowId}/execute`, { inputs });
      set({ currentExecution: res.data.data, isLoading: false });
      return res.data.data;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  addExecutionLog: (log) => {
    set((state) => ({
      executionLogs: [...state.executionLogs, log]
    }));
  }
}));
