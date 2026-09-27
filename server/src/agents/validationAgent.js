class ValidationAgent {
  constructor() {
    this.name = 'validation';
  }

  validate(nodeId, result) {
    if (!result) {
      return {
        valid: false,
        error: 'MISSING_FIELDS',
        reason: `Result for node ${nodeId} is empty`
      };
    }

    if (result.status === 'FAILED' || result.error) {
      return {
        valid: false,
        error: result.error?.code || 'EXECUTION_FAILED',
        reason: result.error?.message || `Node ${nodeId} reported failure`
      };
    }

    return {
      valid: true,
      reason: `Node ${nodeId} output validated successfully`
    };
  }
}

module.exports = new ValidationAgent();
