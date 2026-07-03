import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Heading,
  Card,
  CardBody,
  VStack,
  HStack,
  Badge,
  Text,
  Button,
  Select,
  useColorModeValue,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { ChevronDownIcon, CheckCircleIcon } from '@chakra-ui/icons';
import { WorkflowVisualization, WorkflowStep, ResolutionOption } from '../components/WorkflowVisualization';
import { AgenticFlowModal } from '../components/AgenticFlowModal';
import { useFinOpsOptional } from '../contexts/FinOpsContext';
import { buildAnomaliesUrl, type FinOpsListPageProps } from '../utils/finopsApi';

import { API_V1 as API_URL } from '../config';

const AI_SERVICES = new Set([
  'OpenAI API',
  'Azure OpenAI',
  'Vertex AI',
  'Bedrock',
  'Anthropic API',
  'GPU Compute',
  'ML Pipeline',
]);

function isAIService(service: string) {
  return AI_SERVICES.has(service);
}

// Helper to generate mock workflow steps (3-5 steps depending on case)
function generateResolutionWorkflow(service: string, severity?: string, type?: string, requiresHumanInput?: boolean, amount?: number) {
  // Generate a mock amount if not provided
  const anomalyAmount = amount || (Math.random() * 500 + 200); // Default between $200-$700
  // Determine number of steps based on severity and service complexity
  let numSteps = 3; // Default
  if (severity === 'critical' || severity === 'high') {
    numSteps = 5; // Critical/high severity needs more steps
  } else if (severity === 'medium') {
    numSteps = 4; // Medium severity
  }
  
  // Service-based adjustments
  if (service === 'EKS' || service === 'RDS') {
    numSteps = Math.max(numSteps, 4); // Complex services need more steps
  }

  // Generate resolution options based on service and type
  const generateResolutionOptions = (): ResolutionOption[] => {
    const baseOptions: ResolutionOption[] = [];

    if (isAIService(service)) {
      baseOptions.push(
        {
          id: 'tier',
          name: 'Tier Model by Use Case',
          description: 'Route simple flows to economy models (e.g. nano) and reserve premium models for complex steps',
          estimatedSavings: 180 + Math.random() * 420,
          riskLevel: 'low',
          confidence: 0.88,
        },
        {
          id: 'cache',
          name: 'Enable Prompt Caching',
          description: 'Cache repeated system prompts and RAG context to cut input token volume',
          estimatedSavings: 120 + Math.random() * 280,
          riskLevel: 'low',
          confidence: 0.85,
        },
        {
          id: 'retry',
          name: 'Retry Backoff & Circuit Breaker',
          description: 'Add exponential backoff and circuit breakers to stop retry storms doubling token spend',
          estimatedSavings: 90 + Math.random() * 200,
          riskLevel: 'medium',
          confidence: 0.82,
        },
        {
          id: 'tokens',
          name: 'Cap max_tokens & Context',
          description: 'Tighten max_tokens defaults and trim context windows for non-interactive workflows',
          estimatedSavings: 60 + Math.random() * 150,
          riskLevel: 'low',
          confidence: 0.9,
        },
      );
      return baseOptions.slice(0, 3);
    }
    
    // Service-specific options
    if (service === 'EC2') {
      baseOptions.push(
        {
          id: 'rightsize',
          name: 'Right-size Instances',
          description: 'Downsize over-provisioned EC2 instances to match actual workload requirements',
          estimatedSavings: 500 + Math.random() * 1000,
          riskLevel: 'low',
          confidence: 0.85,
        },
        {
          id: 'reserved',
          name: 'Convert to Reserved Instances',
          description: 'Purchase Reserved Instances for predictable workloads with 1-3 year commitment',
          estimatedSavings: 800 + Math.random() * 1200,
          riskLevel: 'low',
          confidence: 0.90,
        },
        {
          id: 'autoscale',
          name: 'Optimize Auto-scaling',
          description: 'Adjust auto-scaling thresholds to reduce unnecessary instance launches',
          estimatedSavings: 300 + Math.random() * 600,
          riskLevel: 'medium',
          confidence: 0.75,
        }
      );
    } else if (service === 'S3') {
      baseOptions.push(
        {
          id: 'lifecycle',
          name: 'Configure Lifecycle Policies',
          description: 'Move infrequently accessed data to cheaper storage classes (IA, Glacier)',
          estimatedSavings: 200 + Math.random() * 500,
          riskLevel: 'low',
          confidence: 0.80,
        },
        {
          id: 'delete',
          name: 'Remove Unused Objects',
          description: 'Delete orphaned or unused S3 objects and old versions',
          estimatedSavings: 150 + Math.random() * 400,
          riskLevel: 'low',
          confidence: 0.95,
        }
      );
    } else if (service === 'RDS') {
      baseOptions.push(
        {
          id: 'instance',
          name: 'Right-size Database Instances',
          description: 'Downsize RDS instances based on actual CPU and memory utilization',
          estimatedSavings: 600 + Math.random() * 1000,
          riskLevel: 'medium',
          confidence: 0.80,
        },
        {
          id: 'backup',
          name: 'Optimize Backup Retention',
          description: 'Reduce backup retention period for non-critical databases',
          estimatedSavings: 100 + Math.random() * 300,
          riskLevel: 'low',
          confidence: 0.85,
        }
      );
    } else if (service === 'Lambda') {
      baseOptions.push(
        {
          id: 'memory',
          name: 'Optimize Memory Allocation',
          description: 'Adjust Lambda memory settings to optimal levels for cost-performance balance',
          estimatedSavings: 50 + Math.random() * 200,
          riskLevel: 'low',
          confidence: 0.75,
        },
        {
          id: 'provisioned',
          name: 'Use Provisioned Concurrency',
          description: 'Enable provisioned concurrency for predictable workloads to reduce cold starts',
          estimatedSavings: 30 + Math.random() * 100,
          riskLevel: 'low',
          confidence: 0.70,
        }
      );
    } else if (service === 'EKS') {
      baseOptions.push(
        {
          id: 'cluster',
          name: 'Optimize Cluster Configuration',
          description: 'Adjust node group sizes and types based on pod resource requirements',
          estimatedSavings: 400 + Math.random() * 800,
          riskLevel: 'medium',
          confidence: 0.75,
        },
        {
          id: 'autoscaler',
          name: 'Tune Cluster Autoscaler',
          description: 'Optimize cluster autoscaler settings to reduce unnecessary node scaling',
          estimatedSavings: 200 + Math.random() * 500,
          riskLevel: 'medium',
          confidence: 0.70,
        }
      );
    }

    // Add generic options if not enough
    if (baseOptions.length < 2) {
      baseOptions.push(
        {
          id: 'schedule',
          name: 'Schedule Resource Shutdown',
          description: 'Schedule non-production resources to stop during off-hours',
          estimatedSavings: 100 + Math.random() * 300,
          riskLevel: 'low',
          confidence: 0.90,
        },
        {
          id: 'monitoring',
          name: 'Enhanced Monitoring',
          description: 'Implement detailed monitoring to identify cost optimization opportunities',
          estimatedSavings: 50 + Math.random() * 150,
          riskLevel: 'low',
          confidence: 0.60,
        }
      );
    }

    return baseOptions.slice(0, 3); // Return 2-3 options
  };

  // Select the best option (usually the one with best savings/risk ratio)
  const selectBestOption = (options: ResolutionOption[]): ResolutionOption => {
    // Score each option: savings * confidence / risk (low=1, medium=2, high=3)
    const scoredOptions = options.map(opt => ({
      option: opt,
      score: (opt.estimatedSavings || 0) * (opt.confidence || 0.5) / (opt.riskLevel === 'low' ? 1 : opt.riskLevel === 'medium' ? 2 : 3),
    }));
    scoredOptions.sort((a, b) => b.score - a.score);
    return scoredOptions[0].option;
  };

  const options = generateResolutionOptions();
  const selectedOption = selectBestOption(options);

  // Generate applied action details
  const generateAppliedAction = (opt: ResolutionOption, svc: string): { action: string; reason: string } => {
    const reasons = [
      `Selected for optimal balance of savings ($${opt.estimatedSavings?.toFixed(0)}/month) and ${opt.riskLevel} risk level`,
      `Chosen based on ${((opt.confidence || 0.5) * 100).toFixed(0)}% confidence score and high expected ROI`,
      `Recommended due to ${opt.riskLevel} risk profile and significant cost reduction potential`,
      `Best fit for ${svc} service based on utilization patterns and cost analysis`,
    ];
    const randomReason = reasons[Math.floor(Math.random() * reasons.length)];

    let action = '';
    if (opt.id === 'rightsize') {
      action = `Downsized 3 ${svc} instances from m5.xlarge to m5.large based on actual CPU utilization (avg 25%)`;
    } else if (opt.id === 'reserved') {
      action = `Purchased 2 Reserved Instances (1-year term) for stable workloads, applied to production instances`;
    } else if (opt.id === 'autoscale') {
      action = `Adjusted auto-scaling thresholds: CPU threshold increased from 40% to 65%, scale-down cooldown reduced to 3 minutes`;
    } else if (opt.id === 'lifecycle') {
      action = `Configured lifecycle policy: objects older than 30 days â†’ IA, older than 90 days â†’ Glacier`;
    } else if (opt.id === 'delete') {
      action = `Removed 15,432 unused objects and 2,341 old versions, freeing 245 GB of storage`;
    } else if (opt.id === 'instance') {
      action = `Downsized RDS instance from db.r5.xlarge to db.r5.large, adjusted backup window to off-peak hours`;
    } else if (opt.id === 'backup') {
      action = `Reduced backup retention from 30 days to 7 days for non-critical databases`;
    } else if (opt.id === 'memory') {
      action = `Optimized Lambda memory from 512MB to 256MB for 12 functions, reducing cost by 40%`;
    } else if (opt.id === 'cluster') {
      action = `Adjusted EKS node group: changed instance type from m5.large to m5.medium, scaled node count from 6 to 4`;
    } else if (opt.id === 'tier') {
      action = `Updated workflow routing: validation steps use GPT-4.1 Nano, escalation path keeps Claude Sonnet 4.6 only where required`;
    } else if (opt.id === 'cache') {
      action = `Enabled prompt caching for ${service} with 24h TTL on system prompts; estimated 35% input token reduction`;
    } else if (opt.id === 'retry') {
      action = `Applied retry policy: max 2 retries, exponential backoff starting 500ms, circuit breaker after 5 failures/min`;
    } else if (opt.id === 'tokens') {
      action = `Reduced max_tokens from 4096 to 2048 for batch flows; trimmed RAG context to top-5 chunks`;
    } else {
      action = `Applied ${opt.name} configuration changes based on optimization analysis`;
    }

    return { action, reason: randomReason };
  };

  // Helper to generate random confidence between 75-95
  const getRandomConfidence = () => Math.floor(Math.random() * 21) + 75;

  // Agent-specific tools mapping
  const agentTools: Record<string, string[]> = {
    'Anomaly Agent': ['cost_analyzer', 'pattern_detector', 'statistical_analyzer', 'event_correlator'],
    'Allocation Agent': ['resource_scanner', 'tag_validator', 'cost_allocator', 'metadata_parser'],
    'Optimization Agent': ['cost_optimizer', 'rightsizing_engine', 'savings_calculator', 'risk_assessor'],
    'FinOps Orchestrator': ['workflow_engine', 'policy_enforcer', 'api_client', 'notification_service'],
  };

  const allSteps: WorkflowStep[] = [
    {
      id: 'analyze',
      name: 'Analyze Anomaly Root Cause',
      status: 'completed',
      duration_ms: 2500,
      agent: 'Anomaly Agent',
      description: 'Deep analysis of cost patterns and correlation with events',
      tools: agentTools['Anomaly Agent'],
      chainOfThought: `Analyzed cost spike pattern: ${service} ${isAIService(service) ? 'token/API' : ''} showed 2.3x increase over baseline. Correlated with deployment event at ${new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}. Identified root cause as ${isAIService(service) ? (type === 'spike' ? 'token volume surge' : 'model tier or retry amplification') : type === 'spike' ? 'sudden increase in instance count' : type === 'drift' ? 'gradual cost increase over time' : 'unexpected resource provisioning'}.`,
      input: `Service: ${service}, Time Range: Last 7 days, Baseline: $${(anomalyAmount * 0.6).toFixed(2)}/day, Current: $${anomalyAmount.toFixed(2)}/day`,
      output: `Root cause identified: ${type === 'spike' ? 'Auto-scaling triggered due to traffic spike' : type === 'drift' ? 'Resource configuration drift detected' : 'New resource provisioning without proper tagging'}. Impact: ${severity} severity affecting ${service} resources.`,
      confidence: getRandomConfidence(),
    },
    {
      id: 'identify',
      name: 'Identify Impacted Resources',
      status: 'completed',
      duration_ms: 1800,
      agent: 'Allocation Agent',
      description: 'Scanning resources and identifying affected services',
      tools: agentTools['Allocation Agent'],
      chainOfThought: `Scanned all resources tagged with ${service} service. Cross-referenced with cost allocation data. Identified 12 resources contributing to the anomaly. Verified resource ownership and usage patterns to prioritize remediation.`,
      input: `Service filter: ${service}, Cost threshold: $${(anomalyAmount * 0.8).toFixed(2)}, Status: Active`,
      output: `Identified 12 impacted resources: 8 EC2 instances (i-xxx1, i-xxx2, ...), 3 RDS databases (db-xxx1, ...), 1 S3 bucket (bucket-xxx). Total cost attribution: $${anomalyAmount.toFixed(2)}/day.`,
      confidence: getRandomConfidence(),
    },
    {
      id: 'evaluate',
      name: 'Evaluate Resolution Options',
      status: 'completed',
      duration_ms: 2200,
      agent: 'Optimization Agent',
      description: 'Generating resolution strategies and evaluating cost impact',
      options: options,
      tools: agentTools['Optimization Agent'],
      chainOfThought: `Evaluated ${options.length} resolution strategies based on cost impact, risk level, and implementation complexity. Calculated ROI for each option considering implementation time and expected savings. Ranked options by confidence score and risk-adjusted savings.`,
      input: `Anomaly type: ${type}, Service: ${service}, Severity: ${severity}, Current cost: $${anomalyAmount.toFixed(2)}/day, Target reduction: ${severity === 'critical' ? '50%' : severity === 'high' ? '40%' : '30%'}`,
      output: `Generated ${options.length} resolution options: ${options.map(o => o.name).join(', ')}. Best option: ${options[0]?.name} with ${options[0]?.estimatedSavings ? `$${options[0].estimatedSavings.toFixed(0)}/month` : 'significant'} savings and ${options[0]?.riskLevel || 'low'} risk.`,
      confidence: getRandomConfidence(),
    },
  ];

  // If human input is required, add a human decision step
  if (requiresHumanInput) {
    allSteps.push({
      id: 'human-decision',
      name: 'Await Human Decision',
      status: 'pending',
      agent: 'Human-in-Loop',
      description: 'Waiting for user to select which resolution option to apply',
      options: options,
      requiresHumanInput: true,
    });
    allSteps.push({
      id: 'apply',
      name: 'Apply Selected Resolution',
      status: 'pending',
      agent: 'FinOps Orchestrator',
      description: 'Applying the user-selected resolution option',
    });
  } else {
    // Auto-select the best option
    const { action, reason } = generateAppliedAction(selectedOption, service);
    allSteps.push({
      id: 'apply',
      name: 'Apply Recommended Actions',
      status: 'completed',
      duration_ms: 3200,
      agent: 'FinOps Orchestrator',
      description: 'Executing approved remediation actions',
      selectedOption: selectedOption,
      appliedAction: action,
      appliedReason: reason,
      tools: agentTools['FinOps Orchestrator'],
      chainOfThought: `Orchestrating remediation workflow: Selected ${selectedOption.name} based on ${selectedOption.confidence ? `${(selectedOption.confidence * 100).toFixed(0)}%` : 'high'} confidence score. Executing step-by-step: 1) Backup current configuration, 2) Apply changes via API, 3) Verify changes, 4) Monitor for side effects.`,
      input: `Selected option: ${selectedOption.name}, Estimated savings: ${selectedOption.estimatedSavings ? `$${selectedOption.estimatedSavings.toFixed(0)}/month` : 'N/A'}, Risk level: ${selectedOption.riskLevel || 'low'}`,
      output: `Successfully applied ${selectedOption.name}. ${action}. Changes verified and monitoring active. Expected cost reduction: ${selectedOption.estimatedSavings ? `$${selectedOption.estimatedSavings.toFixed(0)}/month` : 'significant'}.`,
      confidence: getRandomConfidence(),
    });
  }

  allSteps.push({
    id: 'verify',
    name: 'Verify Resolution',
    status: requiresHumanInput ? 'pending' : 'completed',
    duration_ms: 1800,
    agent: 'Anomaly Agent',
    description: 'Confirming anomaly is resolved and cost normalized',
    tools: requiresHumanInput ? undefined : agentTools['Anomaly Agent'],
    chainOfThought: requiresHumanInput ? undefined : `Monitoring cost patterns post-remediation. Comparing current cost vs baseline. Verifying no new anomalies introduced. Checking resource utilization metrics. Confirming cost reduction target achieved.`,
    input: requiresHumanInput ? undefined : `Post-remediation cost data: Last 24 hours, Target: <$${(anomalyAmount * 0.7).toFixed(2)}/day, Baseline: $${(anomalyAmount * 0.6).toFixed(2)}/day`,
    output: requiresHumanInput ? undefined : `Verification complete: Cost normalized to $${(anomalyAmount * 0.65).toFixed(2)}/day (below target). No new anomalies detected. Resource utilization within normal range. Anomaly resolved successfully.`,
    confidence: requiresHumanInput ? undefined : getRandomConfidence(),
  });

  // Return the first numSteps steps (but ensure we include human decision if needed)
  if (requiresHumanInput && numSteps < 4) {
    numSteps = 4; // Ensure we have at least 4 steps for human-in-loop workflow
  }
  return allSteps.slice(0, numSteps);
}

function generateInvestigationWorkflow(
  service: string,
  severity?: string,
  type?: string,
  anomalyId?: string
): WorkflowStep[] {
  // Use anomaly ID to create consistent but varied workflows
  const idHash = anomalyId ? anomalyId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : Math.random() * 1000;
  
  // Determine number of steps based on severity and complexity
  let numSteps = 3; // Default
  if (severity === 'critical' || severity === 'high') {
    numSteps = 5; // Critical/high severity needs more investigation steps
  } else if (severity === 'medium') {
    numSteps = 4;
  }
  
  // Service-based adjustments
  if (service === 'EKS' || service === 'RDS') {
    numSteps = Math.max(numSteps, 4);
  }

  // Determine progress based on hash (consistent for same anomaly)
  const progressStage = Math.floor((idHash % 100) / 20); // 0-4 stages
  let completedSteps = 0;
  let inProgressStep = -1;
  
  if (progressStage === 0) {
    // Early stage: just started
    completedSteps = 0;
    inProgressStep = 0;
  } else if (progressStage === 1) {
    // Early-Mid: 1 completed, 1 in progress
    completedSteps = 1;
    inProgressStep = 1;
  } else if (progressStage === 2) {
    // Mid: 1-2 completed, 1 in progress
    completedSteps = Math.floor(numSteps * 0.3);
    inProgressStep = completedSteps;
  } else if (progressStage === 3) {
    // Late-Mid: 2-3 completed, 1 in progress
    completedSteps = Math.floor(numSteps * 0.6);
    inProgressStep = completedSteps;
  } else {
    // Late: mostly done, final step in progress
    completedSteps = numSteps - 1;
    inProgressStep = completedSteps;
  }

  // Ensure we don't exceed bounds
  completedSteps = Math.min(completedSteps, numSteps - 1);
  inProgressStep = Math.min(inProgressStep, numSteps - 1);

  // Different workflow step templates based on service and type
  const stepTemplates = [
    {
      id: 'analyze',
      name: 'Analyze Anomaly Pattern',
      agent: 'Anomaly Agent',
      descriptions: [
        'Analyzing cost patterns and trends',
        'Correlating with deployment events',
        'Examining historical baseline data',
        'Identifying temporal patterns',
      ],
    },
    {
      id: 'identify',
      name: 'Identify Root Cause',
      agent: 'Anomaly Agent',
      descriptions: [
        'Investigating cost drivers',
        'Tracing resource utilization spikes',
        'Analyzing service dependencies',
        'Reviewing configuration changes',
      ],
    },
    {
      id: 'correlate',
      name: 'Correlate with Events',
      agent: 'Allocation Agent',
      descriptions: [
        'Matching with deployment timeline',
        'Cross-referencing with infrastructure changes',
        'Analyzing tag coverage impact',
        'Reviewing resource allocation patterns',
      ],
    },
    {
      id: 'evaluate',
      name: 'Evaluate Impact & Solutions',
      agent: 'Optimization Agent',
      descriptions: [
        'Assessing cost impact magnitude',
        'Generating resolution strategies',
        'Evaluating optimization opportunities',
        'Calculating potential savings',
      ],
    },
    {
      id: 'validate',
      name: 'Validate Findings',
      agent: 'FinOps Orchestrator',
      descriptions: [
        'Verifying root cause analysis',
        'Cross-checking with policies',
        'Validating recommended actions',
        'Confirming investigation completeness',
      ],
    },
  ];

  // Helper to generate random confidence between 75-95
  const getRandomConfidence = () => Math.floor(Math.random() * 21) + 75;

  // Agent-specific tools mapping
  const agentTools: Record<string, string[]> = {
    'Anomaly Agent': ['cost_analyzer', 'pattern_detector', 'statistical_analyzer', 'event_correlator'],
    'Allocation Agent': ['resource_scanner', 'tag_validator', 'cost_allocator', 'metadata_parser'],
    'Optimization Agent': ['cost_optimizer', 'rightsizing_engine', 'savings_calculator', 'risk_assessor'],
    'FinOps Orchestrator': ['workflow_engine', 'policy_enforcer', 'api_client', 'notification_service'],
  };

  // Generate chain of thought, input, and output for each step type
  const getStepDetails = (templateId: string, index: number, stepStatus: string) => {
    const isCompleted = stepStatus === 'completed';
    if (!isCompleted) return {};

    const detailsMap: Record<string, any> = {
      'analyze': {
        chainOfThought: `Examining cost time series data for ${service}. Applied statistical methods (Z-score, moving average) to detect deviations. Identified ${type || 'unusual'} pattern starting ${Math.floor(Math.random() * 3) + 1} days ago. Correlated with ${Math.floor(Math.random() * 3) + 1} deployment events.`,
        input: `Service: ${service}, Time range: Last 14 days, Threshold: 2.5Ïƒ deviation, Baseline: Historical average`,
        output: `Detected anomaly pattern: ${type === 'spike' ? 'Sudden cost increase' : type === 'drift' ? 'Gradual cost increase' : 'Irregular cost pattern'} in ${service} service. Severity: ${severity || 'high'}.`,
      },
      'identify': {
        chainOfThought: `Deep-diving into resource allocation for ${service}. Checking resource tagging compliance. Analyzing resource utilization metrics vs cost attribution. Identifying misallocated or untagged resources. Tracing cost drivers to specific resource instances.`,
        input: `Service: ${service}, Focus: Root cause identification, Tag compliance check, Cost attribution analysis, Resource utilization`,
        output: `Root cause: ${Math.floor(Math.random() * 2) === 0 ? 'Auto-scaling triggered unnecessarily' : 'Resource tagging gaps causing misallocation'}. ${Math.floor(Math.random() * 5) + 8} resources involved.`,
      },
      'correlate': {
        chainOfThought: `Querying event logs for ${service} service. Cross-referencing deployment timestamps with cost spike timeline. Analyzing infrastructure changes and configuration updates. Matching events with cost anomalies using temporal correlation.`,
        input: `Service: ${service}, Event types: deployments, config_changes, scaling_events, Time window: Last 7 days`,
        output: `Found ${Math.floor(Math.random() * 3) + 2} correlated events: ${Math.floor(Math.random() * 2) + 1} deployments, ${Math.floor(Math.random() * 2) + 1} scaling events. Strong correlation detected (${Math.floor(Math.random() * 20 + 80)}% match).`,
      },
      'evaluate': {
        chainOfThought: `Calculating financial impact of anomaly on ${service}. Assessing resource utilization efficiency. Projecting cost impact if unresolved. Quantifying optimization opportunities. Generating resolution strategies with cost-benefit analysis.`,
        input: `Service: ${service}, Metrics: Cost impact, Resource utilization, Potential savings, Resolution options`,
        output: `Impact assessment: ${severity || 'high'} severity. Daily cost impact: $${(Math.random() * 500 + 200).toFixed(2)}. Potential monthly savings if resolved: $${(Math.random() * 2000 + 1000).toFixed(0)}. ${Math.floor(Math.random() * 3) + 2} resolution strategies generated.`,
      },
      'validate': {
        chainOfThought: `Synthesizing analysis results. Cross-checking findings with policy rules. Validating root cause hypothesis. Verifying recommended actions are compliant. Confirming investigation completeness and accuracy.`,
        input: `Service: ${service}, Analysis results, Recommended actions, Risk assessment, Policy compliance`,
        output: `Validation complete: Findings verified. Root cause confirmed with ${Math.floor(Math.random() * 15 + 85)}% confidence. Recommended actions are compliant and safe. Investigation ready for resolution phase.`,
      },
    };

    const details = detailsMap[templateId] || {};
    return {
      tools: agentTools[stepTemplates.find(t => t.id === templateId)?.agent || 'Anomaly Agent'] || agentTools['Anomaly Agent'],
      chainOfThought: details.chainOfThought,
      input: details.input,
      output: details.output,
      confidence: getRandomConfidence(),
    };
  };

  // Generate steps with varied descriptions
  const steps: WorkflowStep[] = [];
  for (let i = 0; i < numSteps; i++) {
    const template = stepTemplates[i];
    const descIndex = Math.floor((idHash + i) % template.descriptions.length);
    
    let status: 'completed' | 'in_progress' | 'pending';
    if (i < completedSteps) {
      status = 'completed';
    } else if (i === inProgressStep) {
      status = 'in_progress';
    } else {
      status = 'pending';
    }

    const stepDetails = getStepDetails(template.id, i, status);

    steps.push({
      id: `${template.id}-${i}`,
      name: template.name,
      status,
      agent: template.agent,
      description: template.descriptions[descIndex],
      duration_ms: status === 'completed' ? 1500 + Math.random() * 3000 : undefined,
      ...stepDetails,
    });
  }

  return steps;
}

export default function Anomalies({ scope, useFinOpsPeriod, title, subtitle }: FinOpsListPageProps = {}) {
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [selectedAnomaly, setSelectedAnomaly] = useState<any>(null);
  const [filter, setFilter] = useState<string>('');
  const [resolvingAnomaly, setResolvingAnomaly] = useState<any>(null);
  const [isAgenticFlowOpen, setIsAgenticFlowOpen] = useState(false);
  const [newlyResolvedIds, setNewlyResolvedIds] = useState<Set<string>>(new Set());
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bg = useColorModeValue('white', 'gray.800');
  const muted = useColorModeValue('gray.600', 'gray.400');
  const finOps = useFinOpsOptional();
  const from = useFinOpsPeriod && finOps ? finOps.timeRangeFrom : undefined;
  const to = useFinOpsPeriod && finOps ? finOps.timeRangeTo : undefined;

  const listUrl = useCallback(
    () => buildAnomaliesUrl(filter, scope, from, to),
    [filter, scope, from, to],
  );

  useEffect(() => {
    fetch(listUrl())
      .then((r) => r.json())
      .then((data) => {
        const anomaliesData = data.data || [];
        // Helper function to deterministically determine if an item requires human input
        const shouldRequireHumanInput = (id: string, status: string): boolean => {
          if (status !== 'open') return false;
          // Use a hash of the ID to deterministically assign HITL (about 20% chance)
          const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          return (hash % 5) === 0; // Approximately 20% will have hash % 5 === 0
        };
        
        // Enhance anomalies with resolution types and workflows
        const enhanced = anomaliesData.map((anomaly: any) => {
          // Use deterministic assignment based on anomaly ID
          anomaly.requiresHumanInput = shouldRequireHumanInput(anomaly.id, anomaly.status);
          
          // Add resolution_type for resolved anomalies
          if (anomaly.status === 'resolved') {
            anomaly.resolution_type = Math.random() > 0.5 ? 'ai' : 'manual';
            if (anomaly.resolution_type === 'ai') {
              // Resolved workflows should not have human input
              anomaly.resolution_workflow = generateResolutionWorkflow(
                anomaly.service,
                anomaly.severity,
                anomaly.type,
                false, // Never require human input for resolved workflows
                anomaly.cost_increase ?? anomaly.amount
              );
            }
          }
          // Add investigation workflow for investigating anomalies
          if (anomaly.status === 'investigating') {
            anomaly.investigation_workflow = generateInvestigationWorkflow(
              anomaly.service,
              anomaly.severity,
              anomaly.type,
              anomaly.id
            );
          }
          return anomaly;
        });
        setAnomalies(enhanced);
      });
  }, [listUrl]);

  const openCount = anomalies.filter((a) => a.status === 'open').length;
  const investigatingCount = anomalies.filter((a) => a.status === 'investigating').length;
  const hitlCount = anomalies.filter((a) => a.requiresHumanInput && a.status === 'open').length;

  const handleViewDetails = (anomaly: any) => {
    setSelectedAnomaly(anomaly);
    onOpen();
  };

  const handleResolve = (anomaly: any, resolveType: 'manual' | 'ai' = 'ai') => {
    if (resolveType === 'ai') {
      // Show agentic flow modal
      setResolvingAnomaly(anomaly);
      setIsAgenticFlowOpen(true);
    } else {
      // Manual resolution - direct API call
      handleManualResolve(anomaly.id);
    }
  };

  const handleManualResolve = async (id: string) => {
    await fetch(`${API_URL}/anomalies/${id}/resolve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolution_type: 'manual' }),
    });
    const url = listUrl();
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        const anomaliesData = data.data || [];
        const enhanced = anomaliesData.map((anomaly: any) => {
          if (anomaly.id === id) {
            anomaly.resolution_type = 'manual';
          }
          return anomaly;
        });
        setAnomalies(enhanced);
      });
  };

  const handleAgenticFlowComplete = async (completedWorkflowSteps: WorkflowStep[]) => {
    if (resolvingAnomaly) {
      await fetch(`${API_URL}/anomalies/${resolvingAnomaly.id}/resolve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution_type: 'ai' }),
      });
      setIsAgenticFlowOpen(false);
      
      // Store the completed workflow steps with the resolving anomaly
      const anomalyId = resolvingAnomaly.id;
      setResolvingAnomaly(null);
      
      // Mark this anomaly as newly resolved
      setNewlyResolvedIds((prev) => new Set(prev).add(anomalyId));
      
      // Refresh anomalies list and use the actual workflow steps from modal
      const url = listUrl();
      fetch(url)
        .then((r) => r.json())
        .then((data) => {
          const anomaliesData = data.data || [];
          // Helper function to deterministically determine if an item requires human input
          const shouldRequireHumanInput = (id: string, status: string): boolean => {
            if (status !== 'open') return false;
            // Use a hash of the ID to deterministically assign HITL (about 20% chance)
            const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            return (hash % 5) === 0; // Approximately 20% will have hash % 5 === 0
          };
          
          const enhanced = anomaliesData.map((anomaly: any) => {
            if (anomaly.id === anomalyId) {
              anomaly.status = 'resolved';
              anomaly.resolution_type = 'ai';
              // Use the actual workflow steps from the modal - preserve ALL properties including tools, chainOfThought, input, output, confidence
              anomaly.resolution_workflow = completedWorkflowSteps.map(step => ({
                ...step, // This should already include all details from the modal
                status: step.status || 'completed' as const, // Preserve status if already set
              }));
              anomaly.requiresHumanInput = false; // Resolved items don't need HITL (but workflow will show it was HITL)
            } else if (anomaly.status === 'resolved' && !anomaly.resolution_type) {
              anomaly.resolution_type = Math.random() > 0.5 ? 'ai' : 'manual';
              if (anomaly.resolution_type === 'ai') {
                anomaly.resolution_workflow = generateResolutionWorkflow(
                  anomaly.service,
                  anomaly.severity,
                  anomaly.type,
                  false,
                  anomaly.cost_increase ?? anomaly.amount
                );
              }
              anomaly.requiresHumanInput = false; // Resolved items don't need HITL
            } else if (anomaly.status === 'investigating') {
              anomaly.investigation_workflow = generateInvestigationWorkflow(
                anomaly.service,
                anomaly.severity,
                anomaly.type,
                anomaly.id
              );
              anomaly.requiresHumanInput = false; // Investigating items don't need HITL
            } else {
              // Use deterministic assignment based on anomaly ID for non-resolved items
              anomaly.requiresHumanInput = shouldRequireHumanInput(anomaly.id, anomaly.status);
            }
            return anomaly;
          });
          setAnomalies(enhanced);
        });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'red';
      case 'high':
        return 'orange';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'blue';
      default:
        return 'gray';
    }
  };

  return (
    <Box>
      <HStack mb={2} flexWrap="wrap" gap={2} align="center">
        <Heading size="lg">{title || 'Anomaly Detection Hub'}</Heading>
        {scope === 'ai' && (
          <Badge colorScheme="purple" fontSize="sm">AI workloads only</Badge>
        )}
      </HStack>
      {subtitle ? (
        <Text color={muted} mb={4}>{subtitle}</Text>
      ) : (
        <Box mb={4} />
      )}

      {scope === 'ai' && (
        <HStack spacing={4} mb={6} flexWrap="wrap">
          <Badge colorScheme={openCount > 0 ? 'orange' : 'green'} px={2} py={1}>
            {openCount} open
          </Badge>
          <Badge colorScheme="blue" px={2} py={1}>
            {investigatingCount} investigating
          </Badge>
          {hitlCount > 0 && (
            <Badge colorScheme="purple" px={2} py={1}>
              {hitlCount} awaiting human decision
            </Badge>
          )}
        </HStack>
      )}

      <HStack mb={6} spacing={4} flexWrap="wrap">
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          maxW="200px"
          placeholder="All Statuses"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved</option>
        </Select>
        <Text fontSize="sm" color="gray.500">
          {anomalies.length} anomalies found
        </Text>
        <Button
          size="sm"
          colorScheme="orange"
          variant="outline"
          onClick={async () => {
            await fetch(`${API_URL}/anomalies/reset${scope ? `?scope=${scope}` : ''}`, { method: 'POST' });
            const url = listUrl();
            fetch(url)
              .then((r) => r.json())
              .then((data) => {
                const anomaliesData = data.data || [];
                // Helper function to deterministically determine if an item requires human input
                const shouldRequireHumanInput = (id: string, status: string): boolean => {
                  if (status !== 'open') return false;
                  // Use a hash of the ID to deterministically assign HITL (about 20% chance)
                  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                  return (hash % 5) === 0; // Approximately 20% will have hash % 5 === 0
                };
                
                const enhanced = anomaliesData.map((anomaly: any) => {
                  // Use deterministic assignment based on anomaly ID
                  anomaly.requiresHumanInput = shouldRequireHumanInput(anomaly.id, anomaly.status);
                  
                  if (anomaly.status === 'resolved') {
                    anomaly.resolution_type = Math.random() > 0.5 ? 'ai' : 'manual';
                    if (anomaly.resolution_type === 'ai') {
                      anomaly.resolution_workflow = generateResolutionWorkflow(
                        anomaly.service,
                        anomaly.severity,
                        anomaly.type,
                        false, // Never require human input for resolved workflows
                        anomaly.cost_increase ?? anomaly.amount
                      );
                    }
                  }
                  if (anomaly.status === 'investigating') {
                    anomaly.investigation_workflow = generateInvestigationWorkflow(
                      anomaly.service,
                      anomaly.severity,
                      anomaly.type,
                      anomaly.id
                    );
                  }
                  return anomaly;
                });
                setAnomalies(enhanced);
              });
          }}
        >
          Refresh
        </Button>
      </HStack>

      <VStack spacing={4} align="stretch">
        {anomalies.map((anomaly) => (
          <Card key={anomaly.id} bg={bg}>
            <CardBody>
              <HStack justify="space-between" mb={2}>
                <HStack>
                  <Badge colorScheme={getSeverityColor(anomaly.severity)} fontSize="md" px={2} py={1}>
                    {anomaly.severity}
                  </Badge>
                  <Badge>{anomaly.type}</Badge>
                  {scope === 'ai' && anomaly.category && (
                    <Badge colorScheme="purple" variant="subtle">{anomaly.category}</Badge>
                  )}
                  <Text fontWeight="bold">{anomaly.service}</Text>
                  {scope === 'ai' && anomaly.model && (
                    <Text color="gray.500" fontSize="sm">{anomaly.model}</Text>
                  )}
                  {scope === 'ai' && (anomaly.workflow || anomaly.team) && (
                    <Text color="gray.500" fontSize="sm">{anomaly.workflow} / {anomaly.team}</Text>
                  )}

                  {((anomaly.status === 'open' && anomaly.requiresHumanInput) || 
                    (anomaly.resolution_workflow && anomaly.resolution_workflow.some((step: any) => step.id === 'human-decision' || step.requiresHumanInput))) && (
                    <Tooltip label={anomaly.status === 'open' ? "Human-in-Loop: Requires user decision" : "Human-in-Loop: Resolved with human decision"}>
                      <Box color="blue.500" fontSize="lg" cursor="help" as="span">
                        ðŸ‘¤
                      </Box>
                    </Tooltip>
                  )}
                </HStack>
                <HStack>
                  <Badge
                    colorScheme={
                      anomaly.status === 'resolved'
                        ? 'green'
                        : anomaly.status === 'investigating'
                        ? 'blue'
                        : 'gray'
                    }
                  >
                    {anomaly.status}
                  </Badge>
                  {anomaly.status === 'resolved' && anomaly.resolution_type && (
                    <Badge colorScheme={anomaly.resolution_type === 'ai' ? 'purple' : 'gray'}>
                      Resolved by {anomaly.resolution_type === 'ai' ? 'AI' : 'Manual'}
                    </Badge>
                  )}
                  <Button size="sm" onClick={() => handleViewDetails(anomaly)}>
                    View Details
                  </Button>
                  {anomaly.status !== 'resolved' && anomaly.status !== 'investigating' && (
                    <Menu>
                      <MenuButton as={Button} size="sm" colorScheme="green" rightIcon={<ChevronDownIcon />}>
                        Resolve
                      </MenuButton>
                      <MenuList>
                        <MenuItem onClick={() => handleResolve(anomaly, 'ai')}>
                          Resolve with AI Agents
                        </MenuItem>
                        <MenuItem onClick={() => handleResolve(anomaly, 'manual')}>
                          Mark as Resolved (Manual)
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  )}
                </HStack>
              </HStack>
              <Text fontSize="sm" color="gray.600" mb={2}>
                Detected: {new Date(anomaly.detected_at).toLocaleString()}
              </Text>
              <Text mb={2}>
                <strong>Cost Increase:</strong> ${anomaly.cost_increase.toFixed(2)} (
                {anomaly.percentage_change}% change)
              </Text>
              <Text fontSize="sm" color="gray.700" mb={2}>
                <strong>RCA Summary:</strong> {anomaly.rca_summary}
              </Text>

              {/* Show AI resolution workflow for resolved items */}
              {anomaly.status === 'resolved' &&
                anomaly.resolution_type === 'ai' &&
                anomaly.resolution_workflow && (
                  <WorkflowVisualization
                    steps={anomaly.resolution_workflow}
                    compact={false}
                    showAgent={true}
                    defaultCollapsed={!newlyResolvedIds.has(anomaly.id)}
                    isNewlyResolved={newlyResolvedIds.has(anomaly.id)}
                  />
                )}

              {/* Show investigation workflow for items under investigation */}
              {anomaly.status === 'investigating' && anomaly.investigation_workflow && (
                <Box mt={3}>
                  <WorkflowVisualization
                    steps={anomaly.investigation_workflow}
                    compact={false}
                    showAgent={true}
                    defaultCollapsed={true}
                  />
                </Box>
              )}
            </CardBody>
          </Card>
        ))}
      </VStack>

      {/* Agentic Flow Modal */}
      {resolvingAnomaly && (
        <AgenticFlowModal
          isOpen={isAgenticFlowOpen}
          onClose={() => {
            setIsAgenticFlowOpen(false);
            setResolvingAnomaly(null);
          }}
          anomalyId={resolvingAnomaly.id}
          anomalyService={resolvingAnomaly.service}
          anomalySeverity={resolvingAnomaly.severity}
          anomalyType={resolvingAnomaly.type}
          requiresHumanInput={resolvingAnomaly.requiresHumanInput}
          onComplete={handleAgenticFlowComplete}
        />
      )}

      {/* Details Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Anomaly Details</DrawerHeader>
          <DrawerBody>
            {selectedAnomaly && (
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontWeight="bold">Severity</Text>
                  <Badge colorScheme={getSeverityColor(selectedAnomaly.severity)}>
                    {selectedAnomaly.severity}
                  </Badge>
                </Box>
                <Box>
                  <Text fontWeight="bold">Type</Text>
                  <Text>{selectedAnomaly.type}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Service</Text>
                  <Text>
                    {selectedAnomaly.service}

                  </Text>
                </Box>
                {scope === 'ai' && selectedAnomaly.provider && (
                  <Box>
                    <Text fontWeight="bold">Provider</Text>
                    <Text>{selectedAnomaly.provider}</Text>
                  </Box>
                )}
                {scope === 'ai' && selectedAnomaly.model && (
                  <Box>
                    <Text fontWeight="bold">Model</Text>
                    <Text>{selectedAnomaly.model}</Text>
                  </Box>
                )}
                {scope === 'ai' && (selectedAnomaly.workflow || selectedAnomaly.team) && (
                  <Box>
                    <Text fontWeight="bold">Workflow / Team</Text>
                    <Text>{selectedAnomaly.workflow} / {selectedAnomaly.team}</Text>
                  </Box>
                )}
                {scope === 'ai' && !selectedAnomaly.model && selectedAnomaly.scope_display && (
                  <Box>
                    <Text fontWeight="bold">Scope</Text>
                    <Text>{selectedAnomaly.scope_display}</Text>
                  </Box>
                )}
                {scope === 'ai' && selectedAnomaly.category && (
                  <Box>
                    <Text fontWeight="bold">Category</Text>
                    <Badge colorScheme="purple">{selectedAnomaly.category}</Badge>
                  </Box>
                )}
                <Box>
                  <Text fontWeight="bold">Status</Text>
                  <HStack>
                    <Badge
                      colorScheme={
                        selectedAnomaly.status === 'resolved'
                          ? 'green'
                          : selectedAnomaly.status === 'investigating'
                          ? 'blue'
                          : 'gray'
                      }
                    >
                      {selectedAnomaly.status}
                    </Badge>
                    {selectedAnomaly.status === 'resolved' &&
                      selectedAnomaly.resolution_type && (
                        <Badge
                          colorScheme={selectedAnomaly.resolution_type === 'ai' ? 'purple' : 'gray'}
                        >
                          Resolved by {selectedAnomaly.resolution_type === 'ai' ? 'AI' : 'Manual'}
                        </Badge>
                      )}
                  </HStack>
                </Box>
                <Box>
                  <Text fontWeight="bold">Cost Impact</Text>
                  <Text>
                    ${selectedAnomaly.cost_increase.toFixed(2)} (
                    {selectedAnomaly.percentage_change}% increase)
                  </Text>
                </Box>
                <Divider />
                <Box>
                  <Text fontWeight="bold">Root Cause Analysis</Text>
                  <Text>{selectedAnomaly.rca_summary}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" mb={2}>Suggested Actions</Text>
                  <List spacing={2}>
                    {selectedAnomaly.suggested_actions?.map((action: string, i: number) => (
                      <ListItem key={i} display="flex" alignItems="flex-start" gap={2}>
                        <ListIcon as={CheckCircleIcon} color="green.500" mt={0.5} />
                        <Text fontSize="sm">{action}</Text>
                      </ListItem>
                    ))}
                  </List>
                </Box>
                <Box>
                  <Text fontWeight="bold">Owner</Text>
                  <Text>{selectedAnomaly.owner}</Text>
                </Box>

                {/* Show full resolution workflow in drawer */}
                {selectedAnomaly.status === 'resolved' &&
                  selectedAnomaly.resolution_type === 'ai' &&
                  selectedAnomaly.resolution_workflow && (
                    <>
                      <Divider />
                      <WorkflowVisualization
                        steps={selectedAnomaly.resolution_workflow}
                        compact={false}
                        showAgent={true}
                        defaultCollapsed={!newlyResolvedIds.has(selectedAnomaly.id)}
                        isNewlyResolved={newlyResolvedIds.has(selectedAnomaly.id)}
                      />
                    </>
                  )}

                {/* Show full investigation workflow in drawer */}
                {selectedAnomaly.status === 'investigating' &&
                  selectedAnomaly.investigation_workflow && (
                    <>
                      <Divider />
                      <WorkflowVisualization
                        steps={selectedAnomaly.investigation_workflow}
                        compact={false}
                        showAgent={true}
                        defaultCollapsed={true}
                      />
                    </>
                  )}
              </VStack>
            )}
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Close
            </Button>
            {selectedAnomaly && selectedAnomaly.status !== 'resolved' && selectedAnomaly.status !== 'investigating' && (
              <Menu>
                <MenuButton as={Button} colorScheme="green" rightIcon={<ChevronDownIcon />}>
                  Resolve
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => {
                    handleResolve(selectedAnomaly, 'ai');
                    onClose();
                  }}>
                    Resolve with AI Agents
                  </MenuItem>
                  <MenuItem onClick={() => {
                    handleResolve(selectedAnomaly, 'manual');
                    onClose();
                  }}>
                    Mark as Resolved (Manual)
                  </MenuItem>
                </MenuList>
              </Menu>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}

