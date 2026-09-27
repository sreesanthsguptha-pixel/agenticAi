const Workflow = require('../models/Workflow');
const Execution = require('../models/Execution');
const dbConfig = require('../config/db');
const inMemoryStore = require('../config/inMemoryStore');

const getDashboardStats = async (userId) => {
  const { isInMemory } = dbConfig.getDBState();

  if (isInMemory) {
    const workflows = inMemoryStore.find('workflows', { owner: userId.toString() });
    const executions = inMemoryStore.find('executions', {});
    const activeCount = workflows.filter(w => w.status === 'active').length;
    const totalExecutions = executions.length;
    const successfulExecutions = executions.filter(e => e.status === 'COMPLETED').length;
    const successRate = totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 100;
    const recentExecutions = executions.slice(-5).reverse();

    return {
      totalWorkflows: workflows.length,
      activeWorkflows: activeCount,
      totalExecutions,
      successRate,
      recentExecutions
    };
  } else {
    const totalWorkflows = await Workflow.countDocuments({ owner: userId });
    const activeWorkflows = await Workflow.countDocuments({ owner: userId, status: 'active' });
    const totalExecutions = await Execution.countDocuments();
    const successfulExecutions = await Execution.countDocuments({ status: 'COMPLETED' });
    const successRate = totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 100;
    const recentExecutions = await Execution.find().sort({ createdAt: -1 }).limit(5);

    return {
      totalWorkflows,
      activeWorkflows,
      totalExecutions,
      successRate,
      recentExecutions
    };
  }
};

const getWorkflows = async (userId, { search, tag, status }) => {
  const { isInMemory } = dbConfig.getDBState();

  if (isInMemory) {
    let list = inMemoryStore.find('workflows', { owner: userId.toString() });
    if (status) {
      list = list.filter(w => w.status === status);
    }
    if (tag) {
      list = list.filter(w => w.tags && w.tags.includes(tag));
    }
    if (search) {
      const queryStr = search.toLowerCase();
      list = list.filter(w => w.name.toLowerCase().includes(queryStr) || (w.description && w.description.toLowerCase().includes(queryStr)));
    }
    return list;
  } else {
    const query = { owner: userId };
    if (status) query.status = status;
    if (tag) query.tags = tag;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    return await Workflow.find(query).sort({ updatedAt: -1 });
  }
};

const createWorkflow = async (userId, data) => {
  const { isInMemory } = dbConfig.getDBState();
  const payload = {
    name: data.name || 'Untitled Workflow',
    description: data.description || '',
    owner: userId.toString(),
    status: data.status || 'active',
    triggerConfig: data.triggerConfig || {},
    nodes: data.nodes || [],
    edges: data.edges || [],
    version: data.version || 1,
    tags: data.tags || ['manual']
  };

  if (isInMemory) {
    return inMemoryStore.insert('workflows', payload);
  } else {
    return await Workflow.create({ ...payload, owner: userId });
  }
};

const getWorkflowById = async (userId, workflowId) => {
  const { isInMemory } = dbConfig.getDBState();

  if (isInMemory) {
    return inMemoryStore.findById('workflows', workflowId);
  } else {
    return await Workflow.findById(workflowId);
  }
};

const updateWorkflow = async (userId, workflowId, updateData) => {
  const { isInMemory } = dbConfig.getDBState();

  if (isInMemory) {
    return inMemoryStore.updateById('workflows', workflowId, updateData);
  } else {
    return await Workflow.findByIdAndUpdate(workflowId, updateData, { new: true });
  }
};

const duplicateWorkflow = async (userId, workflowId) => {
  const existing = await getWorkflowById(userId, workflowId);
  if (!existing) {
    const err = new Error('Workflow not found');
    err.statusCode = 404;
    throw err;
  }

  const clonedData = {
    name: `${existing.name} (Copy)`,
    description: existing.description,
    status: existing.status,
    triggerConfig: existing.triggerConfig,
    nodes: existing.nodes,
    edges: existing.edges,
    version: 1,
    tags: [...(existing.tags || []), 'cloned']
  };

  return await createWorkflow(userId, clonedData);
};

const deleteWorkflow = async (userId, workflowId) => {
  const { isInMemory } = dbConfig.getDBState();

  if (isInMemory) {
    return inMemoryStore.deleteById('workflows', workflowId);
  } else {
    return await Workflow.findByIdAndDelete(workflowId);
  }
};

module.exports = {
  getDashboardStats,
  getWorkflows,
  createWorkflow,
  getWorkflowById,
  updateWorkflow,
  duplicateWorkflow,
  deleteWorkflow
};
