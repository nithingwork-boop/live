import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Badge,
  useColorModeValue,
  SimpleGrid,
  Spinner,
  Divider,
  Input,
  InputGroup,
  InputLeftElement,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Tooltip,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Icon,
  forwardRef,
} from '@chakra-ui/react';
import { 
  SearchIcon,
  SettingsIcon,
  DownloadIcon,
  LinkIcon,
  WarningIcon,
  StarIcon,
  RepeatClockIcon,
  LockIcon,
  InfoIcon,
  CopyIcon,
  TimeIcon
} from '@chakra-ui/icons';
import { useAdminScope } from '../../contexts/AdminScopeContext';
import { getAgentScope, matchesScopeFilter } from './adminScope';

const CREW_API_URL = 'http://localhost:8000';

interface AgentConfig {
  max_iterations?: number;
  max_rpm?: number;
  temperature?: number;
  max_tokens?: number;
  memory_enabled?: boolean;
  verbose?: boolean;
}

interface Agent {
  id: string;
  name: string;
  role: string;
  goal: string;
  backstory: string;
  tools: string[];
  llms?: string[];
  config?: AgentConfig;
}

interface ToolInfo {
  name: string;
  category: string;
  description: string;
  agents: string[];
  usageCount: number;
  isActive: boolean;
  lastUsed: string; // ISO date string
  icon?: React.ReactNode;
  integrationType: string;
  vendor: string;
}

// Tool categories and descriptions
const TOOL_CATEGORIES: Record<string, { name: string; description: string; color: string }> = {
  'data-ops': { name: 'Data Operations', description: 'Data ingestion, validation, and transformation tools', color: 'blue' },
  'cloud-connectors': { name: 'Cloud Connectors', description: 'Cloud provider APIs and SDKs', color: 'cyan' },
  'analytics': { name: 'Analytics & ML', description: 'Machine learning and statistical analysis tools', color: 'purple' },
  'policy': { name: 'Policy & Governance', description: 'Policy enforcement and compliance tools', color: 'orange' },
  'infrastructure': { name: 'Infrastructure', description: 'Infrastructure management and orchestration', color: 'green' },
  'monitoring': { name: 'Monitoring & Observability', description: 'Monitoring, logging, and observability tools', color: 'teal' },
  'other': { name: 'Other', description: 'Miscellaneous tools and utilities', color: 'gray' },
};

const INTEGRATION_TYPES: Record<string, { name: string; description: string; color: string }> = {
  'mcp': {
    name: 'MCP Tools',
    description: 'Model Context Protocol bridges, orchestration primitives, and internal accelerators.',
    color: 'purple',
  },
  'cloud-provider': {
    name: 'Cloud Provider Services',
    description: 'Native integrations with AWS, Azure, GCP, and Kubernetes services.',
    color: 'cyan',
  },
  'saas-platform': {
    name: 'SaaS & Marketplace',
    description: 'Third-party SaaS platforms and marketplace connectors.',
    color: 'teal',
  },
  'api-sdk': {
    name: 'API / SDK Integrations',
    description: 'Direct API clients, SDKs, and connector wrappers used by agents.',
    color: 'blue',
  },
  'homegrown': {
    name: 'Homegrown Automations',
    description: 'Internal automation engines, calculators, and knowledge assets.',
    color: 'orange',
  },
};

const MCP_KEYWORDS = [
  'reasoning_engine',
  'bundle_generator',
  'signature_service',
  'control_library',
  'time_lens',
  'cost_value_analyzer',
  'unit_economics_engine',
  'telemetry_warehouse',
  'portfolio_backlog_mgr',
  'vendor_risk_engine',
  'governance_workbench',
  'portfolio_kpis',
  'pace_layer_simulator',
  'capability_catalog',
  'capability_map',
  'sixr_engine',
  'modernization_playbook',
  'renewal_calendar',
  'kano_classifier',
  'survey_insights',
  'weighted_scoring_template',
  'exit_planner',
  'switching_cost_modeler',
  'data_export_validator',
  'adoption_telemetry',
  'growth_modeler',
  'feature_usage_telemetry',
];

const CLOUD_KEYWORDS = [
  'aws',
  'azure',
  'gcp',
  'cloud',
  'kubernetes',
  'k8s',
  'cur',
  'ri_sp_cud',
  'cloud_vendor_sdks',
];

const SAAS_KEYWORDS = [
  'jira',
  'atlassian',
  'snowflake',
  'salesforce',
  'datadog',
  'prometheus',
  'm365',
  'dbt',
  'great_expectations',
  'github',
  'servicenow',
];

const API_KEYWORDS = [
  'api',
  'sdk',
  'client',
  'connector',
  'rpc',
  'integration',
];

const VENDOR_RULES: { match: RegExp; vendor: string }[] = [
  { match: /cloud_vendor_sdks/, vendor: 'Cloud Providers' },
  { match: /(aws|ri_sp_cud|rightsizing_analyzer|idle_detector|usage_monitor)/, vendor: 'Amazon Web Services' },
  { match: /(azure|m365)/, vendor: 'Microsoft' },
  { match: /(gcp)/, vendor: 'Google Cloud' },
  { match: /(dbt)/, vendor: 'dbt Labs' },
  { match: /great_expectations/, vendor: 'Great Expectations' },
  { match: /temporal/, vendor: 'Temporal' },
  { match: /(opa|rego)/, vendor: 'Open Policy Agent' },
  { match: /(jira|atlassian)/, vendor: 'Atlassian' },
  { match: /snowflake/, vendor: 'Snowflake' },
  { match: /salesforce/, vendor: 'Salesforce' },
  { match: /datadog/, vendor: 'Datadog' },
  { match: /(prometheus|k8s|kubernetes)/, vendor: 'CNCF' },
  { match: /(github|git_inspector)/, vendor: 'GitHub' },
  { match: /cmdb/, vendor: 'ServiceNow' },
];

const getIntegrationType = (toolName: string): keyof typeof INTEGRATION_TYPES => {
  const lower = toolName.toLowerCase();
  if (MCP_KEYWORDS.some((kw) => lower.includes(kw))) {
    return 'mcp';
  }
  if (CLOUD_KEYWORDS.some((kw) => lower.includes(kw))) {
    return 'cloud-provider';
  }
  if (SAAS_KEYWORDS.some((kw) => lower.includes(kw))) {
    return 'saas-platform';
  }
  if (API_KEYWORDS.some((kw) => lower.includes(kw))) {
    return 'api-sdk';
  }
  return 'homegrown';
};

const getToolVendor = (toolName: string): string => {
  const lower = toolName.toLowerCase();
  const rule = VENDOR_RULES.find(({ match }) => match.test(lower));
  if (rule) {
    return rule.vendor;
  }
  return 'Homegrown';
};

const getIntegrationDisplayName = (integrationKey: string): string => {
  return INTEGRATION_TYPES[integrationKey]?.name || integrationKey.replace(/-/g, ' ');
};

// Get icon for tool based on name
const getToolIcon = (toolName: string) => {
  const iconProps = { boxSize: 4, color: 'blue.500' };
  const lower = toolName.toLowerCase();
  
  if (lower.includes('aws') || lower.includes('azure') || lower.includes('gcp') || lower.includes('cloud') || lower.includes('cur') || lower.includes('billing')) {
    return <DownloadIcon {...iconProps} />;
  }
  if (lower.includes('dbt') || lower.includes('expectations') || lower.includes('lineage') || lower.includes('data')) {
    return <SettingsIcon {...iconProps} />;
  }
  if (lower.includes('prophet') || lower.includes('arima') || lower.includes('xgboost') || lower.includes('adtk') || lower.includes('analytics')) {
    return <StarIcon {...iconProps} />;
  }
  if (lower.includes('opa') || lower.includes('rego') || lower.includes('policy') || lower.includes('governance') || lower.includes('budget')) {
    return <LockIcon {...iconProps} />;
  }
  if (lower.includes('k8s') || lower.includes('kubernetes') || lower.includes('temporal') || lower.includes('orchestration')) {
    return <SettingsIcon {...iconProps} />;
  }
  if (lower.includes('prometheus') || lower.includes('datadog') || lower.includes('monitor') || lower.includes('tracker')) {
    return <InfoIcon {...iconProps} />;
  }
  if (lower.includes('anomaly') || lower.includes('correlation') || lower.includes('incident')) {
    return <WarningIcon {...iconProps} />;
  }
  if (lower.includes('allocation') || lower.includes('tag') || lower.includes('link')) {
    return <LinkIcon {...iconProps} />;
  }
  if (lower.includes('forecast') || lower.includes('scenario') || lower.includes('budget')) {
    return <RepeatClockIcon {...iconProps} />;
  }
  if (lower.includes('audit') || lower.includes('ledger') || lower.includes('signature')) {
    return <InfoIcon {...iconProps} />;
  }
  if (lower.includes('contract') || lower.includes('license') || lower.includes('vendor') || lower.includes('usage')) {
    return <CopyIcon {...iconProps} />;
  }
  return <SettingsIcon {...iconProps} />;
};

// Generate random last used date (within last 2-60 minutes)
const generateLastUsed = (): string => {
  const minutesAgo = Math.floor(Math.random() * 58) + 2; // 2 to 60 minutes
  const date = new Date();
  date.setMinutes(date.getMinutes() - minutesAgo);
  return date.toISOString();
};

// Determine if tool is active - all tools are active
const isToolActive = (lastUsed: string): boolean => {
  return true; // All tools are active
};

// Format date for display (optimized for minutes/hours)
const formatLastUsed = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
};

// Categorize tools based on their names/patterns
const categorizeTool = (toolName: string): string => {
  const lower = toolName.toLowerCase();
  if (lower.includes('aws') || lower.includes('azure') || lower.includes('gcp') || lower.includes('cloud') || lower.includes('cur') || lower.includes('billing')) {
    return 'cloud-connectors';
  }
  if (lower.includes('dbt') || lower.includes('expectations') || lower.includes('lineage') || lower.includes('data')) {
    return 'data-ops';
  }
  if (lower.includes('prophet') || lower.includes('arima') || lower.includes('xgboost') || lower.includes('adtk') || lower.includes('analytics')) {
    return 'analytics';
  }
  if (lower.includes('opa') || lower.includes('rego') || lower.includes('policy') || lower.includes('governance') || lower.includes('budget')) {
    return 'policy';
  }
  if (lower.includes('k8s') || lower.includes('kubernetes') || lower.includes('temporal') || lower.includes('orchestration')) {
    return 'infrastructure';
  }
  if (lower.includes('prometheus') || lower.includes('datadog') || lower.includes('monitor') || lower.includes('tracker')) {
    return 'monitoring';
  }
  return 'other';
};

// Fallback mock agents
const MOCK_AGENTS: Agent[] = [
  {
    id: 'finops-orchestrator',
    name: 'FinOps Orchestrator',
    role: 'Senior FinOps Platform Architect',
    goal: 'Deliver FinOps outcomes across Inform/Optimize/Operate phases',
    backstory: 'Central brain coordinating data, policies, and actions across the FinOps platform.',
    tools: ['dbt_rpc', 'great_expectations', 'temporal_client', 'cloud_vendor_sdks', 'opa_client', 'jira_client'],
    llms: ['gpt-4', 'claude-3-opus']
  },
  {
    id: 'ingestion-agent',
    name: 'Ingestion Agent',
    role: 'Senior Data Engineer',
    goal: 'Ensure reliable and timely data ingestion from all sources',
    backstory: 'Specialized in provisioning and managing data connectors across cloud providers.',
    tools: ['AWS CUR/CE/Budgets/Organizations', 'Azure Cost Management Exports', 'GCP Billing Export & Recommender', 'Kubernetes Metrics API', 'Prometheus', 'Datadog', 'M365', 'Atlassian', 'GitHub', 'Snowflake', 'Salesforce'],
    llms: ['gpt-4', 'gpt-3.5-turbo']
  },
  {
    id: 'allocation-agent',
    name: 'Allocation Agent',
    role: 'Senior Cost Allocation Analyst',
    goal: 'Maximize cost allocation coverage and accuracy',
    backstory: 'Expert in cost allocation, tagging strategies, and resource ownership mapping.',
    tools: ['tagger', 'cmdb', 'git_inspector', 'k8s_api'],
    llms: ['gpt-4', 'claude-3-sonnet']
  },
  {
    id: 'anomaly-agent',
    name: 'Anomaly & RCA Agent',
    role: 'Senior Cost Anomaly Analyst',
    goal: 'Detect, analyze, and explain cost anomalies in real-time',
    backstory: 'Specialized in cost anomaly detection using advanced algorithms.',
    tools: ['prophet', 'adtk', 'correlation_engine', 'deployment_tracker', 'incident_feeds'],
    llms: ['gpt-4', 'claude-3-opus']
  },
  {
    id: 'optimization-agent',
    name: 'Optimization Agent',
    role: 'Senior Cloud Cost Optimizer',
    goal: 'Maximize cost savings through intelligent optimization recommendations',
    backstory: 'Expert in identifying cost optimization opportunities across infrastructure.',
    tools: ['rightsizing_analyzer', 'ri_sp_cud_advisor', 'idle_detector', 'storage_tiering', 'k8s_optimizer', 'license_harvester'],
    llms: ['gpt-4', 'claude-3-opus']
  },
  {
    id: 'forecasting-agent',
    name: 'Forecasting Agent',
    role: 'Senior Financial Analyst',
    goal: 'Provide accurate cost forecasts and enable data-driven budget planning',
    backstory: 'Expert in financial modeling and predictive analytics for cloud cost planning.',
    tools: ['arima', 'prophet', 'xgboost', 'scenario_planner', 'budget_modeler'],
    llms: ['gpt-4', 'claude-3-opus']
  },
  {
    id: 'governance-agent',
    name: 'Governance Agent',
    role: 'Senior FinOps Governance Engineer',
    goal: 'Ensure compliance with FinOps policies and governance standards',
    backstory: 'Specialized in policy enforcement and compliance across cloud infrastructure.',
    tools: ['opa', 'rego', 'policy_engine', 'budget_service', 'exception_workflow'],
    llms: ['gpt-4', 'claude-3-sonnet']
  },
  {
    id: 'explainability-agent',
    name: 'Explainability & Audit Agent',
    role: 'Senior Audit & Compliance Analyst',
    goal: 'Provide complete explainability and immutable audit trails',
    backstory: 'Focused on providing transparency and auditability for all agent decisions.',
    tools: ['audit_ledger', 'reasoning_engine', 'signature_service', 'bundle_generator'],
    llms: ['gpt-4', 'claude-3-opus']
  },
  {
    id: 'vendor-license-agent',
    name: 'Vendor & License Agent',
    role: 'Senior Software Asset Manager',
    goal: 'Optimize license utilization and minimize true-up risks',
    backstory: 'Expert in software license management and vendor contract optimization.',
    tools: ['contract_tracker', 'usage_monitor', 'entitlement_db', 'trueup_calculator'],
    llms: ['gpt-4', 'claude-3-sonnet'],
    config: {
      max_iterations: 6,
      max_rpm: 18,
      temperature: 0.4,
      max_tokens: 2500,
      memory_enabled: true,
      verbose: false
    }
  },
  {
    id: 'portfolio-time-agent',
    name: 'Portfolio TIME Lens Agent',
    role: 'Application Portfolio Strategist',
    goal: 'Segment applications using the Gartner TIME framework',
    backstory: 'Built to continuously evaluate the software estate and surface invest/migrate/eliminate recommendations.',
    tools: ['time_lens', 'application_registry', 'lifecycle_dashboard'],
    llms: ['gpt-4', 'claude-3-sonnet']
  },
  {
    id: 'cost-value-agent',
    name: 'Cost-Value Quadrant Agent',
    role: 'Portfolio Value Analyst',
    goal: 'Map products against business value and total cost (or risk)',
    backstory: 'Combines telemetry with unit economics to keep the Cost–Value matrix current.',
    tools: ['cost_value_analyzer', 'telemetry_warehouse', 'unit_economics_engine'],
    llms: ['gpt-4', 'claude-3-haiku']
  },
  {
    id: 'adoption-growth-agent',
    name: 'Adoption Growth Matrix Agent',
    role: 'Product Adoption Analyst',
    goal: 'Classify products by adoption and growth trajectory',
    backstory: 'Ensures portfolio reviews include adoption velocity and strategic growth signals.',
    tools: ['adoption_telemetry', 'growth_modeler', 'portfolio_kpis'],
    llms: ['gpt-4', 'claude-3-haiku']
  },
  {
    id: 'pace-layer-agent',
    name: 'Pace-Layered Portfolio Agent',
    role: 'Enterprise Architecture Strategist',
    goal: 'Categorize systems as record/differentiation/innovation to set guardrails',
    backstory: 'Keeps architectural guardrails in sync with product lifecycle decisions.',
    tools: ['pace_layer_simulator', 'capability_map', 'architecture_registry'],
    llms: ['gpt-4', 'claude-3-sonnet']
  },
  {
    id: 'safe-portfolio-agent',
    name: 'SAFe Portfolio Flow Agent',
    role: 'Lean Portfolio Facilitator',
    goal: 'Monitor portfolio funnel, review, and MVP guardrails aligned to SAFe',
    backstory: 'Automates lean portfolio cadences and ensures request intake follows governance.',
    tools: ['portfolio_backlog_mgr', 'value_stream_mapper', 'flow_metrics_engine'],
    llms: ['gpt-4', 'claude-3-opus']
  },
  {
    id: 'tbm-capability-agent',
    name: 'TBM Capability Lens Agent',
    role: 'TBM & FinOps Capability Analyst',
    goal: 'Attribute software costs to business capabilities and track unit economics',
    backstory: 'Links FinOps and TBM perspectives to highlight capability-level investment efficiency.',
    tools: ['tbm_modeler', 'unit_cost_dashboard', 'capability_catalog'],
    llms: ['gpt-4', 'claude-3-haiku']
  },
  {
    id: 'sixr-modernization-agent',
    name: '6R Modernization Agent',
    role: 'Modernization Strategist',
    goal: 'Recommend retain/rehost/replatform/refactor/repurchase/retire paths',
    backstory: 'Guides modernization backlogs by pairing technical condition with business value.',
    tools: ['sixr_engine', 'modernization_playbook', 'renewal_calendar'],
    llms: ['gpt-4', 'claude-3-sonnet']
  },
  {
    id: 'value-differentiation-agent',
    name: 'Value Differentiation Agent',
    role: 'Product Differentiation Analyst',
    goal: 'Classify features as delighters, performance, or hygiene using Kano models',
    backstory: 'Ensures rationalization choices protect differentiation while consolidating hygiene capabilities.',
    tools: ['kano_classifier', 'feature_usage_telemetry', 'survey_insights'],
    llms: ['gpt-4', 'claude-3-haiku']
  },
  {
    id: 'weighted-scoring-agent',
    name: 'Weighted Scoring Agent',
    role: 'Portfolio Scoring Analyst',
    goal: 'Calculate weighted scores across value, fit, cost, risk, integration, and vendor health',
    backstory: 'Turns scoring worksheets and FinOps metrics into prioritized action plans.',
    tools: ['weighted_scoring_template', 'cost_telemetry', 'governance_workbench'],
    llms: ['gpt-4', 'claude-3-sonnet']
  },
  {
    id: 'vendor-risk-agent',
    name: 'Vendor Risk Agent',
    role: 'Vendor Risk Assessor',
    goal: 'Evaluate vendor financial health and compliance posture',
    backstory: 'Monitors vendor stability, certifications, and data residency commitments.',
    tools: ['vendor_risk_engine', 'financial_monitor', 'compliance_registry'],
    llms: ['gpt-4', 'claude-3-sonnet']
  },
  {
    id: 'operational-fit-agent',
    name: 'Operational Fit Agent',
    role: 'Controls & Guardrails Auditor',
    goal: 'Validate SSO/SCIM, role-based access, audit logs, and SLA adherence',
    backstory: 'Keeps SaaS intake aligned with enterprise guardrails.',
    tools: ['control_library', 'sso_checker', 'audit_log_analyzer'],
    llms: ['gpt-4', 'claude-3-haiku']
  },
  {
    id: 'exit-risk-agent',
    name: 'Exit Risk Agent',
    role: 'Software Exit Planner',
    goal: 'Assess vendor lock-in, export readiness, and switching cost scenarios',
    backstory: 'Ensures every product has an exit strategy before renewal negotiations.',
    tools: ['exit_planner', 'data_export_validator', 'switching_cost_modeler'],
    llms: ['gpt-4', 'claude-3-sonnet']
  },
  {
    id: 'model-router-agent',
    name: 'Model Router Agent',
    role: 'AI Model Routing Specialist',
    goal: 'Route workloads to the most cost-effective model tier',
    backstory: 'Expert in model tiering and provider routing for agentic workflows.',
    tools: ['model_catalog', 'latency_profiler', 'quality_scorer', 'provider_router'],
    llms: ['gpt-4', 'claude-3-sonnet']
  },
  {
    id: 'token-optimizer-agent',
    name: 'Token Optimizer Agent',
    role: 'Token Efficiency Engineer',
    goal: 'Reduce token volume through caching and prompt optimization',
    backstory: 'Specializes in prompt caching and retry storm prevention.',
    tools: ['prompt_cache', 'token_analyzer', 'retry_policy_engine', 'context_compressor'],
    llms: ['gpt-4', 'gpt-3.5-turbo']
  },
  {
    id: 'gpu-finops-agent',
    name: 'GPU FinOps Agent',
    role: 'GPU Infrastructure Analyst',
    goal: 'Maximize GPU utilization and right-size clusters',
    backstory: 'Monitors GPU clusters and training vs inference cost allocation.',
    tools: ['gpu_metrics', 'cluster_autoscaler', 'spot_scheduler', 'workload_profiler'],
    llms: ['gpt-4', 'claude-3-opus']
  }
];

export default function ToolsForAgents() {
  const { scopeFilter } = useAdminScope();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tools, setTools] = useState<ToolInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory] = useState<string>('all');
  const bg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    // Fetch agents
    fetch(`${CREW_API_URL}/v1/agents`, { 
      signal: AbortSignal.timeout(2000) 
    })
      .then((r) => {
        if (!r.ok) throw new Error('Service not available');
        return r.json();
      })
      .then((data) => {
        const agentsData = data.data || MOCK_AGENTS;
        setAgents(agentsData);

        // Build tools map from agents
        const toolsMap: Record<string, { agents: string[]; usageCount: number }> = {};
        
        agentsData.forEach((agent: Agent) => {
          agent.tools.forEach((toolName) => {
            if (!toolsMap[toolName]) {
              toolsMap[toolName] = { agents: [], usageCount: 0 };
            }
            toolsMap[toolName].agents.push(agent.name);
            toolsMap[toolName].usageCount++;
          });
        });

        // Convert to ToolInfo array
        const toolsList: ToolInfo[] = Object.entries(toolsMap).map(([name, data]) => {
          const lastUsed = generateLastUsed();
          const integrationType = getIntegrationType(name);
          const vendor = getToolVendor(name);
          return {
            name,
            category: categorizeTool(name),
            description: generateToolDescription(name),
            agents: data.agents,
            usageCount: data.usageCount,
            isActive: isToolActive(lastUsed),
            lastUsed,
            icon: getToolIcon(name),
            integrationType,
            vendor,
          };
        });

        // Sort by usage count (most used first)
        toolsList.sort((a, b) => b.usageCount - a.usageCount);
        setTools(toolsList);
        setLoading(false);
      })
      .catch(() => {
        setAgents(MOCK_AGENTS);
        
        // Build tools from mock data
        const toolsMap: Record<string, { agents: string[]; usageCount: number }> = {};
        MOCK_AGENTS.forEach((agent) => {
          agent.tools.forEach((toolName) => {
            if (!toolsMap[toolName]) {
              toolsMap[toolName] = { agents: [], usageCount: 0 };
            }
            toolsMap[toolName].agents.push(agent.name);
            toolsMap[toolName].usageCount++;
          });
        });

        const toolsList: ToolInfo[] = Object.entries(toolsMap).map(([name, data]) => {
          const lastUsed = generateLastUsed();
          const integrationType = getIntegrationType(name);
          const vendor = getToolVendor(name);
          return {
            name,
            category: categorizeTool(name),
            description: generateToolDescription(name),
            agents: data.agents,
            usageCount: data.usageCount,
            isActive: isToolActive(lastUsed),
            lastUsed,
            icon: getToolIcon(name),
            integrationType,
            vendor,
          };
        });

        toolsList.sort((a, b) => b.usageCount - a.usageCount);
        setTools(toolsList);
        setLoading(false);
      });
  }, []);

  // Generate tool description based on name
  const generateToolDescription = (toolName: string): string => {
    const lower = toolName.toLowerCase();
    if (lower.includes('aws') || lower.includes('azure') || lower.includes('gcp')) {
      return `Cloud provider integration for ${toolName}`;
    }
    if (lower.includes('dbt')) {
      return 'Data transformation and modeling tool';
    }
    if (lower.includes('great_expectations')) {
      return 'Data quality and validation framework';
    }
    if (lower.includes('temporal')) {
      return 'Workflow orchestration platform';
    }
    if (lower.includes('opa') || lower.includes('rego')) {
      return 'Policy as code framework';
    }
    if (lower.includes('prophet') || lower.includes('arima') || lower.includes('xgboost')) {
      return 'Time series forecasting and machine learning library';
    }
    if (lower.includes('prometheus') || lower.includes('datadog')) {
      return 'Monitoring and observability platform';
    }
    if (lower.includes('k8s') || lower.includes('kubernetes')) {
      return 'Kubernetes API integration';
    }
    if (lower.includes('jira') || lower.includes('atlassian')) {
      return 'Issue tracking and project management';
    }
    return `Tool for ${toolName.replace(/_/g, ' ')}`;
  };

  // Filter tools based on search and category
  const agentScopeByName = (name: string) => {
    const agent = agents.find((a) => a.name === name);
    return agent ? getAgentScope(agent.id) : 'shared';
  };

  const filteredTools = tools.filter(tool => {
    const searchValue = searchTerm.toLowerCase();
    const integrationLabel = getIntegrationDisplayName(tool.integrationType).toLowerCase();
    const matchesSearch = tool.name.toLowerCase().includes(searchValue) ||
                         tool.description.toLowerCase().includes(searchValue) ||
                         tool.vendor.toLowerCase().includes(searchValue) ||
                         integrationLabel.includes(searchValue) ||
                         tool.agents.some(a => a.toLowerCase().includes(searchValue));
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesScope = scopeFilter === 'all' ||
      tool.agents.some((a) => matchesScopeFilter(agentScopeByName(a), scopeFilter));
    return matchesSearch && matchesCategory && matchesScope;
  });

  // Group tools by category
  const toolsByCategory = filteredTools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, ToolInfo[]>);

  const toolsByIntegration = filteredTools.reduce((acc, tool) => {
    const key = tool.integrationType;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(tool);
    return acc;
  }, {} as Record<string, ToolInfo[]>);

  const toolsByVendor = filteredTools.reduce((acc, tool) => {
    if (!acc[tool.vendor]) {
      acc[tool.vendor] = [];
    }
    acc[tool.vendor].push(tool);
    return acc;
  }, {} as Record<string, ToolInfo[]>);

  // Statistics
  const totalTools = tools.length;
  const uniqueAgentsWithTools = new Set(tools.flatMap(t => t.agents)).size;
  const mostUsedTool = tools.length > 0 ? tools[0] : null;
  const totalVendors = new Set(tools.map(t => t.vendor)).size;
  const topVendorEntry = Object.entries(
    tools.reduce((acc, tool) => {
      acc[tool.vendor] = (acc[tool.vendor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1])[0];
  const topVendorLabel = topVendorEntry ? `${topVendorEntry[0]} (${topVendorEntry[1]} tools)` : '—';
  const avgToolsPerAgent = agents.length > 0 
    ? (tools.reduce((sum, t) => sum + t.usageCount, 0) / agents.length).toFixed(1)
    : '0';

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        {/* Header Section */}
        <VStack align="start" spacing={2}>
          <Heading size="lg">Tools for Agents</Heading>
          <Text fontSize="sm" color="gray.600">
            Manage and monitor all tools available to AI agents. View tool usage, categories, and agent assignments.
          </Text>
        </VStack>

        {/* Statistics Cards */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Card bg={bg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel fontSize="xs" color="gray.600">Total Tools</StatLabel>
                <StatNumber fontSize="2xl">{totalTools}</StatNumber>
                <StatHelpText fontSize="xs">Unique tools</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={bg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel fontSize="xs" color="gray.600">Agents Using Tools</StatLabel>
                <StatNumber fontSize="2xl">{uniqueAgentsWithTools}</StatNumber>
                <StatHelpText fontSize="xs">Active agents</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={bg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel fontSize="xs" color="gray.600">Active Vendors</StatLabel>
                <StatNumber fontSize="2xl">{totalVendors}</StatNumber>
                <StatHelpText fontSize="xs">Top vendor: {topVendorLabel}</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={bg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel fontSize="xs" color="gray.600">Avg Usage</StatLabel>
                <StatNumber fontSize="2xl">{avgToolsPerAgent}</StatNumber>
                <StatHelpText fontSize="xs">
                  {mostUsedTool ? `Most used: ${mostUsedTool.name} (${mostUsedTool.usageCount} agents)` : 'Most used: —'}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Search and Filter */}
        <HStack spacing={4}>
          <InputGroup maxW="500px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search tools by name, description, or agent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg={bg}
            />
          </InputGroup>
        </HStack>

        {/* Tabs for different views */}
        <Tabs colorScheme="blue">
          <TabList>
            <Tab>By Category</Tab>
            <Tab>By Integration</Tab>
            <Tab>By Vendor</Tab>
            <Tab>All Tools</Tab>
            <Tab>Usage Matrix</Tab>
          </TabList>

          <TabPanels>
            {/* By Category Tab */}
            <TabPanel px={0}>
              <VStack align="stretch" spacing={6} mt={4}>
                {Object.entries(TOOL_CATEGORIES).filter(([key]) => key !== 'other' || toolsByCategory['other']).map(([categoryKey, category]) => {
                  const categoryTools = toolsByCategory[categoryKey] || [];
                  if (categoryTools.length === 0) return null;

                  return (
                    <Box key={categoryKey}>
                      <HStack mb={4}>
                        <Badge colorScheme={category.color} fontSize="md" px={3} py={1}>
                          {category.name}
                        </Badge>
                        <Text fontSize="sm" color="gray.600">
                          {categoryTools.length} {categoryTools.length === 1 ? 'tool' : 'tools'}
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.500" mb={3}>
                        {category.description}
                      </Text>
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                        {categoryTools.map((tool) => (
                          <Card 
                            key={tool.name} 
                            bg={bg} 
                            borderWidth="1px" 
                            borderColor={borderColor}
                            _hover={{ 
                              boxShadow: 'lg',
                              transform: 'translateY(-2px)',
                              transition: 'all 0.2s',
                              borderColor: 'blue.300'
                            }}
                            transition="all 0.2s"
                          >
                            <CardBody>
                              <VStack align="stretch" spacing={3}>
                                <HStack justify="space-between">
                                  <HStack spacing={2}>
                                    {tool.icon}
                                    <Text fontWeight="semibold" fontSize="sm" noOfLines={1}>
                                      {tool.name}
                                    </Text>
                                  </HStack>
                                  <Badge colorScheme={category.color} fontSize="xs">
                                    {tool.usageCount} {tool.usageCount === 1 ? 'agent' : 'agents'}
                                  </Badge>
                                </HStack>
                                
                                {/* Status and Last Used */}
                                <HStack spacing={2}>
                                  <Badge 
                                    colorScheme={tool.isActive ? 'green' : 'gray'} 
                                    fontSize="xs"
                                  >
                                    {tool.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                  <HStack spacing={1}>
                                    <TimeIcon boxSize={3} color="gray.500" />
                                    <Text fontSize="xs" color="gray.600">
                                      {formatLastUsed(tool.lastUsed)}
                                    </Text>
                                  </HStack>
                                </HStack>
                                
                                <HStack spacing={2} flexWrap="wrap">
                                  <Badge colorScheme="gray" fontSize="xs">
                                    {tool.vendor}
                                  </Badge>
                                  <Badge colorScheme={INTEGRATION_TYPES[tool.integrationType]?.color || 'gray'} fontSize="xs">
                                    {getIntegrationDisplayName(tool.integrationType)}
                                  </Badge>
                                </HStack>

                                <Text fontSize="xs" color="gray.600">
                                  {tool.description}
                                </Text>
                                <Divider />
                                <Box>
                                  <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={1}>
                                    Used by:
                                  </Text>
                                  <HStack spacing={1} flexWrap="wrap">
                                    {tool.agents.slice(0, 3).map((agent, idx) => (
                                      <Badge key={idx} colorScheme="blue" fontSize="xs">
                                        {agent}
                                      </Badge>
                                    ))}
                                    {tool.agents.length > 3 && (
                                      <Badge colorScheme="gray" fontSize="xs">
                                        +{tool.agents.length - 3} more
                                      </Badge>
                                    )}
                                  </HStack>
                                </Box>
                              </VStack>
                            </CardBody>
                          </Card>
                        ))}
                      </SimpleGrid>
                    </Box>
                  );
                })}
              </VStack>
            </TabPanel>

            {/* By Integration Tab */}
            <TabPanel px={0}>
              <VStack align="stretch" spacing={6} mt={4}>
                {Object.entries(INTEGRATION_TYPES).map(([integrationKey, integrationMeta]) => {
                  const integrationTools = toolsByIntegration[integrationKey] || [];
                  if (integrationTools.length === 0) return null;

                  return (
                    <Box key={integrationKey}>
                      <HStack mb={4}>
                        <Badge colorScheme={integrationMeta.color} fontSize="md" px={3} py={1}>
                          {integrationMeta.name}
                        </Badge>
                        <Text fontSize="sm" color="gray.600">
                          {integrationTools.length} {integrationTools.length === 1 ? 'tool' : 'tools'}
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.500" mb={3}>
                        {integrationMeta.description}
                      </Text>
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                        {integrationTools.map((tool) => (
                          <Card
                            key={`${integrationKey}-${tool.name}`}
                            bg={bg}
                            borderWidth="1px"
                            borderColor={borderColor}
                            _hover={{
                              boxShadow: 'lg',
                              transform: 'translateY(-2px)',
                              transition: 'all 0.2s',
                              borderColor: 'blue.300',
                            }}
                            transition="all 0.2s"
                          >
                            <CardBody>
                              <VStack align="stretch" spacing={3}>
                                <HStack justify="space-between">
                                  <HStack spacing={2}>
                                    {tool.icon}
                                    <Text fontWeight="semibold" fontSize="sm" noOfLines={1}>
                                      {tool.name}
                                    </Text>
                                  </HStack>
                                  <Badge colorScheme={integrationMeta.color} fontSize="xs">
                                    {tool.usageCount} {tool.usageCount === 1 ? 'agent' : 'agents'}
                                  </Badge>
                                </HStack>
                                <HStack spacing={2} flexWrap="wrap">
                                  <Badge colorScheme={TOOL_CATEGORIES[tool.category]?.color || 'gray'} fontSize="xs">
                                    {TOOL_CATEGORIES[tool.category]?.name || tool.category}
                                  </Badge>
                                  <Badge colorScheme="gray" fontSize="xs">
                                    {tool.vendor}
                                  </Badge>
                                </HStack>
                                <HStack spacing={2}>
                                  <Badge colorScheme={tool.isActive ? 'green' : 'gray'} fontSize="xs">
                                    {tool.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                  <HStack spacing={1}>
                                    <TimeIcon boxSize={3} color="gray.500" />
                                    <Text fontSize="xs" color="gray.600">
                                      {formatLastUsed(tool.lastUsed)}
                                    </Text>
                                  </HStack>
                                </HStack>
                                <Text fontSize="xs" color="gray.600">
                                  {tool.description}
                                </Text>
                                <Divider />
                                <Box>
                                  <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={1}>
                                    Used by:
                                  </Text>
                                  <HStack spacing={1} flexWrap="wrap">
                                    {tool.agents.slice(0, 3).map((agent, idx) => (
                                      <Badge key={idx} colorScheme="blue" fontSize="xs">
                                        {agent}
                                      </Badge>
                                    ))}
                                    {tool.agents.length > 3 && (
                                      <Badge colorScheme="gray" fontSize="xs">
                                        +{tool.agents.length - 3} more
                                      </Badge>
                                    )}
                                  </HStack>
                                </Box>
                              </VStack>
                            </CardBody>
                          </Card>
                        ))}
                      </SimpleGrid>
                    </Box>
                  );
                })}
              </VStack>
            </TabPanel>

            {/* By Vendor Tab */}
            <TabPanel px={0}>
              <VStack align="stretch" spacing={4} mt={4}>
                <Accordion allowMultiple>
                  {Object.entries(toolsByVendor)
                    .sort((a, b) => {
                      if (b[1].length === a[1].length) {
                        return a[0].localeCompare(b[0]);
                      }
                      return b[1].length - a[1].length;
                    })
                    .map(([vendorName, vendorTools]) => (
                      <AccordionItem key={vendorName} border="none">
                        <AccordionButton
                          _expanded={{ bg: cardBg }}
                          borderWidth="1px"
                          borderColor={borderColor}
                          borderRadius="md"
                          px={4}
                          py={3}
                          mb={2}
                        >
                          <Box flex="1" textAlign="left">
                            <HStack justify="space-between">
                              <Text fontWeight="semibold">{vendorName}</Text>
                              <Badge colorScheme="blue">
                                {vendorTools.length} {vendorTools.length === 1 ? 'tool' : 'tools'}
                              </Badge>
                            </HStack>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                            {vendorTools.map((tool) => (
                              <Card
                                key={`${vendorName}-${tool.name}`}
                                bg={bg}
                                borderWidth="1px"
                                borderColor={borderColor}
                                _hover={{
                                  boxShadow: 'lg',
                                  transform: 'translateY(-2px)',
                                  transition: 'all 0.2s',
                                  borderColor: 'blue.300',
                                }}
                                transition="all 0.2s"
                              >
                                <CardBody>
                                  <VStack align="stretch" spacing={3}>
                                    <HStack justify="space-between">
                                      <HStack spacing={2}>
                                        {tool.icon}
                                        <Text fontWeight="semibold" fontSize="sm" noOfLines={1}>
                                          {tool.name}
                                        </Text>
                                      </HStack>
                                      <Badge colorScheme={tool.isActive ? 'green' : 'gray'} fontSize="xs">
                                        {tool.isActive ? 'Active' : 'Inactive'}
                                      </Badge>
                                    </HStack>
                                    <HStack spacing={2} flexWrap="wrap">
                                      <Badge
                                        colorScheme={INTEGRATION_TYPES[tool.integrationType]?.color || 'gray'}
                                        fontSize="xs"
                                      >
                                        {getIntegrationDisplayName(tool.integrationType)}
                                      </Badge>
                                      <Badge
                                        colorScheme={TOOL_CATEGORIES[tool.category]?.color || 'gray'}
                                        fontSize="xs"
                                      >
                                        {TOOL_CATEGORIES[tool.category]?.name || tool.category}
                                      </Badge>
                                      <Badge colorScheme="purple" fontSize="xs">
                                        {tool.usageCount} {tool.usageCount === 1 ? 'agent' : 'agents'}
                                      </Badge>
                                    </HStack>
                                    <HStack spacing={1}>
                                      <TimeIcon boxSize={3} color="gray.500" />
                                      <Text fontSize="xs" color="gray.600">
                                        {formatLastUsed(tool.lastUsed)}
                                      </Text>
                                    </HStack>
                                    <Text fontSize="xs" color="gray.600">
                                      {tool.description}
                                    </Text>
                                  </VStack>
                                </CardBody>
                              </Card>
                            ))}
                          </SimpleGrid>
                        </AccordionPanel>
                      </AccordionItem>
                    ))}
                </Accordion>
              </VStack>
            </TabPanel>

            {/* All Tools Tab */}
            <TabPanel px={0}>
              <TableContainer mt={4}>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Tool Name</Th>
                      <Th>Vendor</Th>
                      <Th>Integration</Th>
                      <Th>Status</Th>
                      <Th>Category</Th>
                      <Th>Description</Th>
                      <Th>Last Used</Th>
                      <Th>Used By</Th>
                      <Th>Usage Count</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredTools.map((tool) => (
                      <Tr key={tool.name} _hover={{ bg: cardBg }}>
                        <Td>
                          <HStack spacing={2}>
                            {tool.icon}
                            <Text fontWeight="semibold" fontSize="sm">
                              {tool.name}
                            </Text>
                          </HStack>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="gray.600">
                            {tool.vendor}
                          </Text>
                        </Td>
                        <Td>
                          <Badge colorScheme={INTEGRATION_TYPES[tool.integrationType]?.color || 'gray'} fontSize="xs">
                            {getIntegrationDisplayName(tool.integrationType)}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge 
                            colorScheme={tool.isActive ? 'green' : 'gray'} 
                            fontSize="xs"
                          >
                            {tool.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme={TOOL_CATEGORIES[tool.category]?.color || 'gray'} fontSize="xs">
                            {TOOL_CATEGORIES[tool.category]?.name || tool.category}
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="gray.600">
                            {tool.description}
                          </Text>
                        </Td>
                        <Td>
                          <HStack spacing={1}>
                            <TimeIcon boxSize={3} color="gray.500" />
                            <Text fontSize="sm" color="gray.600">
                              {formatLastUsed(tool.lastUsed)}
                            </Text>
                          </HStack>
                        </Td>
                        <Td>
                          <HStack spacing={1} flexWrap="wrap">
                            {tool.agents.slice(0, 2).map((agent, idx) => (
                              <Badge key={idx} colorScheme="blue" fontSize="xs">
                                {agent}
                              </Badge>
                            ))}
                            {tool.agents.length > 2 && (
                              <Tooltip label={tool.agents.join(', ')}>
                                <Badge colorScheme="gray" fontSize="xs" cursor="help">
                                  +{tool.agents.length - 2} more
                                </Badge>
                              </Tooltip>
                            )}
                          </HStack>
                        </Td>
                        <Td>
                          <Text fontSize="sm" fontWeight="semibold">
                            {tool.usageCount}
                          </Text>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </TabPanel>

            {/* Usage Matrix Tab */}
            <TabPanel px={0}>
              <VStack align="stretch" spacing={4} mt={4}>
                {agents.map((agent) => {
                  const agentTools = tools.filter(t => t.agents.includes(agent.name));
                  
                  return (
                    <Card key={agent.id} bg={bg} borderWidth="1px" borderColor={borderColor}>
                      <CardBody>
                        <VStack align="stretch" spacing={3}>
                          <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="semibold" fontSize="md">
                                {agent.name}
                              </Text>
                              <Badge colorScheme="blue" fontSize="xs">
                                {agentTools.length} {agentTools.length === 1 ? 'tool' : 'tools'}
                              </Badge>
                            </VStack>
                          </HStack>
                          <Divider />
                          <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={2}>
                            {agentTools.map((tool) => (
                              <Card key={tool.name} bg={cardBg} size="sm">
                                <CardBody p={2}>
                                  <VStack align="start" spacing={1}>
                                    <HStack spacing={1} w="100%">
                                      {tool.icon}
                                      <Text fontSize="xs" fontWeight="semibold" noOfLines={1} flex={1}>
                                        {tool.name}
                                      </Text>
                                    </HStack>
                                    <HStack spacing={1} w="100%" flexWrap="wrap">
                                      <Badge 
                                        colorScheme={tool.isActive ? 'green' : 'gray'} 
                                        fontSize="2xs"
                                      >
                                        {tool.isActive ? 'Active' : 'Inactive'}
                                      </Badge>
                                      <Badge 
                                        colorScheme={TOOL_CATEGORIES[tool.category]?.color || 'gray'} 
                                        fontSize="2xs"
                                      >
                                        {TOOL_CATEGORIES[tool.category]?.name || tool.category}
                                      </Badge>
                                      <Badge 
                                        colorScheme={INTEGRATION_TYPES[tool.integrationType]?.color || 'gray'} 
                                        fontSize="2xs"
                                      >
                                        {getIntegrationDisplayName(tool.integrationType)}
                                      </Badge>
                                      <Badge colorScheme="gray" fontSize="2xs">
                                        {tool.vendor}
                                      </Badge>
                                    </HStack>
                                    <HStack spacing={1} w="100%">
                                      <TimeIcon boxSize={2} color="gray.500" />
                                      <Text fontSize="2xs" color="gray.600">
                                        {formatLastUsed(tool.lastUsed)}
                                      </Text>
                                    </HStack>
                                  </VStack>
                                </CardBody>
                              </Card>
                            ))}
                          </SimpleGrid>
                        </VStack>
                      </CardBody>
                    </Card>
                  );
                })}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {filteredTools.length === 0 && (
          <Box textAlign="center" py={10}>
            <Text color="gray.500">No tools found matching your search criteria.</Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}

