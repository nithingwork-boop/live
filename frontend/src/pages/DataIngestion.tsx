import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardBody,
  VStack,
  HStack,
  Badge,
  Text,
  useColorModeValue,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  SimpleGrid,
  Stat,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { CheckIcon, WarningIcon } from '@chakra-ui/icons';
import { KpiLabel } from '../components/KpiLabel';

type IntegrationDomain = 'ai';

interface Connector {
  id: string;
  name: string;
  type: string;
  domain: IntegrationDomain;
  status: 'healthy' | 'warning' | 'error';
  dataFreshness: number;
  lastSync: string;
  datasetsRegistered: number;
  schemaValidated: boolean;
}

export const AI_CONNECTORS: Connector[] = [
  { id: 'conn-openai-1', name: 'OpenAI Usage API', type: 'LLM Provider', domain: 'ai', status: 'healthy', dataFreshness: 99.4, lastSync: new Date(Date.now() - 45 * 60000).toISOString(), datasetsRegistered: 2, schemaValidated: true },
  { id: 'conn-azure-oai-1', name: 'Azure OpenAI Metrics', type: 'LLM Provider', domain: 'ai', status: 'healthy', dataFreshness: 98.9, lastSync: new Date(Date.now() - 90 * 60000).toISOString(), datasetsRegistered: 2, schemaValidated: true },
  { id: 'conn-vertex-1', name: 'Vertex AI Billing', type: 'LLM Provider', domain: 'ai', status: 'healthy', dataFreshness: 97.6, lastSync: new Date(Date.now() - 2 * 3600000).toISOString(), datasetsRegistered: 1, schemaValidated: true },
  { id: 'conn-bedrock-1', name: 'AWS Bedrock Usage', type: 'LLM Provider', domain: 'ai', status: 'healthy', dataFreshness: 98.2, lastSync: new Date(Date.now() - 75 * 60000).toISOString(), datasetsRegistered: 1, schemaValidated: true },
  { id: 'conn-anthropic-1', name: 'Anthropic API Usage', type: 'LLM Provider', domain: 'ai', status: 'warning', dataFreshness: 86.0, lastSync: new Date(Date.now() - 6 * 3600000).toISOString(), datasetsRegistered: 1, schemaValidated: true },
  { id: 'conn-langfuse-1', name: 'Langfuse Traces', type: 'Observability', domain: 'ai', status: 'healthy', dataFreshness: 99.0, lastSync: new Date(Date.now() - 20 * 60000).toISOString(), datasetsRegistered: 3, schemaValidated: true },
  { id: 'conn-langsmith-1', name: 'LangSmith Runs', type: 'Observability', domain: 'ai', status: 'healthy', dataFreshness: 98.5, lastSync: new Date(Date.now() - 35 * 60000).toISOString(), datasetsRegistered: 2, schemaValidated: true },
  { id: 'conn-gpu-1', name: 'GPU Cluster Metrics', type: 'GPU Infra', domain: 'ai', status: 'healthy', dataFreshness: 96.8, lastSync: new Date(Date.now() - 3 * 3600000).toISOString(), datasetsRegistered: 2, schemaValidated: true },
  { id: 'conn-mlflow-1', name: 'MLflow Experiment Costs', type: 'ML Platform', domain: 'ai', status: 'warning', dataFreshness: 81.0, lastSync: new Date(Date.now() - 10 * 3600000).toISOString(), datasetsRegistered: 1, schemaValidated: false },
];

function ConnectorPanel({
  connectors,
  domain,
  agentActivity,
}: {
  connectors: Connector[];
  domain: IntegrationDomain;
  agentActivity: string;
}) {
  const bg = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const accent = 'purple';

  const healthyCount = connectors.filter((c) => c.status === 'healthy').length;
  const errorCount = connectors.filter((c) => c.status === 'error').length;
  const avgFreshness = connectors.length
    ? connectors.reduce((s, c) => s + c.dataFreshness, 0) / connectors.length
    : 0;
  const totalDatasets = connectors.reduce((s, c) => s + c.datasetsRegistered, 0);

  const getStatusColor = (status: string) =>
    status === 'healthy' ? 'green' : status === 'warning' ? 'yellow' : 'red';

  const formatDate = (dateString: string) => {
    const hoursAgo = Math.floor((Date.now() - new Date(dateString).getTime()) / 3600000);
    if (hoursAgo < 1) {
      const minutesAgo = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
      return `${minutesAgo} min ago`;
    }
    return `${hoursAgo}h ago`;
  };

  return (
    <VStack align="stretch" spacing={6}>
      <HStack justify="space-between" flexWrap="wrap" gap={2}>
        <Text fontSize="sm" color={`${accent}.600`} fontStyle="italic">
          {agentActivity}
        </Text>
        <Badge colorScheme={accent}>AI FinOps</Badge>
      </HStack>

      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        <Card bg={bg}>
          <CardBody>
            <Stat size="sm">
              <KpiLabel label="Connectors" tip="Total registered data connectors in this domain." />
              <StatNumber fontSize="2xl">{connectors.length}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card bg={bg}>
          <CardBody>
            <Stat size="sm">
              <KpiLabel label="Healthy" tip="Connectors reporting successful sync with no errors in the last cycle." />
              <StatNumber fontSize="2xl" color="green.500">{healthyCount}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card bg={bg}>
          <CardBody>
            <Stat size="sm">
              <KpiLabel label="Avg Freshness" tip="Average data freshness score across connectors (target ≥ 95%)." />
              <StatNumber fontSize="2xl" color={`${accent}.500`}>{avgFreshness.toFixed(1)}%</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card bg={bg}>
          <CardBody>
            <Stat size="sm">
              <KpiLabel label="Datasets" tip="Total datasets registered and schema-validated for ingestion pipelines." />
              <StatNumber fontSize="2xl">{totalDatasets}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card bg={bg}>
        <CardBody>
          <TableContainer>
            <Table size="md" variant="simple">
              <Thead>
                <Tr>
                  <Th>Connector</Th>
                  <Th>Type</Th>
                  <Th>Status</Th>
                  <Th>Freshness</Th>
                  <Th>Last Sync</Th>
                  <Th>Datasets</Th>
                  <Th>Schema</Th>
                </Tr>
              </Thead>
              <Tbody>
                {connectors.map((c) => (
                  <Tr key={c.id}>
                    <Td fontWeight="medium">{c.name}</Td>
                    <Td><Badge colorScheme={accent} fontSize="xs">{c.type}</Badge></Td>
                    <Td><Badge colorScheme={getStatusColor(c.status)}>{c.status.toUpperCase()}</Badge></Td>
                    <Td>
                      <HStack spacing={2}>
                        <Progress value={c.dataFreshness} colorScheme={c.dataFreshness >= 95 ? 'green' : c.dataFreshness >= 80 ? 'yellow' : 'red'} size="sm" w="80px" />
                        <Text fontSize="sm">{c.dataFreshness.toFixed(1)}%</Text>
                      </HStack>
                    </Td>
                    <Td fontSize="sm">{formatDate(c.lastSync)}</Td>
                    <Td>{c.datasetsRegistered}</Td>
                    <Td>{c.schemaValidated ? <CheckIcon color="green.500" /> : <WarningIcon color="red.500" />}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>

      {errorCount > 0 && (
        <Card bg={cardBg} borderLeft="4px" borderColor="red.500">
          <CardBody>
            <Text fontSize="sm">{errorCount} connector(s) require attention. Ingestion Agent is investigating.</Text>
          </CardBody>
        </Card>
      )}
    </VStack>
  );
}

function useAgentActivity(messages: string[]) {
  const [activity, setActivity] = useState(messages[0]);
  useEffect(() => {
    let i = 0;
    setActivity(messages[0]);
    const interval = setInterval(() => {
      i += 1;
      setActivity(messages[i % messages.length]);
    }, 5000);
    return () => clearInterval(interval);
  }, [messages]);
  return activity;
}

const AI_MSGS = [
  'Ingesting OpenAI, Azure OpenAI, and Bedrock token usage exports',
  'Pulling Langfuse/LangSmith traces for AUoW cost attribution',
  'Syncing GPU cluster utilization metrics for inference pools',
];

export function AIIntegrationsPage() {
  const activity = useAgentActivity(AI_MSGS);
  return <ConnectorPanel connectors={AI_CONNECTORS} domain="ai" agentActivity={activity} />;
}

/** @deprecated Use IntegrationsLayout routes */
export default function DataIngestion() {
  return <AIIntegrationsPage />;
}
