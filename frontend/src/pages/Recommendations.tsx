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
  Tooltip,
} from '@chakra-ui/react';
import { WorkflowVisualization, WorkflowStep } from '../components/WorkflowVisualization';
import { AgenticFlowModal } from '../components/AgenticFlowModal';
import { useFinOpsOptional } from '../contexts/FinOpsContext';
import { buildRecommendationsUrl, type FinOpsListPageProps } from '../utils/finopsApi';

import { API_V1 as API_URL } from '../config';

// Generate implementation workflow based on recommendation type
function generateImplementationWorkflow(
  type: string,
  service: string,
  title: string,
  recommendationId?: string,
  requiresHumanInput?: boolean
): WorkflowStep[] {
  // Use recommendation ID to create consistent workflows
  const idHash = recommendationId ? recommendationId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : Math.random() * 1000;
  
  // Determine number of steps based on type and complexity
  let numSteps = 4; // Default to 4 for most types
  if (type === 'idle-cleanup' || type === 'storage-tiering') {
    numSteps = 4; // These also have evaluate steps now
  } else if (type === 'rightsizing' || type === 'reserved-instance' || type === 'commitment-discount') {
    numSteps = 4; // These have evaluate steps
  }

  // Helper to generate random confidence between 75-95
  const getRandomConfidence = () => Math.floor(Math.random() * 21) + 75;

  // Agent-specific tools mapping
  const agentTools: Record<string, string[]> = {
    'Optimization Agent': ['cost_optimizer', 'rightsizing_engine', 'savings_calculator', 'risk_assessor'],
    'Allocation Agent': ['resource_scanner', 'tag_validator', 'cost_allocator', 'metadata_parser'],
    'FinOps Orchestrator': ['workflow_engine', 'policy_enforcer', 'api_client', 'notification_service'],
  };

  // Base steps for all recommendations
  const baseSteps: WorkflowStep[] = [
    {
      id: 'validate',
      name: 'Validate Recommendation',
      status: 'completed',
      duration_ms: 1500 + Math.random() * 1000,
      agent: 'Optimization Agent',
      description: 'Verifying resource eligibility and constraints',
      tools: agentTools['Optimization Agent'],
      chainOfThought: `Validating recommendation for ${service} service. Checking resource eligibility criteria: active status, proper tagging, cost threshold met. Verifying no conflicting recommendations exist. Confirming resource constraints and compliance requirements.`,
      input: `Recommendation type: ${type}, Service: ${service}, Resource IDs: [${service.toLowerCase()}-001, ${service.toLowerCase()}-002, ...], Cost threshold: $${(Math.random() * 500 + 100).toFixed(2)}/month`,
      output: `Validation complete: 3 resources eligible for ${type} optimization. No conflicts detected. Estimated savings: $${(Math.random() * 1000 + 200).toFixed(0)}/month. Ready for implementation.`,
      confidence: getRandomConfidence(),
    },
    {
      id: 'prepare',
      name: 'Prepare Implementation',
      status: 'completed',
      duration_ms: 2000 + Math.random() * 1500,
      agent: 'Allocation Agent',
      description: 'Preparing resource configuration and backup',
      tools: agentTools['Allocation Agent'],
      chainOfThought: `Preparing implementation environment: Creating resource snapshots for rollback capability. Validating current configuration state. Preparing API calls for resource modification. Setting up monitoring and alerting for post-implementation verification.`,
      input: `Resources: 3 ${service} resources, Action: ${type}, Backup required: Yes, Monitoring: Enabled`,
      output: `Preparation complete: 3 snapshots created, configuration validated, implementation scripts prepared. Ready to execute ${type} changes. Rollback capability enabled.`,
      confidence: getRandomConfidence(),
    },
  ];

  // Type-specific implementation steps
  let implementationSteps: WorkflowStep[] = [];
  
  if (type === 'rightsizing') {
    // Generate options for rightsizing
    const sizingOptions = [
      {
        id: 'downsize',
        name: 'Downsize Instance Type',
        description: `Reduce instance size from current to smaller tier (e.g., m5.xlarge → m5.large)`,
        estimatedSavings: 300 + Math.random() * 500,
        riskLevel: 'low' as const,
        confidence: 0.85,
      },
      {
        id: 'scale-horiz',
        name: 'Horizontal Scaling',
        description: 'Keep current instance size but scale out horizontally for better cost efficiency',
        estimatedSavings: 200 + Math.random() * 400,
        riskLevel: 'medium' as const,
        confidence: 0.70,
      },
      {
        id: 'spot',
        name: 'Use Spot Instances',
        description: 'Replace with Spot instances for non-critical workloads',
        estimatedSavings: 500 + Math.random() * 700,
        riskLevel: 'medium' as const,
        confidence: 0.75,
      },
    ];
    const selectedSizingOption = sizingOptions[0]; // Usually downsizing is best
    
    implementationSteps = [
      {
        id: 'analyze',
        name: 'Analyze Current Utilization',
        status: 'completed',
        duration_ms: 1800 + Math.random() * 1200,
        agent: 'Optimization Agent',
        description: 'Analyzing CPU, memory, and network utilization patterns',
        tools: agentTools['Optimization Agent'],
        chainOfThought: `Analyzing utilization metrics for ${service} instances over last 30 days. Calculating average CPU (25%), memory (35%), and network utilization. Identifying instances with consistent low utilization that can be downsized. Comparing current instance specs with actual workload requirements.`,
        input: `Service: ${service}, Metrics: CPU, Memory, Network, Time window: Last 30 days, Instance count: 3`,
        output: `Analysis complete: 3 instances identified with average CPU 25% (well below 50% threshold). Memory utilization 35%. Network usage minimal. Recommended downsizing from m5.xlarge to m5.large.`,
        confidence: getRandomConfidence(),
      },
      {
        id: 'evaluate',
        name: 'Evaluate Right-sizing Options',
        status: 'completed',
        duration_ms: 2200 + Math.random() * 1500,
        agent: 'Optimization Agent',
        description: 'Evaluating different instance sizing strategies and cost impact',
        options: sizingOptions,
        tools: agentTools['Optimization Agent'],
        chainOfThought: `Evaluating ${sizingOptions.length} right-sizing strategies: downsizing, horizontal scaling, and Spot instances. Calculating cost savings for each option. Assessing risk levels and application compatibility. Ranking options by ROI and risk-adjusted value.`,
        input: `Current: m5.xlarge (3 instances), Options: ${sizingOptions.map(o => o.name).join(', ')}, Current cost: $${(Math.random() * 500 + 300).toFixed(2)}/month`,
        output: `Generated ${sizingOptions.length} options. Best option: ${selectedSizingOption.name} with $${selectedSizingOption.estimatedSavings.toFixed(0)}/month savings, ${selectedSizingOption.riskLevel} risk, ${(selectedSizingOption.confidence * 100).toFixed(0)}% confidence.`,
        confidence: getRandomConfidence(),
      },
      {
        id: 'apply',
        name: 'Apply Right-sizing Changes',
        status: 'completed',
        duration_ms: 3000 + Math.random() * 2000,
        agent: 'FinOps Orchestrator',
        description: 'Modifying instance types and configurations',
        selectedOption: selectedSizingOption,
        appliedAction: `Downsized 3 ${service} instances from m5.xlarge to m5.large based on actual CPU utilization (avg 25%). Adjusted instance types to match actual workload requirements.`,
        appliedReason: `Selected ${selectedSizingOption.name} for optimal balance of savings ($${selectedSizingOption.estimatedSavings.toFixed(0)}/month) and ${selectedSizingOption.riskLevel} risk level`,
        tools: agentTools['FinOps Orchestrator'],
        chainOfThought: `Executing right-sizing workflow: 1) Stopping instances for modification, 2) Changing instance type from m5.xlarge to m5.large via API, 3) Restarting instances with new configuration, 4) Verifying application functionality, 5) Monitoring performance metrics.`,
        input: `Action: ${selectedSizingOption.name}, Instance IDs: [i-xxx1, i-xxx2, i-xxx3], Target: m5.large, Backup: Enabled`,
        output: `Successfully applied ${selectedSizingOption.name}: 3 instances downsized to m5.large. Performance verified: CPU utilization increased to 45% (still safe). Expected savings: $${selectedSizingOption.estimatedSavings.toFixed(0)}/month.`,
        confidence: getRandomConfidence(),
      },
    ];
  } else if (type === 'reserved-instance') {
    const riOptions = [
      {
        id: '1yr',
        name: '1-Year Reserved Instance',
        description: 'Standard 1-year term with no upfront payment',
        estimatedSavings: 500 + Math.random() * 1000,
        riskLevel: 'low' as const,
        confidence: 0.85,
      },
      {
        id: '3yr',
        name: '3-Year Reserved Instance',
        description: '3-year term with partial upfront payment for maximum savings',
        estimatedSavings: 1200 + Math.random() * 1500,
        riskLevel: 'medium' as const,
        confidence: 0.75,
      },
    ];
    const selectedRIOption = riOptions[0];
    
    implementationSteps = [
      {
        id: 'evaluate',
        name: 'Evaluate Reserved Instance Options',
        status: 'completed',
        duration_ms: 2200 + Math.random() * 1500,
        agent: 'Optimization Agent',
        description: 'Analyzing instance usage patterns and calculating savings',
        options: riOptions,
        tools: agentTools['Optimization Agent'],
        chainOfThought: `Analyzing ${service} instance usage patterns over last 90 days. Calculating baseline utilization and consistency. Evaluating 1-year vs 3-year Reserved Instance options. Computing total cost of ownership (TCO) for each option including upfront costs and discount rates.`,
        input: `Service: ${service}, Instance usage: Last 90 days, Options: 1-year (no upfront), 3-year (partial upfront), Current on-demand cost: $${(Math.random() * 800 + 500).toFixed(2)}/month`,
        output: `Evaluation complete: ${riOptions.length} options analyzed. Best option: ${selectedRIOption.name} with $${selectedRIOption.estimatedSavings.toFixed(0)}/month savings, ${selectedRIOption.riskLevel} risk. ROI: ${Math.floor(Math.random() * 50 + 100)}% over term.`,
        confidence: getRandomConfidence(),
      },
      {
        id: 'purchase',
        name: 'Purchase Reserved Instances',
        status: 'completed',
        duration_ms: 2500 + Math.random() * 1500,
        agent: 'FinOps Orchestrator',
        description: 'Completing Reserved Instance purchase and applying to instances',
        selectedOption: selectedRIOption,
        appliedAction: `Purchased 1-year Reserved Instances for ${service} workloads. Applied to 3 production instances with consistent usage patterns.`,
        appliedReason: 'Selected 1-year term for optimal balance of savings and flexibility',
        tools: agentTools['FinOps Orchestrator'],
        chainOfThought: `Executing Reserved Instance purchase workflow: 1) Validating instance eligibility, 2) Selecting payment option (no upfront), 3) Submitting purchase request via API, 4) Applying Reserved Instance to matching instances, 5) Verifying discount application.`,
        input: `Option: ${selectedRIOption.name}, Instance type: m5.large, Quantity: 3, Payment: No upfront, Term: 1 year`,
        output: `Purchase complete: 3 Reserved Instances purchased and applied to ${service} instances. Discount active: 30% off on-demand pricing. Monthly savings: $${selectedRIOption.estimatedSavings.toFixed(0)}/month. Total commitment: $${(selectedRIOption.estimatedSavings * 12).toFixed(0)} over 1 year.`,
        confidence: getRandomConfidence(),
      },
    ];
  } else if (type === 'idle-cleanup') {
    const cleanupOptions = [
      {
        id: 'aggressive',
        name: 'Aggressive Cleanup',
        description: 'Remove all resources with zero usage in last 7 days',
        estimatedSavings: 300 + Math.random() * 500,
        riskLevel: 'medium' as const,
        confidence: 0.90,
      },
      {
        id: 'conservative',
        name: 'Conservative Cleanup',
        description: 'Remove only resources with zero usage in last 90 days',
        estimatedSavings: 150 + Math.random() * 300,
        riskLevel: 'low' as const,
        confidence: 0.95,
      },
    ];
    const selectedCleanupOption = cleanupOptions[1]; // Conservative is safer
    
    implementationSteps = [
      {
        id: 'identify',
        name: 'Identify Idle Resources',
        status: 'completed',
        duration_ms: 2000 + Math.random() * 1500,
        agent: 'Allocation Agent',
        description: 'Scanning for unused and orphaned resources',
        tools: agentTools['Allocation Agent'],
        chainOfThought: `Scanning all ${service} resources for idle/inactive status. Checking last access timestamps, utilization metrics, and dependency relationships. Identifying orphaned resources (snapshots, volumes, instances) with no active connections. Categorizing by resource type and age.`,
        input: `Service: ${service}, Scan criteria: Last access > 90 days, Utilization: 0%, Status: Stopped/Unattached, Resource types: All`,
        output: `Identification complete: Found 12 idle resources - 5 unused snapshots, 4 unattached volumes, 3 stopped instances. Total idle cost: $${(Math.random() * 200 + 50).toFixed(2)}/month. Safe for removal.`,
        confidence: getRandomConfidence(),
      },
      {
        id: 'evaluate',
        name: 'Evaluate Cleanup Strategy',
        status: 'completed',
        duration_ms: 1800 + Math.random() * 1200,
        agent: 'Optimization Agent',
        description: 'Evaluating cleanup strategies and risk assessment',
        options: cleanupOptions,
        tools: agentTools['Optimization Agent'],
        chainOfThought: `Evaluating cleanup strategies: Conservative (90+ days) vs Aggressive (7+ days). Assessing risk of false positives for each strategy. Calculating potential savings and impact. Checking for dependencies that might prevent safe removal.`,
        input: `Idle resources: 12, Options: Conservative (90+ days, low risk), Aggressive (7+ days, medium risk), Current cost: $${(Math.random() * 200 + 50).toFixed(2)}/month`,
        output: `Strategy evaluation: ${cleanupOptions.length} options analyzed. Recommended: ${selectedCleanupOption.name} - removes ${selectedCleanupOption.id === 'conservative' ? '12' : '8'} resources safely. Estimated savings: $${selectedCleanupOption.estimatedSavings.toFixed(0)}/month, Risk: ${selectedCleanupOption.riskLevel}.`,
        confidence: getRandomConfidence(),
      },
      {
        id: 'cleanup',
        name: 'Remove Idle Resources',
        status: 'completed',
        duration_ms: 1800 + Math.random() * 1000,
        agent: 'FinOps Orchestrator',
        description: 'Safely removing identified idle resources',
        selectedOption: selectedCleanupOption,
        appliedAction: `Removed 12 idle ${service} resources including unused snapshots, unattached volumes, and stopped instances (90+ days unused).`,
        appliedReason: `Selected ${selectedCleanupOption.name} for ${selectedCleanupOption.riskLevel} risk profile and safe resource removal`,
        tools: agentTools['FinOps Orchestrator'],
        chainOfThought: `Executing cleanup workflow: 1) Final verification of resource status, 2) Creating deletion job for each resource type, 3) Removing snapshots first (safest), 4) Deleting unattached volumes, 5) Terminating stopped instances, 6) Verifying cleanup completion.`,
        input: `Strategy: ${selectedCleanupOption.name}, Resources: 12 (5 snapshots, 4 volumes, 3 instances), Confirmation: Required`,
        output: `Cleanup complete: Successfully removed 12 idle resources. Freed storage: 245 GB. Monthly savings: $${selectedCleanupOption.estimatedSavings.toFixed(0)}/month. No dependencies affected. All resources verified as truly idle.`,
        confidence: getRandomConfidence(),
      },
    ];
  } else if (type === 'storage-tiering') {
    const tieringOptions = [
      {
        id: 'standard',
        name: 'Standard Tiering',
        description: '30 days → IA, 90 days → Glacier',
        estimatedSavings: 200 + Math.random() * 400,
        riskLevel: 'low' as const,
        confidence: 0.85,
      },
      {
        id: 'aggressive',
        name: 'Aggressive Tiering',
        description: '7 days → IA, 30 days → Glacier for faster cost reduction',
        estimatedSavings: 350 + Math.random() * 500,
        riskLevel: 'medium' as const,
        confidence: 0.75,
      },
    ];
    const selectedTieringOption = tieringOptions[0]; // Standard is safer
    
    implementationSteps = [
      {
        id: 'analyze',
        name: 'Analyze Access Patterns',
        status: 'completed',
        duration_ms: 2200 + Math.random() * 1500,
        agent: 'Optimization Agent',
        description: 'Analyzing data access frequency and patterns',
        tools: agentTools['Optimization Agent'],
        chainOfThought: `Analyzing ${service} storage access patterns over last 90 days. Calculating access frequency distribution: hot (daily), warm (weekly), cold (monthly+), archived (never). Identifying objects by age and access patterns. Determining optimal storage class transitions based on data lifecycle.`,
        input: `Service: ${service}, Storage type: S3, Time window: Last 90 days, Metrics: Access frequency, Object age, Object count`,
        output: `Analysis complete: 45% objects accessed daily (hot), 30% weekly (warm), 20% monthly (cold), 5% never accessed (archive). Recommended tiering: 30 days → IA, 90 days → Glacier. Potential savings: $${(Math.random() * 400 + 200).toFixed(0)}/month.`,
        confidence: getRandomConfidence(),
      },
      {
        id: 'evaluate',
        name: 'Evaluate Tiering Strategies',
        status: 'completed',
        duration_ms: 1800 + Math.random() * 1200,
        agent: 'Optimization Agent',
        description: 'Evaluating different lifecycle policy configurations',
        options: tieringOptions,
        tools: agentTools['Optimization Agent'],
        chainOfThought: `Evaluating ${tieringOptions.length} tiering strategies: Standard (30/90 days) vs Aggressive (7/30 days). Calculating cost savings for each transition point. Assessing risk of moving frequently accessed data too early. Balancing cost reduction with access performance.`,
        input: `Current: Standard storage, Options: ${tieringOptions.map(o => o.name).join(', ')}, Current cost: $${(Math.random() * 600 + 300).toFixed(2)}/month`,
        output: `Strategy evaluation: ${tieringOptions.length} options analyzed. Recommended: ${selectedTieringOption.name} - transitions objects at ${selectedTieringOption.id === 'standard' ? '30/90 days' : '7/30 days'}. Estimated savings: $${selectedTieringOption.estimatedSavings.toFixed(0)}/month, Risk: ${selectedTieringOption.riskLevel}.`,
        confidence: getRandomConfidence(),
      },
      {
        id: 'configure',
        name: 'Configure Lifecycle Policies',
        status: 'completed',
        duration_ms: 2000 + Math.random() * 1200,
        agent: 'FinOps Orchestrator',
        description: 'Setting up automated storage tier transitions',
        selectedOption: selectedTieringOption,
        appliedAction: `Configured lifecycle policies for ${service}: objects older than 30 days → Infrequent Access, older than 90 days → Glacier.`,
        appliedReason: `Selected ${selectedTieringOption.name} for ${selectedTieringOption.riskLevel} risk profile and optimal storage cost optimization`,
        tools: agentTools['FinOps Orchestrator'],
        chainOfThought: `Configuring lifecycle policies: 1) Creating policy rules for ${service} buckets, 2) Setting transition rules (30 days → IA, 90 days → Glacier), 3) Configuring expiration rules for old versions, 4) Applying policies to buckets, 5) Verifying policy activation.`,
        input: `Strategy: ${selectedTieringOption.name}, Buckets: ${service.toLowerCase()}-bucket-1, ${service.toLowerCase()}-bucket-2, Transition rules: ${selectedTieringOption.id === 'standard' ? '30→IA, 90→Glacier' : '7→IA, 30→Glacier'}`,
        output: `Configuration complete: Lifecycle policies applied to ${service} buckets. ${selectedTieringOption.id === 'standard' ? '2.5 TB' : '3.2 TB'} eligible for tiering. Expected monthly savings: $${selectedTieringOption.estimatedSavings.toFixed(0)}. Policies active and monitoring.`,
        confidence: getRandomConfidence(),
      },
    ];
  } else if (type === 'commitment-discount') {
    const commitmentOptions = [
      {
        id: 'savings',
        name: 'Savings Plans',
        description: 'Flexible commitment with usage-based discounts',
        estimatedSavings: 400 + Math.random() * 800,
        riskLevel: 'low' as const,
        confidence: 0.80,
      },
      {
        id: 'commitment',
        name: 'Compute Commitment',
        description: 'Fixed compute capacity commitment for higher discounts',
        estimatedSavings: 600 + Math.random() * 1000,
        riskLevel: 'medium' as const,
        confidence: 0.70,
      },
    ];
    const selectedCommitmentOption = commitmentOptions[0];
    
    implementationSteps = [
      {
        id: 'evaluate',
        name: 'Evaluate Commitment Options',
        status: 'completed',
        duration_ms: 2500 + Math.random() * 1500,
        agent: 'Optimization Agent',
        description: 'Analyzing commitment discount opportunities',
        options: commitmentOptions,
        tools: agentTools['Optimization Agent'],
        chainOfThought: `Analyzing ${service} compute usage patterns for commitment eligibility. Evaluating Savings Plans (flexible) vs Compute Commitments (fixed capacity). Calculating discount rates and total cost of ownership. Projecting usage patterns to determine optimal commitment level.`,
        input: `Service: ${service}, Usage patterns: Last 90 days, Options: Savings Plans, Compute Commitments, Current on-demand cost: $${(Math.random() * 1000 + 500).toFixed(2)}/month`,
        output: `Evaluation complete: ${commitmentOptions.length} options analyzed. Best option: ${selectedCommitmentOption.name} with $${selectedCommitmentOption.estimatedSavings.toFixed(0)}/month savings, ${selectedCommitmentOption.riskLevel} risk. Recommended commitment: $${(selectedCommitmentOption.estimatedSavings * 10).toFixed(0)}/month for 1-year term.`,
        confidence: getRandomConfidence(),
      },
      {
        id: 'apply',
        name: 'Apply Commitment Discount',
        status: 'completed',
        duration_ms: 2000 + Math.random() * 1500,
        agent: 'FinOps Orchestrator',
        description: 'Applying selected commitment discount',
        selectedOption: selectedCommitmentOption,
        appliedAction: `Applied Savings Plan to ${service} workloads. Configured 1-year commitment with 20% discount on eligible usage.`,
        appliedReason: 'Selected Savings Plans for flexibility and significant cost reduction',
        tools: agentTools['FinOps Orchestrator'],
        chainOfThought: `Executing commitment purchase: 1) Calculating required commitment amount based on usage, 2) Selecting payment option (no upfront), 3) Submitting Savings Plan purchase, 4) Applying to eligible ${service} usage, 5) Verifying discount application.`,
        input: `Option: ${selectedCommitmentOption.name}, Commitment amount: $${(selectedCommitmentOption.estimatedSavings * 10).toFixed(0)}/month, Term: 1 year, Payment: No upfront`,
        output: `Commitment applied: ${selectedCommitmentOption.name} active for ${service}. 20% discount applied to eligible usage. Monthly savings: $${selectedCommitmentOption.estimatedSavings.toFixed(0)}. Commitment covers ${Math.floor(Math.random() * 20 + 70)}% of compute usage.`,
        confidence: getRandomConfidence(),
      },
    ];
  } else {
    // Generic implementation
    implementationSteps = [
      {
        id: 'implement',
        name: 'Implement Recommendation',
        status: 'completed',
        duration_ms: 2500 + Math.random() * 2000,
        agent: 'FinOps Orchestrator',
        description: 'Applying optimization changes',
        appliedAction: `Applied ${title} to ${service} resources.`,
        appliedReason: 'Implementation completed successfully based on recommendation analysis',
        tools: agentTools['FinOps Orchestrator'],
        chainOfThought: `Executing generic optimization workflow for ${title}: 1) Validating recommendation parameters, 2) Preparing resource modifications, 3) Applying changes via API, 4) Verifying changes, 5) Monitoring impact.`,
        input: `Recommendation: ${title}, Service: ${service}, Type: ${type}, Resources: Multiple`,
        output: `Implementation complete: ${title} successfully applied to ${service} resources. Changes verified and monitoring active. Expected optimization achieved.`,
        confidence: getRandomConfidence(),
      },
    ];
  }

  // If human input is required, modify the apply step to require human decision
  if (requiresHumanInput && implementationSteps.length > 0) {
    const applyStepIndex = implementationSteps.findIndex(s => s.id === 'apply' || s.id === 'purchase' || s.id === 'cleanup' || s.id === 'configure');
    if (applyStepIndex !== -1) {
      // Get options from the evaluate step (which has all the options)
      const evaluateStep = implementationSteps.find(s => s.id === 'evaluate');
      const options = evaluateStep?.options || [];
      
      // Insert human decision step before apply
      implementationSteps.splice(applyStepIndex, 0, {
        id: 'human-decision',
        name: 'Await Human Decision',
        status: 'pending',
        agent: 'Human-in-Loop',
        description: 'Waiting for user to select which implementation option to apply',
        options: options,
        requiresHumanInput: true,
      });
      
      // Update apply step to be pending
      implementationSteps[applyStepIndex + 1] = {
        ...implementationSteps[applyStepIndex + 1],
        status: 'pending',
        selectedOption: undefined,
        appliedAction: undefined,
        appliedReason: undefined,
      };
    }
  }

  // Combine base and implementation steps
  let allSteps = [...baseSteps, ...implementationSteps];
  
  // For types that need more steps, add verification
  // But don't exceed numSteps - we want to show all implementation steps
  const currentTotal = allSteps.length;
  if (currentTotal < numSteps && numSteps > 3) {
    allSteps.push({
      id: 'verify',
      name: 'Verify Implementation',
      status: requiresHumanInput ? 'pending' : 'completed',
      duration_ms: 1500 + Math.random() * 1000,
      agent: 'Optimization Agent',
      description: 'Confirming changes applied successfully and monitoring results',
      tools: requiresHumanInput ? undefined : agentTools['Optimization Agent'],
      chainOfThought: requiresHumanInput ? undefined : `Verifying implementation: 1) Checking resource configuration matches expected state, 2) Validating cost reduction achieved, 3) Monitoring resource performance metrics, 4) Confirming no side effects, 5) Documenting results.`,
      input: requiresHumanInput ? undefined : `Service: ${service}, Implementation type: ${type}, Expected savings: $${(Math.random() * 1000 + 200).toFixed(0)}/month, Monitoring window: 24 hours`,
      output: requiresHumanInput ? undefined : `Verification complete: Implementation successful for ${service}. Cost reduction verified: ${Math.floor(Math.random() * 10 + 15)}% decrease. Resource performance stable. No issues detected. Monitoring active.`,
      confidence: requiresHumanInput ? undefined : getRandomConfidence(),
    });
  }

  // Return all steps (don't slice - we want to show all implementation steps)
  return allSteps;
}

export default function Recommendations({ scope, useFinOpsPeriod, title, subtitle }: FinOpsListPageProps = {}) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [approvingRecommendation, setApprovingRecommendation] = useState<any>(null);
  const [isAgenticFlowOpen, setIsAgenticFlowOpen] = useState(false);
  const [newlyApprovedIds, setNewlyApprovedIds] = useState<Set<string>>(new Set());
  const bg = useColorModeValue('white', 'gray.800');
  const muted = useColorModeValue('gray.600', 'gray.400');
  const finOps = useFinOpsOptional();
  const from = useFinOpsPeriod && finOps ? finOps.timeRangeFrom : undefined;
  const to = useFinOpsPeriod && finOps ? finOps.timeRangeTo : undefined;

  const listUrl = useCallback(
    () => buildRecommendationsUrl(filter, scope, from, to),
    [filter, scope, from, to],
  );

  useEffect(() => {
    fetch(listUrl())
      .then((r) => r.json())
        .then((data) => {
          const recommendationsData = data.data || [];
          // Helper function to deterministically determine if an item requires human input
          const shouldRequireHumanInput = (id: string, status: string): boolean => {
            if (status !== 'draft' && status !== 'pending') return false;
            // Use a hash of the ID to deterministically assign HITL (about 20% chance)
            const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            return (hash % 5) === 0; // Approximately 20% will have hash % 5 === 0
          };
          
          // Add workflow to approved recommendations
          const enhanced = recommendationsData.map((rec: any) => {
            // Use deterministic assignment based on recommendation ID
            rec.requiresHumanInput = shouldRequireHumanInput(rec.id, rec.status);
            
            if (rec.status === 'approved' && !rec.implementation_workflow) {
              // Approved workflows should not have human input
              rec.implementation_workflow = generateImplementationWorkflow(
                rec.type,
                rec.service,
                rec.title,
                rec.id,
                false // Never require human input for approved workflows
              );
            }
            return rec;
          });
          setRecommendations(enhanced);
        });
  }, [listUrl]);

  const handleApprove = (rec: any) => {
    // Show agentic flow modal
    setApprovingRecommendation(rec);
    setIsAgenticFlowOpen(true);
  };

  const handleAgenticFlowComplete = async (completedWorkflowSteps: WorkflowStep[]) => {
    if (approvingRecommendation) {
      await fetch(`${API_URL}/recommendations/${approvingRecommendation.id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ implementation_workflow: completedWorkflowSteps }),
      });
      setIsAgenticFlowOpen(false);
      
      const recId = approvingRecommendation.id;
      setApprovingRecommendation(null);
      
      // Mark this recommendation as newly approved
      setNewlyApprovedIds((prev) => new Set(prev).add(recId));
      
      // Refresh recommendations list
      const url = listUrl();
      fetch(url)
        .then((r) => r.json())
        .then((data) => {
          const recommendationsData = data.data || [];
          // Helper function to deterministically determine if an item requires human input
          const shouldRequireHumanInput = (id: string, status: string): boolean => {
            if (status !== 'draft' && status !== 'pending') return false;
            // Use a hash of the ID to deterministically assign HITL (about 20% chance)
            const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            return (hash % 5) === 0; // Approximately 20% will have hash % 5 === 0
          };
          
          const enhanced = recommendationsData.map((rec: any) => {
            if (rec.id === recId) {
              rec.status = 'approved';
              // Use the actual workflow steps from the modal - preserve ALL properties including tools, chainOfThought, input, output, confidence
              rec.implementation_workflow = completedWorkflowSteps.map(step => ({
                ...step, // This should already include all details from the modal
                status: step.status || 'completed' as const, // Preserve status if already set
              }));
              rec.requiresHumanInput = false; // Approved items don't need HITL (but workflow will show it was HITL)
            } else if (rec.status === 'approved' && !rec.implementation_workflow) {
              // Approved workflows should not have human input
              rec.implementation_workflow = generateImplementationWorkflow(
                rec.type,
                rec.service,
                rec.title,
                rec.id,
                false // Never require human input for approved workflows
              );
              rec.requiresHumanInput = false; // Approved items don't need HITL
            } else {
              // Use deterministic assignment based on recommendation ID for non-approved items
              rec.requiresHumanInput = shouldRequireHumanInput(rec.id, rec.status);
            }
            return rec;
          });
          setRecommendations(enhanced);
        });
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'green';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'green';
      case 'medium':
        return 'yellow';
      case 'high':
        return 'red';
      default:
        return 'gray';
    }
  };

  const totalSavings = recommendations.reduce((sum, r) => sum + (r.estimated_savings || 0), 0);

  return (
    <Box>
      <Heading size="lg" mb={subtitle ? 2 : 6}>{title || 'Optimization Recommendations'}</Heading>
      {subtitle && <Text color={muted} mb={6}>{subtitle}</Text>}

      <HStack mb={6} spacing={4}>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          maxW="200px"
          placeholder="All Statuses"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
        </Select>
        <Text fontSize="sm" color="gray.500">
          {recommendations.length} recommendations • Total Savings: ${totalSavings.toFixed(2)}
        </Text>
        <Button
          size="sm"
          colorScheme="orange"
          variant="outline"
          onClick={async () => {
            await fetch(`${API_URL}/recommendations/reset${scope ? `?scope=${scope}` : ''}`, { method: 'POST' });
            const url = listUrl();
            fetch(url)
              .then((r) => r.json())
              .then((data) => {
                const recommendationsData = data.data || [];
                // Helper function to deterministically determine if an item requires human input
                const shouldRequireHumanInput = (id: string, status: string): boolean => {
                  if (status !== 'draft' && status !== 'pending') return false;
                  // Use a hash of the ID to deterministically assign HITL (about 20% chance)
                  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                  return (hash % 5) === 0; // Approximately 20% will have hash % 5 === 0
                };
                
                // Add workflow to approved recommendations
                const enhanced = recommendationsData.map((rec: any) => {
                  // Use deterministic assignment based on recommendation ID
                  rec.requiresHumanInput = shouldRequireHumanInput(rec.id, rec.status);
                  
                  if (rec.status === 'approved' && !rec.implementation_workflow) {
                    // Approved workflows should not have human input
                    rec.implementation_workflow = generateImplementationWorkflow(
                      rec.type,
                      rec.service,
                      rec.title,
                      rec.id,
                      false // Never require human input for approved workflows
                    );
                  }
                  return rec;
                });
                setRecommendations(enhanced);
              });
          }}
        >
          Refresh
        </Button>
      </HStack>

      <VStack spacing={4} align="stretch">
        {recommendations.map((rec) => (
          <Card key={rec.id} bg={bg}>
            <CardBody>
              <HStack justify="space-between" mb={2}>
                <HStack>
                  <Badge colorScheme={getConfidenceColor(rec.confidence)}>
                    {rec.confidence} confidence
                  </Badge>
                  <Badge colorScheme={getRiskColor(rec.risk_level)}>Risk: {rec.risk_level}</Badge>
                  <Badge>{rec.type}</Badge>
                  {scope === 'ai' && rec.category && (
                    <Badge colorScheme="purple" variant="subtle">{rec.category}</Badge>
                  )}
                  <Text fontWeight="bold">{rec.service}</Text>
                  {scope === 'ai' && rec.scope_display && (
                    <Text color="gray.500" fontSize="sm">{rec.scope_display}</Text>
                  )}
                  {(((rec.status === 'draft' || rec.status === 'pending') && rec.requiresHumanInput) ||
                    (rec.implementation_workflow && rec.implementation_workflow.some((step: any) => step.id === 'human-decision' || step.requiresHumanInput))) && (
                    <Tooltip label={(rec.status === 'draft' || rec.status === 'pending') ? "Human-in-Loop: Requires user decision" : "Human-in-Loop: Approved with human decision"}>
                      <Box color="blue.500" fontSize="lg" cursor="help" as="span">
                        👤
                      </Box>
                    </Tooltip>
                  )}
                </HStack>
                <HStack>
                  <Text fontWeight="bold" color="green.500">
                    ${rec.estimated_savings.toFixed(2)} savings
                  </Text>
                  <Badge
                    colorScheme={
                      rec.status === 'approved'
                        ? 'green'
                        : rec.status === 'pending'
                        ? 'blue'
                        : 'gray'
                    }
                  >
                    {rec.status}
                  </Badge>
                  {rec.status !== 'approved' && (
                    <Button size="sm" colorScheme="blue" onClick={() => handleApprove(rec)}>
                      Approve
                    </Button>
                  )}
                </HStack>
              </HStack>
              <Text fontSize="lg" fontWeight="semibold" mb={2}>
                {rec.title}
              </Text>
              <Text fontSize="sm" color="gray.600" mb={2}>
                {rec.description}
              </Text>
              <HStack fontSize="sm" color="gray.500" mb={rec.status === 'approved' && rec.implementation_workflow ? 3 : 0}>
                <Text>Agent: {rec.agent}</Text>
                <Text>•</Text>
                <Text>Effort: {rec.implementation_effort}</Text>
                <Text>•</Text>
                <Text>Created: {new Date(rec.created_at).toLocaleDateString()}</Text>
              </HStack>

              {/* Show implementation workflow for approved recommendations */}
              {rec.status === 'approved' && rec.implementation_workflow && (
                <Box mt={3}>
                  <WorkflowVisualization
                    steps={rec.implementation_workflow}
                    compact={false}
                    showAgent={true}
                    defaultCollapsed={!newlyApprovedIds.has(rec.id)}
                    isNewlyResolved={newlyApprovedIds.has(rec.id)}
                  />
                </Box>
              )}
            </CardBody>
          </Card>
        ))}
      </VStack>

      {/* Agentic Flow Modal for Approval */}
      {approvingRecommendation && (
        <AgenticFlowModal
          isOpen={isAgenticFlowOpen}
          onClose={() => {
            setIsAgenticFlowOpen(false);
            setApprovingRecommendation(null);
          }}
          anomalyId={approvingRecommendation.id}
          anomalyService={approvingRecommendation.service}
          anomalySeverity={approvingRecommendation.risk_level}
          anomalyType={approvingRecommendation.type}
          isRecommendation={true}
          recommendationTitle={approvingRecommendation.title}
          requiresHumanInput={approvingRecommendation.requiresHumanInput}
          onComplete={handleAgenticFlowComplete}
        />
      )}
    </Box>
  );
}
