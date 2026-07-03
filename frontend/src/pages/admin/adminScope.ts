export type FinOpsDomain = 'ai' | 'shared' | 'software';
export type AdminScopeFilter = 'all' | FinOpsDomain;

/** Primary domain for each agent id */
export const AGENT_SCOPES: Record<string, FinOpsDomain> = {
  'finops-orchestrator': 'shared',
  'ingestion-agent': 'shared',
  'explainability-agent': 'shared',
  'governance-agent': 'shared',
  'allocation-agent': 'shared',
  'anomaly-agent': 'shared',
  'optimization-agent': 'shared',
  'forecasting-agent': 'shared',
  'model-router-agent': 'ai',
  'token-optimizer-agent': 'ai',
  'gpu-finops-agent': 'ai',
  'vendor-license-agent': 'software',
  'portfolio-time-agent': 'software',
  'cost-value-agent': 'software',
  'adoption-growth-agent': 'software',
  'pace-layer-agent': 'software',
  'safe-portfolio-agent': 'software',
  'tbm-capability-agent': 'software',
  'sixr-modernization-agent': 'software',
  'value-differentiation-agent': 'software',
  'weighted-scoring-agent': 'software',
  'vendor-risk-agent': 'software',
  'operational-fit-agent': 'software',
  'exit-risk-agent': 'software',
};

const AI_CREW_IDS = new Set([
  'crew-ai-anomaly-resolution',
  'crew-model-tiering',
  'crew-gpu-optimization',
]);

const SOFTWARE_CREW_IDS = new Set([
  'crew-software-portfolio-assessment',
]);

const AI_WORKFLOW_TYPES = new Set([
  'model_tiering',
  'token_optimization',
  'gpu_rightsizing',
  'prompt_caching',
]);

const AI_AUDIT_AGENTS = new Set([
  'Model Router Agent',
  'Token Optimizer Agent',
  'GPU FinOps Agent',
]);

export function getAgentScope(agentId: string): FinOpsDomain {
  return AGENT_SCOPES[agentId] ?? 'shared';
}

export function getCrewScope(crewId: string, agentIds: string[] = []): FinOpsDomain {
  if (AI_CREW_IDS.has(crewId)) return 'ai';
  if (SOFTWARE_CREW_IDS.has(crewId)) return 'software';
  const domains = agentIds.map(getAgentScope);
  if (domains.length && domains.every((d) => d === 'ai')) return 'ai';
  if (domains.length && domains.every((d) => d === 'software')) return 'software';
  return 'shared';
}

export function getWorkflowScope(workflow: { type?: string; agent?: string; scope?: string }): FinOpsDomain {
  if (workflow.scope === 'ai' || workflow.scope === 'shared' || workflow.scope === 'software') {
    return workflow.scope;
  }
  if (workflow.type && AI_WORKFLOW_TYPES.has(workflow.type)) return 'ai';
  const agent = workflow.agent ?? '';
  if (AI_AUDIT_AGENTS.has(agent)) return 'ai';
  return 'shared';
}

export function getAuditScope(entry: { scope?: string; agent?: string; action?: string }): FinOpsDomain {
  if (entry.scope === 'ai' || entry.scope === 'shared' || entry.scope === 'software') {
    return entry.scope;
  }
  if (entry.agent && AI_AUDIT_AGENTS.has(entry.agent)) return 'ai';
  const action = entry.action ?? '';
  if (action.includes('token') || action.includes('model') || action.includes('gpu') || action.includes('prompt')) {
    return 'ai';
  }
  return 'shared';
}

export function matchesScopeFilter(domain: FinOpsDomain, filter: AdminScopeFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'shared') return domain === 'shared';
  return domain === filter;
}

export const SCOPE_BADGE: Record<FinOpsDomain, { label: string; color: string }> = {
  ai: { label: 'AI', color: 'purple' },
  shared: { label: 'Shared', color: 'gray' },
  software: { label: 'Software', color: 'teal' },
};
