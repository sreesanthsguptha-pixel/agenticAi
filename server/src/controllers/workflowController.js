const workflowService = require('../services/workflowService');
const aiService = require('../services/aiService');
const executionService = require('../services/executionService');

const getDashboard = async (req, res, next) => {
  try {
    const stats = await workflowService.getDashboardStats(req.user.id);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

const getWorkflows = async (req, res, next) => {
  try {
    const { search, tag, status } = req.query;
    const workflows = await workflowService.getWorkflows(req.user.id, { search, tag, status });
    res.status(200).json({ success: true, data: workflows });
  } catch (error) {
    next(error);
  }
};

const createWorkflow = async (req, res, next) => {
  try {
    const workflow = await workflowService.createWorkflow(req.user.id, req.body);
    res.status(201).json({ success: true, data: workflow });
  } catch (error) {
    next(error);
  }
};

const generateWorkflow = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    const generatedGraph = await aiService.generateWorkflowFromPrompt(prompt);
    res.status(200).json({ success: true, data: generatedGraph });
  } catch (error) {
    next(error);
  }
};

const getWorkflowById = async (req, res, next) => {
  try {
    const workflow = await workflowService.getWorkflowById(req.user.id, req.params.id);
    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }
    res.status(200).json({ success: true, data: workflow });
  } catch (error) {
    next(error);
  }
};

const updateWorkflow = async (req, res, next) => {
  try {
    const workflow = await workflowService.updateWorkflow(req.user.id, req.params.id, req.body);
    res.status(200).json({ success: true, data: workflow });
  } catch (error) {
    next(error);
  }
};

const duplicateWorkflow = async (req, res, next) => {
  try {
    const cloned = await workflowService.duplicateWorkflow(req.user.id, req.params.id);
    res.status(201).json({ success: true, data: cloned });
  } catch (error) {
    next(error);
  }
};

const executeWorkflow = async (req, res, next) => {
  try {
    const execution = await executionService.triggerExecution(req.params.id, req.user.id, req.body.inputs);
    res.status(202).json({ success: true, data: execution });
  } catch (error) {
    next(error);
  }
};

const deleteWorkflow = async (req, res, next) => {
  try {
    await workflowService.deleteWorkflow(req.user.id, req.params.id);
    res.status(200).json({ success: true, message: 'Workflow deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getWorkflows,
  createWorkflow,
  generateWorkflow,
  getWorkflowById,
  updateWorkflow,
  duplicateWorkflow,
  executeWorkflow,
  deleteWorkflow
};
