import { useState } from 'react';
import {
  Box,
  Heading,
  Card,
  CardBody,
  VStack,
  HStack,
  Badge,
  Text,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  Select,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useAdminScope, ScopeTag } from '../../contexts/AdminScopeContext';
import { matchesScopeFilter } from './adminScope';

interface ScheduledWorkflow {
  id: string;
  name: string;
  workflowType: string;
  schedule: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  nextRun: string;
  lastRun: string;
  status: 'active' | 'paused' | 'error';
  agent: string;
  scope: 'cloud' | 'ai' | 'shared';
  runs: number;
  successRate: number;
}

// Sample data for scheduled workflows
const sampleScheduledWorkflows: ScheduledWorkflow[] = [
  {
    id: 'sched-1',
    name: 'Daily Cost Anomaly Detection',
    workflowType: 'Anomaly Detection',
    schedule: '0 2 * * *',
    frequency: 'daily',
    nextRun: '2024-01-15T02:00:00Z',
    lastRun: '2024-01-14T02:00:00Z',
    status: 'active',
    agent: 'Anomaly Agent',
    scope: 'cloud',
    runs: 45,
    successRate: 98.5,
  },
  {
    id: 'sched-2',
    name: 'Weekly Cost Optimization Review',
    workflowType: 'Optimization',
    schedule: '0 9 * * 1',
    frequency: 'weekly',
    nextRun: '2024-01-15T09:00:00Z',
    lastRun: '2024-01-08T09:00:00Z',
    status: 'active',
    agent: 'Optimization Agent',
    scope: 'cloud',
    runs: 12,
    successRate: 95.0,
  },
  {
    id: 'sched-3',
    name: 'Monthly Cost Forecasting',
    workflowType: 'Forecasting',
    schedule: '0 0 1 * *',
    frequency: 'monthly',
    nextRun: '2024-02-01T00:00:00Z',
    lastRun: '2024-01-01T00:00:00Z',
    status: 'active',
    agent: 'Forecasting Agent',
    scope: 'cloud',
    runs: 3,
    successRate: 100.0,
  },
  {
    id: 'sched-4',
    name: 'Daily Tagging Compliance Check',
    workflowType: 'Governance',
    schedule: '0 6 * * *',
    frequency: 'daily',
    nextRun: '2024-01-15T06:00:00Z',
    lastRun: '2024-01-14T06:00:00Z',
    status: 'paused',
    agent: 'Governance Agent',
    scope: 'cloud',
    runs: 28,
    successRate: 92.5,
  },
  {
    id: 'sched-5',
    name: 'Hourly Resource Utilization Analysis',
    workflowType: 'Optimization',
    schedule: '0 * * * *',
    frequency: 'custom',
    nextRun: '2024-01-14T15:00:00Z',
    lastRun: '2024-01-14T14:00:00Z',
    status: 'active',
    agent: 'Optimization Agent',
    scope: 'cloud',
    runs: 672,
    successRate: 99.2,
  },
  {
    id: 'sched-6',
    name: 'Weekly Budget Reconciliation',
    workflowType: 'Governance',
    schedule: '0 10 * * 5',
    frequency: 'weekly',
    nextRun: '2024-01-19T10:00:00Z',
    lastRun: '2024-01-12T10:00:00Z',
    status: 'error',
    agent: 'Governance Agent',
    scope: 'cloud',
    runs: 8,
    successRate: 75.0,
  },
  {
    id: 'sched-7',
    name: 'Daily AI Token Anomaly Scan',
    workflowType: 'AI Anomaly Detection',
    schedule: '0 3 * * *',
    frequency: 'daily',
    nextRun: '2024-01-15T03:00:00Z',
    lastRun: '2024-01-14T03:00:00Z',
    status: 'active',
    agent: 'Token Optimizer Agent',
    scope: 'ai',
    runs: 30,
    successRate: 97.0,
  },
  {
    id: 'sched-8',
    name: 'Weekly Model Tiering Review',
    workflowType: 'Model Tiering',
    schedule: '0 8 * * 2',
    frequency: 'weekly',
    nextRun: '2024-01-16T08:00:00Z',
    lastRun: '2024-01-09T08:00:00Z',
    status: 'active',
    agent: 'Model Router Agent',
    scope: 'ai',
    runs: 4,
    successRate: 100.0,
  },
  {
    id: 'sched-9',
    name: 'GPU Utilization Report',
    workflowType: 'GPU FinOps',
    schedule: '0 7 * * *',
    frequency: 'daily',
    nextRun: '2024-01-15T07:00:00Z',
    lastRun: '2024-01-14T07:00:00Z',
    status: 'active',
    agent: 'GPU FinOps Agent',
    scope: 'ai',
    runs: 14,
    successRate: 96.5,
  },
];

export default function WorkflowScheduling() {
  const { scopeFilter } = useAdminScope();
  const [scheduledWorkflows] = useState<ScheduledWorkflow[]>(sampleScheduledWorkflows);
  const bg = useColorModeValue('white', 'gray.800');

  const filteredSchedules = scheduledWorkflows.filter((s) =>
    matchesScopeFilter(s.scope, scopeFilter),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'paused':
        return 'yellow';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatSchedule = (schedule: string, frequency: string) => {
    if (frequency === 'daily') {
      return 'Daily';
    } else if (frequency === 'weekly') {
      return 'Weekly';
    } else if (frequency === 'monthly') {
      return 'Monthly';
    }
    return schedule; // Cron expression for custom
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Workflow Scheduling</Heading>
        <Button leftIcon={<AddIcon />} colorScheme="blue" size="sm">
          Schedule Workflow
        </Button>
      </HStack>

      <Text fontSize="sm" color="gray.600" mb={6}>
        Manage scheduled agentic workflows. Create, edit, and monitor automated workflow executions.
      </Text>

      <Card bg={bg}>
        <CardBody>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Workflow Name</Th>
                  <Th>Type</Th>
                  <Th>Scope</Th>
                  <Th>Schedule</Th>
                  <Th>Agent</Th>
                  <Th>Next Run</Th>
                  <Th>Last Run</Th>
                  <Th>Status</Th>
                  <Th>Runs</Th>
                  <Th>Success Rate</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredSchedules.map((workflow) => (
                  <Tr key={workflow.id}>
                    <Td>
                      <Text fontWeight="medium">{workflow.name}</Text>
                    </Td>
                    <Td>
                      <Badge colorScheme="purple" fontSize="xs">
                        {workflow.workflowType}
                      </Badge>
                    </Td>
                    <Td><ScopeTag domain={workflow.scope} /></Td>
                    <Td>
                      <Text fontSize="sm">{formatSchedule(workflow.schedule, workflow.frequency)}</Text>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{workflow.agent}</Text>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{formatDate(workflow.nextRun)}</Text>
                    </Td>
                    <Td>
                      <Text fontSize="sm" color="gray.600">
                        {formatDate(workflow.lastRun)}
                      </Text>
                    </Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(workflow.status)} fontSize="xs">
                        {workflow.status.toUpperCase()}
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{workflow.runs}</Text>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Text fontSize="sm" fontWeight="medium">
                          {workflow.successRate.toFixed(1)}%
                        </Text>
                        <Box
                          w="60px"
                          h="4px"
                          bg="gray.200"
                          borderRadius="full"
                          overflow="hidden"
                        >
                          <Box
                            w={`${workflow.successRate}%`}
                            h="100%"
                            bg={workflow.successRate >= 95 ? 'green.500' : workflow.successRate >= 80 ? 'yellow.500' : 'red.500'}
                          />
                        </Box>
                      </HStack>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Tooltip label="Edit Schedule">
                          <IconButton
                            aria-label="Edit"
                            icon={<EditIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                          />
                        </Tooltip>
                        <Tooltip label="Delete Schedule">
                          <IconButton
                            aria-label="Delete"
                            icon={<DeleteIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>
    </Box>
  );
}

