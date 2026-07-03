import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Card,
  CardBody,
  VStack,
  HStack,
  Badge,
  Text,
  Progress,
  useColorModeValue,
  Divider,
  Icon,
  Spinner,
  CircularProgress,
  CircularProgressLabel,
  Flex,
  SimpleGrid,
  Tooltip
} from '@chakra-ui/react';
import { CheckIcon, TimeIcon, SpinnerIcon } from '@chakra-ui/icons';
import { useAdminScope, ScopeTag } from '../../contexts/AdminScopeContext';
import { getWorkflowScope, matchesScopeFilter } from './adminScope';

import { API_V1 as API_URL } from '../../config';

interface WorkflowStep {
  name: string;
  status: 'done' | 'running' | 'awaiting_approval' | 'queued';
  duration_ms: number;
}

interface Workflow {
  id: string;
  name: string;
  type: string;
  scope?: string;
  status: 'running' | 'completed' | 'awaiting_approval' | 'failed';
  progress: number;
  created_at: string;
  steps: WorkflowStep[];
  agent: string;
  metrics?: any;
}

export default function AdminWorkflows() {
  const { scopeFilter } = useAdminScope();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [agentActivities, setAgentActivities] = useState<Record<string, string>>({});
  const bg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    fetch(`${API_URL}/workflows`)
      .then(r => r.json())
      .then(data => {
        const workflowsData = data.data || [];
        setWorkflows(workflowsData);
        
        // Initialize agent activities for running workflows
        const activities: Record<string, string> = {};
        workflowsData.forEach((wf: Workflow) => {
          if (wf.status === 'running') {
            const currentStep = wf.steps.find(s => s.status === 'running');
            activities[wf.id] = currentStep 
              ? `Processing: ${currentStep.name}` 
              : `Analyzing workflow data...`;
          }
        });
        setAgentActivities(activities);
      });
  }, []);

  // Simulate real-time agent activity updates
  useEffect(() => {
    const interval = setInterval(() => {
      setWorkflows(prev => prev.map(workflow => {
        if (workflow.status === 'running') {
          // Update progress for running workflows
          const newProgress = Math.min(100, workflow.progress + Math.random() * 2);
          
          // Update current step status and activity
          let currentStepIndex = workflow.steps.findIndex(s => s.status === 'running');
          let newActivity = agentActivities[workflow.id] || '';
          
          if (currentStepIndex === -1) {
            // Find next queued step to start
            currentStepIndex = workflow.steps.findIndex(s => s.status === 'queued');
            if (currentStepIndex !== -1) {
              const newSteps = [...workflow.steps];
              newSteps[currentStepIndex] = { ...newSteps[currentStepIndex], status: 'running' };
              
              setAgentActivities(prev => ({
                ...prev,
                [workflow.id]: `Executing: ${newSteps[currentStepIndex].name}`
              }));
              
              return {
                ...workflow,
                progress: newProgress,
                steps: newSteps
              };
            }
          } else {
            // Update activity message dynamically
            const activityMessages = [
              `Analyzing: ${workflow.steps[currentStepIndex].name}`,
              `Processing data for ${workflow.steps[currentStepIndex].name}`,
              `Executing agent logic for ${workflow.steps[currentStepIndex].name}`,
              `Validating results for ${workflow.steps[currentStepIndex].name}`
            ];
            const randomMsg = activityMessages[Math.floor(Math.random() * activityMessages.length)];
            
            if (Math.random() > 0.7) {
              setAgentActivities(prev => ({
                ...prev,
                [workflow.id]: randomMsg
              }));
            }
            
            // Randomly complete the current step if progress is high enough
            if (newProgress > 85 && Math.random() > 0.9) {
              const newSteps = [...workflow.steps];
              newSteps[currentStepIndex] = { ...newSteps[currentStepIndex], status: 'done', duration_ms: Date.now() % 300000 };
              
              // Check if workflow is complete
              if (newSteps.every(s => s.status === 'done')) {
                setAgentActivities(prev => {
                  const updated = { ...prev };
                  delete updated[workflow.id];
                  return updated;
                });
                
                return {
                  ...workflow,
                  progress: 100,
                  status: 'completed',
                  steps: newSteps
                };
              }
              
              return {
                ...workflow,
                progress: newProgress,
                steps: newSteps
              };
            }
          }
          
          return {
            ...workflow,
            progress: newProgress
          };
        }
        return workflow;
      }));
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [agentActivities]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'blue';
      case 'completed': return 'green';
      case 'awaiting_approval': return 'yellow';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'green';
      case 'running': return 'blue';
      case 'awaiting_approval': return 'yellow';
      case 'queued': return 'gray';
      default: return 'gray';
    }
  };

  const getAgentIcon = (status: string) => {
    switch (status) {
      case 'running':
        return (
          <Spinner
            size="sm"
            thickness="3px"
            speed="0.8s"
            color="blue.500"
            sx={{
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
              }
            }}
          />
        );
      case 'completed':
        return <Icon as={CheckIcon} color="green.500" w={4} h={4} />;
      case 'awaiting_approval':
        return <Icon as={TimeIcon} color="yellow.500" w={4} h={4} />;
      default:
        return <Icon as={TimeIcon} color="gray.500" w={4} h={4} />;
    }
  };

  const getStepIcon = (step: WorkflowStep) => {
    switch (step.status) {
      case 'done':
        return <Icon as={CheckIcon} color="green.500" w={4} h={4} />;
      case 'running':
        return (
          <Spinner
            size="sm"
            thickness="2px"
            speed="0.65s"
            color="blue.500"
          />
        );
      case 'awaiting_approval':
        return <Icon as={TimeIcon} color="yellow.500" w={4} h={4} />;
      default:
        return <Box w={4} h={4} borderRadius="full" bg="gray.300" />;
    }
  };

  const filteredWorkflows = workflows.filter((w) =>
    matchesScopeFilter(getWorkflowScope(w), scopeFilter),
  );

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Agentic Workflows</Heading>
        <HStack spacing={2}>
          <Box
            w="8px"
            h="8px"
            borderRadius="full"
            bg="green.500"
            sx={{
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.3 },
              }
            }}
          />
          <Text fontSize="sm" color="gray.500">
            {filteredWorkflows.filter(w => w.status === 'running').length} active agents
          </Text>
        </HStack>
      </HStack>

      <VStack spacing={6} align="stretch">
        {filteredWorkflows.map((workflow) => (
          <Card key={workflow.id} bg={bg} borderLeft="4px" borderColor={getStatusColor(workflow.status) + '.500'}>
            <CardBody>
              <Flex justify="space-between" align="start" mb={4}>
                <VStack align="start" spacing={2} flex={1}>
                  <HStack flexWrap="wrap">
                    <Heading size="md">{workflow.name}</Heading>
                    <ScopeTag domain={getWorkflowScope(workflow)} />
                    {workflow.status === 'running' && (
                      <Tooltip label={agentActivities[workflow.id] || 'Agent is working...'}>
                        <Badge
                          colorScheme={getStatusColor(workflow.status)}
                          px={3}
                          py={1}
                          borderRadius="full"
                          sx={{
                            animation: 'pulse 2s ease-in-out infinite',
                            '@keyframes pulse': {
                              '0%, 100%': { opacity: 1 },
                              '50%': { opacity: 0.7 },
                            }
                          }}
                        >
                          {workflow.status.toUpperCase()}
                        </Badge>
                      </Tooltip>
                    )}
                    {workflow.status !== 'running' && (
                      <Badge colorScheme={getStatusColor(workflow.status)}>
                        {workflow.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    )}
                  </HStack>
                  
                  <HStack spacing={4}>
                    <HStack spacing={2}>
                      {getAgentIcon(workflow.status)}
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">
                        {workflow.agent}
                      </Text>
                    </HStack>
                    {workflow.status === 'running' && agentActivities[workflow.id] && (
                      <Text fontSize="xs" color="blue.600" fontStyle="italic">
                        {agentActivities[workflow.id]}
                      </Text>
                    )}
                  </HStack>
                  
                  <Text fontSize="xs" color="gray.500">
                    Started: {new Date(workflow.created_at).toLocaleString()}
                  </Text>
                </VStack>

                <VStack align="end" spacing={2}>
                  <CircularProgress
                    value={workflow.progress}
                    color={getStatusColor(workflow.status) + '.500'}
                    size="80px"
                    thickness="8px"
                    isIndeterminate={workflow.status === 'running' && workflow.progress < 100}
                  >
                    <CircularProgressLabel fontSize="sm" fontWeight="bold">
                      {Math.round(workflow.progress)}%
                    </CircularProgressLabel>
                  </CircularProgress>
                  <Progress
                    value={workflow.progress}
                    colorScheme={getStatusColor(workflow.status)}
                    width="120px"
                    size="sm"
                    isAnimated={workflow.status === 'running'}
                  />
                </VStack>
              </Flex>

              <Divider mb={4} />

              <VStack align="stretch" spacing={3}>
                <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={2}>
                  Workflow Steps:
                </Text>
                {workflow.steps.map((step: WorkflowStep, i: number) => (
                  <Box
                    key={i}
                    p={3}
                    bg={step.status === 'running' ? 'blue.50' : cardBg}
                    borderRadius="md"
                    borderLeft={step.status === 'running' ? '3px solid' : '3px solid transparent'}
                    borderColor={step.status === 'running' ? 'blue.500' : 'transparent'}
                    transition="all 0.3s"
                    sx={{
                      ...(step.status === 'running' && {
                        animation: 'shimmer 2s ease-in-out infinite',
                        '@keyframes shimmer': {
                          '0%': { opacity: 1 },
                          '50%': { opacity: 0.85 },
                          '100%': { opacity: 1 },
                        }
                      })
                    }}
                  >
                    <HStack justify="space-between">
                      <HStack spacing={3} flex={1}>
                        {getStepIcon(step)}
                        <VStack align="start" spacing={0}>
                          <Text fontWeight={step.status === 'running' ? 'semibold' : 'normal'}>
                            {step.name}
                          </Text>
                          {step.status === 'running' && (
                            <Text fontSize="xs" color="blue.600" fontStyle="italic">
                              Agent is processing this step...
                            </Text>
                          )}
                        </VStack>
                      </HStack>
                      <HStack spacing={4}>
                        {step.duration_ms > 0 && (
                          <Text fontSize="xs" color="gray.500">
                            {(step.duration_ms / 1000).toFixed(1)}s
                          </Text>
                        )}
                        <Badge
                          colorScheme={getStepStatusColor(step.status)}
                          fontSize="xs"
                          px={2}
                          py={1}
                        >
                          {step.status.replace('_', ' ')}
                        </Badge>
                      </HStack>
                    </HStack>
                    {step.status === 'running' && (
                      <Box mt={2}>
                        <Progress
                          value={Math.min(100, 20 + Math.random() * 60)}
                          colorScheme="blue"
                          size="sm"
                          isAnimated
                          hasStripe
                        />
                      </Box>
                    )}
                  </Box>
                ))}
              </VStack>

              {workflow.metrics && (
                <>
                  <Divider my={4} />
                  <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={3}>
                    Workflow Metrics:
                  </Text>
                  <SimpleGrid columns={{ base: 2, md: Object.keys(workflow.metrics).length }} spacing={4}>
                    {Object.entries(workflow.metrics).map(([key, value]: [string, any]) => (
                      <Box
                        key={key}
                        p={3}
                        bg={cardBg}
                        borderRadius="md"
                        border="1px"
                        borderColor={useColorModeValue('gray.200', 'gray.600')}
                      >
                        <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={1}>
                          {key.replace(/_/g, ' ')}
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" color={getStatusColor(workflow.status) + '.600'}>
                          {typeof value === 'number' && value > 1000
                            ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : typeof value === 'number' && value < 1 && value > 0
                            ? `${(value * 100).toFixed(1)}%`
                            : typeof value === 'number'
                            ? value.toLocaleString()
                            : value}
                        </Text>
                      </Box>
                    ))}
                  </SimpleGrid>
                </>
              )}
            </CardBody>
          </Card>
        ))}
      </VStack>
    </Box>
  );
}

