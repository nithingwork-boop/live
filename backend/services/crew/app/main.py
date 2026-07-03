from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import random

app = FastAPI(title='CrewAI FinOps Service')

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# CrewAI Agent Configuration
class AgentConfig(BaseModel):
    max_iterations: Optional[int] = None
    max_rpm: Optional[int] = None
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    memory_enabled: Optional[bool] = None
    verbose: Optional[bool] = None

# CrewAI Agent Definition
class Agent(BaseModel):
    id: str
    name: str
    role: str  # CrewAI role (e.g., "Senior FinOps Platform Architect")
    goal: str
    backstory: str
    tools: List[str]
    llms: Optional[List[str]] = None
    config: Optional[AgentConfig] = None

# CrewAI Task Definition
class Task(BaseModel):
    id: str
    name: str
    description: str
    expected_input: str  # Context/Input
    expected_output: str
    agent: str  # Agent ID that performs this task

# CrewAI Crew Definition (Workflow that uses agents and tasks)
class Crew(BaseModel):
    id: str
    name: str
    description: str
    agents: List[str]  # Agent IDs
    tasks: List[str]  # Task IDs
    status: str = 'active'

class RunResult(BaseModel):
    task: str
    status: str
    details: dict
    reasoning: Optional[str] = None
    outputs: Optional[dict] = None

class AgentStatus(BaseModel):
    agent: str
    status: str
    current_task: Optional[str] = None
    tasks_completed: int

# Mock agent responses
AGENT_RESPONSES = {
    'FinOps Orchestrator': {
        'reasoning': 'Analyzing current FinOps maturity state across Inform/Optimize/Operate phases. Detected 3 high-priority anomalies requiring immediate attention. Coordinating with Allocation and Optimization agents for remediation.',
        'outputs': {
            'anomalies_identified': 3,
            'workflows_triggered': 2,
            'sla_compliance': 98.5
        }
    },
    'Allocation Agent': {
        'reasoning': 'Scanning 15,420 resources across AWS, Azure, and GCP. Found 894 resources missing required tags (owner, application, env). Applying virtual tags for immediate coverage while generating remediation PRs.',
        'outputs': {
            'resources_scanned': 15420,
            'missing_tags': 894,
            'coverage_improvement': 5.8,
            'prs_created': 12
        }
    },
    'Optimization Agent': {
        'reasoning': 'Analyzed 30-day utilization patterns. Identified 47 EC2 instances with <20% CPU utilization eligible for rightsizing. Estimated savings: $12,450/month. Also found 23 idle resources for cleanup.',
        'outputs': {
            'recommendations_generated': 15,
            'estimated_savings': 12450.00,
            'idle_resources': 23,
            'rightsizing_opportunities': 47
        }
    },
    'Anomaly Agent': {
        'reasoning': 'Detected cost spike in EC2 service (+187% vs baseline) correlated with deployment event at 14:32 UTC. Root cause: Auto-scaling triggered by traffic spike. Recommended review of scaling policies.',
        'outputs': {
            'anomalies_detected': 1,
            'severity': 'high',
            'correlation_confidence': 0.92,
            'recommended_actions': ['Review auto-scaling thresholds', 'Consider reserved instances']
        }
    },
    'Forecasting Agent': {
        'reasoning': 'Applied ARIMA model with seasonal adjustments. 30-day forecast: $145,230 (95% confidence interval: $138,500-$152,100). MAPE: 7.3%. Budget variance: -2.4% (within tolerance).',
        'outputs': {
            'forecast_30d': 145230.00,
            'mape': 7.3,
            'confidence': 0.95,
            'budget_variance': -2.4
        }
    },
    'Governance Agent': {
        'reasoning': 'Evaluated 5,231 resources against 12 active policies. 156 violations detected. Tagging policy: 89 violations. Budget guardrails: 12 violations. Generating enforcement workflows.',
        'outputs': {
            'resources_evaluated': 5231,
            'violations': 156,
            'policies_active': 12,
            'enforcement_actions': 8
        }
    },
    'Ingestion Agent': {
        'reasoning': 'Processing billing exports from AWS CUR, Azure Cost Management, and GCP Billing Export. Validated schemas for 3 datasets, registered 2 new data sources with complete lineage tracking. All connectors healthy with 99.8% data freshness.',
        'outputs': {
            'connectors_provisioned': 3,
            'datasets_validated': 3,
            'data_sources_registered': 2,
            'data_freshness': 99.8,
            'ingestion_health': 'healthy'
        }
    },
    'Explainability & Audit Agent': {
        'reasoning': 'Assembled complete reasoning trail for 15 agent decisions. Generated 3 immutable audit bundles with cryptographic signatures. Documented all inputs, tool calls, and decision paths for compliance review.',
        'outputs': {
            'decisions_audited': 15,
            'audit_bundles_generated': 3,
            'reasoning_logs_created': 15,
            'compliance_evidence': 'complete',
            'signature_status': 'verified'
        }
    },
    'Vendor & License Agent': {
        'reasoning': 'Analyzed 23 SaaS contracts and 145 license entitlements. Identified 12 over-utilized licenses (risk of true-up) and 8 under-utilized licenses (optimization opportunity). 3 contracts approaching renewal within 30 days.',
        'outputs': {
            'contracts_tracked': 23,
            'licenses_analyzed': 145,
            'trueup_risks': 12,
            'optimization_opportunities': 8,
            'renewals_approaching': 3
        }
    },
    'Portfolio TIME Lens Agent': {
        'reasoning': 'Ran TIME segmentation on 28 products. Highlighted invest candidates and systems requiring migration/elimination.',
        'outputs': {
            'time_invest': 6,
            'time_tolerate': 9,
            'time_migrate': 8,
            'time_eliminate': 5
        }
    },
    'Cost-Value Quadrant Agent': {
        'reasoning': 'Mapped products against business value and cost/risk. Flagged high-cost/low-value tools for action.',
        'outputs': {
            'high_value_low_cost': 7,
            'high_value_high_cost': 5,
            'low_value_high_cost': 4,
            'recommendations': 9
        }
    },
    'Adoption Growth Matrix Agent': {
        'reasoning': 'Updated adoption vs. growth matrix. Identified Stars needing investment and Dogs slated for retirement.',
        'outputs': {
            'stars': 5,
            'cash_cows': 6,
            'question_marks': 4,
            'dogs': 3
        }
    },
    'Pace-Layered Portfolio Agent': {
        'reasoning': 'Classified systems of record, differentiation, and innovation to align guardrails.',
        'outputs': {
            'systems_of_record': 7,
            'systems_of_differentiation': 8,
            'systems_of_innovation': 4
        }
    },
    'SAFe Portfolio Flow Agent': {
        'reasoning': 'Monitored portfolio funnel and guardrails. Ensured intake follows lean portfolio governance.',
        'outputs': {
            'requests_in_funnel': 12,
            'approved_mvps': 5,
            'guardrail_exceptions': 1
        }
    },
    'TBM Capability Lens Agent': {
        'reasoning': 'Mapped software spend to TBM capabilities and unit economics.',
        'outputs': {
            'capabilities_reviewed': 9,
            'unit_cost_variance_flags': 3,
            'savings_opportunities': 4
        }
    },
    '6R Modernization Agent': {
        'reasoning': 'Evaluated modernization options and built a retain/migrate/retire roadmap.',
        'outputs': {
            'retain': 7,
            'rehost': 3,
            'replatform': 4,
            'refactor': 2,
            'repurchase': 1,
            'retire': 3
        }
    },
    'Value Differentiation Agent': {
        'reasoning': 'Classified features via Kano to highlight differentiators vs. hygiene capabilities.',
        'outputs': {
            'delighters': 4,
            'performance': 9,
            'hygiene': 6
        }
    },
    'Weighted Scoring Agent': {
        'reasoning': 'Calculated weighted scores across business value, TCO, risk, and vendor health.',
        'outputs': {
            'average_score': 3.6,
            'high_priority_actions': 5,
            'optimize_actions': 7
        }
    },
    'Vendor Risk Agent': {
        'reasoning': 'Reviewed vendor financial and compliance health; flagged high-risk vendors before renewals.',
        'outputs': {
            'vendors_reviewed': 18,
            'high_risk_vendors': 4,
            'compliance_gaps': 3
        }
    },
    'Operational Fit Agent': {
        'reasoning': 'Verified SSO/SCIM, audit logging, and incident SLAs for critical applications.',
        'outputs': {
            'products_assessed': 15,
            'guardrail_gaps': 6,
            'actions_created': 5
        }
    },
    'Exit Risk Agent': {
        'reasoning': 'Assessed exit readiness, data export capability, and switching costs.',
        'outputs': {
            'products_reviewed': 14,
            'high_lockin': 3,
            'exit_plans_ready': 9
        }
    }
}

# Enhanced CrewAI Agent Definitions
AGENTS = [
    {
        'id': 'finops-orchestrator',
        'name': 'FinOps Orchestrator',
        'role': 'Senior FinOps Platform Architect',
        'goal': 'Deliver FinOps outcomes across Inform/Optimize/Operate phases',
        'backstory': 'Central brain coordinating data, policies, and actions across the FinOps platform. Expert in workflow orchestration, SLA enforcement, and multi-agent coordination.',
        'tools': ['dbt_rpc', 'great_expectations', 'temporal_client', 'cloud_vendor_sdks', 'opa_client', 'jira_client'],
        'llms': ['gpt-4', 'claude-3-opus'],
        'config': {
            'max_iterations': 10,
            'max_rpm': 20,
            'temperature': 0.7,
            'max_tokens': 4000,
            'memory_enabled': True,
            'verbose': True
        }
    },
    {
        'id': 'ingestion-agent',
        'name': 'Ingestion Agent',
        'role': 'Senior Data Engineer',
        'goal': 'Ensure reliable and timely data ingestion from all sources',
        'backstory': 'Specialized in provisioning and managing data connectors across cloud providers. Expert in schema validation, dataset registration, and lineage tracking.',
        'tools': ['AWS CUR/CE/Budgets/Organizations', 'Azure Cost Management Exports', 'GCP Billing Export & Recommender', 'Kubernetes Metrics API', 'Prometheus', 'Datadog', 'M365', 'Atlassian', 'GitHub', 'Snowflake', 'Salesforce'],
        'llms': ['gpt-4', 'gpt-3.5-turbo'],
        'config': {
            'max_iterations': 5,
            'max_rpm': 30,
            'temperature': 0.3,
            'max_tokens': 2000,
            'memory_enabled': False,
            'verbose': False
        }
    },
    {
        'id': 'allocation-agent',
        'name': 'Allocation Agent',
        'role': 'Senior Cost Allocation Analyst',
        'goal': 'Maximize cost allocation coverage and accuracy',
        'backstory': 'Expert in cost allocation, tagging strategies, and resource ownership mapping. Specializes in auto-tagging, owner reconciliation, and allocation graph building.',
        'tools': ['tagger', 'cmdb', 'git_inspector', 'k8s_api'],
        'llms': ['gpt-4', 'claude-3-sonnet'],
        'config': {
            'max_iterations': 8,
            'max_rpm': 25,
            'temperature': 0.5,
            'max_tokens': 3000,
            'memory_enabled': True,
            'verbose': False
        }
    },
    {
        'id': 'anomaly-agent',
        'name': 'Anomaly & RCA Agent',
        'role': 'Senior Cost Anomaly Analyst',
        'goal': 'Detect, analyze, and explain cost anomalies in real-time',
        'backstory': 'Specialized in cost anomaly detection using advanced algorithms and correlation analysis. Expert in streaming anomaly detection, root cause analysis, and correlation with deployment events.',
        'tools': ['prophet', 'adtk', 'correlation_engine', 'deployment_tracker', 'incident_feeds'],
        'llms': ['gpt-4', 'claude-3-opus'],
        'config': {
            'max_iterations': 6,
            'max_rpm': 15,
            'temperature': 0.4,
            'max_tokens': 3500,
            'memory_enabled': True,
            'verbose': True
        }
    },
    {
        'id': 'optimization-agent',
        'name': 'Optimization Agent',
        'role': 'Senior Cloud Cost Optimizer',
        'goal': 'Maximize cost savings through intelligent optimization recommendations',
        'backstory': 'Expert in identifying cost optimization opportunities across infrastructure. Specializes in rightsizing, commitment planning, idle detection, and storage optimization.',
        'tools': ['rightsizing_analyzer', 'ri_sp_cud_advisor', 'idle_detector', 'storage_tiering', 'k8s_optimizer', 'license_harvester'],
        'llms': ['gpt-4', 'claude-3-opus'],
        'config': {
            'max_iterations': 7,
            'max_rpm': 20,
            'temperature': 0.6,
            'max_tokens': 4000,
            'memory_enabled': True,
            'verbose': False
        }
    },
    {
        'id': 'forecasting-agent',
        'name': 'Forecasting Agent',
        'role': 'Senior Financial Analyst',
        'goal': 'Provide accurate cost forecasts and enable data-driven budget planning',
        'backstory': 'Expert in financial modeling and predictive analytics for cloud cost planning. Specializes in time series forecasting, budget planning, and scenario modeling.',
        'tools': ['arima', 'prophet', 'xgboost', 'scenario_planner', 'budget_modeler'],
        'llms': ['gpt-4', 'claude-3-opus'],
        'config': {
            'max_iterations': 5,
            'max_rpm': 15,
            'temperature': 0.3,
            'max_tokens': 5000,
            'memory_enabled': True,
            'verbose': False
        }
    },
    {
        'id': 'governance-agent',
        'name': 'Governance Agent',
        'role': 'Senior FinOps Governance Engineer',
        'goal': 'Ensure compliance with FinOps policies and governance standards',
        'backstory': 'Specialized in policy enforcement and compliance across cloud infrastructure. Expert in policy as code, tagging enforcement, budget guardrails, and exception management.',
        'tools': ['opa', 'rego', 'policy_engine', 'budget_service', 'exception_workflow'],
        'llms': ['gpt-4', 'claude-3-sonnet'],
        'config': {
            'max_iterations': 8,
            'max_rpm': 25,
            'temperature': 0.2,
            'max_tokens': 3000,
            'memory_enabled': False,
            'verbose': True
        }
    },
    {
        'id': 'explainability-agent',
        'name': 'Explainability & Audit Agent',
        'role': 'Senior Audit & Compliance Analyst',
        'goal': 'Provide complete explainability and immutable audit trails',
        'backstory': 'Focused on providing transparency and auditability for all agent decisions. Expert in reasoning assembly, audit trail generation, and explainability.',
        'tools': ['audit_ledger', 'reasoning_engine', 'signature_service', 'bundle_generator'],
        'llms': ['gpt-4', 'claude-3-opus'],
        'config': {
            'max_iterations': 10,
            'max_rpm': 20,
            'temperature': 0.5,
            'max_tokens': 6000,
            'memory_enabled': True,
            'verbose': True
        }
    },
    {
        'id': 'vendor-license-agent',
        'name': 'Vendor & License Agent',
        'role': 'Senior Software Asset Manager',
        'goal': 'Optimize license utilization and minimize true-up risks',
        'backstory': 'Expert in software license management and vendor contract optimization. Specializes in SaaS contract tracking, usage vs entitlements, and true-up risk assessment.',
        'tools': ['contract_tracker', 'usage_monitor', 'entitlement_db', 'trueup_calculator'],
        'llms': ['gpt-4', 'claude-3-sonnet'],
        'config': {
            'max_iterations': 6,
            'max_rpm': 18,
            'temperature': 0.4,
            'max_tokens': 2500,
            'memory_enabled': True,
            'verbose': False
        }
    },
    {
         'id': 'risk-overlay-agent',
         'name': 'Risk & Compliance Overlay Agent',
         'role': 'Software Risk & Compliance Specialist',
         'goal': 'Continuously evaluate vendor, operational, and exit risks across the software estate',
         'backstory': 'Combines vendor risk intel, compliance guardrails, and exit planning playbooks to keep the catalog audit-ready.',
         'tools': ['vendor_risk_engine', 'compliance_checker', 'exit_planner', 'control_library'],
         'llms': ['gpt-4', 'claude-3-sonnet'],
         'config': {
             'max_iterations': 6,
             'max_rpm': 18,
             'temperature': 0.35,
             'max_tokens': 2600,
             'memory_enabled': True,
             'verbose': False
         }
    },
    {
        'id': 'portfolio-lens-agent',
        'name': 'Portfolio Lens Agent',
        'role': 'Software Portfolio Strategist',
        'goal': 'Synthesize multi-framework assessments (TIME, Cost/Value, BCG, Pace-Layered)',
        'backstory': 'Calibrates Gartner TIME, cost-value quadrants, and portfolio matrices to guide executive action.',
        'tools': ['time_lens', 'cost_value_analyzer', 'bcg_modeler', 'pace_layer_simulator'],
        'llms': ['gpt-4', 'claude-3-sonnet'],
        'config': {
            'max_iterations': 8,
            'max_rpm': 15,
            'temperature': 0.4,
            'max_tokens': 3200,
            'memory_enabled': True,
            'verbose': True
        }
    },
    {
        'id': 'product-lens-agent',
        'name': 'Product Lens Agent',
        'role': 'Modernization & Rationalization Analyst',
        'goal': 'Drive 6R modernization, Kano differentiation, and weighted scoring playbooks',
        'backstory': 'Transforms weighted scoring templates and Kano models into actionable modernization recommendations.',
        'tools': ['sixr_engine', 'kano_classifier', 'weighted_scoring_template', 'portfolio_backlog_mgr'],
        'llms': ['gpt-4', 'claude-3-haiku'],
        'config': {
            'max_iterations': 7,
            'max_rpm': 20,
            'temperature': 0.3,
            'max_tokens': 2800,
            'memory_enabled': True,
            'verbose': True
        }
    }
]

# Enhanced CrewAI Task Definitions
TASKS = [
    # FinOps Orchestrator Tasks
    {
        'id': 'task-orch-1',
        'name': 'Plan Multi-Agent Workflow',
        'description': 'Plan and coordinate multi-agent workflows for anomaly resolution',
        'expected_input': 'Workflow requests, anomaly alerts, SLA definitions, agent status updates',
        'expected_output': 'Workflow execution plan with assigned agents and tasks',
        'agent': 'finops-orchestrator'
    },
    {
        'id': 'task-orch-2',
        'name': 'Enforce SLA Compliance',
        'description': 'Enforce SLA compliance across all FinOps operations',
        'expected_input': 'SLA definitions, policy rules, workflow execution status',
        'expected_output': 'SLA compliance report and remediation actions',
        'agent': 'finops-orchestrator'
    },
    {
        'id': 'task-orch-3',
        'name': 'Monitor FinOps Cadence',
        'description': 'Monitor and orchestrate FinOps cadence (daily/weekly/monthly cycles)',
        'expected_input': 'Cadence schedules, workflow status, agent availability',
        'expected_output': 'Cadence status dashboard and next action items',
        'agent': 'finops-orchestrator'
    },
    # Ingestion Agent Tasks
    {
        'id': 'task-ingest-1',
        'name': 'Provision Data Connectors',
        'description': 'Provision and configure data connectors for cloud billing exports',
        'expected_input': 'Connector configurations, API credentials, cloud provider details',
        'expected_output': 'Active connectors with validation status',
        'agent': 'ingestion-agent'
    },
    {
        'id': 'task-ingest-2',
        'name': 'Validate Schemas and Register Datasets',
        'description': 'Validate schemas and register datasets with lineage tracking',
        'expected_input': 'Schema definitions, raw data samples, metadata requirements',
        'expected_output': 'Validated datasets with complete metadata and lineage',
        'agent': 'ingestion-agent'
    },
    {
        'id': 'task-ingest-3',
        'name': 'Monitor Ingestion Health',
        'description': 'Monitor ingestion health and trigger alerts on failures',
        'expected_input': 'Connector status, data freshness metrics, error logs',
        'expected_output': 'Ingestion health dashboard and alert notifications',
        'agent': 'ingestion-agent'
    },
    # Allocation Agent Tasks
    {
        'id': 'task-alloc-1',
        'name': 'Auto-tag Assets and Reconcile Owners',
        'description': 'Auto-tag assets and reconcile owner/app/env metadata',
        'expected_input': 'Resource metadata, CMDB data, Git metadata, tagging policies',
        'expected_output': 'Tagged resources with ownership mapping',
        'agent': 'allocation-agent'
    },
    {
        'id': 'task-alloc-2',
        'name': 'Build Allocation Graphs',
        'description': 'Build allocation graphs and coverage reports',
        'expected_input': 'Tagged resources, cost data, allocation rules',
        'expected_output': 'Allocation graphs and coverage percentage reports',
        'agent': 'allocation-agent'
    },
    {
        'id': 'task-alloc-3',
        'name': 'Enforce Tagging Standards',
        'description': 'Enforce tagging standards and remediate gaps > 2% in prod accounts',
        'expected_input': 'Tagging policies, resource inventory, compliance thresholds',
        'expected_output': 'Remediation PRs, tickets, and report with coverage by BU',
        'agent': 'allocation-agent'
    },
    # Anomaly Agent Tasks
    {
        'id': 'task-anom-1',
        'name': 'Detect Cost Anomalies',
        'description': 'Detect cost spikes using streaming detectors (prophet/ADTK)',
        'expected_input': 'Cost time series, historical baselines, detection parameters',
        'expected_output': 'Anomaly alerts with severity and confidence scores',
        'agent': 'anomaly-agent'
    },
    {
        'id': 'task-anom-2',
        'name': 'Correlate Anomalies with Events',
        'description': 'Correlate anomalies with deploys, autoscaling, and incident feeds',
        'expected_input': 'Anomaly alerts, deployment events, scaling events, incident data',
        'expected_output': 'Correlation reports linking anomalies to root causes',
        'agent': 'anomaly-agent'
    },
    {
        'id': 'task-anom-3',
        'name': 'Perform Root Cause Analysis',
        'description': 'Perform root cause analysis and generate resolution recommendations',
        'expected_input': 'Anomaly details, correlation data, historical patterns',
        'expected_output': 'RCA reports with recommended actions',
        'agent': 'anomaly-agent'
    },
    # Optimization Agent Tasks
    {
        'id': 'task-opt-1',
        'name': 'Recommend Rightsizing Opportunities',
        'description': 'Recommend rightsizing opportunities for underutilized resources',
        'expected_input': 'Resource utilization data, cost data, performance metrics',
        'expected_output': 'Rightsizing recommendations with estimated savings',
        'agent': 'optimization-agent'
    },
    {
        'id': 'task-opt-2',
        'name': 'Analyze Commitment Coverage',
        'description': 'Analyze RI/SP/CUD coverage and recommend commitment purchases',
        'expected_input': 'Usage patterns, commitment inventory, pricing data',
        'expected_output': 'Commitment recommendations with ROI analysis',
        'agent': 'optimization-agent'
    },
    {
        'id': 'task-opt-3',
        'name': 'Identify Idle Resources',
        'description': 'Identify and recommend cleanup of idle resources',
        'expected_input': 'Resource utilization, cost data, idle detection rules',
        'expected_output': 'Idle resource list with cleanup recommendations',
        'agent': 'optimization-agent'
    },
    {
        'id': 'task-opt-4',
        'name': 'Optimize Storage and K8s',
        'description': 'Optimize storage tiering and K8s requests/limits tuning',
        'expected_input': 'Storage usage patterns, K8s resource requests/limits, cost data',
        'expected_output': 'Storage and K8s optimization recommendations',
        'agent': 'optimization-agent'
    },
    # Forecasting Agent Tasks
    {
        'id': 'task-forecast-1',
        'name': 'Generate Cost Forecasts',
        'description': 'Generate multivariate time series forecasts using ARIMA/Prophet/XGBoost',
        'expected_input': 'Historical cost data, usage trends, business calendar',
        'expected_output': 'Cost forecasts with confidence intervals',
        'agent': 'forecasting-agent'
    },
    {
        'id': 'task-forecast-2',
        'name': 'Account for Seasonality',
        'description': 'Account for seasonality and business calendar events',
        'expected_input': 'Historical data, seasonality patterns, business events calendar',
        'expected_output': 'Seasonally-adjusted forecasts with event impact',
        'agent': 'forecasting-agent'
    },
    {
        'id': 'task-forecast-3',
        'name': 'Create Scenario Models',
        'description': 'Create scenario planning models for different growth assumptions',
        'expected_input': 'Base forecasts, growth assumptions, scenario parameters',
        'expected_output': 'Scenario-based forecasts (best/expected/worst case)',
        'agent': 'forecasting-agent'
    },
    # Governance Agent Tasks
    {
        'id': 'task-gov-1',
        'name': 'Enforce Tagging Policies',
        'description': 'Enforce tagging policies using OPA/Rego policy as code',
        'expected_input': 'Policy rules, resource metadata, tagging data',
        'expected_output': 'Policy compliance reports and remediation actions',
        'agent': 'governance-agent'
    },
    {
        'id': 'task-gov-2',
        'name': 'Monitor Budget Guardrails',
        'description': 'Monitor budget guardrails and trigger alerts on breaches',
        'expected_input': 'Budget definitions, cost data, guardrail thresholds',
        'expected_output': 'Budget breach alerts and containment recommendations',
        'agent': 'governance-agent'
    },
    {
        'id': 'task-gov-3',
        'name': 'Manage Exception Workflows',
        'description': 'Manage exception workflows for policy violations',
        'expected_input': 'Policy violations, exception requests, approval workflows',
        'expected_output': 'Exception requests, approvals, and tracking',
        'agent': 'governance-agent'
    },
    # Explainability Agent Tasks
    {
        'id': 'task-expl-1',
        'name': 'Assemble Reasoning Trails',
        'description': 'Assemble step-by-step reasoning for all agent decisions',
        'expected_input': 'Agent decision logs, tool calls, feature data',
        'expected_output': 'Detailed reasoning logs with decision paths',
        'agent': 'explainability-agent'
    },
    {
        'id': 'task-expl-2',
        'name': 'Generate Audit Bundles',
        'description': 'Produce immutable audit bundles with signatures',
        'expected_input': 'Decision logs, tool calls, approvals, feature data',
        'expected_output': 'Signed audit bundles stored in object store',
        'agent': 'explainability-agent'
    },
    {
        'id': 'task-expl-3',
        'name': 'Log Decision Artifacts',
        'description': 'Log inputs, features, tool calls, and approvals',
        'expected_input': 'Agent decision data, tool execution logs, approval records',
        'expected_output': 'Complete audit logs with all decision artifacts',
        'agent': 'explainability-agent'
    },
    {
        'id': 'task-expl-3',
        'name': 'Explain Budget Guardrail Exceptions',
        'description': 'Produce explainability package for exceeded guardrails with recommended mitigations',
        'expected_input': 'Guardrail violations, spend telemetry, policy source, stakeholder list',
        'expected_output': 'Narrative explaining breach, root cause, recommended compensating controls',
        'agent': 'explainability-agent'
    },
    {
        'id': 'task-portfolio-lens-report',
        'name': 'Generate Portfolio Lens Report',
        'description': 'Produce TIME, Cost–Value, BCG, and Pace-Layered insights for the software estate',
        'expected_input': 'Inventory snapshot, utilization metrics, capability map, scoring template',
        'expected_output': 'Multi-framework portfolio report with quadrant placements and recommended actions',
        'agent': 'portfolio-lens-agent'
    },
    {
        'id': 'task-product-modernization',
        'name': 'Compile Product Modernization Recommendations',
        'description': 'Run 6R modernization, Kano differentiation, and weighted scoring analysis',
        'expected_input': 'Scoring worksheets, renewal calendar, feature usage telemetry',
        'expected_output': 'Ranked modernization plan with decisions, actions, and owners',
        'agent': 'product-lens-agent'
    },
    {
        'id': 'task-risk-overlay',
        'name': 'Run Risk & Compliance Overlay',
        'description': 'Evaluate vendor, operational, and exit risks and surface remediation plan',
        'expected_input': 'Vendor risk questionnaires, control library, renewal notices, export readiness checklist',
        'expected_output': 'Risk overlay dashboard with remediation actions and guardrails',
        'agent': 'risk-overlay-agent'
    },
    # Vendor & License Agent Tasks
    {
        'id': 'task-vendor-1',
        'name': 'Track SaaS Contracts',
        'description': 'Track SaaS/marketplace contracts and renewal dates',
        'expected_input': 'Contract data, renewal dates, vendor information',
        'expected_output': 'Contract inventory with renewal calendar',
        'agent': 'vendor-license-agent'
    },
    {
        'id': 'task-vendor-2',
        'name': 'Compare Usage vs Entitlements',
        'description': 'Compare actual usage vs. entitlements',
        'expected_input': 'Usage data, entitlement records, license assignments',
        'expected_output': 'License utilization reports with over/under utilization',
        'agent': 'vendor-license-agent'
    },
    {
        'id': 'task-vendor-3',
        'name': 'Assess True-up Risks',
        'description': 'Assess true-up risks and recommend license optimization',
        'expected_input': 'Usage data, entitlements, contract terms, true-up policies',
        'expected_output': 'True-up risk assessment and optimization recommendations',
        'agent': 'vendor-license-agent'
    }
]

# Enhanced CrewAI Crew Definitions (Workflows)
CREWS = [
    {
        'id': 'crew-tagging-enforcement',
        'name': 'Tagging Enforcement Crew',
        'description': 'Multi-agent workflow to enforce tagging standards and remediate gaps',
        'agents': ['finops-orchestrator', 'allocation-agent', 'governance-agent'],
        'tasks': ['task-orch-1', 'task-alloc-1', 'task-alloc-3', 'task-gov-1'],
        'status': 'active'
    },
    {
        'id': 'crew-anomaly-resolution',
        'name': 'Anomaly Resolution Crew',
        'description': 'Multi-agent workflow to detect, analyze, and resolve cost anomalies',
        'agents': ['finops-orchestrator', 'anomaly-agent', 'optimization-agent', 'explainability-agent'],
        'tasks': ['task-orch-1', 'task-anom-1', 'task-anom-2', 'task-anom-3', 'task-opt-1', 'task-expl-1'],
        'status': 'active'
    },
    {
        'id': 'crew-idle-cleanup',
        'name': 'Idle Resource Cleanup Crew',
        'description': 'Multi-agent workflow to identify and clean up idle resources',
        'agents': ['finops-orchestrator', 'optimization-agent', 'governance-agent', 'explainability-agent'],
        'tasks': ['task-orch-1', 'task-opt-3', 'task-gov-2', 'task-expl-2'],
        'status': 'active'
    },
    {
        'id': 'crew-commitment-planning',
        'name': 'Commitment Planning Crew',
        'description': 'Multi-agent workflow to analyze and recommend commitment purchases',
        'agents': ['finops-orchestrator', 'optimization-agent', 'forecasting-agent', 'explainability-agent'],
        'tasks': ['task-orch-1', 'task-opt-2', 'task-forecast-1', 'task-forecast-3', 'task-expl-1'],
        'status': 'active'
    },
    {
        'id': 'crew-budget-monitoring',
        'name': 'Budget Monitoring Crew',
        'description': 'Multi-agent workflow to monitor budgets and enforce guardrails',
        'agents': ['finops-orchestrator', 'forecasting-agent', 'governance-agent', 'explainability-agent'],
        'tasks': ['task-orch-2', 'task-forecast-1', 'task-gov-2', 'task-expl-3'],
        'status': 'active'
    },
    {
        'id': 'crew-data-ingestion',
        'name': 'Data Ingestion Crew',
        'description': 'Multi-agent workflow to provision connectors and validate data',
        'agents': ['finops-orchestrator', 'ingestion-agent', 'explainability-agent'],
        'tasks': ['task-orch-3', 'task-ingest-1', 'task-ingest-2', 'task-ingest-3', 'task-expl-1'],
        'status': 'active'
    },
    {
        'id': 'crew-software-portfolio-assessment',
        'name': 'Software Portfolio Assessment Crew',
        'description': 'Coordinates portfolio lens, product modernization, and risk overlay agents to deliver product management insights',
        'agents': ['portfolio-lens-agent', 'product-lens-agent', 'risk-overlay-agent'],
        'tasks': ['task-portfolio-lens-report', 'task-product-modernization', 'task-risk-overlay'],
        'status': 'active'
    }
]

@app.get('/health')
def health():
    return {
        'ok': True,
        'service': 'CrewAI FinOps Agent Service',
        'version': '0.1.0',
        'agents_available': list(AGENT_RESPONSES.keys())
    }

@app.get('/crew/agents')
def list_agents():
    """List all available agents and their status"""
    return {
        'agents': [
            {
                'name': agent,
                'status': random.choice(['idle', 'running', 'queued']),
                'capabilities': get_agent_capabilities(agent)
            }
            for agent in AGENT_RESPONSES.keys()
        ]
    }

def get_agent_capabilities(agent: str) -> List[str]:
    """Return capabilities for each agent"""
    capabilities_map = {
        'FinOps Orchestrator': ['workflow_coordination', 'sla_enforcement', 'agent_orchestration'],
        'Allocation Agent': ['tagging', 'cost_allocation', 'cmdb_integration'],
        'Optimization Agent': ['rightsizing', 'idle_detection', 'commitment_planning'],
        'Anomaly Agent': ['spike_detection', 'rca_analysis', 'correlation'],
        'Forecasting Agent': ['time_series_forecasting', 'budget_planning', 'scenario_modeling'],
        'Governance Agent': ['policy_enforcement', 'compliance_checking', 'exception_management'],
        'Ingestion Agent': ['connector_provisioning', 'schema_validation', 'dataset_registration', 'lineage_tracking'],
        'Explainability & Audit Agent': ['reasoning_assembly', 'audit_bundle_generation', 'decision_logging', 'compliance_reporting'],
        'Vendor & License Agent': ['contract_tracking', 'license_utilization', 'trueup_risk_assessment', 'renewal_management'],
        'Portfolio TIME Lens Agent': ['time_analysis', 'portfolio_segmentation'],
        'Cost-Value Quadrant Agent': ['cost_value_segmentation', 'unit_economics_analysis'],
        'Adoption Growth Matrix Agent': ['adoption_tracking', 'growth_scoring'],
        'Pace-Layered Portfolio Agent': ['pace_layer_classification', 'architecture_guardrails'],
        'SAFe Portfolio Flow Agent': ['portfolio_flow_monitoring', 'lean_governance'],
        'TBM Capability Lens Agent': ['capability_cost_mapping', 'unit_economics_insights'],
        '6R Modernization Agent': ['sixr_decisioning', 'modernization_roadmapping'],
        'Value Differentiation Agent': ['kano_classification', 'differentiation_analysis'],
        'Weighted Scoring Agent': ['weighted_scoring', 'priority_backlog_generation'],
        'Vendor Risk Agent': ['vendor_risk_assessment', 'compliance_monitoring'],
        'Operational Fit Agent': ['control_validation', 'guardrail_enforcement'],
        'Exit Risk Agent': ['exit_planning', 'lockin_analysis']
    }
    return capabilities_map.get(agent, [])

@app.post('/crew/run', response_model=RunResult)
def run_task(t: Task):
    """Run a task with the specified agent"""
    agent_resp = AGENT_RESPONSES.get(t.agent, {})
    
    # Simulate processing time
    status = random.choice(['running', 'completed', 'queued'])
    
    result = {
        'task': t.name,
        'status': status,
        'agent': t.agent,
        'started_at': datetime.utcnow().isoformat(),
        'details': {
            'description': t.description,
            'agent': t.agent
        },
        'reasoning': agent_resp.get('reasoning', 'Task queued for processing'),
        'outputs': agent_resp.get('outputs', {})
    }
    
    if status == 'completed':
        result['completed_at'] = datetime.utcnow().isoformat()
        result['duration_ms'] = random.randint(5000, 45000)
    
    return result

@app.get('/crew/tasks/{task_id}')
def get_task_status(task_id: str):
    """Get status of a running task"""
    return {
        'task_id': task_id,
        'status': random.choice(['running', 'completed', 'failed']),
        'progress': random.randint(0, 100),
        'agent': 'Optimization Agent',
        'started_at': datetime.utcnow().isoformat()
    }

@app.get('/crew/audit')
def get_audit_trail():
    """Get recent agent decision audit trail"""
    agents = list(AGENT_RESPONSES.keys())
    return {
        'entries': [
            {
                'id': f'audit-{i}',
                'timestamp': datetime.utcnow().isoformat(),
                'agent': random.choice(agents),
                'action': random.choice(['tagging_enforcement', 'idle_cleanup', 'rightsizing_recommendation']),
                'decision': f'Sample decision from {random.choice(agents)}',
                'confidence': round(random.uniform(0.7, 0.99), 2)
            }
            for i in range(10)
        ]
    }

# Enhanced endpoints for CrewAI definitions
@app.get('/v1/agents')
def get_agents():
    """Get all CrewAI agents with full definitions"""
    return {
        'data': AGENTS,
        'total': len(AGENTS)
    }

@app.get('/v1/agents/{agent_id}')
def get_agent(agent_id: str):
    """Get a specific agent by ID"""
    agent = next((a for a in AGENTS if a['id'] == agent_id), None)
    if not agent:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail='Agent not found')
    return agent

@app.get('/v1/tasks')
def get_tasks():
    """Get all CrewAI tasks with full definitions"""
    return {
        'data': TASKS,
        'total': len(TASKS)
    }

@app.get('/v1/tasks/{task_id}')
def get_task(task_id: str):
    """Get a specific task by ID"""
    task = next((t for t in TASKS if t['id'] == task_id), None)
    if not task:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail='Task not found')
    return task

@app.get('/v1/tasks/agent/{agent_id}')
def get_tasks_by_agent(agent_id: str):
    """Get all tasks for a specific agent"""
    tasks = [t for t in TASKS if t['agent'] == agent_id]
    return {
        'data': tasks,
        'total': len(tasks)
    }

@app.get('/v1/crews')
def get_crews():
    """Get all CrewAI crews (workflows) with full definitions"""
    return {
        'data': CREWS,
        'total': len(CREWS)
    }

@app.get('/v1/crews/{crew_id}')
def get_crew(crew_id: str):
    """Get a specific crew by ID with expanded agent and task details"""
    crew = next((c for c in CREWS if c['id'] == crew_id), None)
    if not crew:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail='Crew not found')
    
    # Expand agent and task details
    expanded_crew = crew.copy()
    expanded_crew['agent_details'] = [a for a in AGENTS if a['id'] in crew['agents']]
    expanded_crew['task_details'] = [t for t in TASKS if t['id'] in crew['tasks']]
    
    return expanded_crew

