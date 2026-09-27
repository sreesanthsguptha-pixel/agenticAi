const plannerAgent = require('./plannerAgent');
const executionAgent = require('./executionAgent');
const validationAgent = require('./validationAgent');
const recoveryAgent = require('./recoveryAgent');
const monitoringAgent = require('./monitoringAgent');

// Check if LangGraph module is available in environment
let langGraphStatus = 'not-installed';
try {
  require('@langchain/langgraph');
  langGraphStatus = 'available';
} catch (e) {
  langGraphStatus = 'not-installed';
}

const runWorkflowOrchestration = async ({ executionId, workflow, userId, onStatusChange }) => {
  const startTime = Date.now();
  console.log(`[Orchestrator] Starting orchestration for execution ${executionId} (LangGraph: ${langGraphStatus})`);

  // 1. Monitoring: Emit start event
  await monitoringAgent.logEvent({
    executionId,
    workflowId: workflow._id,
    userId,
    agent: 'monitoring',
    level: 'info',
    message: `Orchestration initialized (Substrate: ${langGraphStatus})`,
    metadata: { langGraph: langGraphStatus }
  });

  // 2. Planner Agent Step
  await monitoringAgent.logEvent({
    executionId,
    workflowId: workflow._id,
    userId,
    agent: 'planner',
    level: 'info',
    message: 'Analyzing graph topology & calculating execution plan...'
  });

  const planResult = plannerAgent.plan(workflow);

  await monitoringAgent.logEvent({
    executionId,
    workflowId: workflow._id,
    userId,
    agent: 'planner',
    level: 'success',
    message: `Plan generated with confidence score ${planResult.confidenceScore}`,
    metadata: { sequence: planResult.sequence, confidenceScore: planResult.confidenceScore }
  });

  const nodesMap = (workflow.nodes || []).reduce((acc, node) => {
    acc[node.id] = node;
    return acc;
  }, {});

  const outputs = {};
  let currentRetryCount = 0;

  // Update status to RUNNING
  if (onStatusChange) {
    await onStatusChange('RUNNING', { currentNode: planResult.sequence[0] || null });
  }

  // Iterate sequence
  for (const nodeId of planResult.sequence) {
    const node = nodesMap[nodeId];
    if (!node) continue;

    if (onStatusChange) {
      await onStatusChange('RUNNING', { currentNode: nodeId });
    }

    let nodeSuccess = false;
    let attempts = 0;
    const maxRetries = 2;

    while (!nodeSuccess && attempts <= maxRetries) {
      attempts++;

      // Execution Agent Step
      await monitoringAgent.logEvent({
        executionId,
        workflowId: workflow._id,
        userId,
        nodeId,
        agent: 'execution',
        level: 'info',
        message: `Executing node "${node.data?.label || nodeId}" (Attempt ${attempts})`
      });

      try {
        const result = await executionAgent.executeNode(node, { userId, previousOutputs: outputs });

        // Validation Agent Step
        await monitoringAgent.logEvent({
          executionId,
          workflowId: workflow._id,
          userId,
          nodeId,
          agent: 'validation',
          level: 'info',
          message: `Validating node output for "${node.data?.label || nodeId}"`
        });

        const valResult = validationAgent.validate(nodeId, result);

        if (valResult.valid) {
          outputs[nodeId] = result.output;
          nodeSuccess = true;

          await monitoringAgent.logEvent({
            executionId,
            workflowId: workflow._id,
            userId,
            nodeId,
            agent: 'validation',
            level: 'success',
            message: `Node "${node.data?.label || nodeId}" completed and validated successfully`,
            metadata: { output: result.output }
          });
        } else {
          throw new Error(`Validation failed: ${valResult.reason}`);
        }
      } catch (err) {
        // Recovery Agent Step
        await monitoringAgent.logEvent({
          executionId,
          workflowId: workflow._id,
          userId,
          nodeId,
          agent: 'recovery',
          level: 'warning',
          message: `Handling execution failure: ${err.message}`
        });

        const recoveryDecision = recoveryAgent.handleFailure(err, currentRetryCount, maxRetries);

        await monitoringAgent.logEvent({
          executionId,
          workflowId: workflow._id,
          userId,
          nodeId,
          agent: 'recovery',
          level: recoveryDecision.action === 'escalate' ? 'error' : 'warning',
          message: `Recovery Decision: ${recoveryDecision.reason}`,
          metadata: recoveryDecision
        });

        if (recoveryDecision.action === 'retry_with_backoff' && attempts <= maxRetries) {
          currentRetryCount++;
          await new Promise(res => setTimeout(res, Math.min(recoveryDecision.backoffDelayMs, 500)));
        } else {
          // Cannot recover -> fail run
          const duration = Math.round((Date.now() - startTime) / 1000);
          if (onStatusChange) {
            await onStatusChange('FAILED', {
              endTime: new Date(),
              duration,
              error: { message: err.message, category: recoveryDecision.category }
            });
          }

          await monitoringAgent.logEvent({
            executionId,
            workflowId: workflow._id,
            userId,
            nodeId,
            agent: 'monitoring',
            level: 'error',
            message: `Execution ${executionId} terminated with failure.`,
            metadata: { error: err.message }
          });

          return {
            status: 'FAILED',
            error: err.message,
            langGraph: langGraphStatus,
            outputs,
            duration
          };
        }
      }
    }
  }

  // Successful completion
  const duration = Math.round((Date.now() - startTime) / 1000);
  if (onStatusChange) {
    await onStatusChange('COMPLETED', {
      endTime: new Date(),
      duration,
      outputs
    });
  }

  await monitoringAgent.logEvent({
    executionId,
    workflowId: workflow._id,
    userId,
    agent: 'monitoring',
    level: 'success',
    message: `Execution completed successfully in ${duration}s`,
    metadata: { duration, outputs, langGraph: langGraphStatus }
  });

  return {
    status: 'COMPLETED',
    langGraph: langGraphStatus,
    outputs,
    duration
  };
};

module.exports = {
  runWorkflowOrchestration,
  langGraphStatus
};
