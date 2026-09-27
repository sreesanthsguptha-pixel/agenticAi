class BaseIntegration {
  constructor(name) {
    this.name = name;
  }

  async executeAction(actionName, params = {}, credentials = null) {
    throw new Error(`Method executeAction not implemented for ${this.name}`);
  }

  validateCredentials(credentials) {
    if (!credentials) {
      return { valid: false, error: 'INTEGRATION_NOT_CONNECTED' };
    }
    return { valid: true };
  }
}

module.exports = BaseIntegration;
