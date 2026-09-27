const executionService = require('../services/executionService');

const listExecutions = async (req, res, next) => {
  try {
    const { workflowId, status } = req.query;
    const executions = await executionService.listExecutions({ workflowId, status });
    res.status(200).json({ success: true, data: executions });
  } catch (error) {
    next(error);
  }
};

const getExecutionById = async (req, res, next) => {
  try {
    const execution = await executionService.getExecutionById(req.params.id);
    if (!execution) {
      return res.status(404).json({ success: false, message: 'Execution run not found' });
    }
    res.status(200).json({ success: true, data: execution });
  } catch (error) {
    next(error);
  }
};

const getExecutionTimeline = async (req, res, next) => {
  try {
    const logs = await executionService.getExecutionTimeline(req.params.id);
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

const pauseExecution = async (req, res, next) => {
  try {
    const updated = await executionService.pauseExecution(req.params.id);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const resumeExecution = async (req, res, next) => {
  try {
    const updated = await executionService.resumeExecution(req.params.id);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const cancelExecution = async (req, res, next) => {
  try {
    const updated = await executionService.cancelExecution(req.params.id);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listExecutions,
  getExecutionById,
  getExecutionTimeline,
  pauseExecution,
  resumeExecution,
  cancelExecution
};
