const express = require('express');
const integrationController = require('../controllers/integrationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', integrationController.listIntegrations);
router.get('/status', integrationController.getStatus);
router.get('/oauth/:provider/start', integrationController.startOAuth);
router.get('/oauth/:provider/callback', integrationController.handleOAuthCallback);
router.get('/oauth/error', integrationController.handleOAuthError);
router.post('/', integrationController.manualCredentialSetup);

module.exports = router;
