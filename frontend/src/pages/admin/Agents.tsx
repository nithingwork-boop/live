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
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Spinner,
  Divider,
} from '@chakra-ui/react';

const CREW_API_URL = 'http://localhost:8000';

interface Agent {
  id: string;
  name: string;
  goal: string;
  backstory: string;
  tools: string[];
  llms?: string[];
}

// Fallback mock data matching backend structure
const MOCK_AGENTS: Agent[] = [
  {
    id: 'finops-orchestrator',
    name: 'FinOps Orchestrator',
    goal: 'Deliver FinOps outcomes across Inform/Optimize/Operate phases',
    backstory: 'Central brain coordinating data, policies, and actions across the FinOps platform. Expert in workflow orchestration, SLA enforcement, and multi-agent coordination.',
    tools: ['dbt_rpc', 'great_expectations', 'temporal_client', 'cloud_vendor_sdks', 'opa_client', 'jira_client'],
    llms: ['gpt-4', 'claude-3-opus']
  },
  {
    id: 'ingestion-agent',
    name: 'Ingestion Agent',
    goal: 'Ensure reliable and timely data ingestion from all sources',
    backstory: 'Specialized in provisioning and managing data connectors across cloud providers. Expert in schema validation, dataset registration, and lineage tracking.',
    tools: ['AWS CUR/CE/Budgets/Organizations', 'Azure Cost Management Exports', 'GCP Billing Export & Recommender', 'Kubernetes Metrics API', 'Prometheus', 'Datadog', 'M365', 'Atlassian', 'GitHub', 'Snowflake', 'Salesforce'],
    llms: ['gpt-4', 'gpt-3.5-turbo']
  },
  {
    id: 'allocation-agent',
    name: 'Allocation Agent',
    goal: 'Maximize cost allocation coverage and accuracy',
    backstory: 'Expert in cost allocation, tagging strategies, and resource ownership mapping. Specializes in auto-tagging, owner reconciliation, and allocation graph building.',
    tools: ['tagger', 'cmdb', 'git_inspector', 'k8s_api'],
    llms: ['gpt-4', 'claude-3-sonnet']
  },
  {
    id: 'anomaly-agent',
    name: 'Anomaly & RCA Agent',
    goal: 'Detect, analyze, and explain cost anomalies in real-time',
    backstory: 'Specialized in cost anomaly detection using advanced algorithms and correlation analysis. Expert in streaming anomaly detection, root cause analysis, and correlation with deployment events.',
    tools: ['prophet', 'adtk', 'correlation_engine', 'deployment_tracker', 'incident_feeds'],
    llms: ['gpt-4', 'claude-3-opus']
  },
  {
    id: 'optimization-agent',
    name: 'Optimization Agent',
    goal: 'Maximize cost savings through intelligent optimization recommendations',
    backstory: 'Expert in identifying cost optimization opportunities across infrastructure. Specializes in rightsizing, commitment planning, idle detection, and storage optimization.',
    tools: ['rightsizing_analyzer', 'ri_sp_cud_advisor', 'idle_detector', 'storage_tiering', 'k8s_optimizer', 'license_harvester'],
    llms: ['gpt-4', 'claude-3-opus']
  },
  {
    id: 'forecasting-agent',
    name: 'Forecasting Agent',
    goal: 'Provide accurate cost forecasts and enable data-driven budget planning',
    backstory: 'Expert in financial modeling and predictive analytics for cloud cost planning. Specializes in time series forecasting, budget planning, and scenario modeling.',
    tools: ['arima', 'prophet', 'xgboost', 'scenario_planner', 'budget_modeler'],
    llms: ['gpt-4', 'claude-3-opus']
  },
  {
    id: 'governance-agent',
    name: 'Governance Agent',
    goal: 'Ensure compliance with FinOps policies and governance standards',
    backstory: 'Specialized in policy enforcement and compliance across cloud infrastructure. Expert in policy as code, tagging enforcement, budget guardrails, and exception management.',
    tools: ['opa', 'rego', 'policy_engine', 'budget_service', 'exception_workflow'],
    llms: ['gpt-4', 'claude-3-sonnet']
  },
  {
    id: 'explainability-agent',
    name: 'Explainability & Audit Agent',
    goal: 'Provide complete explainability and immutable audit trails',
    backstory: 'Focused on providing transparency and auditability for all agent decisions. Expert in reasoning assembly, audit trail generation, and explainability.',
    tools: ['audit_ledger', 'reasoning_engine', 'signature_service', 'bundle_generator'],
    llms: ['gpt-4', 'claude-3-opus']
  },
  {
    id: 'vendor-license-agent',
    name: 'Vendor & License Agent',
    goal: 'Optimize license utilization and minimize true-up risks',
    backstory: 'Expert in software license management and vendor contract optimization. Specializes in SaaS contract tracking, usage vs entitlements, and true-up risk assessment.',
    tools: ['contract_tracker', 'usage_monitor', 'entitlement_db', 'trueup_calculator'],
    llms: ['gpt-4', 'claude-3-sonnet']
  }
];

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const bg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    // Try to fetch from backend, but use mock data if it fails
    fetch(`${CREW_API_URL}/v1/agents`, { 
      signal: AbortSignal.timeout(2000) // 2 second timeout
    })
      .then((r) => {
        if (!r.ok) throw new Error('Service not available');
        return r.json();
      })
      .then((data) => {
        setAgents(data.data || MOCK_AGENTS);
        setLoading(false);
      })
      .catch(() => {
        // Silently use fallback mock data when service is not available
        setAgents(MOCK_AGENTS);
        setLoading(false);
      });
  }, []);

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
        Agents
      </Heading>
      <Text fontSize="sm" color="gray.600" mb={6}>
        Manage and monitor all AI agents in the FinOps platform. View agent details including goals, backstory, tools, and LLMs.
      </Text>

      <VStack spacing={6} align="stretch">
        {agents.map((agent) => (
          <Card key={agent.id} bg={bg}>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Heading size="md">{agent.name}</Heading>
                    <Badge colorScheme="blue">CrewAI Agent</Badge>
                  </VStack>
                </HStack>

                <Divider />

                <VStack align="stretch" spacing={3}>
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={1}>
                      GOAL
                    </Text>
                    <Text fontSize="sm" fontWeight="semibold" color="blue.600">
                      {agent.goal}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={1}>
                      BACKSTORY
                    </Text>
                    <Text fontSize="sm">{agent.backstory}</Text>
                  </Box>
                </VStack>

                <Accordion allowMultiple>
                  <AccordionItem>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        <Text fontWeight="semibold">Tools ({agent.tools.length})</Text>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      <HStack spacing={2} flexWrap="wrap">
                        {agent.tools.map((tool, index) => (
                          <Badge key={index} colorScheme="purple" fontSize="xs">
                            {tool}
                          </Badge>
                        ))}
                      </HStack>
                    </AccordionPanel>
                  </AccordionItem>

                  {agent.llms && agent.llms.length > 0 && (
                    <AccordionItem>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          <Text fontWeight="semibold">LLMs ({agent.llms.length})</Text>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4}>
                        <HStack spacing={2} flexWrap="wrap">
                          {agent.llms.map((llm, index) => (
                            <Badge key={index} colorScheme="green" fontSize="xs">
                              {llm}
                            </Badge>
                          ))}
                        </HStack>
                      </AccordionPanel>
                    </AccordionItem>
                  )}
                </Accordion>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </VStack>
    </Box>
  );
}
