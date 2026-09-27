const integrationService = require('../services/integrationService');

const listIntegrations = async (req, res, next) => {
  try {
    const list = await integrationService.getUserIntegrations(req.user.id);
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

const getStatus = async (req, res, next) => {
  try {
    const list = await integrationService.getUserIntegrations(req.user.id);
    const health = list.map(item => ({
      provider: item.provider,
      isConnected: item.isConnected,
      status: item.isConnected ? 'HEALTHY' : 'NOT_CONNECTED'
    }));
    res.status(200).json({ success: true, data: health });
  } catch (error) {
    next(error);
  }
};

const startOAuth = async (req, res, next) => {
  try {
    const { provider } = req.params;
    // Simulate starting OAuth flow and return simulated redirect URL or mock auth code
    const redirectUrl = `/api/integrations/oauth/${provider}/callback?code=mock_code_${provider}_${Date.now()}`;
    res.status(200).json({ success: true, redirectUrl, message: `OAuth flow initiated for ${provider}` });
  } catch (error) {
    next(error);
  }
};

const handleOAuthCallback = async (req, res, next) => {
  try {
    const { provider } = req.params;
    const { code } = req.query;
    await integrationService.setIntegrationCredential(req.user.id, provider, {
      accessToken: `access_token_${provider}_${code}`,
      refreshToken: `refresh_token_${provider}`,
      connectedAt: new Date().toISOString()
    }, true);
    res.status(200).json({ success: true, message: `${provider} OAuth integration connected successfully.` });
  } catch (error) {
    next(error);
  }
};

const handleOAuthError = async (req, res, next) => {
  res.status(400).json({ success: false, error: 'AUTH_EXPIRED', message: 'OAuth authorization failed or expired.' });
};

const manualCredentialSetup = async (req, res, next) => {
  try {
    const { provider, credentials, isConnected = true } = req.body;
    const updated = await integrationService.setIntegrationCredential(req.user.id, provider, credentials, isConnected);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listIntegrations,
  getStatus,
  startOAuth,
  handleOAuthCallback,
  handleOAuthError,
  manualCredentialSetup
};
