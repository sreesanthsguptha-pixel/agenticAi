const axios = require('axios');
const env = require('../config/env');

const generateDeterministicWorkflow = (prompt) => {
  const p = (prompt || '').toLowerCase();

  const nodes = [
    {
      id: 'node-1',
      type: 'triggerNode',
      position: { x: 100, y: 150 },
      data: { label: 'Manual/Webhook Trigger', triggerType: 'manual', config: { schedule: 'immediate' } }
    }
  ];

  const edges = [];

  let lastNodeId = 'node-1';
  let nodeCounter = 2;

  if (p.includes('email') || p.includes('gmail') || p.includes('invoice')) {
    const aiNodeId = `node-${nodeCounter++}`;
    nodes.push({
      id: aiNodeId,
      type: 'aiNode',
      position: { x: 400, y: 150 },
      data: { label: 'Analyze Invoice Details', model: 'gpt-4o-mini', prompt: 'Extract total, due date, vendor name' }
    });
    edges.push({ id: `e-${lastNodeId}-${aiNodeId}`, source: lastNodeId, target: aiNodeId, animated: true });
    lastNodeId = aiNodeId;

    const gmailNodeId = `node-${nodeCounter++}`;
    nodes.push({
      id: gmailNodeId,
      type: 'actionNode',
      position: { x: 700, y: 150 },
      data: { label: 'Send Email Notification', provider: 'gmail', action: 'send_email', config: { to: 'finance@company.com', subject: 'Invoice Processed' } }
    });
    edges.push({ id: `e-${lastNodeId}-${gmailNodeId}`, source: lastNodeId, target: gmailNodeId, animated: true });
    lastNodeId = gmailNodeId;
  }

  if (p.includes('slack') || p.includes('notify') || p.includes('alert')) {
    const slackNodeId = `node-${nodeCounter++}`;
    nodes.push({
      id: slackNodeId,
      type: 'actionNode',
      position: { x: 700, y: 300 },
      data: { label: 'Post to Slack Channel', provider: 'slack', action: 'post_message', config: { channel: '#ops-alerts', message: 'Workflow execution alert' } }
    });
    edges.push({ id: `e-${nodes[0].id}-${slackNodeId}`, source: nodes[0].id, target: slackNodeId, animated: true });
  }

  if (p.includes('sheet') || p.includes('excel') || p.includes('log')) {
    const sheetNodeId = `node-${nodeCounter++}`;
    nodes.push({
      id: sheetNodeId,
      type: 'actionNode',
      position: { x: 400, y: 450 },
      data: { label: 'Append Row to Google Sheet', provider: 'google-sheets', action: 'append_row', config: { spreadsheetId: 'sheet_main', sheetName: 'Log' } }
    });
    edges.push({ id: `e-${lastNodeId}-${sheetNodeId}`, source: lastNodeId, target: sheetNodeId, animated: true });
  }

  if (p.includes('discord')) {
    const discordNodeId = `node-${nodeCounter++}`;
    nodes.push({
      id: discordNodeId,
      type: 'actionNode',
      position: { x: 700, y: 450 },
      data: { label: 'Send Discord Bot Message', provider: 'discord', action: 'post_bot_message', config: { channelId: 'general', content: 'Agentic automation triggered' } }
    });
    edges.push({ id: `e-${nodes[0].id}-${discordNodeId}`, source: nodes[0].id, target: discordNodeId, animated: true });
  }

  // If no specific keywords matched, generate standard 3-step AI pipeline
  if (nodes.length === 1) {
    const step2 = `node-${nodeCounter++}`;
    nodes.push({
      id: step2,
      type: 'aiNode',
      position: { x: 400, y: 150 },
      data: { label: 'AI Summarizer & Processor', model: 'gpt-4o-mini', prompt: `Process prompt: ${prompt}` }
    });
    edges.push({ id: `e-${lastNodeId}-${step2}`, source: lastNodeId, target: step2, animated: true });

    const step3 = `node-${nodeCounter++}`;
    nodes.push({
      id: step3,
      type: 'actionNode',
      position: { x: 700, y: 150 },
      data: { label: 'Slack Alert Broadcast', provider: 'slack', action: 'post_message', config: { channel: '#general' } }
    });
    edges.push({ id: `e-${step2}-${step3}`, source: step2, target: step3, animated: true });
  }

  return {
    name: `Workflow: ${prompt.slice(0, 30)}...`,
    description: `Auto-generated workflow for: "${prompt}"`,
    triggerConfig: { type: 'manual' },
    nodes,
    edges,
    version: 1,
    tags: ['ai-generated', 'agentic']
  };
};

const generateWorkflowFromPrompt = async (prompt) => {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Prompt is required');
  }

  // 1. Try OpenRouter if key is present
  if (env.OPENROUTER_API_KEY) {
    try {
      console.log('[AIService] Generating workflow using OpenRouter...');
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'openai/gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an expert AI workflow designer. Given a prompt, respond ONLY with valid JSON containing keys "name", "description", "nodes", "edges".
Nodes must have id, type ('triggerNode'|'actionNode'|'aiNode'), position ({x, y}), data ({label, provider, action, config}).
Edges must have id, source, target, animated: true.`
            },
            { role: 'user', content: prompt }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 8000
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (content) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.nodes && parsed.edges) {
            return {
              ...parsed,
              version: 1,
              tags: ['openrouter', 'ai-generated']
            };
          }
        }
      }
    } catch (err) {
      console.warn('[AIService] OpenRouter failed, falling back to Gemini / Deterministic:', err.message);
    }
  }

  // 2. Try Gemini if key is present
  if (env.GEMINI_API_KEY) {
    try {
      console.log('[AIService] Generating workflow using Gemini...');
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
      const response = await axios.post(
        url,
        {
          contents: [{
            parts: [{
              text: `Respond with valid JSON only. Build workflow nodes and edges for: "${prompt}". Keys: name, description, nodes, edges.`
            }]
          }]
        },
        { timeout: 8000 }
      );
      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.nodes && parsed.edges) {
            return {
              ...parsed,
              version: 1,
              tags: ['gemini', 'ai-generated']
            };
          }
        }
      }
    } catch (err) {
      console.warn('[AIService] Gemini failed, falling back to Deterministic builder:', err.message);
    }
  }

  // 3. Fallback to Deterministic Builder
  console.log('[AIService] Using Deterministic Rule Builder for workflow generation.');
  return generateDeterministicWorkflow(prompt);
};

module.exports = {
  generateWorkflowFromPrompt,
  generateDeterministicWorkflow
};
