class PlannerAgent {
  constructor() {
    this.name = 'planner';
  }

  plan(workflow) {
    const nodes = workflow.nodes || [];
    const edges = workflow.edges || [];

    if (nodes.length === 0) {
      return {
        sequence: [],
        confidenceScore: 0.0,
        reason: 'Workflow contains no nodes'
      };
    }

    // Map graph adjacencies for topological sequence
    const nodeIds = nodes.map(n => n.id);
    const inDegree = {};
    const adj = {};

    nodeIds.forEach(id => {
      inDegree[id] = 0;
      adj[id] = [];
    });

    edges.forEach(edge => {
      if (adj[edge.source] && inDegree[edge.target] !== undefined) {
        adj[edge.source].push(edge.target);
        inDegree[edge.target]++;
      }
    });

    const queue = nodeIds.filter(id => inDegree[id] === 0);
    const sequence = [];

    while (queue.length > 0) {
      const current = queue.shift();
      sequence.push(current);

      if (adj[current]) {
        adj[current].forEach(neighbor => {
          inDegree[neighbor]--;
          if (inDegree[neighbor] === 0) {
            queue.push(neighbor);
          }
        });
      }
    }

    // Handle any unvisited nodes (cycles or disconnected nodes)
    nodeIds.forEach(id => {
      if (!sequence.includes(id)) {
        sequence.push(id);
      }
    });

    const isConnected = sequence.length === nodes.length;
    const confidenceScore = isConnected ? 0.95 : 0.70;

    return {
      sequence,
      confidenceScore,
      totalNodes: nodes.length,
      reason: 'Topological order calculated successfully'
    };
  }
}

module.exports = new PlannerAgent();
