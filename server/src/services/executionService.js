const Execution = require('../models/Execution');
const ExecutionLog = require('../models/ExecutionLog');
const Workflow = require('../models/Workflow');
const dbConfig = require('../config/db');
const inMemoryStore = require('../config/inMemoryStore');
const orchestrator = require('../agents/orchestrator');
const executionQueue = require('../queues/executionQueue');

// Register queue job processor
executionQueue.init(async (jobData) => {
  const { executionId, workflowId, userId } = jobData;
  const workflow = await workflowServiceHelper(workflowId);
  if (!workflow) return;

  await orchestrator.runWorkflowOrchestration({
    executionId,
    workflow,
    userId,
    onStatusChange: async (status, updateData = {}) => {
      await updateExecutionStatus(executionId, status, updateData);
    }
  });
});

const workflowServiceHelper = async (workflowId) => {
  const { isInMemory } = dbConfig.getDBState();
  if (isInMemory) {
    return inMemoryStore.findById('workflows', workflowId);
  } else {
    return await Workflow.findById(workflowId);
  }
};

const updateExecutionStatus = async (executionId, status, extraFields = {}) => {
  const { isInMemory } = dbConfig.getDBState();
  if (isInMemory) {
    return inMemoryStore.updateById('executions', executionId, { status, ...extraFields });
  } else {
    return await Execution.findByIdAndUpdate(executionId, { status, ...extraFields }, { new: true });
  }
};

const triggerExecution = async (workflowId, userId, inputs = {}) => {
  const workflow = await workflowServiceHelper(workflowId);
  if (!workflow) {
    const err = new Error('Workflow not found');
    err.statusCode = 404;
    throw err;
  }

  const { isInMemory } = dbConfig.getDBState();
  const executionPayload = {
    workflowId: workflow._id ? workflow._id.toString() : workflowId,
    workflowSnapshot: {
      name: workflow.name,
      nodes: workflow.nodes,
      edges: workflow.edges,
      version: workflow.version
    },
    status: 'PENDING',
    inputs,
    outputs: {},
    retryCount: 0,
    startTime: new Date()
  };

  let execution;
  if (isInMemory) {
    execution = inMemoryStore.insert('executions', executionPayload);
  } else {
    execution = await Execution.create(executionPayload);
  }

  const executionIdStr = execution._id ? execution._id.toString() : execution.id;

  // Add to background execution queue
  await executionQueue.addJob({
    executionId: executionIdStr,
    workflowId: workflow._id ? workflow._id.toString() : workflowId,
    userId
  });

  return execution;
};

const listExecutions = async ({ workflowId, status }) => {
  const { isInMemory } = dbConfig.getDBState();

  if (isInMemory) {
    let list = inMemoryStore.find('executions', {}, { sort: { createdAt: -1 } });
    if (workflowId) {
      list = list.filter(e => e.workflowId === workflowId.toString());
    }
    if (status) {
      list = list.filter(e => e.status === status);
    }
    return list;
  } else {
    const query = {};
    if (workflowId) query.workflowId = workflowId;
    if (status) query.status = status;
    return await Execution.find(query).sort({ createdAt: -1 });
  }
};

const getExecutionById = async (executionId) => {
  const { isInMemory } = dbConfig.getDBState();

  if (isInMemory) {
    return inMemoryStore.findById('executions', executionId);
  } else {
    return await Execution.findById(executionId);
  }
};

const getExecutionTimeline = async (executionId) => {
  const { isInMemory } = dbConfig.getDBState();

  if (isInMemory) {
    return inMemoryStore.find('executionLogs', { executionId: executionId.toString() });
  } else {
    return await ExecutionLog.find({ executionId }).sort({ createdAt: 1 });
  }
};

const pauseExecution = async (executionId) => {
  return await updateExecutionStatus(executionId, 'PAUSED');
};

const resumeExecution = async (executionId) => {
  return await updateExecutionStatus(executionId, 'RUNNING');
};

const cancelExecution = async (executionId) => {
  return await updateExecutionStatus(executionId, 'CANCELLED', { endTime: new Date() });
};

module.exports = {
  triggerExecution,
  listExecutions,
  getExecutionById,
  getExecutionTimeline,
  pauseExecution,
  resumeExecution,
  cancelExecution
};
