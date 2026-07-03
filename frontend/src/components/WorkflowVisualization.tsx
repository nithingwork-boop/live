import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Progress,
  Tooltip,
  useColorModeValue,
  Collapse,
  useDisclosure,
  IconButton,
} from '@chakra-ui/react';
import { CheckIcon, TimeIcon, SpinnerIcon, ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';

export interface ResolutionOption {
  id: string;
  name: string;
  description: string;
  estimatedSavings?: number;
  riskLevel?: 'low' | 'medium' | 'high';
  confidence?: number;
}

export interface WorkflowStep {
  id: string;
  name: string;
  status: 'completed' | 'in_progress' | 'pending';
  duration_ms?: number;
  agent?: string;
  description?: string;
  options?: ResolutionOption[]; // For "Evaluate Resolution Options" step
  selectedOption?: ResolutionOption; // For "Apply Recommended Actions" step
  appliedAction?: string; // Description of what was applied
  appliedReason?: string; // Why this option was selected
  requiresHumanInput?: boolean; // If true, workflow pauses and waits for user selection
  tools?: string[]; // Tools used by the agent
  chainOfThought?: string; // Chain of thought and reasoning
  input?: string; // Input data/parameters
  output?: string; // Output/result
  confidence?: number; // Confidence level (0-100)
}

interface WorkflowVisualizationProps {
  steps: WorkflowStep[];
  compact?: boolean;
  showAgent?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  isNewlyResolved?: boolean; // If true, expand by default even if resolved
}

export function WorkflowVisualization({
  steps,
  compact = false,
  showAgent = false,
  collapsible = true,
  defaultCollapsed = false,
  isNewlyResolved = false,
}: WorkflowVisualizationProps) {
  // If newly resolved, always show expanded; otherwise use defaultCollapsed
  const shouldDefaultCollapse = !isNewlyResolved && defaultCollapsed;
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: !shouldDefaultCollapse });
  const bg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const completedColor = useColorModeValue('green.500', 'green.300');
  const inProgressColor = useColorModeValue('blue.500', 'blue.300');
  const pendingColor = useColorModeValue('orange.500', 'orange.300'); // Amber for pending

  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const inProgressCount = steps.filter((s) => s.status === 'in_progress').length;
  const totalSteps = steps.length;
  const progress = (completedCount / totalSteps) * 100;

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckIcon color={completedColor} />;
      case 'in_progress':
        return (
          <SpinnerIcon
            color={inProgressColor}
            style={{
              animation: 'spin 1s linear infinite',
            }}
          />
        );
      default:
        return <TimeIcon color={pendingColor} />;
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'in_progress':
        return 'blue';
      default:
        return 'gray';
    }
  };

  if (compact) {
    return (
      <Box mt={2}>
        <HStack spacing={2} fontSize="xs" mb={1}>
          <Text color="gray.600">AI Workflow:</Text>
          <Badge colorScheme={getStepColor(steps[0]?.status || 'pending')} fontSize="xx-small">
            {completedCount}/{totalSteps} completed
          </Badge>
        </HStack>
        <HStack spacing={1}>
          {steps.slice(0, 5).map((step) => (
            <Tooltip key={step.id} label={step.name} placement="top">
              <Box>
                {getStepIcon(step.status)}
              </Box>
            </Tooltip>
          ))}
          {steps.length > 5 && (
            <Text fontSize="xs" color="gray.500">
              +{steps.length - 5} more
            </Text>
          )}
        </HStack>
      </Box>
    );
  }

  return (
    <VStack align="stretch" spacing={3} p={4} bg={bg} borderRadius="md" border="1px" borderColor={borderColor}>
      <HStack 
        justify="space-between" 
        mb={2}
        cursor={collapsible ? 'pointer' : 'default'}
        onClick={collapsible ? onToggle : undefined}
        _hover={collapsible ? { bg: useColorModeValue('gray.100', 'gray.600') } : {}}
        p={2}
        borderRadius="md"
        transition="background-color 0.2s"
      >
        <HStack spacing={3} flex={1} flexWrap="wrap">
          <HStack spacing={1} alignItems="center">
            <Text fontWeight="bold" fontSize="sm">
              Agent Workflow
            </Text>
          </HStack>
          {/* Timeline view of all steps with names for all steps */}
          <HStack spacing={2} alignItems="center" flexWrap="wrap">
            {steps.map((step, index) => {
              const stepColor = step.status === 'completed' 
                ? completedColor 
                : step.status === 'in_progress' 
                ? inProgressColor 
                : pendingColor;
              
              return (
                <HStack key={step.id} spacing={1} alignItems="center">
                  <HStack spacing={1} alignItems="center">
                    <Box>{getStepIcon(step.status)}</Box>
                    <Text fontSize="xs" color={stepColor} fontWeight="medium">
                      {step.name}
                    </Text>
                  </HStack>
                  {index < steps.length - 1 && (
                    <Box
                      width="12px"
                      height="2px"
                      bg={stepColor}
                      opacity={step.status === 'completed' ? 1 : step.status === 'in_progress' ? 0.7 : 0.5}
                    />
                  )}
                </HStack>
              );
            })}
          </HStack>
        </HStack>
        <HStack spacing={2}>
          <Badge colorScheme={inProgressCount > 0 ? 'blue' : completedCount === totalSteps ? 'green' : 'gray'}>
            {completedCount}/{totalSteps} steps
          </Badge>
          {collapsible && (
            <Box onClick={(e) => e.stopPropagation()}>
              <IconButton
                aria-label={isOpen ? 'Collapse workflow' : 'Expand workflow'}
                icon={isOpen ? <ChevronDownIcon boxSize={5} /> : <ChevronRightIcon boxSize={5} />}
                size="sm"
                variant="ghost"
                onClick={onToggle}
                minW="auto"
                h="auto"
                p={0}
              />
            </Box>
          )}
        </HStack>
      </HStack>
      <Progress value={progress} colorScheme={inProgressCount > 0 ? 'blue' : 'green'} size="sm" mb={2} />
      <Collapse in={isOpen || !collapsible} animateOpacity>
        <VStack align="stretch" spacing={2}>
        {steps.map((step) => (
          <Box
            key={step.id}
            p={3}
            borderRadius="md"
            bg={
              step.status === 'completed'
                ? useColorModeValue('green.50', 'green.900')
                : step.status === 'in_progress'
                ? useColorModeValue('blue.50', 'blue.900')
                : useColorModeValue('white', 'gray.800')
            }
            border="1px"
            borderColor={
              step.status === 'completed'
                ? useColorModeValue('green.200', 'green.700')
                : step.status === 'in_progress'
                ? useColorModeValue('blue.200', 'blue.700')
                : borderColor
            }
          >
            <HStack align="start" spacing={4}>
              {/* Left Column: Basic Details */}
              <VStack align="start" spacing={2} flex="0 0 35%" minW="200px">
                <HStack spacing={2} align="center">
                  <Box flexShrink={0}>{getStepIcon(step.status)}</Box>
                  <HStack>
                    <Text fontSize="sm" fontWeight={step.status !== 'pending' ? 'semibold' : 'normal'}>
                      {step.name}
                    </Text>
                    <Badge colorScheme={getStepColor(step.status)} size="sm" fontSize="xx-small">
                      {step.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </HStack>
                </HStack>
                
                {step.description && (
                  <Text fontSize="xs" color="gray.600">
                    {step.description}
                  </Text>
                )}

                {showAgent && step.agent && (
                  <Text fontSize="xs" color="gray.500">
                    Agent: {step.agent}
                  </Text>
                )}
                
                {step.duration_ms && step.status === 'completed' && (
                  <Text fontSize="xs" color="gray.500">
                    Duration: {(step.duration_ms / 1000).toFixed(1)}s
                  </Text>
                )}

                {/* Show resolution options for "Evaluate Resolution Options" step */}
                {step.options && step.options.length > 0 && (
                  <Box mt={1} p={2} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="md" w="100%">
                    <Text fontSize="xs" fontWeight="semibold" mb={1} color="blue.700">
                      Resolution Options Evaluated:
                    </Text>
                    <VStack align="stretch" spacing={1}>
                      {step.options.map((option) => (
                        <Box key={option.id} fontSize="xs">
                          <HStack>
                            <Text fontWeight="medium">• {option.name}</Text>
                            {option.estimatedSavings && (
                              <Badge colorScheme="green" fontSize="xx-small">
                                ${option.estimatedSavings.toFixed(0)}/mo savings
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

                {/* Show applied action for "Apply Recommended Actions" step */}
                {step.selectedOption && (
                  <Box mt={1} p={2} bg={useColorModeValue('green.50', 'green.900')} borderRadius="md" w="100%">
                    <Text fontSize="xs" fontWeight="semibold" mb={1} color="green.700">
                      Selected & Applied:
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
              </VStack>

              {/* Right Column: Detailed Information (Tools, Chain of Thought, Input, Output, Confidence) */}
              {step.status === 'completed' && (
                <VStack align="stretch" spacing={3} flex="1" borderLeft="1px" borderColor={useColorModeValue('gray.200', 'gray.600')} pl={4}>
                  {step.tools && step.tools.length > 0 && (
                    <Box>
                      <Text fontSize="xs" fontWeight="semibold" color="blue.600" mb={1}>
                        Tools Used:
                      </Text>
                      <HStack spacing={1} flexWrap="wrap">
                        {step.tools.map((tool, idx) => (
                          <Badge key={idx} colorScheme="purple" fontSize="xx-small">
                            {tool.toUpperCase()}
                          </Badge>
                        ))}
                      </HStack>
                    </Box>
                  )}
                  
                  {step.chainOfThought && (
                    <Box>
                      <Text fontSize="xs" fontWeight="semibold" color="blue.600" mb={1}>
                        Chain of Thought:
                      </Text>
                      <Text fontSize="xs" color="gray.600" fontStyle="italic">
                        {step.chainOfThought}
                      </Text>
                    </Box>
                  )}
                  
                  {step.input && (
                    <Box>
                      <Text fontSize="xs" fontWeight="semibold" color="blue.600" mb={1}>
                        Input:
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        {step.input}
                      </Text>
                    </Box>
                  )}
                  
                  {step.output && (
                    <Box>
                      <Text fontSize="xs" fontWeight="semibold" color="green.600" mb={1}>
                        Output:
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        {step.output}
                      </Text>
                    </Box>
                  )}
                  
                  {step.confidence !== undefined && (
                    <Box>
                      <HStack spacing={2}>
                        <Text fontSize="xs" fontWeight="semibold" color="blue.600">
                          Confidence Level:
                        </Text>
                        <Badge colorScheme={step.confidence >= 90 ? 'green' : step.confidence >= 85 ? 'blue' : 'yellow'} fontSize="xs">
                          {step.confidence}%
                        </Badge>
                      </HStack>
                    </Box>
                  )}
                </VStack>
              )}
            </HStack>
          </Box>
        ))}
        </VStack>
      </Collapse>
    </VStack>
  );
}

