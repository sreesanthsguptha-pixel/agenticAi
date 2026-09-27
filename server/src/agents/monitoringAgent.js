const ExecutionLog = require('../models/ExecutionLog');
const Notification = require('../models/Notification');
const dbConfig = require('../config/db');
const inMemoryStore = require('../config/inMemoryStore');
const { emitExecutionEvent } = require('../config/socket');

class MonitoringAgent {
  constructor() {
    this.name = 'monitoring';
  }

  async logEvent({ executionId, workflowId, userId, nodeId, agent, level = 'info', message, metadata = {} }) {
    const { isInMemory } = dbConfig.getDBState();

    const payload = {
      executionId,
      workflowId,
      nodeId,
      agent,
      level,
      message,
      metadata,
      timestamp: new Date().toISOString()
    };

    // 1. Emit real-time Socket.IO event
    emitExecutionEvent(executionId, payload);

    // 2. Persist log row
    try {
      if (isInMemory) {
        inMemoryStore.insert('executionLogs', {
          executionId: executionId ? executionId.toString() : null,
          workflowId: workflowId ? workflowId.toString() : null,
          nodeId,
          agent,
          level,
          message,
          metadata
        });
      } else {
        await ExecutionLog.create({
          executionId,
          workflowId,
          nodeId,
          agent,
          level,
          message,
          metadata
        });
      }
    } catch (err) {
      console.error('[MonitoringAgent] Failed to persist execution log:', err.message);
    }

    // 3. Create notification if error or escalation
    if ((level === 'error' || level === 'warning') && userId) {
      try {
        if (isInMemory) {
          inMemoryStore.insert('notifications', {
            owner: userId.toString(),
            workflowId: workflowId ? workflowId.toString() : null,
            executionId: executionId ? executionId.toString() : null,
            type: level === 'error' ? 'failure' : 'escalation',
            title: `Execution Alert (${agent.toUpperCase()})`,
            message,
            isRead: false
          });
        } else {
          await Notification.create({
            owner: userId,
            workflowId,
            executionId,
            type: level === 'error' ? 'failure' : 'escalation',
            title: `Execution Alert (${agent.toUpperCase()})`,
            message
          });
        }
      } catch (err) {
        console.error('[MonitoringAgent] Failed to create notification:', err.message);
      }
    }

    return payload;
  }
}

module.exports = new MonitoringAgent();
