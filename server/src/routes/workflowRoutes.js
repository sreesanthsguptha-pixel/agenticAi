const express = require('express');
const workflowController = require('../controllers/workflowController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/dashboard', workflowController.getDashboard);
router.get('/', workflowController.getWorkflows);
router.post('/', workflowController.createWorkflow);
router.post('/generate', workflowController.generateWorkflow);
router.get('/:id', workflowController.getWorkflowById);
router.put('/:id', workflowController.updateWorkflow);
router.post('/:id/duplicate', workflowController.duplicateWorkflow);
router.post('/:id/execute', workflowController.executeWorkflow);
router.delete('/:id', workflowController.deleteWorkflow);

module.exports = router;
