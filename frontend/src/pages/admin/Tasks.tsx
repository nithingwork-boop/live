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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

const CREW_API_URL = 'http://localhost:8000';

interface Task {
  id: string;
  name: string;
  description: string;
  expected_input: string;
  expected_output: string;
  agent: string;
}

interface Agent {
  id: string;
  name: string;
}

// Fallback mock data
const MOCK_AGENTS_MAP: Record<string, string> = {
  'finops-orchestrator': 'FinOps Orchestrator',
  'ingestion-agent': 'Ingestion Agent',
  'allocation-agent': 'Allocation Agent',
  'anomaly-agent': 'Anomaly & RCA Agent',
  'optimization-agent': 'Optimization Agent',
  'forecasting-agent': 'Forecasting Agent',
  'governance-agent': 'Governance Agent',
  'explainability-agent': 'Explainability & Audit Agent',
  'vendor-license-agent': 'Vendor & License Agent'
};

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
    id: 'task-ingest-1',
    name: 'Provision Data Connectors',
    description: 'Provision and configure data connectors for cloud billing exports',
    expected_input: 'Connector configurations, API credentials, cloud provider details',
    expected_output: 'Active connectors with validation status',
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
    id: 'task-anom-1',
    name: 'Detect Cost Anomalies',
    description: 'Detect cost spikes using streaming detectors (prophet/ADTK)',
    expected_input: 'Cost time series, historical baselines, detection parameters',
    expected_output: 'Anomaly alerts with severity and confidence scores',
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
    id: 'task-forecast-1',
    name: 'Generate Cost Forecasts',
    description: 'Generate multivariate time series forecasts using ARIMA/Prophet/XGBoost',
    expected_input: 'Historical cost data, usage trends, business calendar',
    expected_output: 'Cost forecasts with confidence intervals',
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
    id: 'task-expl-1',
    name: 'Assemble Reasoning Trails',
    description: 'Assemble step-by-step reasoning for all agent decisions',
    expected_input: 'Agent decision logs, tool calls, feature data',
    expected_output: 'Detailed reasoning logs with decision paths',
    agent: 'explainability-agent'
  },
  {
    id: 'task-vendor-1',
    name: 'Track SaaS Contracts',
    description: 'Track SaaS/marketplace contracts and renewal dates',
    expected_input: 'Contract data, renewal dates, vendor information',
    expected_output: 'Contract inventory with renewal calendar',
    agent: 'vendor-license-agent'
  }
];

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Record<string, string>>(MOCK_AGENTS_MAP);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const bg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    // Fetch agents first to map agent IDs to names
    fetch(`${CREW_API_URL}/v1/agents`, { 
      signal: AbortSignal.timeout(2000) 
    })
      .then((r) => {
        if (!r.ok) throw new Error('Service not available');
        return r.json();
      })
      .then((data) => {
        const agentsMap: Record<string, string> = {};
        (data.data || []).forEach((agent: Agent) => {
          agentsMap[agent.id] = agent.name;
        });
        setAgents(agentsMap);
      })
      .catch(() => {
        // Silently use fallback data
        setAgents(MOCK_AGENTS_MAP);
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
        // Silently use fallback mock data
        setTasks(MOCK_TASKS);
        setLoading(false);
      });
  }, []);

  const filteredTasks = tasks.filter(
    (task) =>
      task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agents[task.agent] && agents[task.agent].toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Tasks
      </Heading>
      <Text fontSize="sm" color="gray.600" mb={6}>
        View all CrewAI tasks with their descriptions, expected inputs (context), expected outputs, and assigned agents.
      </Text>

      <Box mb={6}>
        <InputGroup maxW="400px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search tasks by name, description, or agent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
      </Box>

      <VStack spacing={4} align="stretch">
        {filteredTasks.map((task) => (
          <Card key={task.id} bg={bg}>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Heading size="md">{task.name}</Heading>
                    <Badge colorScheme="blue">{agents[task.agent] || task.agent}</Badge>
                  </VStack>
                </HStack>

                <Box>
                  <Text fontSize="sm" color="gray.600">
                    {task.description}
                  </Text>
                </Box>

                <TableContainer>
                  <Table size="sm" variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Expected Input (Context)</Th>
                        <Th>Expected Output</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td>
                          <Text fontSize="sm">{task.expected_input}</Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm">{task.expected_output}</Text>
                        </Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </VStack>

      {filteredTasks.length === 0 && (
        <Box textAlign="center" py={10}>
          <Text color="gray.500">No tasks found matching your search.</Text>
        </Box>
      )}
    </Box>
  );
}

