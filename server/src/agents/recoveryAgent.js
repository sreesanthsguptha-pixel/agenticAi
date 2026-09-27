class RecoveryAgent {
  constructor() {
    this.name = 'recovery';
  }

  handleFailure(error, retryCount = 0, maxRetries = 3) {
    const message = error?.message || (typeof error === 'string' ? error : 'Unknown error');
    const code = error?.code || '';

    let failureCategory = 'TRANSIENT';

    if (message.includes('INTEGRATION_NOT_CONNECTED') || message.includes('credentials missing')) {
      failureCategory = 'INTEGRATION_NOT_CONNECTED';
    } else if (message.includes('AUTH_EXPIRED') || code === 'AUTH_EXPIRED' || message.includes('401') || message.includes('token expired')) {
      failureCategory = 'AUTH_EXPIRED';
    } else if (message.includes('RATE_LIMIT') || message.includes('429') || message.includes('rate limit')) {
      failureCategory = 'RATE_LIMIT';
    } else if (message.includes('MISSING_FIELDS')) {
      failureCategory = 'MISSING_FIELDS';
    } else if (message.includes('500') || message.includes('API_FAILURE')) {
      failureCategory = 'API_FAILURE';
    }

    // Determine strategy: retry_with_backoff vs escalate
    if (failureCategory === 'INTEGRATION_NOT_CONNECTED' || failureCategory === 'AUTH_EXPIRED') {
      return {
        category: failureCategory,
        action: 'escalate',
        reason: `Authentication failure (${failureCategory}). Operator action required to reconnect integration.`,
        backoffDelayMs: 0
      };
    }

    if (retryCount < maxRetries) {
      const backoffDelayMs = Math.pow(2, retryCount) * 1000;
      return {
        category: failureCategory,
        action: 'retry_with_backoff',
        reason: `Transient failure (${failureCategory}). Retrying attempt ${retryCount + 1}/${maxRetries} after ${backoffDelayMs}ms backoff.`,
        backoffDelayMs
      };
    }

    return {
      category: failureCategory,
      action: 'escalate',
      reason: `Exceeded maximum retries (${maxRetries}). Escalating execution failure.`,
      backoffDelayMs: 0
    };
  }
}

module.exports = new RecoveryAgent();
