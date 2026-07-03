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
  Spinner,
  SimpleGrid,
  Divider,
  IconButton,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Collapse,
} from '@chakra-ui/react';
import { SearchIcon, ViewIcon, ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { useAdminScope, ScopeTag } from '../../contexts/AdminScopeContext';
import { getCrewScope, matchesScopeFilter } from './adminScope';

const CREW_API_URL = 'http://localhost:8000';

interface Agent {
  id: string;
  name: string;
  role?: string;
  goal: string;
  backstory: string;
  tools: string[];
  llms?: string[];
}

interface Task {
  id: string;
  name: string;
  description: string;
  expected_input: string;
  expected_output: string;
  agent: string;
}

interface Crew {
  id: string;
  name: string;
  description: string;
  agents: string[];
  tasks: string[];
  status: string;
  agent_details?: Agent[];
  task_details?: Task[];
}

const AGENT_LIBRARY: Record<string, Agent> = {
  'finops-orchestrator': {
    id: 'finops-orchestrator',
    name: 'FinOps Orchestrator',
    role: 'Senior FinOps Platform Architect',
    goal: 'Deliver FinOps outcomes across Inform/Optimize/Operate phases',
    backstory: 'Central brain coordinating data, policies, and actions across the FinOps platform. Expert in workflow orchestration, SLA enforcement, and multi-agent coordination.',
    tools: ['dbt_rpc', 'great_expectations', 'temporal_client', 'cloud_vendor_sdks', 'opa_client', 'jira_client'],
    llms: ['gpt-4', 'claude-3-opus']
  },
  'ingestion-agent': {
    id: 'ingestion-agent',
    name: 'Ingestion Agent',
    role: 'Senior Data Engineer',
    goal: 'Ensure reliable and timely data ingestion from all sources',
    backstory: 'Specialized in provisioning and managing data connectors across cloud providers. Expert in schema validation, dataset registration, and lineage tracking.',
    tools: ['AWS CUR/CE/Budgets/Organizations', 'Azure Cost Management Exports', 'GCP Billing Export & Recommender', 'Kubernetes Metrics API', 'Prometheus', 'Datadog', 'M365', 'Atlassian', 'GitHub', 'Snowflake', 'Salesforce'],
    llms: ['gpt-4', 'gpt-3.5-turbo']
  },
  'allocation-agent': {
    id: 'allocation-agent',
    name: 'Allocation Agent',
    role: 'Senior Cost Allocation Analyst',
    goal: 'Maximize cost allocation coverage and accuracy',
    backstory: 'Expert in cost allocation, tagging strategies, and resource ownership mapping. Specializes in auto-tagging, owner reconciliation, and allocation graph building.',
    tools: ['tagger', 'cmdb', 'git_inspector', 'k8s_api'],
    llms: ['gpt-4', 'claude-3-sonnet']
  },
  'anomaly-agent': {
    id: 'anomaly-agent',
    name: 'Anomaly & RCA Agent',
    role: 'Senior Cost Anomaly Analyst',
    goal: 'Detect, analyze, and explain cost anomalies in real-time',
    backstory: 'Specialized in cost anomaly detection using advanced algorithms and correlation analysis. Expert in streaming anomaly detection, root cause analysis, and correlation with deployment events.',
    tools: ['prophet', 'adtk', 'correlation_engine', 'deployment_tracker', 'incident_feeds'],
    llms: ['gpt-4', 'claude-3-opus']
  },
  'optimization-agent': {
    id: 'optimization-agent',
    name: 'Optimization Agent',
    role: 'Senior Cloud Cost Optimizer',
    goal: 'Maximize cost savings through intelligent optimization recommendations',
    backstory: 'Expert in identifying cost optimization opportunities across infrastructure. Specializes in rightsizing, commitment planning, idle detection, and storage optimization.',
    tools: ['rightsizing_analyzer', 'ri_sp_cud_advisor', 'idle_detector', 'storage_tiering', 'k8s_optimizer', 'license_harvester'],
    llms: ['gpt-4', 'claude-3-opus']
  },
  'forecasting-agent': {
    id: 'forecasting-agent',
    name: 'Forecasting Agent',
    role: 'Senior Financial Analyst',
    goal: 'Provide accurate cost forecasts and enable data-driven budget planning',
    backstory: 'Expert in financial modeling and predictive analytics for cloud cost planning. Specializes in time series forecasting, budget planning, and scenario modeling.',
    tools: ['arima', 'prophet', 'xgboost', 'scenario_planner', 'budget_modeler'],
    llms: ['gpt-4', 'claude-3-opus']
  },
  'governance-agent': {
    id: 'governance-agent',
    name: 'Governance Agent',
    role: 'Senior FinOps Governance Engineer',
    goal: 'Ensure compliance with FinOps policies and governance standards',
    backstory: 'Specialized in policy enforcement and compliance across cloud infrastructure. Expert in policy as code, tagging enforcement, budget guardrails, and exception management.',
    tools: ['opa', 'rego', 'policy_engine', 'budget_service', 'exception_workflow'],
    llms: ['gpt-4', 'claude-3-sonnet']
  },
  'explainability-agent': {
    id: 'explainability-agent',
    name: 'Explainability & Audit Agent',
    role: 'Senior Audit & Compliance Analyst',
    goal: 'Provide complete explainability and immutable audit trails',
    backstory: 'Focused on providing transparency and auditability for all agent decisions. Expert in reasoning assembly, audit trail generation, and explainability.',
    tools: ['audit_ledger', 'reasoning_engine', 'signature_service', 'bundle_generator'],
    llms: ['gpt-4', 'claude-3-opus']
  },
  'model-router-agent': {
    id: 'model-router-agent',
    name: 'Model Router Agent',
    role: 'AI Model Routing Specialist',
    goal: 'Route workloads to the most cost-effective model tier',
    backstory: 'Expert in model tiering and provider routing for agentic workflows.',
    tools: ['model_catalog', 'latency_profiler', 'quality_scorer', 'provider_router'],
    llms: ['gpt-4', 'claude-3-sonnet']
  },
  'token-optimizer-agent': {
    id: 'token-optimizer-agent',
    name: 'Token Optimizer Agent',
    role: 'Token Efficiency Engineer',
    goal: 'Reduce token volume through caching and prompt optimization',
    backstory: 'Specializes in prompt caching and retry storm prevention.',
    tools: ['prompt_cache', 'token_analyzer', 'retry_policy_engine', 'context_compressor'],
    llms: ['gpt-4', 'gpt-3.5-turbo']
  },
  'gpu-finops-agent': {
    id: 'gpu-finops-agent',
    name: 'GPU FinOps Agent',
    role: 'GPU Infrastructure Analyst',
    goal: 'Maximize GPU utilization and right-size clusters',
    backstory: 'Monitors GPU clusters and training vs inference cost allocation.',
    tools: ['gpu_metrics', 'cluster_autoscaler', 'spot_scheduler', 'workload_profiler'],
    llms: ['gpt-4', 'claude-3-opus']
  },
  'portfolio-time-agent': {
    id: 'portfolio-time-agent',
    name: 'Portfolio TIME Lens Agent',
    role: 'Application Portfolio Strategist',
    goal: 'Segment applications by value and technical condition using the Gartner TIME framework',
    backstory: 'Built to continuously evaluate the software estate and surface invest/migrate/eliminate recommendations.',
    tools: ['time_lens', 'application_registry', 'lifecycle_dashboard'],
    llms: ['gpt-4', 'claude-3-sonnet']
  },
  'cost-value-agent': {
    id: 'cost-value-agent',
    name: 'Cost-Value Quadrant Agent',
    role: 'Portfolio Value Analyst',
    goal: 'Map products against business value and TCO/risk to highlight prioritize/eliminate candidates',
    backstory: 'Combines telemetry with unit economics to keep the Cost–Value matrix current for stakeholders.',
    tools: ['cost_value_analyzer', 'telemetry_warehouse', 'unit_economics_engine'],
    llms: ['gpt-4', 'claude-3-haiku']
  },
  'adoption-growth-agent': {
    id: 'adoption-growth-agent',
    name: 'Adoption Growth Matrix Agent',
    role: 'Product Adoption Analyst',
    goal: 'Track adoption and growth trajectories to classify products as Stars, Cash Cows, Question Marks, or Dogs',
    backstory: 'Ensures portfolio reviews include adoption velocity and strategic growth signals.',
    tools: ['adoption_telemetry', 'growth_modeler', 'portfolio_kpis'],
    llms: ['gpt-4', 'claude-3-haiku']
  },
  'pace-layer-agent': {
    id: 'pace-layer-agent',
    name: 'Pace-Layered Portfolio Agent',
    role: 'Enterprise Architecture Strategist',
    goal: 'Classify products as systems of record, differentiation, or innovation to set guardrails',
    backstory: 'Keeps architectural guardrails in sync with product lifecycle decisions.',
    tools: ['pace_layer_simulator', 'capability_map', 'architecture_registry'],
    llms: ['gpt-4', 'claude-3-sonnet']
  },
  'safe-portfolio-agent': {
    id: 'safe-portfolio-agent',
    name: 'SAFe Portfolio Flow Agent',
    role: 'Lean Portfolio Facilitator',
    goal: 'Monitor portfolio funnel, review, and MVP guardrails aligned to SAFe practices',
    backstory: 'Automates lean portfolio cadences and ensures request intake follows governance.',
    tools: ['portfolio_backlog_mgr', 'value_stream_mapper', 'flow_metrics_engine'],
    llms: ['gpt-4', 'claude-3-opus']
  },
  'tbm-capability-agent': {
    id: 'tbm-capability-agent',
    name: 'TBM Capability Lens Agent',
    role: 'TBM & FinOps Capability Analyst',
    goal: 'Attribute software costs to business capabilities and track unit economics',
    backstory: 'Links FinOps and TBM perspectives to highlight capability-level investment efficiency.',
    tools: ['tbm_modeler', 'unit_cost_dashboard', 'capability_catalog'],
    llms: ['gpt-4', 'claude-3-haiku']
  },
  'sixr-modernization-agent': {
    id: 'sixr-modernization-agent',
    name: '6R Modernization Agent',
    role: 'Modernization Strategist',
    goal: 'Evaluate products across the 6R modernization spectrum to drive rationalization outcomes',
    backstory: 'Guides modernization backlogs by pairing technical condition with business value.',
    tools: ['sixr_engine', 'modernization_playbook', 'renewal_calendar'],
    llms: ['gpt-4', 'claude-3-sonnet']
  },
  'value-differentiation-agent': {
    id: 'value-differentiation-agent',
    name: 'Value Differentiation Agent',
    role: 'Product Differentiation Analyst',
    goal: 'Classify features as delighters, performance, or hygiene using Kano models',
    backstory: 'Ensures rationalization choices protect differentiation while consolidating hygiene capabilities.',
    tools: ['kano_classifier', 'feature_usage_telemetry', 'survey_insights'],
    llms: ['gpt-4', 'claude-3-haiku']
  },
  'weighted-scoring-agent': {
    id: 'weighted-scoring-agent',
    name: 'Weighted Scoring Agent',
    role: 'Portfolio Scoring Analyst',
    goal: 'Calculate weighted scores across business value, fit, TCO, risk, integration, and vendor health',
    backstory: 'Turns scoring worksheets and FinOps metrics into prioritized action plans.',
    tools: ['weighted_scoring_template', 'cost_telemetry', 'governance_workbench'],
    llms: ['gpt-4', 'claude-3-sonnet']
  },
  'vendor-risk-agent': {
    id: 'vendor-risk-agent',
    name: 'Vendor Risk Agent',
    role: 'Vendor Risk Assessor',
    goal: 'Evaluate vendor financial health and compliance posture for the portfolio',
    backstory: 'Monitors vendor stability, certifications, and data residency commitments.',
    tools: ['vendor_risk_engine', 'financial_monitor', 'compliance_registry'],
    llms: ['gpt-4', 'claude-3-sonnet']
  },
  'operational-fit-agent': {
    id: 'operational-fit-agent',
    name: 'Operational Fit Agent',
    role: 'Controls & Guardrails Auditor',
    goal: 'Validate SSO/SCIM, role-based controls, audit logging, and SLA adherence',
    backstory: 'Keeps SaaS intake aligned with enterprise guardrails and operational resilience requirements.',
    tools: ['control_library', 'sso_checker', 'audit_log_analyzer'],
    llms: ['gpt-4', 'claude-3-haiku']
  },
  'exit-risk-agent': {
    id: 'exit-risk-agent',
    name: 'Exit Risk Agent',
    role: 'Software Exit Planner',
    goal: 'Assess vendor lock-in, export readiness, and switching cost scenarios',
    backstory: 'Ensures every product has an exit strategy before renewal negotiations.',
    tools: ['exit_planner', 'data_export_validator', 'switching_cost_modeler'],
    llms: ['gpt-4', 'claude-3-sonnet']
  }
};

const TASK_LIBRARY: Record<string, Task> = {
  'task-orch-1': {
    id: 'task-orch-1',
    name: 'Plan Multi-Agent Workflow',
    description: 'Plan and coordinate multi-agent workflows for anomaly resolution',
    expected_input: 'Workflow requests, anomaly alerts, SLA definitions, agent status updates',
    expected_output: 'Workflow execution plan with assigned agents and tasks',
    agent: 'finops-orchestrator'
  },
  'task-orch-2': {
    id: 'task-orch-2',
    name: 'Enforce SLA Compliance',
    description: 'Enforce SLA compliance across all FinOps operations',
    expected_input: 'SLA definitions, policy rules, workflow execution status',
    expected_output: 'SLA compliance report and remediation actions',
    agent: 'finops-orchestrator'
  },
  'task-orch-3': {
    id: 'task-orch-3',
    name: 'Monitor FinOps Cadence',
    description: 'Monitor and orchestrate FinOps cadence (daily/weekly/monthly cycles)',
    expected_input: 'Cadence schedules, workflow status, agent availability',
    expected_output: 'Cadence status dashboard and next action items',
    agent: 'finops-orchestrator'
  },
  'task-alloc-1': {
    id: 'task-alloc-1',
    name: 'Auto-tag Assets and Reconcile Owners',
    description: 'Auto-tag assets and reconcile owner/app/env metadata',
    expected_input: 'Resource metadata, CMDB data, Git metadata, tagging policies',
    expected_output: 'Tagged resources with ownership mapping',
    agent: 'allocation-agent'
  },
  'task-alloc-3': {
    id: 'task-alloc-3',
    name: 'Enforce Tagging Standards',
    description: 'Enforce tagging standards and remediate gaps > 2% in prod accounts',
    expected_input: 'Tagging policies, resource inventory, compliance thresholds',
    expected_output: 'Remediation PRs, tickets, and report with coverage by BU',
    agent: 'allocation-agent'
  },
  'task-anom-1': {
    id: 'task-anom-1',
    name: 'Detect Cost Anomalies',
    description: 'Detect cost spikes using streaming detectors (prophet/ADTK)',
    expected_input: 'Cost time series, historical baselines, detection parameters',
    expected_output: 'Anomaly alerts with severity and confidence scores',
    agent: 'anomaly-agent'
  },
  'task-anom-2': {
    id: 'task-anom-2',
    name: 'Correlate Anomalies with Events',
    description: 'Correlate anomalies with deploys, autoscaling, and incident feeds',
    expected_input: 'Anomaly alerts, deployment events, scaling events, incident data',
    expected_output: 'Correlation reports linking anomalies to root causes',
    agent: 'anomaly-agent'
  },
  'task-anom-3': {
    id: 'task-anom-3',
    name: 'Perform Root Cause Analysis',
    description: 'Perform root cause analysis and generate resolution recommendations',
    expected_input: 'Anomaly details, correlation data, historical patterns',
    expected_output: 'RCA reports with recommended actions',
    agent: 'anomaly-agent'
  },
  'task-opt-1': {
    id: 'task-opt-1',
    name: 'Recommend Rightsizing Opportunities',
    description: 'Recommend rightsizing opportunities for underutilized resources',
    expected_input: 'Resource utilization data, cost data, performance metrics',
    expected_output: 'Rightsizing recommendations with estimated savings',
    agent: 'optimization-agent'
  },
  'task-opt-2': {
    id: 'task-opt-2',
    name: 'Analyze Commitment Coverage',
    description: 'Analyze RI/SP/CUD coverage and recommend commitment purchases',
    expected_input: 'Usage patterns, commitment inventory, pricing data',
    expected_output: 'Commitment recommendations with ROI analysis',
    agent: 'optimization-agent'
  },
  'task-opt-3': {
    id: 'task-opt-3',
    name: 'Identify Idle Resources',
    description: 'Identify and recommend cleanup of idle resources',
    expected_input: 'Resource utilization, cost data, idle detection rules',
    expected_output: 'Idle resource list with cleanup recommendations',
    agent: 'optimization-agent'
  },
  'task-forecast-1': {
    id: 'task-forecast-1',
    name: 'Generate Cost Forecasts',
    description: 'Generate multivariate time series forecasts using ARIMA/Prophet/XGBoost',
    expected_input: 'Historical cost data, usage trends, business calendar',
    expected_output: 'Cost forecasts with confidence intervals',
    agent: 'forecasting-agent'
  },
  'task-forecast-3': {
    id: 'task-forecast-3',
    name: 'Create Scenario Models',
    description: 'Create scenario planning models for different growth assumptions',
    expected_input: 'Base forecasts, growth assumptions, scenario parameters',
    expected_output: 'Scenario-based forecasts (best/expected/worst case)',
    agent: 'forecasting-agent'
  },
  'task-gov-1': {
    id: 'task-gov-1',
    name: 'Enforce Tagging Policies',
    description: 'Enforce tagging policies using OPA/Rego policy as code',
    expected_input: 'Policy rules, resource metadata, tagging data',
    expected_output: 'Policy compliance reports and remediation actions',
    agent: 'governance-agent'
  },
  'task-gov-2': {
    id: 'task-gov-2',
    name: 'Monitor Budget Guardrails',
    description: 'Monitor budget guardrails and trigger alerts on breaches',
    expected_input: 'Budget definitions, cost data, guardrail thresholds',
    expected_output: 'Budget breach alerts and containment recommendations',
    agent: 'governance-agent'
  },
  'task-expl-1': {
    id: 'task-expl-1',
    name: 'Assemble Reasoning Trails',
    description: 'Assemble step-by-step reasoning for all agent decisions',
    expected_input: 'Agent decision logs, tool calls, feature data',
    expected_output: 'Detailed reasoning logs with decision paths',
    agent: 'explainability-agent'
  },
  'task-expl-2': {
    id: 'task-expl-2',
    name: 'Generate Audit Bundles',
    description: 'Produce immutable audit bundles with signatures',
    expected_input: 'Decision logs, tool calls, approvals, feature data',
    expected_output: 'Signed audit bundles stored in object store',
    agent: 'explainability-agent'
  },
  'task-expl-3': {
    id: 'task-expl-3',
    name: 'Explain Budget Guardrail Exceptions',
    description: 'Produce explainability package for exceeded guardrails with recommended mitigations',
    expected_input: 'Guardrail violations, spend telemetry, policy source, stakeholder list',
    expected_output: 'Narrative explaining breach, root cause, recommended compensating controls',
    agent: 'explainability-agent'
  },
  'task-ingest-1': {
    id: 'task-ingest-1',
    name: 'Provision Data Connectors',
    description: 'Provision and configure data connectors for cloud billing exports',
    expected_input: 'Connector configurations, API credentials, cloud provider details',
    expected_output: 'Active connectors with validation status',
    agent: 'ingestion-agent'
  },
  'task-ingest-2': {
    id: 'task-ingest-2',
    name: 'Validate Schemas and Register Datasets',
    description: 'Validate schemas and register datasets with lineage tracking',
    expected_input: 'Schema definitions, raw data samples, metadata requirements',
    expected_output: 'Validated datasets with complete metadata and lineage',
    agent: 'ingestion-agent'
  },
  'task-ingest-3': {
    id: 'task-ingest-3',
    name: 'Monitor Ingestion Health',
    description: 'Monitor ingestion health and trigger alerts on failures',
    expected_input: 'Connector status, data freshness metrics, error logs',
    expected_output: 'Ingestion health dashboard and alert notifications',
    agent: 'ingestion-agent'
  },
  'task-portfolio-time-report': {
    id: 'task-portfolio-time-report',
    name: 'Generate TIME Segmentation',
    description: 'Evaluate applications with the Gartner TIME framework to propose invest/migrate decisions',
    expected_input: 'Application registry, technical condition metrics, business value scores',
    expected_output: 'TIME segmentation with recommended actions per product',
    agent: 'portfolio-time-agent'
  },
  'task-cost-value-analysis': {
    id: 'task-cost-value-analysis',
    name: 'Run Cost–Value Quadrant Analysis',
    description: 'Map products against business value and cost/risk for prioritization',
    expected_input: 'Cost telemetry, unit economics, business value scores',
    expected_output: 'Quadrant assignments with recommended optimize/eliminate actions',
    agent: 'cost-value-agent'
  },
  'task-adoption-growth-matrix': {
    id: 'task-adoption-growth-matrix',
    name: 'Build Adoption/Growth Matrix',
    description: 'Classify products using adoption and growth trends to identify Stars, Cash Cows, Question Marks, and Dogs',
    expected_input: 'Adoption telemetry, growth metrics, strategic importance',
    expected_output: 'BCG matrix with follow-up recommendations',
    agent: 'adoption-growth-agent'
  },
  'task-pace-layered-evaluation': {
    id: 'task-pace-layered-evaluation',
    name: 'Perform Pace-Layered Evaluation',
    description: 'Determine system of record/differentiation/innovation classification for each product',
    expected_input: 'Capability map, customization level, release cadence',
    expected_output: 'Pace-layered assignments with guardrails',
    agent: 'pace-layer-agent'
  },
  'task-safe-portfolio-flow': {
    id: 'task-safe-portfolio-flow',
    name: 'Monitor SAFe Portfolio Flow',
    description: 'Track funnel → review → MVP/guardrail flow for software intake',
    expected_input: 'Portfolio backlog, lean metrics, governance policies',
    expected_output: 'Portfolio flow dashboard with intake decisions',
    agent: 'safe-portfolio-agent'
  },
  'task-tbm-capability-report': {
    id: 'task-tbm-capability-report',
    name: 'Generate TBM Capability Report',
    description: 'Link software costs to business capabilities and unit economics',
    expected_input: 'TBM cost model, capability catalog, usage telemetry',
    expected_output: 'Capability cost report with unit cost insights',
    agent: 'tbm-capability-agent'
  },
  'task-sixr-modernization': {
    id: 'task-sixr-modernization',
    name: 'Create 6R Modernization Plan',
    description: 'Recommend retain/rehost/replatform/refactor/repurchase/retire actions',
    expected_input: 'Modernization assessments, renewal dates, technical condition scores',
    expected_output: '6R modernization roadmap with sequencing',
    agent: 'sixr-modernization-agent'
  },
  'task-value-differentiation': {
    id: 'task-value-differentiation',
    name: 'Evaluate Value Differentiation',
    description: 'Classify features via Kano model to protect differentiators while consolidating hygiene capabilities',
    expected_input: 'Feature usage telemetry, stakeholder surveys, differentiation scoring',
    expected_output: 'Kano classification with keep vs. standardize recommendations',
    agent: 'value-differentiation-agent'
  },
  'task-weighted-scoring': {
    id: 'task-weighted-scoring',
    name: 'Compute Weighted Scoring',
    description: 'Generate weighted scores across cost, value, risk, and strategic alignment',
    expected_input: 'Scoring template, FinOps metrics, vendor health data',
    expected_output: 'Prioritized action list with weighted scores and decision notes',
    agent: 'weighted-scoring-agent'
  },
  'task-vendor-risk': {
    id: 'task-vendor-risk',
    name: 'Assess Vendor Risk',
    description: 'Evaluate vendor financial health, compliance posture, and data residency',
    expected_input: 'Vendor questionnaires, financial metrics, certification evidence',
    expected_output: 'Vendor risk report with mitigation plan',
    agent: 'vendor-risk-agent'
  },
  'task-operational-fit': {
    id: 'task-operational-fit',
    name: 'Validate Operational Fit',
    description: 'Check SSO/SCIM, role-based access, audit logs, and SLA adherence',
    expected_input: 'Access control configs, audit log samples, SLA documents',
    expected_output: 'Operational readiness assessment with remediation actions',
    agent: 'operational-fit-agent'
  },
  'task-exit-risk': {
    id: 'task-exit-risk',
    name: 'Analyze Exit Risk',
    description: 'Assess vendor lock-in, data export readiness, and switching costs',
    expected_input: 'Data export formats, contract clauses, migration plans',
    expected_output: 'Exit readiness report with contingency steps',
    agent: 'exit-risk-agent'
  },
  'task-model-tier-1': {
    id: 'task-model-tier-1',
    name: 'Recommend Model Tiering',
    description: 'Analyze workflow steps and recommend economy vs premium model routing',
    expected_input: 'Workflow trace data, quality SLAs, latency requirements',
    expected_output: 'Tiering plan with projected token savings',
    agent: 'model-router-agent'
  },
  'task-token-opt-1': {
    id: 'task-token-opt-1',
    name: 'Optimize Token Usage',
    description: 'Identify prompt caching and context trimming opportunities',
    expected_input: 'Prompt templates, token usage logs, retry metrics',
    expected_output: 'Token reduction plan with caching configuration',
    agent: 'token-optimizer-agent'
  },
  'task-gpu-rightsize-1': {
    id: 'task-gpu-rightsize-1',
    name: 'Right-size GPU Clusters',
    description: 'Analyze GPU utilization and recommend cluster scaling changes',
    expected_input: 'GPU metrics, workload schedules, cost data',
    expected_output: 'Rightsizing recommendations with utilization targets',
    agent: 'gpu-finops-agent'
  }
};

type BaseCrew = Omit<Crew, 'agent_details' | 'task_details'>;

const BASE_CREWS: BaseCrew[] = [
  {
    id: 'crew-tagging-enforcement',
    name: 'Tagging Enforcement Crew',
    description: 'Multi-agent workflow to enforce tagging standards and remediate gaps',
    agents: ['finops-orchestrator', 'allocation-agent', 'governance-agent'],
    tasks: ['task-orch-1', 'task-alloc-1', 'task-alloc-3', 'task-gov-1'],
    status: 'active'
  },
  {
    id: 'crew-anomaly-resolution',
    name: 'Anomaly Resolution Crew',
    description: 'Multi-agent workflow to detect, analyze, and resolve cost anomalies',
    agents: ['finops-orchestrator', 'anomaly-agent', 'optimization-agent', 'explainability-agent'],
    tasks: ['task-orch-1', 'task-anom-1', 'task-anom-2', 'task-anom-3', 'task-opt-1', 'task-expl-1'],
    status: 'active'
  },
  {
    id: 'crew-idle-cleanup',
    name: 'Idle Resource Cleanup Crew',
    description: 'Multi-agent workflow to identify and clean up idle resources',
    agents: ['finops-orchestrator', 'optimization-agent', 'governance-agent', 'explainability-agent'],
    tasks: ['task-orch-1', 'task-opt-3', 'task-gov-2', 'task-expl-2'],
    status: 'active'
  },
  {
    id: 'crew-commitment-planning',
    name: 'Commitment Planning Crew',
    description: 'Multi-agent workflow to analyze and recommend commitment purchases',
    agents: ['finops-orchestrator', 'optimization-agent', 'forecasting-agent', 'explainability-agent'],
    tasks: ['task-orch-1', 'task-opt-2', 'task-forecast-1', 'task-forecast-3', 'task-expl-1'],
    status: 'active'
  },
  {
    id: 'crew-budget-monitoring',
    name: 'Budget Monitoring Crew',
    description: 'Multi-agent workflow to monitor budgets and enforce guardrails',
    agents: ['finops-orchestrator', 'forecasting-agent', 'governance-agent', 'explainability-agent'],
    tasks: ['task-orch-2', 'task-forecast-1', 'task-gov-2', 'task-expl-3'],
    status: 'active'
  },
  {
    id: 'crew-data-ingestion',
    name: 'Data Ingestion Crew',
    description: 'Multi-agent workflow to provision connectors and validate data',
    agents: ['finops-orchestrator', 'ingestion-agent', 'explainability-agent'],
    tasks: ['task-orch-3', 'task-ingest-1', 'task-ingest-2', 'task-ingest-3', 'task-expl-1'],
    status: 'active'
  },
  {
    id: 'crew-portfolio-lenses',
    name: 'Portfolio Lens Crew',
    description: 'Runs TIME, Cost–Value, BCG, Pace-Layered, Lean Portfolio, and TBM capability assessments',
    agents: ['portfolio-time-agent', 'cost-value-agent', 'adoption-growth-agent', 'pace-layer-agent', 'safe-portfolio-agent', 'tbm-capability-agent'],
    tasks: ['task-portfolio-time-report', 'task-cost-value-analysis', 'task-adoption-growth-matrix', 'task-pace-layered-evaluation', 'task-safe-portfolio-flow', 'task-tbm-capability-report'],
    status: 'active'
  },
  {
    id: 'crew-product-lenses',
    name: 'Product Lens Crew',
    description: 'Generates 6R modernization, Kano differentiation, and weighted scoring outputs',
    agents: ['sixr-modernization-agent', 'value-differentiation-agent', 'weighted-scoring-agent'],
    tasks: ['task-sixr-modernization', 'task-value-differentiation', 'task-weighted-scoring'],
    status: 'active'
  },
  {
    id: 'crew-risk-overlay',
    name: 'Risk & Compliance Overlay Crew',
    description: 'Evaluates vendor risk, operational guardrails, and exit readiness for the software estate',
    agents: ['vendor-risk-agent', 'operational-fit-agent', 'exit-risk-agent'],
    tasks: ['task-vendor-risk', 'task-operational-fit', 'task-exit-risk'],
    status: 'active'
  },
  {
    id: 'crew-ai-anomaly-resolution',
    name: 'AI Anomaly Resolution Crew',
    description: 'Detect and resolve token spikes, model changes, and retry storms in AI workloads',
    agents: ['finops-orchestrator', 'model-router-agent', 'token-optimizer-agent', 'explainability-agent'],
    tasks: ['task-orch-1', 'task-model-tier-1', 'task-token-opt-1', 'task-expl-1'],
    status: 'active'
  },
  {
    id: 'crew-model-tiering',
    name: 'Model Tiering Crew',
    description: 'Recommend economy vs premium model routing by workflow step',
    agents: ['model-router-agent', 'token-optimizer-agent', 'explainability-agent'],
    tasks: ['task-model-tier-1', 'task-token-opt-1', 'task-expl-1'],
    status: 'active'
  },
  {
    id: 'crew-gpu-optimization',
    name: 'GPU Optimization Crew',
    description: 'Right-size GPU clusters and optimize training/inference scheduling',
    agents: ['gpu-finops-agent', 'forecasting-agent', 'explainability-agent'],
    tasks: ['task-gpu-rightsize-1', 'task-forecast-1', 'task-expl-1'],
    status: 'active'
  }
];

const enrichCrew = (crew: BaseCrew): Crew => {
  const agent_details = crew.agents.map((agentId) => {
    const agent = AGENT_LIBRARY[agentId];
    if (!agent) {
      return {
        id: agentId,
        name: agentId,
        goal: '',
        backstory: '',
        tools: [],
        llms: []
      };
    }

    const clonedAgent: Agent = {
      ...agent,
      tools: [...agent.tools]
    };

    if (agent.llms) {
      clonedAgent.llms = [...agent.llms];
    }

    return clonedAgent;
  });

  const task_details = crew.tasks.map((taskId) => {
    const task = TASK_LIBRARY[taskId];
    if (!task) {
      return {
        id: taskId,
        name: taskId,
        description: '',
        expected_input: '',
        expected_output: '',
        agent: ''
      };
    }

    return { ...task };
  });

  return {
    ...crew,
    agent_details,
    task_details
  };
};

const MOCK_CREWS: Crew[] = BASE_CREWS.map(enrichCrew);

export default function Crews() {
  const { scopeFilter } = useAdminScope();
  const [crews, setCrews] = useState<Crew[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);
  const [modalAgentsOpen, setModalAgentsOpen] = useState(false);
  const [modalTasksOpen, setModalTasksOpen] = useState(false);
  const [modalWorkflowOpen, setModalWorkflowOpen] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.100', 'gray.700');

  useEffect(() => {
    // Try to fetch from backend, but use mock data if it fails
    fetch(`${CREW_API_URL}/v1/crews`, { 
      signal: AbortSignal.timeout(2000) // 2 second timeout
    })
      .then((r) => {
        if (!r.ok) throw new Error('Service not available');
        return r.json();
      })
      .then((data) => {
        // Fetch expanded details for each crew
        const crewsWithDetails = data.data || [];
        if (crewsWithDetails.length === 0) {
          setCrews(MOCK_CREWS);
          setLoading(false);
          return;
        }
        Promise.all(
          crewsWithDetails.map((crew: Crew) =>
            fetch(`${CREW_API_URL}/v1/crews/${crew.id}`, { 
              signal: AbortSignal.timeout(2000) 
            })
              .then((r) => r.json())
              .catch(() => crew)
          )
        ).then((expandedCrews) => {
          setCrews(expandedCrews);
          setLoading(false);
        }).catch(() => {
          setCrews(MOCK_CREWS);
          setLoading(false);
        });
      })
      .catch(() => {
        // Silently use fallback mock data when service is not available
        setCrews(MOCK_CREWS);
        setLoading(false);
      });
  }, []);

  const filteredCrews = crews.filter((crew) => {
    if (!matchesScopeFilter(getCrewScope(crew.id, crew.agents), scopeFilter)) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const agentMatches = (crew.agent_details || [])
      .some((agent) =>
        agent.name.toLowerCase().includes(term) ||
        agent.goal.toLowerCase().includes(term)
      ) || crew.agents.some((agentId) => agentId.toLowerCase().includes(term));
    const taskMatches = (crew.task_details || [])
      .some((task) =>
        task.name.toLowerCase().includes(term) ||
        task.description.toLowerCase().includes(term)
      ) || crew.tasks.some((taskId) => taskId.toLowerCase().includes(term));

    return (
      crew.name.toLowerCase().includes(term) ||
      crew.description.toLowerCase().includes(term) ||
      agentMatches ||
      taskMatches
    );
  });

  const totalCrews = filteredCrews.length;
  const totalAgents = new Set(filteredCrews.flatMap((c) => c.agents)).size;
  const totalTasks = new Set(filteredCrews.flatMap((c) => c.tasks)).size;
  const activeCrews = filteredCrews.filter((crew) => crew.status === 'active').length;

  const handleViewCrew = (crew: Crew) => {
    setSelectedCrew(crew);
    setModalAgentsOpen(false);
    setModalTasksOpen(false);
    setModalWorkflowOpen(false);
    onOpen();
  };

  const handleCloseModal = () => {
    setSelectedCrew(null);
    onClose();
  };

  const orderedWorkflowTasks = selectedCrew
    ? (selectedCrew.task_details && selectedCrew.task_details.length > 0
        ? selectedCrew.task_details
        : selectedCrew.tasks.map((taskId) => ({
            id: taskId,
            name: taskId,
            description: '',
            expected_input: '',
            expected_output: '',
            agent: ''
          })))
    : [];

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
        <VStack align="start" spacing={2}>
          <Heading size="lg">Crews</Heading>
          <Text fontSize="sm" color="gray.600">
            Explore orchestrated CrewAI workflows and review their agents and tasks.
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Card bg={bg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel fontSize="xs" color="gray.600">Total Crews</StatLabel>
                <StatNumber fontSize="2xl">{totalCrews}</StatNumber>
                <StatHelpText fontSize="xs">Configured workflows</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={bg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel fontSize="xs" color="gray.600">Unique Agents</StatLabel>
                <StatNumber fontSize="2xl">{totalAgents}</StatNumber>
                <StatHelpText fontSize="xs">Across all crews</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={bg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel fontSize="xs" color="gray.600">Unique Tasks</StatLabel>
                <StatNumber fontSize="2xl">{totalTasks}</StatNumber>
                <StatHelpText fontSize="xs">In crew workflows</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={bg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel fontSize="xs" color="gray.600">Active Crews</StatLabel>
                <StatNumber fontSize="2xl">{activeCrews}</StatNumber>
                <StatHelpText fontSize="xs">Running automations</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Box>
          <InputGroup maxW="500px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search crews, agents, or tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg={bg}
            />
          </InputGroup>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={6}>
          {filteredCrews.map((crew) => {
            return (
              <Card
                key={crew.id}
                bg={bg}
                borderWidth="1px"
                borderColor={borderColor}
                height="100%"
                _hover={{
                  boxShadow: 'lg',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s',
                  borderColor: 'blue.300'
                }}
                transition="all 0.2s"
              >
                <CardBody>
                  <VStack align="stretch" spacing={4} height="100%">
                    <HStack justify="space-between" align="start">
                      <VStack align="stretch" spacing={2}>
                        <Heading size="md">{crew.name}</Heading>
                        <ScopeTag domain={getCrewScope(crew.id, crew.agents)} />
                        <HStack spacing={2}>
                          <Badge colorScheme="purple" variant="subtle">
                            {crew.agents.length} agents
                          </Badge>
                          <Badge colorScheme="teal" variant="subtle">
                            {crew.tasks.length} tasks
                          </Badge>
                        </HStack>
                      </VStack>
                      <VStack spacing={2} align="end">
                        <IconButton
                          aria-label="View crew details"
                          icon={<ViewIcon />}
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() => handleViewCrew(crew)}
                        />
                        <Badge colorScheme={crew.status === 'active' ? 'green' : 'gray'}>
                          {crew.status.toUpperCase()}
                        </Badge>
                      </VStack>
                    </HStack>

                    <Text fontSize="sm" color="gray.600">
                      {crew.description}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            );
          })}
        </SimpleGrid>
      </VStack>

      <Modal isOpen={isOpen} onClose={handleCloseModal} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedCrew?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedCrew && (
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <Badge colorScheme={selectedCrew.status === 'active' ? 'green' : 'gray'}>
                    {selectedCrew.status.toUpperCase()}
                  </Badge>
                  <Badge colorScheme="purple" variant="subtle">
                    {selectedCrew.agents.length} agents • {selectedCrew.tasks.length} tasks
                  </Badge>
                </HStack>
                <Text fontSize="sm" color="gray.600">
                  {selectedCrew.description}
                </Text>

                <Divider />

                <VStack align="stretch" spacing={2}>
                  <HStack
                    justify="space-between"
                    cursor="pointer"
                    onClick={() => setModalWorkflowOpen((prev) => !prev)}
                    role="button"
                    aria-expanded={modalWorkflowOpen}
                  >
                    <Heading size="sm">Workflow</Heading>
                    {modalWorkflowOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
                  </HStack>
                  <Collapse in={modalWorkflowOpen} animateOpacity>
                    <VStack align="stretch" spacing={2} mt={2}>
                      {orderedWorkflowTasks.map((task, index) => (
                        <Box key={`${task.id}-workflow`} p={3} bg={cardBg} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
                          <HStack spacing={3} align="start">
                            <Badge colorScheme="blue" variant="solid" borderRadius="full" px={2}>
                              {index + 1}
                            </Badge>
                            <VStack align="start" spacing={1}>
                              <HStack spacing={2}>
                                <Text fontWeight="semibold" fontSize="sm">
                                  {task.name}
                                </Text>
                                {task.agent && (
                                  <Badge colorScheme="blue" fontSize="xs">
                                    {task.agent}
                                  </Badge>
                                )}
                              </HStack>
                              {task.description && (
                                <Text fontSize="xs" color="gray.600">
                                  {task.description}
                                </Text>
                              )}
                            </VStack>
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  </Collapse>
                </VStack>

                <Divider />

                <VStack align="stretch" spacing={2}>
                  <HStack
                    justify="space-between"
                    cursor="pointer"
                    onClick={() => setModalAgentsOpen((prev) => !prev)}
                    role="button"
                    aria-expanded={modalAgentsOpen}
                  >
                    <Heading size="sm">Agents</Heading>
                    {modalAgentsOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
                  </HStack>
                  <Collapse in={modalAgentsOpen} animateOpacity>
                    <VStack align="stretch" spacing={2} mt={2}>
                      {(selectedCrew.agent_details && selectedCrew.agent_details.length > 0
                        ? selectedCrew.agent_details
                        : selectedCrew.agents.map((agentId) => ({ id: agentId, name: agentId, goal: '', backstory: '', tools: [], llms: [] }))
                      ).map((agent) => (
                        <Box key={agent.id} p={3} bg={cardBg} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="semibold" fontSize="sm">
                              {agent.name}
                            </Text>
                            {agent.goal && (
                              <Text fontSize="xs" color="gray.600">
                                {agent.goal}
                              </Text>
                            )}
                            {agent.tools && agent.tools.length > 0 && (
                              <HStack spacing={1} flexWrap="wrap">
                                {agent.tools.slice(0, 4).map((tool, idx) => (
                                  <Badge key={idx} colorScheme="blue" variant="subtle" fontSize="xs">
                                    {tool}
                                  </Badge>
                                ))}
                              </HStack>
                            )}
                          </VStack>
                        </Box>
                      ))}
                    </VStack>
                  </Collapse>
                </VStack>

                <Divider />

                <VStack align="stretch" spacing={2}>
                  <HStack
                    justify="space-between"
                    cursor="pointer"
                    onClick={() => setModalTasksOpen((prev) => !prev)}
                    role="button"
                    aria-expanded={modalTasksOpen}
                  >
                    <Heading size="sm">Tasks</Heading>
                    {modalTasksOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
                  </HStack>
                  <Collapse in={modalTasksOpen} animateOpacity>
                    <VStack align="stretch" spacing={2} mt={2}>
                      {(selectedCrew.task_details && selectedCrew.task_details.length > 0
                        ? selectedCrew.task_details
                        : selectedCrew.tasks.map((taskId) => ({ id: taskId, name: taskId, description: '', expected_input: '', expected_output: '', agent: '' }))
                      ).map((task) => (
                        <Box key={task.id} p={3} bg={cardBg} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
                          <VStack align="start" spacing={1}>
                            <HStack spacing={2}>
                              <Text fontWeight="semibold" fontSize="sm">
                                {task.name}
                              </Text>
                              {task.agent && (
                                <Badge colorScheme="blue" fontSize="xs">
                                  {task.agent}
                                </Badge>
                              )}
                            </HStack>
                            {task.description && (
                              <Text fontSize="xs" color="gray.600">
                                {task.description}
                              </Text>
                            )}
                          </VStack>
                        </Box>
                      ))}
                    </VStack>
                  </Collapse>
                </VStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

