// Comprehensive mock data generators for FinOps platform

const services = ['EC2', 'S3', 'RDS', 'Lambda', 'CloudWatch', 'EKS', 'ECS', 'Route53', 'ELB', 'EBS', 'VMware', 'Hyper-V', 'Oracle DB', 'SQL Server', 'OpenStack'];
const clouds = ['AWS', 'Azure', 'GCP', 'On-Prem'];
const accounts = ['prod-1111', 'dev-2222', 'staging-3333', 'sandbox-4444'];
const projects = ['core-platform', 'data-analytics', 'ml-pipeline', 'api-gateway', 'mobile-backend'];
const regions = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'];
const owners = ['team-a', 'team-b', 'team-c', 'team-d', 'platform-ops'];
const applications = ['payment-service', 'user-service', 'analytics-dashboard', 'batch-processor', 'api-gateway'];
const environments = ['prod', 'dev', 'staging', 'test'];
const bizUnits = ['engineering', 'data-science', 'platform', 'marketing', 'sales'];

import { productCatalog, getProductByName, type Product } from './product-catalog';

export function generateCosts(days: number = 30) {
  const costs: any[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Generate costs for each product in the catalog
  // Each product gets daily cost records with both license and usage costs
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - (days - i - 1));
    const dateStr = date.toISOString().split('T')[0];
    
    // Generate costs for each product in catalog
    productCatalog.forEach(product => {
      // Determine if this product should have a cost record today
      // Ensure every product gets at least 2-3 records per week
      const dayOfWeek = date.getDay();
      const shouldGenerate = 
        dayOfWeek === 0 || // Sunday - always generate for all products
        dayOfWeek === 3 || // Wednesday - always generate
        dayOfWeek === 6 || // Saturday - always generate
        Math.random() < 0.3; // 30% chance on other days
      
      if (shouldGenerate) {
        // Calculate license cost (prorated per day for monthly licenses)
        const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        const dailyLicenseCost = product.monthlyLicenseCost > 0 
          ? (product.monthlyLicenseCost / daysInMonth) 
          : 0;
        
        // Calculate usage cost
        // Use default usage with some variance
        const usageVariance = 0.7 + Math.random() * 0.6; // 70% to 130% of default
        const usageUnits = product.defaultUsageUnits * usageVariance;
        const usageCost = product.usageCostPerUnit > 0 
          ? (usageUnits * product.usageCostPerUnit)
          : 0;
        
        // Total cost = license cost + usage cost
        const totalCost = dailyLicenseCost + usageCost;
        
        // Map platform to cloud value
        const cloudValue = product.platform === 'Cloud' 
          ? (product.vendor === 'AWS' ? 'AWS' : 
             product.vendor === 'Microsoft' ? 'Azure' : 
             product.vendor === 'Google Cloud' ? 'GCP' : 
             product.vendor === 'Oracle' && product.name.includes('Cloud') ? 'GCP' :
             product.vendor === 'Salesforce' || product.vendor === 'Adobe' || product.vendor === 'ServiceNow' || 
             product.vendor === 'Splunk' || product.vendor === 'Datadog' || product.vendor === 'New Relic' ||
             product.vendor === 'Atlassian' || product.vendor === 'GitHub' || product.vendor === 'Slack' ||
             product.vendor === 'Zoom' || product.vendor === 'Docker' ? 'AWS' : // SaaS products default to AWS
             'AWS') // Default to AWS for cloud
          : 'On-Prem';
        
        if (totalCost > 0) {
          costs.push({
            date: dateStr,
            cloud: cloudValue,
            account: accounts[Math.floor(Math.random() * accounts.length)],
            project: projects[Math.floor(Math.random() * projects.length)],
            service: product.name,
            vendor: product.vendor, // Add vendor for filtering
            platform: product.platform, // Add platform for filtering
            serviceType: product.serviceType, // Add service type
            region: regions[Math.floor(Math.random() * regions.length)],
            resource_id: `res-${product.id}-${Math.random().toString(36).substr(2, 9)}`,
            usage_qty: parseFloat(usageUnits.toFixed(2)),
            license_cost: parseFloat(dailyLicenseCost.toFixed(2)),
            usage_cost: parseFloat(usageCost.toFixed(2)),
            cost_amount: parseFloat(totalCost.toFixed(2)), // Total = license + usage
            currency: 'USD',
            tags: {
              owner: owners[Math.floor(Math.random() * owners.length)],
              application: applications[Math.floor(Math.random() * applications.length)],
              env: environments[Math.floor(Math.random() * environments.length)],
              biz_unit: bizUnits[Math.floor(Math.random() * bizUnits.length)],
              cost_center: `CC-${Math.floor(Math.random() * 10)}`,
              vendor: product.vendor,
              service_type: product.serviceType
            }
          });
        }
      }
    });
    
    // Also generate some additional infrastructure service costs
    const additionalRecords = 10 + Math.floor(Math.random() * 10);
    for (let j = 0; j < additionalRecords; j++) {
      const selectedCloud = clouds[Math.floor(Math.random() * clouds.length)];
      const selectedService = selectedCloud === 'On-Prem' 
        ? ['VMware', 'Hyper-V', 'Oracle DB', 'SQL Server', 'OpenStack'][Math.floor(Math.random() * 5)]
        : services.slice(0, 10)[Math.floor(Math.random() * 10)];
      
      const baseAmount = 10 + Math.random() * 500;
      const amount = parseFloat(baseAmount.toFixed(2));
      
      costs.push({
        date: dateStr,
        cloud: selectedCloud,
        account: accounts[Math.floor(Math.random() * accounts.length)],
        project: projects[Math.floor(Math.random() * projects.length)],
        service: selectedService,
        region: regions[Math.floor(Math.random() * regions.length)],
        resource_id: `res-${Math.random().toString(36).substr(2, 9)}`,
        usage_qty: parseFloat((Math.random() * 1000).toFixed(2)),
        cost_amount: amount,
        currency: 'USD',
        tags: {
          owner: owners[Math.floor(Math.random() * owners.length)],
          application: applications[Math.floor(Math.random() * applications.length)],
          env: environments[Math.floor(Math.random() * environments.length)],
          biz_unit: bizUnits[Math.floor(Math.random() * bizUnits.length)],
          cost_center: `CC-${Math.floor(Math.random() * 10)}`
        }
      });
    }

    // AI scope: GenAI/ML costs (LLM APIs, GPU, AI PaaS)
    const aiServices = ['OpenAI API', 'Azure OpenAI', 'Vertex AI', 'Bedrock', 'Anthropic API', 'GPU Compute', 'ML Pipeline'];
    const aiRecordsPerDay = 3 + Math.floor(Math.random() * 5);
    for (let k = 0; k < aiRecordsPerDay; k++) {
      const service = aiServices[Math.floor(Math.random() * aiServices.length)];
      const baseAmount = 50 + Math.random() * 400;
      const amount = parseFloat(baseAmount.toFixed(2));
      costs.push({
        date: dateStr,
        cloud: 'AI',
        account: accounts[Math.floor(Math.random() * accounts.length)],
        project: projects[Math.floor(Math.random() * projects.length)],
        service,
        region: regions[Math.floor(Math.random() * regions.length)],
        resource_id: `ai-${Math.random().toString(36).substr(2, 9)}`,
        usage_qty: parseFloat((Math.random() * 5000).toFixed(2)),
        cost_amount: amount,
        currency: 'USD',
        tags: {
          owner: owners[Math.floor(Math.random() * owners.length)],
          application: applications[Math.floor(Math.random() * applications.length)],
          env: environments[Math.floor(Math.random() * environments.length)],
          biz_unit: bizUnits[Math.floor(Math.random() * bizUnits.length)],
          cost_center: `CC-${Math.floor(Math.random() * 10)}`,
        },
      });
    }
  }

  return costs;
}

export function generateAnomalies() {
  const anomalies = [];
  const severityLevels = ['critical', 'high', 'medium', 'low'];
  const anomalyTypes = ['spike', 'drop', 'unusual-pattern', 'budget-breach'];
  const services_short = ['EC2', 'S3', 'RDS', 'Lambda', 'EKS'];
  
  for (let i = 0; i < 15; i++) {
    const daysAgo = Math.floor(Math.random() * 14);
    const detectedAt = new Date();
    detectedAt.setDate(detectedAt.getDate() - daysAgo);
    
    const costIncrease = (Math.random() * 200 + 50).toFixed(2);
    const percentage = (Math.random() * 150 + 25).toFixed(1);
    
    anomalies.push({
      id: `anom-${Math.random().toString(36).substr(2, 9)}`,
      detected_at: detectedAt.toISOString(),
      severity: severityLevels[Math.floor(Math.random() * severityLevels.length)],
      type: anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)],
      service: services_short[Math.floor(Math.random() * services_short.length)],
      cloud: clouds[Math.floor(Math.random() * clouds.length)],
      account: accounts[Math.floor(Math.random() * accounts.length)],
      cost_increase: parseFloat(costIncrease),
      percentage_change: parseFloat(percentage),
      status: Math.random() > 0.7 ? 'resolved' : Math.random() > 0.5 ? 'investigating' : 'open',
      owner: owners[Math.floor(Math.random() * owners.length)],
      rca_summary: generateRCASummary(),
      suggested_actions: generateSuggestedActions()
    });
  }
  
  return anomalies.sort((a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime());
}

function generateRCASummary(): string {
  const reasons = [
    'Deployment of new microservice caused unexpected EC2 instance scaling',
    'Scheduled batch job ran longer than expected due to increased data volume',
    'Auto-scaling policy triggered during peak traffic spike',
    'Failed health check led to multiple instance restarts',
    'RDS instance upgraded to larger instance type for performance',
    'Increased Lambda invocations from new API endpoint',
    'EKS cluster auto-scaled due to pod resource pressure'
  ];
  return reasons[Math.floor(Math.random() * reasons.length)];
}

function generateSuggestedActions(): string[] {
  const actions = [
    'Review auto-scaling thresholds',
    'Consider reserved instances for steady-state workload',
    'Implement cost allocation tags',
    'Right-size instance based on actual usage',
    'Schedule non-critical workloads during off-peak hours'
  ];
  const count = 2 + Math.floor(Math.random() * 3);
  return actions.slice(0, count);
}

import { AI_WORKFLOW_SCOPES } from './ai-models';
const AI_CATEGORIES = ['tokens spike', 'model change', 'retry storm'];
const AI_RCA_SUMMARIES: Record<string, string[]> = {
  'tokens spike': [
    'Token volume increased 45% week-over-week; prompt length growth after context-window rollout drove most of the rise.',
    'Completion token usage spiked following a change to max_tokens defaults; recommend tightening defaults for non-interactive flows.',
    'Input token spike correlates with new embedding workload; consider caching and batch sizing.',
  ],
  'model change': [
    'Cost increase aligns with switch from GPT-4.1 Nano to GPT-4.1 for this workflow; evaluate tiering by use case.',
    'Migration to Claude Sonnet 4.6 for escalation path increased per-request cost; review fallback and routing rules.',
    'New model version rollout (Gemini 2.5 Flash) increased unit cost; compare latency and quality before locking in.',
  ],
  'retry storm': [
    'Rate-limit errors triggered retries and doubled effective token consumption; add backoff and circuit breaker.',
    'Transient 5xx from provider led to client retries; cost impact ~35% for the window. Improve idempotency and retry policy.',
    'Timeout reduction caused more retries and higher total tokens; tune timeout and consider streaming.',
  ],
};
const AI_ACTIONS = [
  'Review token limits and caching for this workflow',
  'Tier model by use case (e.g. nano for simple, 4o for complex)',
  'Add retry backoff and circuit breaker',
  'Set max_tokens and context limits per agent',
  'Audit prompt length and trim where possible',
];

export function generateAIAnomalies() {
  const anomalies: any[] = [];
  const severityLevels = ['critical', 'high', 'medium', 'low'];
  const statuses = ['open', 'investigating', 'resolved'] as const;
  for (let i = 0; i < 12; i++) {
    const daysAgo = Math.floor(Math.random() * 14);
    const detectedAt = new Date();
    detectedAt.setDate(detectedAt.getDate() - daysAgo);
    const costIncrease = Math.round((Math.random() * 180 + 40) * 100) / 100;
    const percentage = Math.round((Math.random() * 120 + 25) * 10) / 10;
    const scope = AI_WORKFLOW_SCOPES[i % AI_WORKFLOW_SCOPES.length];
    const category = AI_CATEGORIES[i % AI_CATEGORIES.length];
    const service = scope.service;
    const summaries = AI_RCA_SUMMARIES[category];
    const rca = summaries[i % summaries.length];
    const actionCount = 2 + Math.floor(Math.random() * 2);
    const suggested_actions = AI_ACTIONS.slice(0, actionCount).sort(() => Math.random() - 0.5);
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    anomalies.push({
      id: `ai-anom-${Math.random().toString(36).substr(2, 9)}`,
      detected_at: detectedAt.toISOString(),
      severity: severityLevels[Math.floor(Math.random() * severityLevels.length)],
      type: 'spike',
      category,
      service,
      cloud: 'AI',
      provider: scope.provider,
      model: scope.model,
      workflow: scope.workflow,
      team: scope.team,
      scope_display: `${scope.model} / ${scope.workflow} / ${scope.team}`,
      account: accounts[Math.floor(Math.random() * accounts.length)],
      cost_increase: costIncrease,
      percentage_change: percentage,
      status,
      owner: owners[Math.floor(Math.random() * owners.length)],
      rca_summary: rca,
      suggested_actions,
    });
  }
  return anomalies.sort((a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime());
}

const AI_REC_TYPES = ['model-tiering', 'prompt-caching', 'token-limits', 'gpu-rightsizing', 'batch-optimization', 'retry-policy'];
const AI_REC_TITLES = [
  'Route simple flows to GPT-4.1 Nano instead of GPT-4o',
  'Enable prompt caching for repeated system prompts in Complaint Intake',
  'Set max_tokens limits for non-interactive batch agents',
  'Right-size GPU cluster ml-training-prod during off-peak hours',
  'Batch embedding requests to reduce per-call overhead',
  'Add exponential backoff to reduce retry-driven token waste',
  'Consolidate duplicate RAG context blocks across agent steps',
  'Switch evaluation workloads to Gemini 2.5 Flash-Lite',
  'Tune GPU inference pool autoscaling to match traffic patterns',
  'Reduce context window for document triage classification step',
];
const AI_REC_DESCRIPTIONS = [
  'Workflow analysis shows 62% of requests are simple classification tasks eligible for economy models without quality loss.',
  'System prompts repeat on every request; caching would cut input tokens by an estimated 35–45%.',
  'Batch agents run with high max_tokens defaults; tightening limits reduces completion token waste.',
  'GPU utilization drops below 40% overnight; scale-down or spot scheduling would cut idle GPU spend.',
  'Embedding calls are issued individually; batching 32–64 documents per request improves cost efficiency.',
  'Retry storms after rate limits doubled effective consumption; backoff and circuit breaker recommended.',
];

export function generateAIRecommendations() {
  const recommendations: any[] = [];
  const confidenceLevels = ['high', 'medium', 'low'];

  for (let i = 0; i < 15; i++) {
    const daysAgo = Math.floor(Math.random() * 28);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);
    const savings = Math.round((Math.random() * 1200 + 80) * 100) / 100;
    const risk = Math.random() > 0.55 ? 'low' : Math.random() > 0.25 ? 'medium' : 'high';
    const scope = AI_WORKFLOW_SCOPES[i % AI_WORKFLOW_SCOPES.length];
    const service = scope.service;
    const category = AI_CATEGORIES[i % AI_CATEGORIES.length];

    recommendations.push({
      id: `ai-rec-${Math.random().toString(36).substr(2, 9)}`,
      type: AI_REC_TYPES[i % AI_REC_TYPES.length],
      title: AI_REC_TITLES[i % AI_REC_TITLES.length],
      description: AI_REC_DESCRIPTIONS[i % AI_REC_DESCRIPTIONS.length],
      service,
      cloud: 'AI',
      provider: scope.provider,
      model: scope.model,
      workflow: scope.workflow,
      team: scope.team,
      scope_display: `${scope.model} / ${scope.workflow} / ${scope.team}`,
      category,
      account: accounts[Math.floor(Math.random() * accounts.length)],
      estimated_savings: savings,
      confidence: confidenceLevels[Math.floor(Math.random() * confidenceLevels.length)],
      risk_level: risk,
      status: Math.random() > 0.75 ? 'approved' : Math.random() > 0.5 ? 'pending' : 'draft',
      created_at: createdAt.toISOString(),
      agent: ['Model Router Agent', 'Optimization Agent', 'GPU FinOps Agent'][i % 3],
      implementation_effort: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
    });
  }

  return recommendations.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function generateRecommendations() {
  const recommendations = [];
  const recTypes = ['rightsizing', 'reserved-instance', 'idle-cleanup', 'storage-tiering', 'commitment-discount'];
  const confidenceLevels = ['high', 'medium', 'low'];
  
  for (let i = 0; i < 20; i++) {
    const savings = (Math.random() * 5000 + 500).toFixed(2);
    const risk = Math.random() > 0.6 ? 'low' : Math.random() > 0.3 ? 'medium' : 'high';
    
    recommendations.push({
      id: `rec-${Math.random().toString(36).substr(2, 9)}`,
      type: recTypes[Math.floor(Math.random() * recTypes.length)],
      title: generateRecommendationTitle(),
      description: generateRecommendationDescription(),
      service: services[Math.floor(Math.random() * services.length)],
      cloud: clouds[Math.floor(Math.random() * clouds.length)],
      account: accounts[Math.floor(Math.random() * accounts.length)],
      estimated_savings: parseFloat(savings),
      confidence: confidenceLevels[Math.floor(Math.random() * confidenceLevels.length)],
      risk_level: risk,
      status: Math.random() > 0.8 ? 'approved' : Math.random() > 0.6 ? 'pending' : 'draft',
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      agent: ['Allocation Agent', 'Optimization Agent', 'Forecasting Agent'][Math.floor(Math.random() * 3)],
      implementation_effort: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
    });
  }
  
  return recommendations;
}

function generateRecommendationTitle(): string {
  const titles = [
    'Right-size EC2 instances based on actual CPU utilization',
    'Purchase Reserved Instances for steady-state workloads',
    'Clean up idle EBS volumes older than 90 days',
    'Migrate infrequently accessed S3 data to Glacier',
    'Apply Compute Savings Plans for flexible usage',
    'Downsize RDS instance from db.r5.2xlarge to db.r5.xlarge',
    'Terminate unused NAT Gateways in dev accounts'
  ];
  return titles[Math.floor(Math.random() * titles.length)];
}

function generateRecommendationDescription(): string {
  return 'Based on 30-day usage analysis, this resource shows consistent over-provisioning. Implementing this recommendation will reduce costs while maintaining performance SLAs.';
}

export function generateWorkflows() {
  return [
    {
      id: 'wf-tagging-001',
      name: 'Tagging Enforcement',
      type: 'tagging_enforcement',
      scope: 'cloud',
      status: 'running',
      progress: 65,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      steps: [
        { name: 'Detect non-compliant resources (>2%)', status: 'done', duration_ms: 45000 },
        { name: 'Create PRs and tickets', status: 'running', duration_ms: 120000 },
        { name: 'Apply virtual tags (backfill)', status: 'queued', duration_ms: 0 },
        { name: 'Gate deployments via policy', status: 'queued', duration_ms: 0 },
        { name: 'Owner approval & auto-remediate', status: 'queued', duration_ms: 0 }
      ],
      agent: 'Allocation Agent',
      metrics: {
        resources_processed: 1247,
        coverage_improvement: 3.2,
        tickets_created: 8
      }
    },
    {
      id: 'wf-idle-002',
      name: 'Idle Cleanup',
      type: 'idle_cleanup',
      scope: 'cloud',
      status: 'awaiting_approval',
      progress: 45,
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      steps: [
        { name: 'Identify idle for 72h', status: 'done', duration_ms: 30000 },
        { name: 'Snapshot & stop', status: 'done', duration_ms: 120000 },
        { name: 'Wait for approval (24h hold)', status: 'awaiting_approval', duration_ms: 0 },
        { name: 'Delete after confirmation', status: 'queued', duration_ms: 0 }
      ],
      agent: 'Optimization Agent',
      metrics: {
        resources_identified: 23,
        estimated_savings: 450.00,
        resources_stopped: 23
      }
    },
    {
      id: 'wf-commitment-003',
      name: 'Commitment Planner',
      type: 'commitment_planner',
      scope: 'cloud',
      status: 'completed',
      progress: 100,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      steps: [
        { name: 'Forecast 6-month baseline', status: 'done', duration_ms: 180000 },
        { name: 'Generate CUD portfolio recommendations', status: 'done', duration_ms: 90000 },
        { name: 'Finance approval', status: 'done', duration_ms: 3600000 },
        { name: 'Export purchase cart', status: 'done', duration_ms: 15000 }
      ],
      agent: 'Forecasting Agent',
      metrics: {
        projected_savings: 12500.00,
        commitment_amount: 45000.00,
        roi_percentage: 27.8
      }
    },
    {
      id: 'wf-model-tier-004',
      name: 'AI Model Tiering',
      type: 'model_tiering',
      scope: 'ai',
      status: 'running',
      progress: 58,
      created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      steps: [
        { name: 'Analyze workflow token profiles', status: 'done', duration_ms: 55000 },
        { name: 'Score quality vs cost tradeoffs', status: 'running', duration_ms: 80000 },
        { name: 'Generate tiering recommendations', status: 'queued', duration_ms: 0 },
        { name: 'Human approval for premium routes', status: 'queued', duration_ms: 0 },
      ],
      agent: 'Model Router Agent',
      metrics: { workflows_analyzed: 12, projected_token_savings_pct: 28.5 }
    },
    {
      id: 'wf-token-opt-005',
      name: 'Prompt Caching Rollout',
      type: 'prompt_caching',
      scope: 'ai',
      status: 'awaiting_approval',
      progress: 72,
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      steps: [
        { name: 'Identify repeated system prompts', status: 'done', duration_ms: 40000 },
        { name: 'Configure cache keys per agent', status: 'done', duration_ms: 95000 },
        { name: 'Await platform owner approval', status: 'awaiting_approval', duration_ms: 0 },
        { name: 'Enable caching in production', status: 'queued', duration_ms: 0 },
      ],
      agent: 'Token Optimizer Agent',
      metrics: { agents_affected: 8, estimated_input_token_reduction_pct: 35 }
    },
    {
      id: 'wf-gpu-006',
      name: 'GPU Cluster Rightsizing',
      type: 'gpu_rightsizing',
      scope: 'ai',
      status: 'completed',
      progress: 100,
      created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      steps: [
        { name: 'Collect GPU utilization metrics', status: 'done', duration_ms: 60000 },
        { name: 'Model off-peak scale-down schedule', status: 'done', duration_ms: 120000 },
        { name: 'Apply autoscaling policy', status: 'done', duration_ms: 45000 },
        { name: 'Verify inference latency SLAs', status: 'done', duration_ms: 90000 },
      ],
      agent: 'GPU FinOps Agent',
      metrics: { clusters_optimized: 2, monthly_savings: 3200 }
    }
  ];
}

export function generateKPIs() {
  const today = new Date();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
  
  return {
    allocation_coverage: {
      value: 94.2,
      target: 95.0,
      trend: 2.1, // percentage point improvement
      status: 'on_track'
    },
    forecast_accuracy: {
      value: 7.3, // MAPE
      target: 8.0,
      trend: -0.8,
      status: 'good'
    },
    savings_pipeline: {
      value: 124750.00,
      target: 100000.00,
      trend: 15200.00,
      status: 'exceeding'
    },
    budget_variance: {
      value: -2.4, // percentage
      target: 0,
      trend: 1.2,
      status: 'good'
    },
    waste_percentage: {
      value: 12.5,
      target: 10.0,
      trend: -1.8,
      status: 'improving'
    },
    data_freshness_minutes: {
      value: 8,
      target: 10,
      trend: -2,
      status: 'exceeding'
    }
  };
}

export function generateAuditTrail() {
  const audit = [];
  const cloudAgents = ['Allocation Agent', 'Optimization Agent', 'Anomaly Agent', 'Forecasting Agent', 'Governance Agent', 'Ingestion Agent'];
  const aiAgents = ['Model Router Agent', 'Token Optimizer Agent', 'GPU FinOps Agent'];
  const sharedAgents = ['FinOps Orchestrator', 'Explainability & Audit Agent', 'Vendor & License Agent'];
  const agents = [...cloudAgents, ...aiAgents, ...sharedAgents];
  const cloudActions = ['tagging_enforcement', 'idle_cleanup', 'rightsizing_recommendation', 'budget_alert', 'forecast_update', 'connector_provisioning'];
  const aiActions = ['model_tiering_recommendation', 'prompt_caching_rollout', 'token_limit_policy', 'gpu_rightsizing', 'retry_policy_update'];
  const sharedActions = ['audit_bundle_generation', 'license_utilization_check'];
  const actions = [...cloudActions, ...aiActions, ...sharedActions];
  
  for (let i = 0; i < 50; i++) {
    const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    const agent = agents[Math.floor(Math.random() * agents.length)];
    const isAi = aiAgents.includes(agent);
    const isCloud = cloudAgents.includes(agent);
    const scope = isAi ? 'ai' : isCloud ? 'cloud' : 'shared';
    const actionPool = isAi ? aiActions : isCloud ? cloudActions : sharedActions;
    const action = actionPool[Math.floor(Math.random() * actionPool.length)];
    const hasAuditBundle = agent === 'Explainability & Audit Agent' || Math.random() > 0.7;
    
    audit.push({
      id: `audit-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: timestamp.toISOString(),
      agent: agent,
      scope,
      action,
      resource: `res-${Math.random().toString(36).substr(2, 9)}`,
      decision: generateDecision(),
      inputs: generateInputs(),
      policy_matches: generatePolicyMatches(),
      confidence: parseFloat((Math.random() * 0.5 + 0.5).toFixed(2)),
      hash: `sha256:${Math.random().toString(36).substr(2, 64)}`,
      audit_bundle: hasAuditBundle ? {
        id: `bundle-${Math.random().toString(36).substr(2, 9)}`,
        reasoning_steps: [
          'Analyzed input data and identified key patterns',
          'Applied policy rules and validation checks',
          'Generated decision with confidence scoring',
          'Signed bundle with cryptographic signature'
        ],
        tool_calls: ['analyzer', 'policy_engine', 'signature_service'],
        features_used: ['cost_data', 'utilization_metrics', 'policy_rules'],
        signature_status: 'verified',
        bundle_size: Math.floor(Math.random() * 500 + 100)
      } : null
    });
  }
  
  return audit.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function generateDecision(): string {
  const decisions = [
    'Applied virtual tags to 47 resources',
    'Created PR #1234 for tagging remediation',
    'Stopped 12 idle EC2 instances',
    'Recommended db.r5.2xlarge → db.r5.xlarge downsizing',
    'Alerted budget owner of 85% threshold breach',
    'Updated 30-day forecast with 94% confidence'
  ];
  return decisions[Math.floor(Math.random() * decisions.length)];
}

function generateInputs(): any {
  return {
    resources_scanned: Math.floor(Math.random() * 1000 + 100),
    time_window_days: 30,
    policy_version: 'v2.1.3'
  };
}

function generatePolicyMatches(): string[] {
  return [
    'finops.tagging.required_keys',
    'finops.budget.guardrails',
    'finops.optimization.rightsizing_threshold'
  ].slice(0, Math.floor(Math.random() * 3) + 1);
}

export function generateAllocationStats() {
  return {
    total_resources: 15420,
    tagged_resources: 14526,
    coverage_percentage: 94.2,
    by_tag: {
      owner: { coverage: 96.8, missing: 484 },
      application: { coverage: 92.1, missing: 1220 },
      env: { coverage: 94.8, missing: 231 },
      biz_unit: { coverage: 89.3, missing: 1643 },
      cost_center: { coverage: 85.7, missing: 2204 }
    },
    trends: {
      week_ago: 91.5,
      month_ago: 88.2
    }
  };
}

export function generateSoftwareInventory() {
  const licenseTypes = ['Monthly Subscription', 'Yearly Subscription', 'One-time License', 'Perpetual License', 'Pay-as-you-go', 'Enterprise Agreement'];
  
  // Correct vendor-product mappings
  const vendorProductMap: { [key: string]: { vendor: string; product: string; productType: string }[] } = {
    'Microsoft': [
      { vendor: 'Microsoft', product: 'Office 365', productType: 'SaaS' },
      { vendor: 'Microsoft', product: 'Azure Services', productType: 'IaaS' },
      { vendor: 'Microsoft', product: 'Microsoft Teams', productType: 'SaaS' },
      { vendor: 'Microsoft', product: 'SQL Server', productType: 'COTS' },
      { vendor: 'Microsoft', product: 'Windows Server', productType: 'COTS' }
    ],
    'AWS': [
      { vendor: 'AWS', product: 'AWS Cloud Services', productType: 'IaaS' },
      { vendor: 'AWS', product: 'EC2', productType: 'IaaS' },
      { vendor: 'AWS', product: 'S3', productType: 'IaaS' },
      { vendor: 'AWS', product: 'RDS', productType: 'PaaS' }
    ],
    'Google Cloud': [
      { vendor: 'Google Cloud', product: 'Google Workspace', productType: 'SaaS' },
      { vendor: 'Google Cloud', product: 'GCP Services', productType: 'IaaS' },
      { vendor: 'Google Cloud', product: 'Google Cloud Platform', productType: 'IaaS' }
    ],
    'Oracle': [
      { vendor: 'Oracle', product: 'Oracle Database', productType: 'COTS' },
      { vendor: 'Oracle', product: 'Oracle Cloud Infrastructure', productType: 'IaaS' },
      { vendor: 'Oracle', product: 'Java Enterprise', productType: 'COTS' }
    ],
    'Salesforce': [
      { vendor: 'Salesforce', product: 'Salesforce CRM', productType: 'SaaS' },
      { vendor: 'Salesforce', product: 'Salesforce Platform', productType: 'PaaS' }
    ],
    'Adobe': [
      { vendor: 'Adobe', product: 'Adobe Creative Cloud', productType: 'SaaS' },
      { vendor: 'Adobe', product: 'Adobe Acrobat', productType: 'SaaS' }
    ],
    'ServiceNow': [
      { vendor: 'ServiceNow', product: 'ServiceNow ITSM', productType: 'SaaS' },
      { vendor: 'ServiceNow', product: 'ServiceNow Platform', productType: 'SaaS' }
    ],
    'Splunk': [
      { vendor: 'Splunk', product: 'Splunk Enterprise', productType: 'SaaS' },
      { vendor: 'Splunk', product: 'Splunk Cloud', productType: 'SaaS' }
    ],
    'Datadog': [
      { vendor: 'Datadog', product: 'Datadog APM', productType: 'SaaS' },
      { vendor: 'Datadog', product: 'Datadog Infrastructure', productType: 'SaaS' }
    ],
    'New Relic': [
      { vendor: 'New Relic', product: 'New Relic Monitoring', productType: 'SaaS' },
      { vendor: 'New Relic', product: 'New Relic One', productType: 'SaaS' }
    ],
    'Atlassian': [
      { vendor: 'Atlassian', product: 'Jira Software', productType: 'SaaS' },
      { vendor: 'Atlassian', product: 'Jira Service Management', productType: 'SaaS' },
      { vendor: 'Atlassian', product: 'Confluence', productType: 'SaaS' },
      { vendor: 'Atlassian', product: 'Bitbucket', productType: 'SaaS' },
      { vendor: 'Atlassian', product: 'Atlassian Cloud', productType: 'SaaS' },
      { vendor: 'Atlassian', product: 'Bamboo', productType: 'SaaS' },
      { vendor: 'Atlassian', product: 'Fisheye', productType: 'SaaS' },
      { vendor: 'Atlassian', product: 'Crowd', productType: 'SaaS' },
      { vendor: 'Atlassian', product: 'Sourcetree', productType: 'SaaS' },
      { vendor: 'Atlassian', product: 'Opsgenie', productType: 'SaaS' }
    ],
    'GitHub': [
      { vendor: 'GitHub', product: 'GitHub Enterprise', productType: 'SaaS' },
      { vendor: 'GitHub', product: 'GitHub Actions', productType: 'SaaS' }
    ],
    'Slack': [
      { vendor: 'Slack', product: 'Slack Enterprise', productType: 'SaaS' },
      { vendor: 'Slack', product: 'Slack Business', productType: 'SaaS' }
    ],
    'Zoom': [
      { vendor: 'Zoom', product: 'Zoom Business', productType: 'SaaS' },
      { vendor: 'Zoom', product: 'Zoom Enterprise', productType: 'SaaS' }
    ],
    'Docker': [
      { vendor: 'Docker', product: 'Docker Enterprise', productType: 'SaaS' },
      { vendor: 'Docker', product: 'Docker Desktop', productType: 'SaaS' }
    ],
    'VMware': [
      { vendor: 'VMware', product: 'VMware vSphere', productType: 'IaaS' },
      { vendor: 'VMware', product: 'VMware Cloud', productType: 'IaaS' }
    ],
    'Kubernetes': [
      { vendor: 'CNCF', product: 'Kubernetes', productType: 'Open Source' }
    ],
    'Homegrown': [
      { vendor: 'Homegrown', product: 'Internal Analytics Platform', productType: 'Custom' },
      { vendor: 'Homegrown', product: 'Custom CRM System', productType: 'Custom' },
      { vendor: 'Homegrown', product: 'Enterprise Portal', productType: 'Custom' }
    ]
  };
  
  // Flatten all vendor-product pairs
  const allProducts: { vendor: string; product: string; productType: string }[] = [];
  Object.values(vendorProductMap).forEach(products => {
    allProducts.push(...products);
  });
  
  const inventory = [];
  const now = new Date();
  
  // Helper function to create inventory item
  const createInventoryItem = (productInfo: { vendor: string; product: string; productType: string }, licenseType: string) => {
    const vendor = productInfo.vendor;
    const product = productInfo.product;
    const productType = productInfo.productType;
    
    // Calculate license cost based on type
    let licenseCost = 0;
    if (licenseType.includes('Monthly')) {
      licenseCost = 100 + Math.random() * 5000;
    } else if (licenseType.includes('Yearly')) {
      licenseCost = 1000 + Math.random() * 50000;
    } else if (licenseType.includes('One-time') || licenseType.includes('Perpetual')) {
      licenseCost = 5000 + Math.random() * 100000;
    } else if (licenseType.includes('Enterprise')) {
      licenseCost = 100000 + Math.random() * 500000;
    } else {
      licenseCost = 50 + Math.random() * 2000;
    }
    
    // Calculate last paid and next billing dates
    const lastPaidDaysAgo = Math.floor(Math.random() * 365);
    const lastPaid = new Date(now);
    lastPaid.setDate(lastPaid.getDate() - lastPaidDaysAgo);
    
    let nextBilling: Date | null = null;
    if (licenseType.includes('Monthly')) {
      nextBilling = new Date(lastPaid);
      nextBilling.setMonth(nextBilling.getMonth() + 1);
    } else if (licenseType.includes('Yearly')) {
      nextBilling = new Date(lastPaid);
      nextBilling.setFullYear(nextBilling.getFullYear() + 1);
    } else if (licenseType.includes('Enterprise')) {
      nextBilling = new Date(lastPaid);
      nextBilling.setFullYear(nextBilling.getFullYear() + 1);
    }
    // One-time and Perpetual licenses have no next billing
    
    // Contract ID
    const contractId = `CONTRACT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    return {
      id: `SW-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      product_name: product,
      vendor: vendor,
      product_type: productType,
      license_type: licenseType,
      license_cost: parseFloat(licenseCost.toFixed(2)),
      currency: 'USD',
      last_paid: lastPaid.toISOString().split('T')[0],
      next_billing: nextBilling ? nextBilling.toISOString().split('T')[0] : null,
      contract_id: contractId,
      status: Math.random() > 0.1 ? 'Active' : 'Renewal Pending',
      users_seats: licenseType.includes('Enterprise') ? Math.floor(Math.random() * 1000 + 100) : Math.floor(Math.random() * 100 + 1),
      renewal_date: nextBilling ? nextBilling.toISOString().split('T')[0] : null
    };
  };
  
  // First, ensure each product appears at least once for better coverage
  for (const productInfo of allProducts) {
    const licenseType = licenseTypes[Math.floor(Math.random() * licenseTypes.length)];
    inventory.push(createInventoryItem(productInfo, licenseType));
  }
  
  // Then add more random entries to reach a reasonable inventory size (at least 50 items)
  const targetSize = Math.max(50, allProducts.length * 2); // At least 50, or 2x the number of products
  for (let i = allProducts.length; i < targetSize; i++) {
    const productInfo = allProducts[Math.floor(Math.random() * allProducts.length)];
    const licenseType = licenseTypes[Math.floor(Math.random() * licenseTypes.length)];
    inventory.push(createInventoryItem(productInfo, licenseType));
  }
  
  return inventory.sort((a, b) => a.product_name.localeCompare(b.product_name));
}

const CONTRACT_OWNERS = [
  'Finance Ops',
  'IT Procurement',
  'Platform Engineering',
  'AI Platform Team',
  'Enterprise Apps',
  'Cloud Center of Excellence',
];

export function generateContracts() {
  const now = new Date();
  const addMonths = (months: number) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split('T')[0];
  };

  const licenseSeeds = [
    { name: 'Microsoft Enterprise Agreement', vendor: 'Microsoft', products: ['Office 365', 'Teams', 'Azure AD'], committed: 2400000, used: 2150000, seats_committed: 5000, seats_used: 4680, term: 36, renewal_months: 8 },
    { name: 'Salesforce Enterprise License', vendor: 'Salesforce', products: ['Salesforce CRM', 'Salesforce Platform'], committed: 890000, used: 720000, seats_committed: 1200, seats_used: 980, term: 24, renewal_months: 5 },
    { name: 'Adobe Creative Cloud ELA', vendor: 'Adobe', products: ['Adobe Creative Cloud'], committed: 420000, used: 185000, seats_committed: 800, seats_used: 340, term: 12, renewal_months: 3 },
    { name: 'ServiceNow ITSM Agreement', vendor: 'ServiceNow', products: ['ServiceNow ITSM', 'ServiceNow Platform'], committed: 650000, used: 610000, seats_committed: 450, seats_used: 425, term: 36, renewal_months: 14 },
    { name: 'Atlassian Cloud Enterprise', vendor: 'Atlassian', products: ['Jira', 'Confluence', 'Bitbucket'], committed: 310000, used: 295000, seats_committed: 2200, seats_used: 2100, term: 12, renewal_months: 6 },
    { name: 'GitHub Enterprise Agreement', vendor: 'GitHub', products: ['GitHub Enterprise', 'GitHub Actions'], committed: 280000, used: 265000, seats_committed: 900, seats_used: 870, term: 12, renewal_months: 9 },
    { name: 'Splunk Enterprise License', vendor: 'Splunk', products: ['Splunk Enterprise'], committed: 520000, used: 480000, seats_committed: 0, seats_used: 0, term: 24, renewal_months: 11 },
    { name: 'Datadog Enterprise Agreement', vendor: 'Datadog', products: ['Datadog APM', 'Datadog Infrastructure'], committed: 390000, used: 410000, seats_committed: 0, seats_used: 0, term: 12, renewal_months: 4 },
  ];

  const cloudSeeds = [
    { name: 'AWS Enterprise Discount Program', vendor: 'AWS', scope: 'AWS', committed: 4800000, used: 4120000, term: 12, renewal_months: 7 },
    { name: 'Azure Monetary Commitment', vendor: 'Microsoft', scope: 'Azure', committed: 2200000, used: 1980000, term: 12, renewal_months: 10 },
    { name: 'GCP Committed Use Discounts', vendor: 'Google Cloud', scope: 'GCP', committed: 980000, used: 720000, term: 12, renewal_months: 5 },
    { name: 'Oracle Cloud Infrastructure Commit', vendor: 'Oracle', scope: 'OCI', committed: 450000, used: 310000, term: 24, renewal_months: 18 },
  ];

  const aiSeeds = [
    { name: 'Azure OpenAI Volume Commitment', vendor: 'Microsoft', scope: 'Azure OpenAI', committed: 360000, used: 298000, term: 12, renewal_months: 6 },
    { name: 'OpenAI Enterprise API Agreement', vendor: 'OpenAI', scope: 'OpenAI API', committed: 240000, used: 215000, term: 12, renewal_months: 8 },
    { name: 'Anthropic Claude Volume Tier', vendor: 'Anthropic', scope: 'Anthropic API', committed: 180000, used: 142000, term: 12, renewal_months: 4 },
  ];

  const contracts: any[] = [];

  licenseSeeds.forEach((seed, i) => {
    const utilization = Math.round((seed.used / seed.committed) * 1000) / 10;
    const overCommitted = seed.used > seed.committed;
    contracts.push({
      id: `lic-${i + 1}`,
      name: seed.name,
      vendor: seed.vendor,
      contract_type: 'license',
      status: seed.renewal_months <= 3 ? 'renewal_pending' : 'active',
      committed_annual: seed.committed,
      used_annual: seed.used,
      utilization_pct: utilization,
      over_committed: overCommitted,
      currency: 'USD',
      renewal_date: addMonths(seed.renewal_months),
      term_months: seed.term,
      owner: CONTRACT_OWNERS[i % CONTRACT_OWNERS.length],
      products: seed.products,
      seats_committed: seed.seats_committed || null,
      seats_used: seed.seats_used || null,
    });
  });

  cloudSeeds.forEach((seed, i) => {
    const utilization = Math.round((seed.used / seed.committed) * 1000) / 10;
    contracts.push({
      id: `cloud-${i + 1}`,
      name: seed.name,
      vendor: seed.vendor,
      contract_type: 'cloud',
      status: seed.renewal_months <= 6 ? 'under_review' : 'active',
      committed_annual: seed.committed,
      used_annual: seed.used,
      utilization_pct: utilization,
      over_committed: false,
      currency: 'USD',
      renewal_date: addMonths(seed.renewal_months),
      term_months: seed.term,
      owner: CONTRACT_OWNERS[(i + 2) % CONTRACT_OWNERS.length],
      scope: seed.scope,
    });
  });

  aiSeeds.forEach((seed, i) => {
    const utilization = Math.round((seed.used / seed.committed) * 1000) / 10;
    contracts.push({
      id: `ai-${i + 1}`,
      name: seed.name,
      vendor: seed.vendor,
      contract_type: 'ai',
      status: 'active',
      committed_annual: seed.committed,
      used_annual: seed.used,
      utilization_pct: utilization,
      over_committed: false,
      currency: 'USD',
      renewal_date: addMonths(seed.renewal_months),
      term_months: seed.term,
      owner: 'AI Platform Team',
      scope: seed.scope,
    });
  });

  return contracts.sort((a, b) => a.name.localeCompare(b.name));
}

export function generateContractOptimizations(contracts: ReturnType<typeof generateContracts>) {
  const optimizations: any[] = [];
  const types = ['renegotiation', 'unused-seats', 'true-up-risk', 'commitment-adjustment', 'co-term', 'rightsizing'];
  const titles: Record<string, string[]> = {
    renegotiation: [
      'Renegotiate volume tier before renewal',
      'Request multi-year discount at current utilization',
      'Align pricing to benchmarked market rates',
    ],
    'unused-seats': [
      'Reclaim unused Creative Cloud seats',
      'Downgrade to active-user licensing model',
      'Remove zombie seats via SSO deprovisioning',
    ],
    'true-up-risk': [
      'True-up exposure on over-committed Datadog agreement',
      'Address seat overage before annual true-up',
      'Pre-negotiate true-up cap for enterprise license',
    ],
    'commitment-adjustment': [
      'Increase AWS EDP commitment to capture higher discount tier',
      'Shift GCP CUD mix toward compute-heavy workloads',
      'Right-size Azure MCA to actual run-rate',
    ],
    'co-term': [
      'Co-term Splunk and Datadog renewals for leverage',
      'Bundle Atlassian and GitHub renewals in Q2',
      'Align Microsoft EA and Azure MCA renewal windows',
    ],
    rightsizing: [
      'Reduce Oracle OCI commit based on migration plan',
      'Adjust Anthropic tier to match forecasted token volume',
      'Optimize OpenAI commit vs pay-as-you-go blend',
    ],
  };
  const descriptions: Record<string, string> = {
    renegotiation: 'Vendor & License Agent identified negotiation leverage based on utilization trends and renewal timing.',
    'unused-seats': 'Seat utilization below 50% — reclaim licenses or switch to consumption-based pricing.',
    'true-up-risk': 'Current usage exceeds committed entitlements; true-up charges likely at renewal.',
    'commitment-adjustment': 'Usage trajectory supports a different commitment level for improved unit economics.',
    'co-term': 'Aligning renewal dates improves procurement leverage and reduces administrative overhead.',
    rightsizing: 'Forecast shows commitment misalignment; adjust terms to reduce waste or capture discounts.',
  };

  contracts.forEach((contract, i) => {
    if (contract.utilization_pct < 55 || contract.over_committed || contract.utilization_pct > 88) {
      let type: string;
      if (contract.over_committed) type = 'true-up-risk';
      else if (contract.seats_committed && contract.seats_used && contract.seats_used / contract.seats_committed < 0.55) type = 'unused-seats';
      else if (contract.utilization_pct > 88 && contract.contract_type === 'cloud') type = 'commitment-adjustment';
      else if (contract.renewal_date && new Date(contract.renewal_date) < new Date(Date.now() + 120 * 86400000)) type = 'renegotiation';
      else type = types[i % types.length];

      const titleList = titles[type] || titles.renegotiation;
      const savings = Math.round((Math.abs(contract.committed_annual - contract.used_annual) * 0.08 + Math.random() * 50000) / 100) * 100;
      const daysAgo = Math.floor(Math.random() * 21);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      optimizations.push({
        id: `contract-opt-${contract.id}-${i}`,
        contract_id: contract.id,
        contract_name: contract.name,
        contract_type: contract.contract_type,
        type,
        title: titleList[i % titleList.length],
        description: descriptions[type],
        estimated_savings: savings,
        risk_level: type === 'true-up-risk' ? 'high' : type === 'unused-seats' ? 'low' : 'medium',
        status: Math.random() > 0.6 ? 'pending' : 'draft',
        agent: 'Vendor & License Agent',
        created_at: createdAt.toISOString(),
      });
    }
  });

  // Ensure at least 10 optimization items
  while (optimizations.length < 10) {
    const contract = contracts[optimizations.length % contracts.length];
    const type = types[optimizations.length % types.length];
    const titleList = titles[type];
    optimizations.push({
      id: `contract-opt-extra-${optimizations.length}`,
      contract_id: contract.id,
      contract_name: contract.name,
      contract_type: contract.contract_type,
      type,
      title: titleList[0],
      description: descriptions[type],
      estimated_savings: Math.round((20000 + Math.random() * 80000) / 100) * 100,
      risk_level: 'medium',
      status: 'draft',
      agent: 'Vendor & License Agent',
      created_at: new Date().toISOString(),
    });
  }

  return optimizations.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function generateContractsPayload() {
  const contracts = generateContracts();
  const optimizations = generateContractOptimizations(contracts);
  const totalCommitted = contracts.reduce((s, c) => s + c.committed_annual, 0);
  const totalUsed = contracts.reduce((s, c) => s + c.used_annual, 0);
  const renewalsSoon = contracts.filter((c) => {
    if (!c.renewal_date) return false;
    const days = (new Date(c.renewal_date).getTime() - Date.now()) / 86400000;
    return days >= 0 && days <= 90;
  }).length;

  return {
    contracts,
    optimizations,
    summary: {
      total_contracts: contracts.length,
      total_committed: totalCommitted,
      total_used: totalUsed,
      avg_utilization_pct: Math.round((totalUsed / totalCommitted) * 1000) / 10,
      renewals_within_90d: renewalsSoon,
      open_optimizations: optimizations.filter((o) => o.status !== 'approved').length,
      potential_savings: optimizations.reduce((s, o) => s + o.estimated_savings, 0),
    },
  };
}
