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
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Spinner,
  Divider,
  Input,
  InputGroup,
  InputLeftElement,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { 
  SearchIcon, 
  ViewIcon,
  SettingsIcon,
  DownloadIcon,
  LinkIcon,
  WarningIcon,
  RepeatClockIcon,
  LockIcon,
  InfoIcon,
  CopyIcon,
  ChatIcon,
  StarIcon,
  CheckCircleIcon,
} from '@chakra-ui/icons';
import { useAdminScope, ScopeTag } from '../../contexts/AdminScopeContext';
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

interface Task {
  id: string;
  name: string;
  description: string;
  expected_input: string;
  expected_output: string;
  agent: string;
}

// Fallback mock data matching backend structure
const MOCK_AGENTS: Agent[] = [
  {
    id: 'finops-orchestrator',
    name: 'FinOps Orchestrator',
    role: 'Senior FinOps Platform Architect',
    goal: 'Deliver FinOps outcomes across Inform/Optimize/Operate phases',
    backstory: 'Central brain coordinating data, policies, and actions across the FinOps platform. Expert in workflow orchestration, SLA enforcement, and multi-agent coordination.',
    tools: ['dbt_rpc', 'great_expectations', 'temporal_client', 'cloud_vendor_sdks', 'opa_client', 'jira_client'],
    llms: ['gpt-4', 'claude-3-opus'],
    config: {
      max_iterations: 10,
      max_rpm: 20,
      temperature: 0.7,
      max_tokens: 4000,
      memory_enabled: true,
      verbose: true
    }
  },
  {
    id: 'ingestion-agent',
    name: 'Ingestion Agent',
    role: 'Senior Data Engineer',
    goal: 'Ensure reliable and timely data ingestion from all sources',
    backstory: 'Specialized in provisioning and managing data connectors across cloud providers. Expert in schema validation, dataset registration, and lineage tracking.',
    tools: ['AWS CUR/CE/Budgets/Organizations', 'Azure Cost Management Exports', 'GCP Billing Export & Recommender', 'Kubernetes Metrics API', 'Prometheus', 'Datadog', 'M365', 'Atlassian', 'GitHub', 'Snowflake', 'Salesforce'],
    llms: ['gpt-4', 'gpt-3.5-turbo'],
    config: {
      max_iterations: 5,
      max_rpm: 30,
      temperature: 0.3,
      max_tokens: 2000,
      memory_enabled: false,
      verbose: false
    }
  },
  {
    id: 'allocation-agent',
    name: 'Allocation Agent',
    role: 'Senior Cost Allocation Analyst',
    goal: 'Maximize cost allocation coverage and accuracy',
    backstory: 'Expert in cost allocation, tagging strategies, and resource ownership mapping. Specializes in auto-tagging, owner reconciliation, and allocation graph building.',
    tools: ['tagger', 'cmdb', 'git_inspector', 'k8s_api'],
    llms: ['gpt-4', 'claude-3-sonnet'],
    config: {
      max_iterations: 8,
      max_rpm: 25,
      temperature: 0.5,
      max_tokens: 3000,
      memory_enabled: true,
      verbose: false
    }
  },
  {
    id: 'anomaly-agent',
    name: 'Anomaly & RCA Agent',
    role: 'Senior Cost Anomaly Analyst',
    goal: 'Detect, analyze, and explain cost anomalies in real-time',
    backstory: 'Specialized in cost anomaly detection using advanced algorithms and correlation analysis. Expert in streaming anomaly detection, root cause analysis, and correlation with deployment events.',
    tools: ['prophet', 'adtk', 'correlation_engine', 'deployment_tracker', 'incident_feeds'],
    llms: ['gpt-4', 'claude-3-opus'],
    config: {
      max_iterations: 6,
      max_rpm: 15,
      temperature: 0.4,
      max_tokens: 3500,
      memory_enabled: true,
      verbose: true
    }
  },
  {
    id: 'optimization-agent',
    name: 'Optimization Agent',
    role: 'Senior Cloud Cost Optimizer',
    goal: 'Maximize cost savings through intelligent optimization recommendations',
    backstory: 'Expert in identifying cost optimization opportunities across infrastructure. Specializes in rightsizing, commitment planning, idle detection, and storage optimization.',
    tools: ['rightsizing_analyzer', 'ri_sp_cud_advisor', 'idle_detector', 'storage_tiering', 'k8s_optimizer', 'license_harvester'],
    llms: ['gpt-4', 'claude-3-opus'],
    config: {
      max_iterations: 7,
      max_rpm: 20,
      temperature: 0.6,
      max_tokens: 4000,
      memory_enabled: true,
      verbose: false
    }
  },
  {
    id: 'forecasting-agent',
    name: 'Forecasting Agent',
    role: 'Senior Financial Analyst',
    goal: 'Provide accurate cost forecasts and enable data-driven budget planning',
    backstory: 'Expert in financial modeling and predictive analytics for cloud cost planning. Specializes in time series forecasting, budget planning, and scenario modeling.',
    tools: ['arima', 'prophet', 'xgboost', 'scenario_planner', 'budget_modeler'],
    llms: ['gpt-4', 'claude-3-opus'],
    config: {
      max_iterations: 5,
      max_rpm: 15,
      temperature: 0.3,
      max_tokens: 5000,
      memory_enabled: true,
      verbose: false
    }
  },
  {
    id: 'governance-agent',
    name: 'Governance Agent',
    role: 'Senior FinOps Governance Engineer',
    goal: 'Ensure compliance with FinOps policies and governance standards',
    backstory: 'Specialized in policy enforcement and compliance across cloud infrastructure. Expert in policy as code, tagging enforcement, budget guardrails, and exception management.',
    tools: ['opa', 'rego', 'policy_engine', 'budget_service', 'exception_workflow'],
    llms: ['gpt-4', 'claude-3-sonnet'],
    config: {
      max_iterations: 8,
      max_rpm: 25,
      temperature: 0.2,
      max_tokens: 3000,
      memory_enabled: false,
      verbose: true
    }
  },
  {
    id: 'explainability-agent',
    name: 'Explainability & Audit Agent',
    role: 'Senior Audit & Compliance Analyst',
    goal: 'Provide complete explainability and immutable audit trails',
    backstory: 'Focused on providing transparency and auditability for all agent decisions. Expert in reasoning assembly, audit trail generation, and explainability.',
    tools: ['audit_ledger', 'reasoning_engine', 'signature_service', 'bundle_generator'],
    llms: ['gpt-4', 'claude-3-opus'],
    config: {
      max_iterations: 10,
      max_rpm: 20,
      temperature: 0.5,
      max_tokens: 6000,
      memory_enabled: true,
      verbose: true
    }
  },
  {
    id: 'vendor-license-agent',
    name: 'Vendor & License Agent',
    role: 'Senior Software Asset Manager',
    goal: 'Optimize license utilization and minimize true-up risks',
    backstory: 'Expert in software license management and vendor contract optimization. Specializes in SaaS contract tracking, usage vs entitlements, and true-up risk assessment.',
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
    goal: 'Segment applications by value and technical condition using the Gartner TIME framework',
    backstory: 'Built to continuously evaluate the software estate and surface invest/migrate/eliminate recommendations.',
    tools: ['time_lens', 'application_registry', 'lifecycle_dashboard'],
    llms: ['gpt-4', 'claude-3-sonnet'],
    config: {
      max_iterations: 6,
      max_rpm: 12,
      temperature: 0.4,
      max_tokens: 2800,
      memory_enabled: true,
      verbose: true
    }
  },
  {
    id: 'cost-value-agent',
    name: 'Cost-Value Quadrant Agent',
    role: 'Portfolio Value Analyst',
    goal: 'Map products against business value and TCO/risk to highlight prioritize/eliminate candidates',
    backstory: 'Combines telemetry with unit economics to keep the Cost–Value matrix current for stakeholders.',
    tools: ['cost_value_analyzer', 'telemetry_warehouse', 'unit_economics_engine'],
    llms: ['gpt-4', 'claude-3-haiku'],
    config: {
      max_iterations: 6,
      max_rpm: 12,
      temperature: 0.35,
      max_tokens: 2600,
      memory_enabled: true,
      verbose: true
    }
  },
  {
    id: 'adoption-growth-agent',
    name: 'Adoption Growth Matrix Agent',
    role: 'Product Adoption Analyst',
    goal: 'Track adoption and growth trajectories to classify products as Stars, Cash Cows, Question Marks, or Dogs',
    backstory: 'Ensures portfolio reviews include adoption velocity and strategic growth signals.',
    tools: ['adoption_telemetry', 'growth_modeler', 'portfolio_kpis'],
    llms: ['gpt-4', 'claude-3-haiku'],
    config: {
      max_iterations: 5,
      max_rpm: 10,
      temperature: 0.3,
      max_tokens: 2400,
      memory_enabled: true,
      verbose: false
    }
  },
  {
    id: 'pace-layer-agent',
    name: 'Pace-Layered Portfolio Agent',
    role: 'Enterprise Architecture Strategist',
    goal: 'Classify products as systems of record, differentiation, or innovation to set guardrails',
    backstory: 'Keeps architectural guardrails in sync with product lifecycle decisions.',
    tools: ['pace_layer_simulator', 'capability_map', 'architecture_registry'],
    llms: ['gpt-4', 'claude-3-sonnet'],
    config: {
      max_iterations: 4,
      max_rpm: 8,
      temperature: 0.3,
      max_tokens: 2200,
      memory_enabled: true,
      verbose: false
    }
  },
  {
    id: 'safe-portfolio-agent',
    name: 'SAFe Portfolio Flow Agent',
    role: 'Lean Portfolio Facilitator',
    goal: 'Monitor portfolio funnel, review, and MVP guardrails aligned to SAFe practices',
    backstory: 'Automates lean portfolio cadences and ensures request intake follows governance.',
    tools: ['portfolio_backlog_mgr', 'value_stream_mapper', 'flow_metrics_engine'],
    llms: ['gpt-4', 'claude-3-opus'],
    config: {
      max_iterations: 4,
      max_rpm: 10,
      temperature: 0.4,
      max_tokens: 2400,
      memory_enabled: true,
      verbose: true
    }
  },
  {
    id: 'tbm-capability-agent',
    name: 'TBM Capability Lens Agent',
    role: 'TBM & FinOps Capability Analyst',
    goal: 'Attribute software costs to business capabilities and track unit economics',
    backstory: 'Links FinOps and TBM perspectives to highlight capability-level investment efficiency.',
    tools: ['tbm_modeler', 'unit_cost_dashboard', 'capability_catalog'],
    llms: ['gpt-4', 'claude-3-haiku'],
    config: {
      max_iterations: 5,
      max_rpm: 10,
      temperature: 0.35,
      max_tokens: 2400,
      memory_enabled: true,
      verbose: false
    }
  },
  {
    id: 'sixr-modernization-agent',
    name: '6R Modernization Agent',
    role: 'Modernization Strategist',
    goal: 'Evaluate products across the 6R modernization spectrum to drive rationalization outcomes',
    backstory: 'Guides modernization backlogs by pairing technical condition with business value.',
    tools: ['sixr_engine', 'modernization_playbook', 'renewal_calendar'],
    llms: ['gpt-4', 'claude-3-sonnet'],
    config: {
      max_iterations: 6,
      max_rpm: 12,
      temperature: 0.35,
      max_tokens: 2600,
      memory_enabled: true,
      verbose: true
    }
  },
  {
    id: 'value-differentiation-agent',
    name: 'Value Differentiation Agent',
    role: 'Product Differentiation Analyst',
    goal: 'Classify features as delighters, performance, or hygiene using Kano models',
    backstory: 'Ensures rationalization choices protect differentiation while consolidating hygiene capabilities.',
    tools: ['kano_classifier', 'feature_usage_telemetry', 'survey_insights'],
    llms: ['gpt-4', 'claude-3-haiku'],
    config: {
      max_iterations: 5,
      max_rpm: 10,
      temperature: 0.3,
      max_tokens: 2400,
      memory_enabled: true,
      verbose: false
    }
  },
  {
    id: 'weighted-scoring-agent',
    name: 'Weighted Scoring Agent',
    role: 'Portfolio Scoring Analyst',
    goal: 'Calculate weighted scores across business value, fit, TCO, risk, integration, and vendor health',
    backstory: 'Turns scoring worksheets and FinOps metrics into prioritized action plans.',
    tools: ['weighted_scoring_template', 'cost_telemetry', 'governance_workbench'],
    llms: ['gpt-4', 'claude-3-sonnet'],
    config: {
      max_iterations: 6,
      max_rpm: 10,
      temperature: 0.3,
      max_tokens: 2400,
      memory_enabled: true,
      verbose: false
    }
  },
  {
    id: 'vendor-risk-agent',
    name: 'Vendor Risk Agent',
    role: 'Vendor Risk Assessor',
    goal: 'Evaluate vendor financial health and compliance posture for the portfolio',
    backstory: 'Monitors vendor stability, certifications, and data residency commitments.',
    tools: ['vendor_risk_engine', 'financial_monitor', 'compliance_registry'],
    llms: ['gpt-4', 'claude-3-sonnet'],
    config: {
      max_iterations: 4,
      max_rpm: 12,
      temperature: 0.35,
      max_tokens: 2200,
      memory_enabled: true,
      verbose: false
    }
  },
  {
    id: 'operational-fit-agent',
    name: 'Operational Fit Agent',
    role: 'Controls & Guardrails Auditor',
    goal: 'Validate SSO/SCIM, role-based controls, audit logging, and SLA adherence',
    backstory: 'Keeps SaaS intake aligned with enterprise guardrails and operational resilience requirements.',
    tools: ['control_library', 'sso_checker', 'audit_log_analyzer'],
    llms: ['gpt-4', 'claude-3-haiku'],
    config: {
      max_iterations: 4,
      max_rpm: 10,
      temperature: 0.3,
      max_tokens: 2200,
      memory_enabled: true,
      verbose: false
    }
  },
  {
    id: 'exit-risk-agent',
    name: 'Exit Risk Agent',
    role: 'Software Exit Planner',
    goal: 'Assess vendor lock-in, export readiness, and switching cost scenarios',
    backstory: 'Ensures every product has an exit strategy before renewal negotiations.',
    tools: ['exit_planner', 'data_export_validator', 'switching_cost_modeler'],
    llms: ['gpt-4', 'claude-3-sonnet'],
    config: {
      max_iterations: 4,
      max_rpm: 10,
      temperature: 0.35,
      max_tokens: 2200,
      memory_enabled: true,
      verbose: false
    }
  },
  {
    id: 'model-router-agent',
    name: 'Model Router Agent',
    role: 'AI Model Routing Specialist',
    goal: 'Route workloads to the most cost-effective model tier without quality regression',
    backstory: 'Expert in model tiering, latency-cost tradeoffs, and provider routing for agentic workflows.',
    tools: ['model_catalog', 'latency_profiler', 'quality_scorer', 'provider_router'],
    llms: ['gpt-4', 'claude-3-sonnet'],
    config: { max_iterations: 6, max_rpm: 25, temperature: 0.4, max_tokens: 3000, memory_enabled: true, verbose: false }
  },
  {
    id: 'token-optimizer-agent',
    name: 'Token Optimizer Agent',
    role: 'Token Efficiency Engineer',
    goal: 'Reduce token volume through caching, prompt trimming, and retry policy tuning',
    backstory: 'Specializes in prompt caching, context compression, and retry storm prevention for LLM workloads.',
    tools: ['prompt_cache', 'token_analyzer', 'retry_policy_engine', 'context_compressor'],
    llms: ['gpt-4', 'gpt-3.5-turbo'],
    config: { max_iterations: 5, max_rpm: 30, temperature: 0.3, max_tokens: 2500, memory_enabled: false, verbose: false }
  },
  {
    id: 'gpu-finops-agent',
    name: 'GPU FinOps Agent',
    role: 'GPU Infrastructure Analyst',
    goal: 'Maximize GPU utilization and right-size training/inference clusters',
    backstory: 'Monitors GPU clusters, spot scheduling, and training vs inference cost allocation.',
    tools: ['gpu_metrics', 'cluster_autoscaler', 'spot_scheduler', 'workload_profiler'],
    llms: ['gpt-4', 'claude-3-opus'],
    config: { max_iterations: 5, max_rpm: 15, temperature: 0.35, max_tokens: 3500, memory_enabled: true, verbose: true }
  }
];

const MOCK_TASKS: Task[] = [
  {
    id: 'task-orch-1',
    name: 'Plan Multi-Agent Workflow',
    description: 'Plan and coordinate multi-agent workflows for anomaly resolution',
    expected_input: 'Workflow requests, anomaly alerts, SLA definitions, agent status updates',
    expected_output: 'Workflow execution plan with assigned agents and tasks',
    agent: 'finops-orchestrator'
  },
  {
    id: 'task-orch-2',
    name: 'Enforce SLA Compliance',
    description: 'Enforce SLA compliance across all FinOps operations',
    expected_input: 'SLA definitions, policy rules, workflow execution status',
    expected_output: 'SLA compliance report and remediation actions',
    agent: 'finops-orchestrator'
  },
  {
    id: 'task-orch-3',
    name: 'Monitor FinOps Cadence',
    description: 'Monitor and orchestrate FinOps cadence (daily/weekly/monthly cycles)',
    expected_input: 'Cadence schedules, workflow status, agent availability',
    expected_output: 'Cadence status dashboard and next action items',
    agent: 'finops-orchestrator'
  },
  {
    id: 'task-ingest-1',
    name: 'Provision Data Connectors',
    description: 'Provision and configure data connectors for cloud billing exports',
    expected_input: 'Connector configurations, API credentials, cloud provider details',
    expected_output: 'Active connectors with validation status',
    agent: 'ingestion-agent'
  },
  {
    id: 'task-ingest-2',
    name: 'Validate Schemas and Register Datasets',
    description: 'Validate schemas and register datasets with lineage tracking',
    expected_input: 'Schema definitions, raw data samples, metadata requirements',
    expected_output: 'Validated datasets with complete metadata and lineage',
    agent: 'ingestion-agent'
  },
  {
    id: 'task-ingest-3',
    name: 'Monitor Ingestion Health',
    description: 'Monitor ingestion health and trigger alerts on failures',
    expected_input: 'Connector status, data freshness metrics, error logs',
    expected_output: 'Ingestion health dashboard and alert notifications',
    agent: 'ingestion-agent'
  },
  {
    id: 'task-alloc-1',
    name: 'Auto-tag Assets and Reconcile Owners',
    description: 'Auto-tag assets and reconcile owner/app/env metadata',
    expected_input: 'Resource metadata, CMDB data, Git metadata, tagging policies',
    expected_output: 'Tagged resources with ownership mapping',
    agent: 'allocation-agent'
  },
  {
    id: 'task-alloc-3',
    name: 'Enforce Tagging Standards',
    description: 'Enforce tagging standards and remediate gaps > 2% in prod accounts',
    expected_input: 'Tagging policies, resource inventory, compliance thresholds',
    expected_output: 'Remediation PRs, tickets, and report with coverage by BU',
    agent: 'allocation-agent'
  },
  {
    id: 'task-anom-1',
    name: 'Detect Cost Anomalies',
    description: 'Detect cost spikes using streaming detectors (prophet/ADTK)',
    expected_input: 'Cost time series, historical baselines, detection parameters',
    expected_output: 'Anomaly alerts with severity and confidence scores',
    agent: 'anomaly-agent'
  },
  {
    id: 'task-anom-2',
    name: 'Correlate Anomalies with Events',
    description: 'Correlate anomalies with deploys, autoscaling, and incident feeds',
    expected_input: 'Anomaly alerts, deployment events, scaling events, incident data',
    expected_output: 'Correlation reports linking anomalies to root causes',
    agent: 'anomaly-agent'
  },
  {
    id: 'task-anom-3',
    name: 'Perform Root Cause Analysis',
    description: 'Perform root cause analysis and generate resolution recommendations',
    expected_input: 'Anomaly details, correlation data, historical patterns',
    expected_output: 'RCA reports with recommended actions',
    agent: 'anomaly-agent'
  },
  {
    id: 'task-opt-1',
    name: 'Recommend Rightsizing Opportunities',
    description: 'Recommend rightsizing opportunities for underutilized resources',
    expected_input: 'Resource utilization data, cost data, performance metrics',
    expected_output: 'Rightsizing recommendations with estimated savings',
    agent: 'optimization-agent'
  },
  {
    id: 'task-opt-2',
    name: 'Analyze Commitment Coverage',
    description: 'Analyze RI/SP/CUD coverage and recommend commitment purchases',
    expected_input: 'Usage patterns, commitment inventory, pricing data',
    expected_output: 'Commitment recommendations with ROI analysis',
    agent: 'optimization-agent'
  },
  {
    id: 'task-opt-3',
    name: 'Identify Idle Resources',
    description: 'Identify and recommend cleanup of idle resources',
    expected_input: 'Resource utilization, cost data, idle detection rules',
    expected_output: 'Idle resource list with cleanup recommendations',
    agent: 'optimization-agent'
  },
  {
    id: 'task-forecast-1',
    name: 'Generate Cost Forecasts',
    description: 'Generate multivariate time series forecasts using ARIMA/Prophet/XGBoost',
    expected_input: 'Historical cost data, usage trends, business calendar',
    expected_output: 'Cost forecasts with confidence intervals',
    agent: 'forecasting-agent'
  },
  {
    id: 'task-forecast-3',
    name: 'Create Scenario Models',
    description: 'Create scenario planning models for different growth assumptions',
    expected_input: 'Base forecasts, growth assumptions, scenario parameters',
    expected_output: 'Scenario-based forecasts (best/expected/worst case)',
    agent: 'forecasting-agent'
  },
  {
    id: 'task-gov-1',
    name: 'Enforce Tagging Policies',
    description: 'Enforce tagging policies using OPA/Rego policy as code',
    expected_input: 'Policy rules, resource metadata, tagging data',
    expected_output: 'Policy compliance reports and remediation actions',
    agent: 'governance-agent'
  },
  {
    id: 'task-gov-2',
    name: 'Monitor Budget Guardrails',
    description: 'Monitor budget guardrails and trigger alerts on breaches',
    expected_input: 'Budget definitions, cost data, guardrail thresholds',
    expected_output: 'Budget breach alerts and containment recommendations',
    agent: 'governance-agent'
  },
  {
    id: 'task-expl-1',
    name: 'Assemble Reasoning Trails',
    description: 'Assemble step-by-step reasoning for all agent decisions',
    expected_input: 'Agent decision logs, tool calls, feature data',
    expected_output: 'Detailed reasoning logs with decision paths',
    agent: 'explainability-agent'
  },
  {
    id: 'task-expl-2',
    name: 'Generate Audit Bundles',
    description: 'Produce immutable audit bundles with signatures',
    expected_input: 'Decision logs, tool calls, approvals, feature data',
    expected_output: 'Signed audit bundles stored in object store',
    agent: 'explainability-agent'
  },
  {
    id: 'task-vendor-1',
    name: 'Track SaaS Contracts',
    description: 'Track SaaS/marketplace contracts and renewal dates',
    expected_input: 'Contract data, renewal dates, vendor information',
    expected_output: 'Contract inventory with renewal calendar',
    agent: 'vendor-license-agent'
  },
  {
    id: 'task-expl-3',
    name: 'Explain Budget Guardrail Exceptions',
    description: 'Produce explainability package for exceeded guardrails with recommended mitigations',
    expected_input: 'Guardrail violations, spend telemetry, policy source, stakeholder list',
    expected_output: 'Narrative explaining breach, root cause, recommended compensating controls',
    agent: 'explainability-agent'
  },
  {
    id: 'task-portfolio-time-report',
    name: 'Generate TIME Segmentation',
    description: 'Evaluate applications with the Gartner TIME framework to propose invest/migrate decisions',
    expected_input: 'Application registry, technical condition metrics, business value scores',
    expected_output: 'TIME segmentation with recommended actions per product',
    agent: 'portfolio-time-agent'
  },
  {
    id: 'task-cost-value-analysis',
    name: 'Run Cost–Value Quadrant Analysis',
    description: 'Map products against business value and cost/risk for prioritization',
    expected_input: 'Cost telemetry, unit economics, business value scores',
    expected_output: 'Quadrant assignments with recommended optimize/eliminate actions',
    agent: 'cost-value-agent'
  },
  {
    id: 'task-adoption-growth-matrix',
    name: 'Build Adoption/Growth Matrix',
    description: 'Classify products using adoption and growth trends to identify Stars, Cash Cows, Question Marks, and Dogs',
    expected_input: 'Adoption telemetry, growth metrics, strategic importance',
    expected_output: 'BCG matrix with follow-up recommendations',
    agent: 'adoption-growth-agent'
  },
  {
    id: 'task-pace-layered-evaluation',
    name: 'Perform Pace-Layered Evaluation',
    description: 'Determine system of record/differentiation/innovation classification for each product',
    expected_input: 'Capability map, customization level, release cadence',
    expected_output: 'Pace-layered assignments with guardrails',
    agent: 'pace-layer-agent'
  },
  {
    id: 'task-safe-portfolio-flow',
    name: 'Monitor SAFe Portfolio Flow',
    description: 'Track funnel → review → MVP/guardrail flow for software intake',
    expected_input: 'Portfolio backlog, lean metrics, governance policies',
    expected_output: 'Portfolio flow dashboard with intake decisions',
    agent: 'safe-portfolio-agent'
  },
  {
    id: 'task-tbm-capability-report',
    name: 'Generate TBM Capability Report',
    description: 'Link software costs to business capabilities and unit economics',
    expected_input: 'TBM cost model, capability catalog, usage telemetry',
    expected_output: 'Capability cost report with unit cost insights',
    agent: 'tbm-capability-agent'
  },
  {
    id: 'task-sixr-modernization',
    name: 'Create 6R Modernization Plan',
    description: 'Recommend retain/rehost/replatform/refactor/repurchase/retire actions',
    expected_input: 'Modernization assessments, renewal dates, technical condition scores',
    expected_output: '6R modernization roadmap with sequencing',
    agent: 'sixr-modernization-agent'
  },
  {
    id: 'task-value-differentiation',
    name: 'Evaluate Value Differentiation',
    description: 'Classify features via Kano model to protect differentiators while consolidating hygiene capabilities',
    expected_input: 'Feature usage telemetry, stakeholder surveys, differentiation scoring',
    expected_output: 'Kano classification with keep vs. standardize recommendations',
    agent: 'value-differentiation-agent'
  },
  {
    id: 'task-weighted-scoring',
    name: 'Compute Weighted Scoring',
    description: 'Generate weighted scores across cost, value, risk, and strategic alignment',
    expected_input: 'Scoring template, FinOps metrics, vendor health data',
    expected_output: 'Prioritized action list with weighted scores and decision notes',
    agent: 'weighted-scoring-agent'
  },
  {
    id: 'task-vendor-risk',
    name: 'Assess Vendor Risk',
    description: 'Evaluate vendor financial health, compliance posture, and data residency',
    expected_input: 'Vendor questionnaires, financial metrics, certification evidence',
    expected_output: 'Vendor risk report with mitigation plan',
    agent: 'vendor-risk-agent'
  },
  {
    id: 'task-operational-fit',
    name: 'Validate Operational Fit',
    description: 'Check SSO/SCIM, role-based access, audit logs, and SLA adherence',
    expected_input: 'Access control configs, audit log samples, SLA documents',
    expected_output: 'Operational readiness assessment with remediation actions',
    agent: 'operational-fit-agent'
  },
  {
    id: 'task-exit-risk',
    name: 'Analyze Exit Risk',
    description: 'Assess vendor lock-in, data export readiness, and switching costs',
    expected_input: 'Data export formats, contract clauses, migration plans',
    expected_output: 'Exit readiness report with contingency steps',
    agent: 'exit-risk-agent'
  },
  {
    id: 'task-model-tier-1',
    name: 'Recommend Model Tiering',
    description: 'Analyze workflow steps and recommend economy vs premium model routing',
    expected_input: 'Workflow trace data, quality SLAs, latency requirements',
    expected_output: 'Tiering plan with projected token savings',
    agent: 'model-router-agent'
  },
  {
    id: 'task-token-opt-1',
    name: 'Optimize Token Usage',
    description: 'Identify prompt caching and context trimming opportunities',
    expected_input: 'Prompt templates, token usage logs, retry metrics',
    expected_output: 'Token reduction plan with caching configuration',
    agent: 'token-optimizer-agent'
  },
  {
    id: 'task-gpu-rightsize-1',
    name: 'Right-size GPU Clusters',
    description: 'Analyze GPU utilization and recommend cluster scaling changes',
    expected_input: 'GPU metrics, workload schedules, cost data',
    expected_output: 'Rightsizing recommendations with utilization targets',
    agent: 'gpu-finops-agent'
  }
];

export default function AgentsAndTasks() {
  const { scopeFilter } = useAdminScope();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
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
        setAgents(data.data || MOCK_AGENTS);
      })
      .catch(() => {
        setAgents(MOCK_AGENTS);
      });

    // Fetch tasks
    fetch(`${CREW_API_URL}/v1/tasks`, { 
      signal: AbortSignal.timeout(2000) 
    })
      .then((r) => {
        if (!r.ok) throw new Error('Service not available');
        return r.json();
      })
      .then((data) => {
        setTasks(data.data || MOCK_TASKS);
        setLoading(false);
      })
      .catch(() => {
        setTasks(MOCK_TASKS);
        setLoading(false);
      });
  }, []);

  // Filter agents based on search
  const filteredAgents = agents.filter(agent =>
    matchesScopeFilter(getAgentScope(agent.id), scopeFilter) &&
    (agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.goal.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.backstory.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredTasks = tasks.filter(task =>
    matchesScopeFilter(getAgentScope(task.agent), scopeFilter) &&
    (task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.agent.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get tasks for a specific agent
  const getTasksForAgent = (agentId: string): Task[] => {
    return tasks.filter(task => task.agent === agentId);
  };

  // Get agent name by ID
  const getAgentName = (agentId: string): string => {
    const agent = agents.find(a => a.id === agentId);
    return agent ? agent.name : agentId;
  };

  // Get icon for agent based on ID
  const getAgentIcon = (agentId: string) => {
    const iconProps = { boxSize: 5, color: 'blue.500' };
    switch (agentId) {
      case 'finops-orchestrator':
        return <SettingsIcon {...iconProps} />;
      case 'ingestion-agent':
        return <DownloadIcon {...iconProps} />;
      case 'allocation-agent':
        return <LinkIcon {...iconProps} />;
      case 'anomaly-agent':
        return <WarningIcon {...iconProps} />;
      case 'optimization-agent':
        return <StarIcon {...iconProps} />;
      case 'forecasting-agent':
        return <RepeatClockIcon {...iconProps} />;
      case 'governance-agent':
        return <LockIcon {...iconProps} />;
      case 'explainability-agent':
        return <InfoIcon {...iconProps} />;
      case 'vendor-license-agent':
        return <CopyIcon {...iconProps} />;
      default:
        return <SettingsIcon {...iconProps} />;
    }
  };

  // Handle view agent details
  const handleViewAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    onOpen();
  };

  // Statistics
  const totalAgents = filteredAgents.length;
  const totalTasks = filteredTasks.length;
  const totalTools = new Set(filteredAgents.flatMap(a => a.tools)).size;
  const avgToolsPerAgent = filteredAgents.length > 0 
    ? (filteredAgents.reduce((sum, a) => sum + a.tools.length, 0) / filteredAgents.length).toFixed(1)
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
          <Heading size="lg">Agents & Tasks</Heading>
          <Text fontSize="sm" color="gray.600">
            Manage and monitor all AI agents and their assigned tasks in the FinOps platform.
          </Text>
        </VStack>

        {/* Statistics Cards */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Card bg={bg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel fontSize="xs" color="gray.600">Total Agents</StatLabel>
                <StatNumber fontSize="2xl">{totalAgents}</StatNumber>
                <StatHelpText fontSize="xs">Active agents</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={bg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel fontSize="xs" color="gray.600">Total Tasks</StatLabel>
                <StatNumber fontSize="2xl">{totalTasks}</StatNumber>
                <StatHelpText fontSize="xs">Available tasks</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={bg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel fontSize="xs" color="gray.600">Unique Tools</StatLabel>
                <StatNumber fontSize="2xl">{totalTools}</StatNumber>
                <StatHelpText fontSize="xs">Across all agents</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={bg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel fontSize="xs" color="gray.600">Avg Tools/Agent</StatLabel>
                <StatNumber fontSize="2xl">{avgToolsPerAgent}</StatNumber>
                <StatHelpText fontSize="xs">Average tool count</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Search Bar */}
        <Box>
          <InputGroup maxW="500px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search agents or tasks by name, description, or agent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg={bg}
            />
          </InputGroup>
        </Box>

        {/* Tabs for Agents and Tasks */}
        <Tabs index={selectedTab} onChange={setSelectedTab} colorScheme="blue">
          <TabList>
            <Tab>Agents View</Tab>
            <Tab>Tasks View</Tab>
          </TabList>

          <TabPanels>
            {/* Agents Tab */}
            <TabPanel px={0}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mt={4}>
                {filteredAgents.map((agent) => {
                  const agentTasks = getTasksForAgent(agent.id);
                  
                  return (
                    <Card 
                      key={agent.id} 
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
                        <VStack align="stretch" spacing={4}>
                          {/* Agent Header */}
                          <VStack align="start" spacing={2}>
                            <HStack justify="space-between" w="100%">
                              <Heading size="md">{agent.name}</Heading>
                              <IconButton
                                aria-label="View agent details"
                                icon={<ViewIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="blue"
                                onClick={() => handleViewAgent(agent)}
                              />
                            </HStack>
                            <HStack spacing={2} flexWrap="wrap">
                              <ScopeTag domain={getAgentScope(agent.id)} />
                              <Badge colorScheme="purple" fontSize="xs">
                                {agentTasks.length} {agentTasks.length === 1 ? 'Task' : 'Tasks'}
                              </Badge>
                              <Badge colorScheme="green" fontSize="xs">
                                {agent.tools.length} Tools
                              </Badge>
                              {agent.llms && agent.llms.length > 0 && (
                                <Badge colorScheme="blue" fontSize="xs">
                                  {agent.llms.length} {agent.llms.length === 1 ? 'LLM' : 'LLMs'}
                                </Badge>
                              )}
                            </HStack>
                          </VStack>

                          <Divider />

                          {/* Backstory - Without heading */}
                          <Text fontSize="sm" color="gray.700">
                            {agent.backstory}
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </TabPanel>

            {/* Tasks Tab */}
            <TabPanel px={0}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mt={4}>
                {filteredTasks.map((task) => (
                  <Card 
                    key={task.id} 
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
                      <VStack align="stretch" spacing={4}>
                        {/* Task Header */}
                        <VStack align="start" spacing={2}>
                          <HStack justify="space-between" w="100%">
                            <Heading size="md">{task.name}</Heading>
                          </HStack>
                          <Badge colorScheme="blue" fontSize="xs" alignSelf="flex-start">
                            {getAgentName(task.agent)}
                          </Badge>
                        </VStack>

                        <Divider />

                        {/* Task Description */}
                        <Box>
                          <Text fontSize="sm" color="gray.700">
                            {task.description}
                          </Text>
                        </Box>

                        {/* Expected Input and Output */}
                        <Accordion allowMultiple>
                          <AccordionItem border="none">
                            <AccordionButton px={0} py={2}>
                              <Box flex="1" textAlign="left">
                                <HStack spacing={2}>
                                  <CheckCircleIcon boxSize={4} color="blue.500" />
                                  <Text fontWeight="semibold" fontSize="sm">
                                    Expected Input
                                  </Text>
                                </HStack>
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel px={0} pb={2}>
                              <Box bg={cardBg} p={3} borderRadius="md">
                                <Text fontSize="xs" color="gray.600">
                                  {task.expected_input}
                                </Text>
                              </Box>
                            </AccordionPanel>
                          </AccordionItem>

                          <AccordionItem border="none">
                            <AccordionButton px={0} py={2}>
                              <Box flex="1" textAlign="left">
                                <HStack spacing={2}>
                                  <CheckCircleIcon boxSize={4} color="green.500" />
                                  <Text fontWeight="semibold" fontSize="sm">
                                    Expected Output
                                  </Text>
                                </HStack>
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel px={0} pb={2}>
                              <Box bg={cardBg} p={3} borderRadius="md">
                                <Text fontSize="xs" color="gray.600">
                                  {task.expected_output}
                                </Text>
                              </Box>
                            </AccordionPanel>
                          </AccordionItem>
                        </Accordion>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {filteredAgents.length === 0 && filteredTasks.length === 0 && (
          <Box textAlign="center" py={10}>
            <Text color="gray.500">No results found matching your search.</Text>
          </Box>
        )}
      </VStack>

      {/* Agent Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              {selectedAgent && getAgentIcon(selectedAgent.id)}
              <Heading size="md">{selectedAgent?.name}</Heading>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedAgent && (
              <VStack align="stretch" spacing={6}>
                {/* Role */}
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2}>
                    ROLE
                  </Text>
                  <Text fontSize="sm" fontWeight="semibold" color="blue.600">
                    {selectedAgent.role}
                  </Text>
                </Box>

                {/* Goal */}
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2}>
                    GOAL
                  </Text>
                  <Text fontSize="sm" fontWeight="semibold" color="blue.600">
                    {selectedAgent.goal}
                  </Text>
                </Box>

                {/* Backstory */}
                <Box>
                  <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2}>
                    BACKSTORY
                  </Text>
                  <Text fontSize="sm">{selectedAgent.backstory}</Text>
                </Box>

                {/* Configuration Parameters */}
                {selectedAgent.config && (
                  <Box>
                    <HStack mb={2}>
                      <SettingsIcon boxSize={4} color="gray.500" />
                      <Text fontSize="xs" fontWeight="bold" color="gray.500">
                        CONFIG PARAMS
                      </Text>
                    </HStack>
                    <Card bg={cardBg} size="sm">
                      <CardBody p={3}>
                        <SimpleGrid columns={2} spacing={4}>
                          {selectedAgent.config.max_iterations !== undefined && (
                            <Box>
                              <Text fontSize="xs" color="gray.600" mb={0.5}>
                                Max Iterations
                              </Text>
                              <Text fontSize="sm" fontWeight="semibold">
                                {selectedAgent.config.max_iterations}
                              </Text>
                            </Box>
                          )}
                          {selectedAgent.config.max_rpm !== undefined && (
                            <Box>
                              <Text fontSize="xs" color="gray.600" mb={0.5}>
                                Max RPM
                              </Text>
                              <Text fontSize="sm" fontWeight="semibold">
                                {selectedAgent.config.max_rpm}
                              </Text>
                            </Box>
                          )}
                          {selectedAgent.config.temperature !== undefined && (
                            <Box>
                              <Text fontSize="xs" color="gray.600" mb={0.5}>
                                Temperature
                              </Text>
                              <Text fontSize="sm" fontWeight="semibold">
                                {selectedAgent.config.temperature}
                              </Text>
                            </Box>
                          )}
                          {selectedAgent.config.max_tokens !== undefined && (
                            <Box>
                              <Text fontSize="xs" color="gray.600" mb={0.5}>
                                Max Tokens
                              </Text>
                              <Text fontSize="sm" fontWeight="semibold">
                                {selectedAgent.config.max_tokens}
                              </Text>
                            </Box>
                          )}
                          {selectedAgent.config.memory_enabled !== undefined && (
                            <Box>
                              <Text fontSize="xs" color="gray.600" mb={0.5}>
                                Memory Enabled
                              </Text>
                              <Text fontSize="sm" fontWeight="semibold">
                                {selectedAgent.config.memory_enabled ? 'Yes' : 'No'}
                              </Text>
                            </Box>
                          )}
                          {selectedAgent.config.verbose !== undefined && (
                            <Box>
                              <Text fontSize="xs" color="gray.600" mb={0.5}>
                                Verbose
                              </Text>
                              <Text fontSize="sm" fontWeight="semibold">
                                {selectedAgent.config.verbose ? 'Yes' : 'No'}
                              </Text>
                            </Box>
                          )}
                        </SimpleGrid>
                      </CardBody>
                    </Card>
                  </Box>
                )}

                <Divider />

                {/* Tools, LLMs & Tasks - Collapsible */}
                <Accordion allowMultiple>
                  {/* Tools */}
                  <AccordionItem border="none">
                    <AccordionButton px={0} py={2}>
                      <Box flex="1" textAlign="left">
                        <HStack spacing={2}>
                          <SettingsIcon boxSize={4} color="purple.500" />
                          <Text fontWeight="semibold" fontSize="sm">
                            Tools ({selectedAgent.tools.length})
                          </Text>
                        </HStack>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel px={0} pb={2}>
                      <HStack spacing={2} flexWrap="wrap">
                        {selectedAgent.tools.map((tool, index) => (
                          <Badge key={index} colorScheme="purple" fontSize="xs">
                            {tool}
                          </Badge>
                        ))}
                      </HStack>
                    </AccordionPanel>
                  </AccordionItem>

                  {/* LLMs */}
                  {selectedAgent.llms && selectedAgent.llms.length > 0 && (
                    <AccordionItem border="none">
                      <AccordionButton px={0} py={2}>
                        <Box flex="1" textAlign="left">
                          <HStack spacing={2}>
                            <ChatIcon boxSize={4} color="green.500" />
                            <Text fontWeight="semibold" fontSize="sm">
                              LLMs ({selectedAgent.llms.length})
                            </Text>
                          </HStack>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel px={0} pb={2}>
                        <HStack spacing={2} flexWrap="wrap">
                          {selectedAgent.llms.map((llm, index) => (
                            <Badge key={index} colorScheme="green" fontSize="xs">
                              {llm}
                            </Badge>
                          ))}
                        </HStack>
                      </AccordionPanel>
                    </AccordionItem>
                  )}

                  {/* Tasks */}
                  {(() => {
                    const agentTasks = getTasksForAgent(selectedAgent.id);
                    return agentTasks.length > 0 ? (
                      <AccordionItem border="none">
                        <AccordionButton px={0} py={2}>
                          <Box flex="1" textAlign="left">
                            <HStack spacing={2}>
                              <CheckCircleIcon boxSize={4} color="blue.500" />
                              <Text fontWeight="semibold" fontSize="sm">
                                Tasks ({agentTasks.length})
                              </Text>
                            </HStack>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel px={0} pb={2}>
                          <VStack align="stretch" spacing={2} mt={2}>
                            {agentTasks.map((task) => (
                              <Card key={task.id} bg={cardBg} size="sm">
                                <CardBody p={3}>
                                  <VStack align="stretch" spacing={2}>
                                    <Text fontSize="sm" fontWeight="semibold">
                                      {task.name}
                                    </Text>
                                    <Text fontSize="xs" color="gray.600">
                                      {task.description}
                                    </Text>
                                  </VStack>
                                </CardBody>
                              </Card>
                            ))}
                          </VStack>
                        </AccordionPanel>
                      </AccordionItem>
                    ) : null;
                  })()}
                </Accordion>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
