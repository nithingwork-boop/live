import { useEffect, useState, useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Progress,
  Button,
  Box,
  Badge,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react';
import { CheckIcon, TimeIcon, SpinnerIcon } from '@chakra-ui/icons';
import { WorkflowStep, ResolutionOption } from './WorkflowVisualization';

interface AgenticFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  anomalyId: string;
  anomalyService: string;
  anomalySeverity?: string;
  anomalyType?: string;
  isRecommendation?: boolean; // Flag to indicate if this is for a recommendation
  recommendationTitle?: string; // Recommendation title if applicable
  requiresHumanInput?: boolean; // Flag to indicate if human input is required
  onComplete: (workflowSteps: WorkflowStep[]) => void;
}

export function AgenticFlowModal({
  isOpen,
  onClose,
  anomalyId: _anomalyId,
  anomalyService,
  anomalySeverity,
  anomalyType,
  isRecommendation = false,
  recommendationTitle,
  requiresHumanInput = false,
  onComplete,
}: AgenticFlowModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedHumanOption, setSelectedHumanOption] = useState<ResolutionOption | null>(null);
  const [waitingForHumanInput, setWaitingForHumanInput] = useState(false);
  // Store getStepDetails function in a ref so it's always accessible
  const getStepDetailsRef = useRef<((stepId: string, stepStatus: string) => any) | null>(null);

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Generate resolution options based on service
  const generateResolutionOptions = (): ResolutionOption[] => {
    const baseOptions: ResolutionOption[] = [];
    
    if (anomalyService === 'EC2') {
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
    } else if (anomalyService === 'S3') {
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
    } else if (anomalyService === 'RDS') {
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
    } else if (anomalyService === 'Lambda') {
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
    } else if (anomalyService === 'EKS') {
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
    } else if (
      ['OpenAI API', 'Azure OpenAI', 'Vertex AI', 'Bedrock', 'Anthropic API', 'GPU Compute', 'ML Pipeline'].includes(
        anomalyService,
      )
    ) {
      baseOptions.push(
        {
          id: 'tier',
          name: 'Tier Model by Use Case',
          description: 'Route simple flows to economy models; reserve premium models for complex steps',
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
          description: 'Stop retry storms from doubling effective token consumption',
          estimatedSavings: 90 + Math.random() * 200,
          riskLevel: 'medium',
          confidence: 0.82,
        },
      );
    } else {
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

    return baseOptions.slice(0, 3);
  };

  // Select the best option
  const selectBestOption = (options: ResolutionOption[]): ResolutionOption => {
    const scoredOptions = options.map(opt => ({
      option: opt,
      score: (opt.estimatedSavings || 0) * (opt.confidence || 0.5) / (opt.riskLevel === 'low' ? 1 : opt.riskLevel === 'medium' ? 2 : 3),
    }));
    scoredOptions.sort((a, b) => b.score - a.score);
    return scoredOptions[0].option;
  };

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
      action = `Configured lifecycle policy: objects older than 30 days → IA, older than 90 days → Glacier`;
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
    } else {
      action = `Applied ${opt.name} configuration changes based on optimization analysis`;
    }

    return { action, reason: randomReason };
  };

  // Generate recommendation implementation steps
  const generateRecommendationSteps = (): WorkflowStep[] => {
    // Helper to generate random confidence between 75-95
    const getRandomConfidence = () => Math.floor(Math.random() * 21) + 75;

    // Agent-specific tools mapping
    const agentTools: Record<string, string[]> = {
      'Optimization Agent': ['cost_optimizer', 'rightsizing_engine', 'savings_calculator', 'risk_assessor'],
      'Allocation Agent': ['resource_scanner', 'tag_validator', 'cost_allocator', 'metadata_parser'],
      'FinOps Orchestrator': ['workflow_engine', 'policy_enforcer', 'api_client', 'notification_service'],
      'Human-in-Loop': [], // Human doesn't use tools
    };

    let numSteps = 4; // Default to show all steps including evaluate
    if (anomalyType === 'rightsizing' || anomalyType === 'reserved-instance' || anomalyType === 'commitment-discount') {
      numSteps = 4; // These have evaluate steps
    } else if (anomalyType === 'idle-cleanup' || anomalyType === 'storage-tiering') {
      numSteps = 4; // These also have evaluate steps now
    }

    const baseSteps: WorkflowStep[] = [
      {
        id: 'validate',
        name: 'Validate Recommendation',
        status: 'pending',
        agent: 'Optimization Agent',
        description: 'Verifying resource eligibility and constraints',
      },
      {
        id: 'prepare',
        name: 'Prepare Implementation',
        status: 'pending',
        agent: 'Allocation Agent',
        description: 'Preparing resource configuration and backup',
      },
    ];

    let implementationSteps: WorkflowStep[] = [];
    
    if (anomalyType === 'rightsizing') {
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
          status: 'pending',
          agent: 'Optimization Agent',
          description: 'Analyzing CPU, memory, and network utilization patterns',
        },
        {
          id: 'evaluate',
          name: 'Evaluate Right-sizing Options',
          status: 'pending',
          agent: 'Optimization Agent',
          description: 'Evaluating different instance sizing strategies and cost impact',
          options: sizingOptions,
        },
        {
          id: 'apply',
          name: 'Apply Right-sizing Changes',
          status: 'pending',
          agent: 'FinOps Orchestrator',
          description: 'Modifying instance types and configurations',
          selectedOption: selectedSizingOption,
          appliedAction: `Downsized 3 ${anomalyService} instances from m5.xlarge to m5.large based on actual CPU utilization (avg 25%). Adjusted instance types to match actual workload requirements.`,
          appliedReason: `Selected ${selectedSizingOption.name} for optimal balance of savings ($${selectedSizingOption.estimatedSavings.toFixed(0)}/month) and ${selectedSizingOption.riskLevel} risk level`,
        },
      ];
    } else if (anomalyType === 'reserved-instance') {
      const options = [
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
      const selected = selectBestOption(options);
      const { action, reason } = generateAppliedAction(selected, anomalyService);
      
      implementationSteps = [
        {
          id: 'evaluate',
          name: 'Evaluate Reserved Instance Options',
          status: 'pending',
          agent: 'Optimization Agent',
          description: 'Analyzing instance usage patterns and calculating savings',
          options: options,
        },
        {
          id: 'purchase',
          name: 'Purchase Reserved Instances',
          status: 'pending',
          agent: 'FinOps Orchestrator',
          description: 'Completing Reserved Instance purchase and applying to instances',
          selectedOption: selected,
          appliedAction: action,
          appliedReason: reason,
        },
      ];
    } else if (anomalyType === 'idle-cleanup') {
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
          status: 'pending',
          agent: 'Allocation Agent',
          description: 'Scanning for unused and orphaned resources',
        },
        {
          id: 'evaluate',
          name: 'Evaluate Cleanup Strategy',
          status: 'pending',
          agent: 'Optimization Agent',
          description: 'Evaluating cleanup strategies and risk assessment',
          options: cleanupOptions,
        },
        {
          id: 'cleanup',
          name: 'Remove Idle Resources',
          status: 'pending',
          agent: 'FinOps Orchestrator',
          description: 'Safely removing identified idle resources',
          selectedOption: selectedCleanupOption,
          appliedAction: `Removed 12 idle ${anomalyService} resources including unused snapshots, unattached volumes, and stopped instances (90+ days unused).`,
          appliedReason: `Selected ${selectedCleanupOption.name} for ${selectedCleanupOption.riskLevel} risk profile and safe resource removal`,
        },
      ];
    } else if (anomalyType === 'storage-tiering') {
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
          status: 'pending',
          agent: 'Optimization Agent',
          description: 'Analyzing data access frequency and patterns',
        },
        {
          id: 'evaluate',
          name: 'Evaluate Tiering Strategies',
          status: 'pending',
          agent: 'Optimization Agent',
          description: 'Evaluating different lifecycle policy configurations',
          options: tieringOptions,
        },
        {
          id: 'configure',
          name: 'Configure Lifecycle Policies',
          status: 'pending',
          agent: 'FinOps Orchestrator',
          description: 'Setting up automated storage tier transitions',
          selectedOption: selectedTieringOption,
          appliedAction: `Configured lifecycle policies for ${anomalyService}: objects older than 30 days → Infrequent Access, older than 90 days → Glacier.`,
          appliedReason: `Selected ${selectedTieringOption.name} for ${selectedTieringOption.riskLevel} risk profile and optimal storage cost optimization`,
        },
      ];
    } else if (anomalyType === 'commitment-discount') {
      const options = [
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
      const selected = selectBestOption(options);
      const { action, reason } = generateAppliedAction(selected, anomalyService);
      
      implementationSteps = [
        {
          id: 'evaluate',
          name: 'Evaluate Commitment Options',
          status: 'pending',
          agent: 'Optimization Agent',
          description: 'Analyzing commitment discount opportunities',
          options: options,
        },
        {
          id: 'apply',
          name: 'Apply Commitment Discount',
          status: 'pending',
          agent: 'FinOps Orchestrator',
          description: 'Applying selected commitment discount',
          selectedOption: selected,
          appliedAction: action,
          appliedReason: reason,
        },
      ];
    } else {
      // Generic implementation with options
      const genericOptions = [
        {
          id: 'standard',
          name: 'Standard Implementation',
          description: 'Apply recommendation with standard configuration',
          estimatedSavings: 200 + Math.random() * 400,
          riskLevel: 'low' as const,
          confidence: 0.80,
        },
        {
          id: 'optimized',
          name: 'Optimized Implementation',
          description: 'Apply recommendation with enhanced optimization settings',
          estimatedSavings: 350 + Math.random() * 500,
          riskLevel: 'medium' as const,
          confidence: 0.75,
        },
      ];
      const selectedGenericOption = genericOptions[0];
      
      implementationSteps = [
        {
          id: 'evaluate',
          name: 'Evaluate Implementation Options',
          status: 'pending',
          agent: 'Optimization Agent',
          description: 'Evaluating implementation strategies',
          options: genericOptions,
        },
        {
          id: 'implement',
          name: 'Implement Recommendation',
          status: 'pending',
          agent: 'FinOps Orchestrator',
          description: 'Applying optimization changes',
          selectedOption: selectedGenericOption,
          appliedAction: `Applied ${recommendationTitle || 'recommendation'} to ${anomalyService} resources using ${selectedGenericOption.name} configuration.`,
          appliedReason: `Selected ${selectedGenericOption.name} for ${selectedGenericOption.riskLevel} risk profile and optimal savings ($${selectedGenericOption.estimatedSavings.toFixed(0)}/month)`,
        },
      ];
    }

    let allSteps = [...baseSteps, ...implementationSteps];
    const currentTotal = allSteps.length;
    if (currentTotal < numSteps && numSteps > 3) {
      allSteps.push({
        id: 'verify',
        name: 'Verify Implementation',
        status: 'pending',
        agent: 'Optimization Agent',
        description: 'Confirming changes applied successfully and monitoring results',
      });
    }

    // If human input is required, modify the apply step to require human decision
    if (requiresHumanInput && implementationSteps.length > 0) {
      const applyStepIndex = allSteps.findIndex(s => s.id === 'apply' || s.id === 'purchase' || s.id === 'cleanup' || s.id === 'configure');
      if (applyStepIndex !== -1) {
        // Get options from the evaluate step (which has all the options)
        const evaluateStep = allSteps.find(s => s.id === 'evaluate');
        const options = evaluateStep?.options || [];
        
        // Insert human decision step before apply
        allSteps.splice(applyStepIndex, 0, {
          id: 'human-decision',
          name: 'Await Human Decision',
          status: 'pending',
          agent: 'Human-in-Loop',
          description: 'Waiting for user to select which implementation option to apply',
          options: options,
          requiresHumanInput: true,
        });
        
        // Update apply step to be pending without selected option
        allSteps[applyStepIndex + 1] = {
          ...allSteps[applyStepIndex + 1],
          selectedOption: undefined,
          appliedAction: undefined,
          appliedReason: undefined,
        };
      }
    }

    // Store details generation function for use when steps complete
    (allSteps as any).getStepDetails = (stepId: string, stepStatus: string) => {
      if (stepStatus !== 'completed') return {};
      
      // Get recommendation-specific details based on step ID and type
      const detailsMap: Record<string, any> = {
        'validate': {
          tools: agentTools['Optimization Agent'],
          chainOfThought: `Validating recommendation for ${anomalyService} service. Checking resource eligibility criteria: active status, proper tagging, cost threshold met. Verifying no conflicting recommendations exist. Confirming resource constraints and compliance requirements.`,
          input: `Recommendation type: ${anomalyType}, Service: ${anomalyService}, Resource IDs: [${anomalyService.toLowerCase()}-001, ${anomalyService.toLowerCase()}-002, ...], Cost threshold: $${(Math.random() * 500 + 100).toFixed(2)}/month`,
          output: `Validation complete: 3 resources eligible for ${anomalyType} optimization. No conflicts detected. Estimated savings: $${(Math.random() * 1000 + 200).toFixed(0)}/month. Ready for implementation.`,
          confidence: getRandomConfidence(),
        },
        'prepare': {
          tools: agentTools['Allocation Agent'],
          chainOfThought: `Preparing implementation environment: Creating resource snapshots for rollback capability. Validating current configuration state. Preparing API calls for resource modification. Setting up monitoring and alerting for post-implementation verification.`,
          input: `Resources: 3 ${anomalyService} resources, Action: ${anomalyType}, Backup required: Yes, Monitoring: Enabled`,
          output: `Preparation complete: 3 snapshots created, configuration validated, implementation scripts prepared. Ready to execute ${anomalyType} changes. Rollback capability enabled.`,
          confidence: getRandomConfidence(),
        },
        'analyze': {
          tools: agentTools['Optimization Agent'],
          chainOfThought: `Analyzing utilization metrics for ${anomalyService} instances over last 30 days. Calculating average CPU (25%), memory (35%), and network utilization. Identifying instances with consistent low utilization that can be optimized. Comparing current specs with actual workload requirements.`,
          input: `Service: ${anomalyService}, Metrics: CPU, Memory, Network, Time window: Last 30 days, Instance count: 3`,
          output: `Analysis complete: 3 instances identified with average CPU 25% (well below 50% threshold). Memory utilization 35%. Network usage minimal. Recommended optimization: ${anomalyType}.`,
          confidence: getRandomConfidence(),
        },
        'identify': {
          tools: agentTools['Allocation Agent'],
          chainOfThought: `Scanning all ${anomalyService} resources for idle/inactive status. Checking last access timestamps, utilization metrics, and dependency relationships. Identifying orphaned resources (snapshots, volumes, instances) with no active connections. Categorizing by resource type and age.`,
          input: `Service: ${anomalyService}, Scan criteria: Last access > 90 days, Utilization: 0%, Status: Stopped/Unattached, Resource types: All`,
          output: `Identification complete: Found 12 idle resources - 5 unused snapshots, 4 unattached volumes, 3 stopped instances. Total idle cost: $${(Math.random() * 200 + 50).toFixed(2)}/month. Safe for removal.`,
          confidence: getRandomConfidence(),
        },
        'evaluate': {
          tools: agentTools['Optimization Agent'],
          chainOfThought: `Evaluating implementation strategies based on cost impact, risk level, and implementation complexity. Calculating ROI for each option considering implementation time and expected savings. Ranked options by confidence score and risk-adjusted savings.`,
          input: `Recommendation type: ${anomalyType}, Service: ${anomalyService}, Current cost: $${(Math.random() * 500 + 300).toFixed(2)}/month, Target optimization: ${anomalyType}`,
          output: `Evaluation complete: Generated implementation options. Best option identified with ${Math.floor(Math.random() * 15 + 80)}% confidence. Expected savings: $${(Math.random() * 1000 + 200).toFixed(0)}/month.`,
          confidence: getRandomConfidence(),
        },
        'apply': {
          tools: agentTools['FinOps Orchestrator'],
          chainOfThought: `Executing implementation workflow: Selected best option based on confidence score. Executing step-by-step: 1) Backup current configuration, 2) Apply changes via API, 3) Verify changes, 4) Monitor for side effects.`,
          input: `Action: ${anomalyType}, Service: ${anomalyService}, Resources: 3 resources, Backup: Enabled`,
          output: `Implementation complete: Successfully applied ${anomalyType} optimization to ${anomalyService}. Changes verified and monitoring active. Expected savings: $${(Math.random() * 1000 + 200).toFixed(0)}/month.`,
          confidence: getRandomConfidence(),
        },
        'purchase': {
          tools: agentTools['FinOps Orchestrator'],
          chainOfThought: `Executing Reserved Instance purchase workflow: 1) Validating instance eligibility, 2) Selecting payment option, 3) Submitting purchase request via API, 4) Applying Reserved Instance to matching instances, 5) Verifying discount application.`,
          input: `Service: ${anomalyService}, Instance type: m5.large, Quantity: 3, Payment: No upfront, Term: 1 year`,
          output: `Purchase complete: 3 Reserved Instances purchased and applied to ${anomalyService} instances. Discount active: 30% off on-demand pricing. Monthly savings: $${(Math.random() * 1000 + 400).toFixed(0)}/month.`,
          confidence: getRandomConfidence(),
        },
        'cleanup': {
          tools: agentTools['FinOps Orchestrator'],
          chainOfThought: `Executing cleanup workflow: 1) Final verification of resource status, 2) Creating deletion job for each resource type, 3) Removing snapshots first (safest), 4) Deleting unattached volumes, 5) Terminating stopped instances, 6) Verifying cleanup completion.`,
          input: `Service: ${anomalyService}, Resources: 12 (5 snapshots, 4 volumes, 3 instances), Confirmation: Required`,
          output: `Cleanup complete: Successfully removed 12 idle resources. Freed storage: 245 GB. Monthly savings: $${(Math.random() * 500 + 150).toFixed(0)}/month. No dependencies affected.`,
          confidence: getRandomConfidence(),
        },
        'configure': {
          tools: agentTools['FinOps Orchestrator'],
          chainOfThought: `Configuring lifecycle policies: 1) Creating policy rules for ${anomalyService} buckets, 2) Setting transition rules (30 days → IA, 90 days → Glacier), 3) Configuring expiration rules for old versions, 4) Applying policies to buckets, 5) Verifying policy activation.`,
          input: `Service: ${anomalyService}, Buckets: ${anomalyService.toLowerCase()}-bucket-1, ${anomalyService.toLowerCase()}-bucket-2, Transition rules: 30→IA, 90→Glacier`,
          output: `Configuration complete: Lifecycle policies applied to ${anomalyService} buckets. 2.5 TB eligible for tiering. Expected monthly savings: $${(Math.random() * 400 + 200).toFixed(0)}. Policies active and monitoring.`,
          confidence: getRandomConfidence(),
        },
        'implement': {
          tools: agentTools['FinOps Orchestrator'],
          chainOfThought: `Executing generic optimization workflow for ${recommendationTitle || anomalyType}: 1) Validating recommendation parameters, 2) Preparing resource modifications, 3) Applying changes via API, 4) Verifying changes, 5) Monitoring impact.`,
          input: `Recommendation: ${recommendationTitle || anomalyType}, Service: ${anomalyService}, Type: ${anomalyType}, Resources: Multiple`,
          output: `Implementation complete: ${recommendationTitle || anomalyType} successfully applied to ${anomalyService} resources. Changes verified and monitoring active. Expected optimization achieved.`,
          confidence: getRandomConfidence(),
        },
        'verify': {
          tools: agentTools['Optimization Agent'],
          chainOfThought: `Verifying implementation: 1) Checking resource configuration matches expected state, 2) Validating cost reduction achieved, 3) Monitoring resource performance metrics, 4) Confirming no side effects, 5) Documenting results.`,
          input: `Service: ${anomalyService}, Implementation type: ${anomalyType}, Expected savings: $${(Math.random() * 1000 + 200).toFixed(0)}/month, Monitoring window: 24 hours`,
          output: `Verification complete: Implementation successful for ${anomalyService}. Cost reduction verified: ${Math.floor(Math.random() * 10 + 15)}% decrease. Resource performance stable. No issues detected. Monitoring active.`,
          confidence: getRandomConfidence(),
        },
      };
      
      return detailsMap[stepId] || {};
    };

    // Return all steps (don't slice - we want to show all implementation steps)
    let stepsToReturn = allSteps.map(step => ({ ...step, status: 'pending' as const }));
    
    // Attach getStepDetails function to the returned array so it can be accessed later
    (stepsToReturn as any).getStepDetails = (allSteps as any).getStepDetails;
    
    return stepsToReturn;
  };

  // Generate workflow steps based on anomaly characteristics
  const generateSteps = (): WorkflowStep[] => {
    // If this is for a recommendation, use recommendation-specific steps
    if (isRecommendation) {
      return generateRecommendationSteps();
    }

    // Otherwise, use anomaly resolution steps
    let numSteps = 3; // Default
    if (anomalySeverity === 'critical' || anomalySeverity === 'high') {
      numSteps = 5; // Critical/high severity needs more steps
    } else if (anomalySeverity === 'medium') {
      numSteps = 4; // Medium severity
    }
    
    // Service-based adjustments
    if (anomalyService === 'EKS' || anomalyService === 'RDS') {
      numSteps = Math.max(numSteps, 4); // Complex services need more steps
    }

    // Helper to generate random confidence between 75-95
    const getRandomConfidence = () => Math.floor(Math.random() * 21) + 75;

    // Agent-specific tools mapping
    const agentTools: Record<string, string[]> = {
      'Anomaly Agent': ['cost_analyzer', 'pattern_detector', 'statistical_analyzer', 'event_correlator'],
      'Allocation Agent': ['resource_scanner', 'tag_validator', 'cost_allocator', 'metadata_parser'],
      'Optimization Agent': ['cost_optimizer', 'rightsizing_engine', 'savings_calculator', 'risk_assessor'],
      'FinOps Orchestrator': ['workflow_engine', 'policy_enforcer', 'api_client', 'notification_service'],
      'Human-in-Loop': [], // Human doesn't use tools
    };

    // Generate a mock amount for details
    const anomalyAmount = Math.random() * 500 + 200; // Between $200-$700

    // Generate options and selected option
    const options = generateResolutionOptions();
    const selectedOption = selectBestOption(options);
    const { action, reason } = generateAppliedAction(selectedOption, anomalyService);

    const allSteps: WorkflowStep[] = [
      {
        id: 'analyze',
        name: 'Analyze Anomaly Root Cause',
        status: 'pending',
        agent: 'Anomaly Agent',
        description: 'Deep analysis of cost patterns and correlation with events',
        // Details will be added when step is completed
      },
      {
        id: 'identify',
        name: 'Identify Impacted Resources',
        status: 'pending',
        agent: 'Allocation Agent',
        description: 'Scanning resources and identifying affected services',
      },
      {
        id: 'evaluate',
        name: 'Evaluate Resolution Options',
        status: 'pending',
        agent: 'Optimization Agent',
        description: 'Generating resolution strategies and evaluating cost impact',
        options: options,
      },
    ];

    // If human input is required, add human decision step
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
      
      // Verify step will be added after apply for both cases
    } else {
      allSteps.push({
        id: 'apply',
        name: 'Apply Recommended Actions',
        status: 'pending',
        agent: 'FinOps Orchestrator',
        description: 'Executing approved remediation actions',
        selectedOption: selectedOption,
        appliedAction: action,
        appliedReason: reason,
      });
    }

    // Add verify step after apply for all workflows
    allSteps.push({
      id: 'verify',
      name: 'Verify Resolution',
      status: 'pending',
      agent: 'Anomaly Agent',
      description: 'Confirming anomaly is resolved and cost normalized',
    });

    // Store details generation function for use when steps complete
    (allSteps as any).getStepDetails = (stepId: string, stepStatus: string) => {
      if (stepStatus !== 'completed') return {};
      
      const detailsMap: Record<string, any> = {
        'analyze': {
          tools: agentTools['Anomaly Agent'],
          chainOfThought: `Analyzed cost spike pattern: ${anomalyService} service showed 2.3x increase over baseline. Correlated with deployment event at ${new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}. Identified root cause as ${anomalyType === 'spike' ? 'sudden increase in instance count' : anomalyType === 'drift' ? 'gradual cost increase over time' : 'unexpected resource provisioning'}.`,
          input: `Service: ${anomalyService}, Time Range: Last 7 days, Baseline: $${(anomalyAmount * 0.6).toFixed(2)}/day, Current: $${anomalyAmount.toFixed(2)}/day`,
          output: `Root cause identified: ${anomalyType === 'spike' ? 'Auto-scaling triggered due to traffic spike' : anomalyType === 'drift' ? 'Resource configuration drift detected' : 'New resource provisioning without proper tagging'}. Impact: ${anomalySeverity || 'high'} severity affecting ${anomalyService} resources.`,
          confidence: getRandomConfidence(),
        },
        'identify': {
          tools: agentTools['Allocation Agent'],
          chainOfThought: `Scanned all resources tagged with ${anomalyService} service. Cross-referenced with cost allocation data. Identified 12 resources contributing to the anomaly. Verified resource ownership and usage patterns to prioritize remediation.`,
          input: `Service filter: ${anomalyService}, Cost threshold: $${(anomalyAmount * 0.8).toFixed(2)}, Status: Active`,
          output: `Identified 12 impacted resources: 8 EC2 instances (i-xxx1, i-xxx2, ...), 3 RDS databases (db-xxx1, ...), 1 S3 bucket (bucket-xxx). Total cost attribution: $${anomalyAmount.toFixed(2)}/day.`,
          confidence: getRandomConfidence(),
        },
        'evaluate': {
          tools: agentTools['Optimization Agent'],
          chainOfThought: `Evaluated ${options.length} resolution strategies based on cost impact, risk level, and implementation complexity. Calculated ROI for each option considering implementation time and expected savings. Ranked options by confidence score and risk-adjusted savings.`,
          input: `Anomaly type: ${anomalyType}, Service: ${anomalyService}, Severity: ${anomalySeverity}, Current cost: $${anomalyAmount.toFixed(2)}/day, Target reduction: ${anomalySeverity === 'critical' ? '50%' : anomalySeverity === 'high' ? '40%' : '30%'}`,
          output: `Generated ${options.length} resolution options: ${options.map((o: ResolutionOption) => o.name).join(', ')}. Best option: ${options[0]?.name} with ${options[0]?.estimatedSavings ? `$${options[0].estimatedSavings.toFixed(0)}/month` : 'significant'} savings and ${options[0]?.riskLevel || 'low'} risk.`,
          confidence: getRandomConfidence(),
        },
        'apply': {
          tools: agentTools['FinOps Orchestrator'],
          chainOfThought: `Orchestrating remediation workflow: Selected ${selectedOption.name} based on ${selectedOption.confidence ? `${(selectedOption.confidence * 100).toFixed(0)}%` : 'high'} confidence score. Executing step-by-step: 1) Backup current configuration, 2) Apply changes via API, 3) Verify changes, 4) Monitor for side effects.`,
          input: `Selected option: ${selectedOption.name}, Estimated savings: ${selectedOption.estimatedSavings ? `$${selectedOption.estimatedSavings.toFixed(0)}/month` : 'N/A'}, Risk level: ${selectedOption.riskLevel || 'low'}`,
          output: `Successfully applied ${selectedOption.name}. ${action}. Changes verified and monitoring active. Expected cost reduction: ${selectedOption.estimatedSavings ? `$${selectedOption.estimatedSavings.toFixed(0)}/month` : 'significant'}.`,
          confidence: getRandomConfidence(),
        },
        'verify': {
          tools: agentTools['Anomaly Agent'],
          chainOfThought: `Monitoring cost patterns post-remediation. Comparing current cost vs baseline. Verifying no new anomalies introduced. Checking resource utilization metrics. Confirming cost reduction target achieved.`,
          input: `Post-remediation cost data: Last 24 hours, Target: <$${(anomalyAmount * 0.7).toFixed(2)}/day, Baseline: $${(anomalyAmount * 0.6).toFixed(2)}/day`,
          output: `Verification complete: Cost normalized to $${(anomalyAmount * 0.65).toFixed(2)}/day (below target). No new anomalies detected. Resource utilization within normal range. Anomaly resolved successfully.`,
          confidence: getRandomConfidence(),
        },
      };
      
      return detailsMap[stepId] || {};
    };

    // For human-in-loop workflow, ensure we include all steps: analyze, identify, evaluate, human-decision, apply, verify
    // For regular workflow, return the first numSteps steps
    let stepsToReturn: WorkflowStep[];
    if (requiresHumanInput) {
      // Return all steps for human-in-loop (analyze, identify, evaluate, human-decision, apply, verify)
      stepsToReturn = allSteps.map(step => ({ ...step, status: 'pending' as const }));
    } else {
      stepsToReturn = allSteps.slice(0, numSteps).map(step => ({ ...step, status: 'pending' as const }));
    }
    
    // Attach getStepDetails function to the returned array so it can be accessed later
    (stepsToReturn as any).getStepDetails = (allSteps as any).getStepDetails;
    
    return stepsToReturn;
  };

  // Initialize workflow steps based on anomaly service
  useEffect(() => {
    if (isOpen) {
      const steps = generateSteps();
      // Store getStepDetails function in ref for easy access
      const getStepDetails = (steps as any).getStepDetails;
      if (getStepDetails) {
        getStepDetailsRef.current = getStepDetails;
      }
      setWorkflowSteps(steps);
      setCurrentStep(0);
      setIsCompleted(false);
      setSelectedHumanOption(null);
      setWaitingForHumanInput(false);
    } else {
      // Reset when modal closes
      getStepDetailsRef.current = null;
      setWorkflowSteps([]);
      setCurrentStep(0);
      setIsCompleted(false);
      setSelectedHumanOption(null);
      setWaitingForHumanInput(false);
    }
  }, [isOpen, anomalyService, anomalySeverity, requiresHumanInput]);

  // Handle human input selection
  const handleHumanOptionSelect = (option: ResolutionOption) => {
    setSelectedHumanOption(option);
    
    // Update workflow steps with selected option
    setWorkflowSteps((prev) => {
      const newSteps = [...prev];
      // Preserve getStepDetails function
      const getStepDetails = (prev as any).getStepDetails;
      if (getStepDetails) {
        (newSteps as any).getStepDetails = getStepDetails;
      }
      
      const humanStepIndex = newSteps.findIndex(s => s.requiresHumanInput && s.status === 'in_progress');
      const applyStepIndex = newSteps.findIndex(s => (s.id === 'apply' || s.id === 'purchase' || s.id === 'cleanup' || s.id === 'configure') && s.status === 'pending');
      
      if (humanStepIndex !== -1) {
        // Mark human decision step as completed with selected option
        // Human decision step doesn't need tools/details
        newSteps[humanStepIndex] = {
          ...newSteps[humanStepIndex],
          status: 'completed',
          selectedOption: option,
          duration_ms: 500, // Small duration for human decision
        };
        
        // Update apply step with selected option and mark as in_progress to start execution
        if (applyStepIndex !== -1) {
          const { action } = generateAppliedAction(option, anomalyService);
          
          // Get step details for apply step when it completes later - use ref for reliable access
          const resolveStepDetails = getStepDetailsRef.current || (prev as any).getStepDetails;
          const applyStepDetails = resolveStepDetails ? resolveStepDetails('apply', 'completed') : {};
          
          // For human-in-loop, update the chain of thought to mention human selection
          const humanApplyDetails = applyStepDetails.chainOfThought 
            ? { ...applyStepDetails, chainOfThought: `Orchestrating remediation workflow: User selected ${option.name} from ${newSteps.find((s: WorkflowStep) => s.id === 'evaluate')?.options?.length || 0} options. Executing step-by-step: 1) Backup current configuration, 2) Apply changes via API, 3) Verify changes, 4) Monitor for side effects.` }
            : applyStepDetails;
          
          newSteps[applyStepIndex] = {
            ...newSteps[applyStepIndex],
            status: 'in_progress',
            selectedOption: option,
            appliedAction: action,
            appliedReason: 'Human selection', // Set reason as "Human selection"
            ...humanApplyDetails, // Add tools, chainOfThought, input, output, confidence (will be used when completed)
          };
          setCurrentStep(applyStepIndex);
        }
      }
      
      return newSteps;
    });
    
    // Resume workflow execution after human selection
    setWaitingForHumanInput(false);
  };

  // Simulate step-by-step execution
  useEffect(() => {
    if (!isOpen || !workflowSteps.length || isCompleted) return;
    
    // If waiting for human input, pause execution
    if (waitingForHumanInput) return;

    const interval = setInterval(() => {
      setWorkflowSteps((prev) => {
        const newSteps = [...prev];
        // Preserve getStepDetails function - use ref first, then fallback to array
        if (getStepDetailsRef.current) {
          (newSteps as any).getStepDetails = getStepDetailsRef.current;
        } else if ((prev as any).getStepDetails) {
          (newSteps as any).getStepDetails = (prev as any).getStepDetails;
          getStepDetailsRef.current = (prev as any).getStepDetails;
        }
        
        const activeStepIndex = newSteps.findIndex(s => s.status === 'in_progress');
        const nextPendingIndex = newSteps.findIndex(s => s.status === 'pending');
        
        // If no step is in progress, start the first pending one
        if (activeStepIndex === -1 && nextPendingIndex !== -1) {
          const nextStep = newSteps[nextPendingIndex];
          
          // Check if this step requires human input
          if (nextStep.requiresHumanInput) {
            // Set step to in_progress and wait for human input
            // Make sure options are available from evaluate step if not already set
            const evaluateStep = newSteps.find(s => s.id === 'evaluate');
            const optionsForHumanStep = nextStep.options || evaluateStep?.options || [];
            newSteps[nextPendingIndex] = {
              ...nextStep,
              status: 'in_progress',
              options: optionsForHumanStep.length > 0 ? optionsForHumanStep : nextStep.options,
            };
            setCurrentStep(nextPendingIndex);
            setWaitingForHumanInput(true);
            return newSteps;
          }
          
          // Preserve all step properties when transitioning to in_progress
          newSteps[nextPendingIndex] = {
            ...newSteps[nextPendingIndex],
            status: 'in_progress',
          };
          setCurrentStep(nextPendingIndex);
          return newSteps;
        }

        // Complete current step and move to next
        if (activeStepIndex !== -1 && !newSteps[activeStepIndex].requiresHumanInput) {
          // Get step details from ref (always accessible)
          const getStepDetails = getStepDetailsRef.current || (newSteps as any).getStepDetails || (prev as any).getStepDetails;
          const stepId = newSteps[activeStepIndex].id;
          const stepDetails = getStepDetails ? getStepDetails(stepId, 'completed') : {};
          
          // Preserve all step properties including options, selectedOption, appliedAction, appliedReason
          // Also add details (tools, chainOfThought, input, output, confidence)
          // Merge stepDetails to ensure we don't overwrite existing properties
          const completedStep = {
            ...newSteps[activeStepIndex],
            ...stepDetails, // Add tools, chainOfThought, input, output, confidence (may overwrite if already exists)
            status: 'completed' as const,
            duration_ms: newSteps[activeStepIndex].duration_ms || (2000 + Math.random() * 3000), // 2-5 seconds
          };
          newSteps[activeStepIndex] = completedStep;

          // Check if all steps are complete
          if (nextPendingIndex === -1) {
            setIsCompleted(true);
            // Capture steps and use ref for getStepDetails
            const capturedSteps = [...newSteps];
            const capturedGetStepDetails = getStepDetailsRef.current || (newSteps as any).getStepDetails || (prev as any).getStepDetails;
            
            setTimeout(() => {
              // Ensure all completed steps have their details before passing to onComplete
              const finalSteps = capturedSteps.map((step) => {
                if (step.status === 'completed' && capturedGetStepDetails) {
                  // Always get step details and merge - this ensures we have all details
                  const stepDetails = capturedGetStepDetails(step.id, 'completed');
                  // Merge stepDetails with existing step, ensuring all details are present
                  return {
                    ...step,
                    ...stepDetails, // Add/overwrite tools, chainOfThought, input, output, confidence
                  };
                }
                return step;
              });
              // Pass the completed workflow steps to onComplete
              onComplete(finalSteps);
            }, 1500);
          } else {
            // Start next pending step
            const nextStep = newSteps[nextPendingIndex];
            if (nextStep.requiresHumanInput) {
              // Set step to in_progress and wait for human input
              // Make sure options are available from evaluate step if not already set
              const evaluateStep = newSteps.find(s => s.id === 'evaluate');
              const optionsForHumanStep = nextStep.options || evaluateStep?.options || [];
              newSteps[nextPendingIndex] = {
                ...nextStep,
                status: 'in_progress',
                options: optionsForHumanStep.length > 0 ? optionsForHumanStep : nextStep.options,
              };
              setCurrentStep(nextPendingIndex);
              setWaitingForHumanInput(true);
            } else {
              newSteps[nextPendingIndex] = {
                ...nextStep,
                status: 'in_progress',
              };
              setCurrentStep(nextPendingIndex);
            }
          }

          return newSteps;
        }

        return prev;
      });
    }, 2500); // Update every 2.5 seconds

    return () => clearInterval(interval);
  }, [isOpen, workflowSteps.length, isCompleted, waitingForHumanInput, onComplete, anomalyService]);

  const completedCount = workflowSteps.filter((s) => s.status === 'completed').length;
  const inProgressCount = workflowSteps.filter((s) => s.status === 'in_progress').length;
  const totalSteps = workflowSteps.length;
  const progress = (completedCount / totalSteps) * 100;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" closeOnOverlayClick={false}>
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent bg={bg}>
        <ModalHeader>
          <VStack align="start" spacing={1}>
            <Text>{isRecommendation ? 'Implementing Recommendation' : 'Agentic Resolution Workflow'}</Text>
            <Text fontSize="sm" color="gray.500" fontWeight="normal">
              {isRecommendation 
                ? `Implementing: ${recommendationTitle || anomalyService}`
                : `Resolving anomaly: ${anomalyService}`
              }
            </Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack align="stretch" spacing={4}>
            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm" fontWeight="semibold">
                  Overall Progress
                </Text>
                <Badge
                  colorScheme={isCompleted ? 'green' : inProgressCount > 0 ? 'blue' : 'gray'}
                  fontSize="sm"
                >
                  {completedCount}/{totalSteps} steps completed
                </Badge>
              </HStack>
              <Progress
                value={progress}
                colorScheme={isCompleted ? 'green' : 'blue'}
                size="lg"
                borderRadius="full"
              />
            </Box>

            <Divider />

            <VStack align="stretch" spacing={3}>
              {workflowSteps.map((step, index) => {
                // Find the evaluate step to get options if this is a human decision step
                const evaluateStep = workflowSteps.find(s => s.id === 'evaluate');
                // For human decision steps, get options from the step itself first, then from evaluate step
                let optionsForHumanStep = step.options;
                if (step.requiresHumanInput && (!optionsForHumanStep || optionsForHumanStep.length === 0)) {
                  // Try to get options from the evaluate step (which should have them)
                  optionsForHumanStep = evaluateStep?.options || [];
                }
                // If still no options, try to get from any completed step with options
                if ((!optionsForHumanStep || optionsForHumanStep.length === 0) && step.requiresHumanInput) {
                  const stepWithOptions = workflowSteps.find(s => s.options && s.options.length > 0);
                  optionsForHumanStep = stepWithOptions?.options || [];
                }
                if (!optionsForHumanStep) {
                  optionsForHumanStep = [];
                }
                
                // A step is active if it's the current step and in progress
                // For human decision step, it's active only when it's the current step and waiting for input
                const isActive = step.requiresHumanInput && step.id === 'human-decision' 
                  ? (index === currentStep && step.status === 'in_progress' && waitingForHumanInput)
                  : (index === currentStep && step.status === 'in_progress');
                const isDone = step.status === 'completed';
                const isPending = step.status === 'pending';

                return (
                  <HStack
                    key={step.id}
                    p={3}
                    borderRadius="md"
                    bg={
                      isDone
                        ? useColorModeValue('green.50', 'green.900')
                        : step.requiresHumanInput && waitingForHumanInput
                        ? useColorModeValue('orange.50', 'orange.900')
                        : isActive
                        ? useColorModeValue('blue.50', 'blue.900')
                        : useColorModeValue('gray.50', 'gray.700')
                    }
                    border="2px"
                    borderColor={
                      isDone
                        ? useColorModeValue('green.300', 'green.700')
                        : step.requiresHumanInput && waitingForHumanInput
                        ? useColorModeValue('orange.300', 'orange.700')
                        : isActive
                        ? useColorModeValue('blue.300', 'blue.700')
                        : borderColor
                    }
                    spacing={4}
                    transition="all 0.3s"
                    transform={isActive ? 'scale(1.02)' : 'scale(1)'}
                  >
                    <Box flexShrink={0}>
                      {isDone ? (
                        <CheckIcon color={useColorModeValue('green.500', 'green.300')} boxSize={5} />
                      ) : step.requiresHumanInput && waitingForHumanInput ? (
                        <Box color={useColorModeValue('orange.500', 'orange.300')} fontSize="lg">
                          👤
                        </Box>
                      ) : isActive ? (
                        <SpinnerIcon
                          color={useColorModeValue('blue.500', 'blue.300')}
                          boxSize={5}
                          style={{
                            animation: 'spin 1s linear infinite',
                          }}
                        />
                      ) : (
                        <TimeIcon color={useColorModeValue('gray.400', 'gray.500')} boxSize={5} />
                      )}
                    </Box>
                    <VStack align="start" flex={1} spacing={1}>
                      <HStack>
                        <Text
                          fontWeight={isActive || isDone ? 'bold' : 'normal'}
                          fontSize="sm"
                          color={isPending ? 'gray.500' : 'inherit'}
                        >
                          {step.name}
                        </Text>
                        {step.agent && (
                          <Badge colorScheme="purple" fontSize="xx-small">
                            {step.agent}
                          </Badge>
                        )}
                      </HStack>
                      {step.description && (
                        <Text fontSize="xs" color="gray.600">
                          {step.description}
                        </Text>
                      )}
                      
                      {/* Show resolution options for "Evaluate Resolution Options" step */}
                      {step.options && step.options.length > 0 && (isDone || isActive) && !step.requiresHumanInput && step.id === 'evaluate' && (
                        <Box mt={2} p={2} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="md" border="1px" borderColor={useColorModeValue('blue.200', 'blue.700')}>
                          <Text fontSize="xs" fontWeight="semibold" mb={1} color="blue.700">
                            {isActive && !isDone ? 'Evaluating Resolution Options:' : 'Resolution Options Evaluated:'}
                          </Text>
                          <VStack align="stretch" spacing={1}>
                            {step.options.map((option) => (
                              <Box key={option.id} fontSize="xs">
                                <HStack>
                                  <Text fontWeight="medium">• {option.name}</Text>
                                  {option.estimatedSavings && (
                                    <Badge colorScheme="green" fontSize="xx-small">
                                      ${option.estimatedSavings.toFixed(0)}/mo
                                    </Badge>
                                  )}
                                  {option.riskLevel && (
                                    <Badge
                                      colorScheme={option.riskLevel === 'low' ? 'green' : option.riskLevel === 'medium' ? 'yellow' : 'red'}
                                      fontSize="xx-small"
                                    >
                                      {option.riskLevel} risk
                                    </Badge>
                                  )}
                                </HStack>
                                <Text fontSize="xx-small" color="gray.600" pl={4}>
                                  {option.description}
                                </Text>
                              </Box>
                            ))}
                          </VStack>
                        </Box>
                      )}

                      {/* Human input selection UI - Show only once when this specific step requires human input and is waiting */}
                      {step.requiresHumanInput && step.id === 'human-decision' && waitingForHumanInput && (step.status === 'in_progress' || (index === currentStep && waitingForHumanInput)) && optionsForHumanStep && optionsForHumanStep.length > 0 && (
                        <Box mt={3} p={3} bg={useColorModeValue('orange.50', 'orange.900')} borderRadius="md" border="2px" borderColor={useColorModeValue('orange.300', 'orange.700')}>
                          <Text fontSize="sm" fontWeight="bold" mb={2} color="orange.700">
                            👤 Human Decision Required
                          </Text>
                          <Text fontSize="xs" color="gray.700" mb={3}>
                            Please select which resolution option to apply:
                          </Text>
                          <VStack align="stretch" spacing={2}>
                            {optionsForHumanStep.map((option) => (
                              <Button
                                key={option.id}
                                size="sm"
                                variant={selectedHumanOption?.id === option.id ? 'solid' : 'outline'}
                                colorScheme={selectedHumanOption?.id === option.id ? 'blue' : 'gray'}
                                onClick={() => handleHumanOptionSelect(option)}
                                justifyContent="flex-start"
                                textAlign="left"
                                h="auto"
                                py={2}
                              >
                                <VStack align="start" spacing={1} width="100%">
                                  <HStack width="100%" justify="space-between">
                                    <Text fontWeight="semibold" fontSize="sm">
                                      {option.name}
                                    </Text>
                                    <HStack spacing={2}>
                                      {option.estimatedSavings && (
                                        <Badge colorScheme="green" fontSize="xx-small">
                                          ${option.estimatedSavings.toFixed(0)}/mo
                                        </Badge>
                                      )}
                                      {option.riskLevel && (
                                        <Badge
                                          colorScheme={option.riskLevel === 'low' ? 'green' : option.riskLevel === 'medium' ? 'yellow' : 'red'}
                                          fontSize="xx-small"
                                        >
                                          {option.riskLevel} risk
                                        </Badge>
                                      )}
                                    </HStack>
                                  </HStack>
                                  <Text fontSize="xs" color="gray.600" textAlign="left">
                                    {option.description}
                                  </Text>
                                </VStack>
                              </Button>
                            ))}
                          </VStack>
                        </Box>
                      )}

                      {/* Show applied action for "Apply Recommended Actions" step */}
                      {step.selectedOption && (isDone || isActive) && (
                        <Box mt={2} p={2} bg={useColorModeValue('green.50', 'green.900')} borderRadius="md" border="1px" borderColor={useColorModeValue('green.200', 'green.700')}>
                          <Text fontSize="xs" fontWeight="semibold" mb={1} color="green.700">
                            {isActive && !isDone ? 'Applying Selected Option:' : 'Selected & Applied:'}
                          </Text>
                          <Text fontSize="xs" fontWeight="medium" mb={1}>
                            {step.selectedOption.name}
                          </Text>
                          {step.appliedAction && (
                            <Text fontSize="xx-small" color="gray.700" mb={1}>
                              Action: {step.appliedAction}
                            </Text>
                          )}
                          {step.appliedReason && (
                            <Text fontSize="xx-small" color="gray.600" fontStyle="italic">
                              Reason: {step.appliedReason}
                            </Text>
                          )}
                          {step.selectedOption.estimatedSavings && (
                            <Badge colorScheme="green" fontSize="xx-small" mt={1}>
                              Expected savings: ${step.selectedOption.estimatedSavings.toFixed(0)}/month
                            </Badge>
                          )}
                        </Box>
                      )}

                      {isActive && (
                        <Text fontSize="xs" color="blue.600" fontStyle="italic">
                          Executing...
                        </Text>
                      )}
                      {isDone && step.duration_ms && (
                        <Text fontSize="xs" color="gray.500">
                          Completed in {(step.duration_ms / 1000).toFixed(1)}s
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                );
              })}
            </VStack>

            {isCompleted && (
              <Box
                p={4}
                bg={useColorModeValue('green.50', 'green.900')}
                borderRadius="md"
                border="2px"
                borderColor={useColorModeValue('green.300', 'green.700')}
                textAlign="center"
              >
                <VStack spacing={2}>
                  <CheckIcon color={useColorModeValue('green.500', 'green.300')} boxSize={8} />
                  <Text fontWeight="bold" color={useColorModeValue('green.700', 'green.300')}>
                    Anomaly Resolved Successfully!
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    All resolution steps completed. The anomaly has been resolved by AI agents.
                  </Text>
                </VStack>
              </Box>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

