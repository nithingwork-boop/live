import { useEffect, useState, forwardRef } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  useColorModeValue,
  Grid,
  VStack,
  Spinner,
  Select,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Icon,
  Tooltip as ChakraTooltip,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useFinOps } from '../../contexts/FinOpsContext';
import { fetchAIHome, AI_PROVIDERS } from './aiApi';

import { API_V1 as API_URL } from '../../config';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const InfoIcon = forwardRef<SVGSVGElement, any>((props, ref) => (
  <Icon viewBox="0 0 24 24" ref={ref} {...props}>
    <path
      fill="currentColor"
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
    />
  </Icon>
));
InfoIcon.displayName = 'InfoIcon';

function KpiLabel({ label, tip }: { label: string; tip: string }) {
  return (
    <HStack spacing={1}>
      <StatLabel mb={0}>{label}</StatLabel>
      <ChakraTooltip label={tip} hasArrow>
        <Icon as={InfoIcon} color="gray.400" w={4} h={4} cursor="help" />
      </ChakraTooltip>
    </HStack>
  );
}

export default function AISpendOpsHome() {
  const { timeRange, timeRangeFrom, timeRangeTo } = useFinOps();
  const [aiHome, setAIHome] = useState<any>(null);
  const [openAnomalyCount, setOpenAnomalyCount] = useState(0);
  const [pendingRecCount, setPendingRecCount] = useState(0);
  const [provider, setProvider] = useState('All');
  const [loading, setLoading] = useState(true);
  const bg = useColorModeValue('white', 'gray.800');
  const muted = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchAIHome(timeRangeFrom, timeRangeTo, provider),
      fetch(`${API_URL}/anomalies?scope=ai&from=${timeRangeFrom}&to=${timeRangeTo}`).then((r) => r.json()),
      fetch(`${API_URL}/recommendations?scope=ai&from=${timeRangeFrom}&to=${timeRangeTo}`).then((r) => r.json()),
    ])
      .then(([home, anomData, recData]) => {
        setAIHome(home);
        const anoms = anomData.data || [];
        setOpenAnomalyCount(anoms.filter((a: any) => a.status !== 'resolved').length);
        const recs = recData.data || [];
        setPendingRecCount(recs.filter((r: any) => r.status !== 'approved').length);
      })
      .catch((e) => console.error('AI FinOps home fetch failed', e))
      .finally(() => setLoading(false));
  }, [timeRangeFrom, timeRangeTo, provider]);

  const totalAISpend = aiHome?.period_spend ?? 0;
  const categorySpendData = (aiHome?.categories ?? []).map((c: any, i: number) => ({
    name: c.name,
    value: c.amount,
    pct: c.pct,
    fill: COLORS[i % COLORS.length],
  }));
  const costTrendData = aiHome?.token_trend ?? [];
  const topModelsBreakdown = aiHome?.top_models ?? [];
  const gpuUtilization = aiHome?.gpu_utilization ?? 0;
  const gpuColor = gpuUtilization >= 70 ? 'green' : gpuUtilization >= 40 ? 'yellow' : 'red';
  const tokens = aiHome?.tokens ?? { total: 0, cost_per_1k: 0, requests: 0 };
  const costPerAUoW = aiHome?.cost_per_auow ?? 0;
  const workflows = aiHome?.workflows ?? [];
  const spendDelta = aiHome?.spend_delta_pct ?? 0;

  if (loading) {
    return (
      <Box py={8} display="flex" justifyContent="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="lg" mb={2}>AI FinOps – Home</Heading>
      <Text color={muted} mb={2}>
        Scope: AI workloads (LLMs, GPUs, AI PaaS). Time range:{' '}
        {timeRange === 'custom' ? `${timeRangeFrom} – ${timeRangeTo}` : `Last ${Math.ceil((new Date(timeRangeTo).getTime() - new Date(timeRangeFrom).getTime()) / 86400000)} days`}.
      </Text>
      <HStack mb={6} spacing={4}>
        <Select size="sm" maxW="160px" value={provider} onChange={(e) => setProvider(e.target.value)}>
          {AI_PROVIDERS.map((p) => (
            <option key={p} value={p}>{p === 'All' ? 'All providers' : p}</option>
          ))}
        </Select>
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={4} mb={6}>
        <Card as={RouterLink} to="/ai/budgets" bg={bg} _hover={{ shadow: 'md' }} cursor="pointer">
          <CardBody>
            <Stat>
              <KpiLabel
                label="Total AI Spend"
                tip="Sum of LLM API, GPU compute, and AI PaaS spend for the selected period and provider filter."
              />
              <StatNumber>${(totalAISpend / 1000).toFixed(1)}k</StatNumber>
              <StatHelpText>
                <StatArrow type={spendDelta < 0 ? 'decrease' : 'increase'} />
                {Math.abs(spendDelta).toFixed(1)}% vs prior period
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card bg={bg}>
          <CardBody>
            <Stat>
              <KpiLabel
                label="AI Spend by Category"
                tip="Split of AI spend across training, inference, evaluation, and other workloads."
              />
              <Box h="60px" mt={2}>
                <ResponsiveContainer width="100%" height={60}>
                  <PieChart>
                    <Pie data={categorySpendData} cx="50%" cy="50%" innerRadius={18} outerRadius={26} dataKey="value" nameKey="name">
                      {categorySpendData.map((entry: any, i: number) => (
                        <Cell key={i} fill={entry.fill || COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number, name: string, props: any) => [`$${(v / 1000).toFixed(1)}k (${props.payload.pct}%)`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <HStack mt={2} flexWrap="wrap" gap={2}>
                {categorySpendData.map((c: any) => (
                  <HStack key={c.name} spacing={1.5}>
                    <Box w="8px" h="8px" borderRadius="sm" bg={c.fill} flexShrink={0} />
                    <Text fontSize="xs" color={muted}>{c.name}</Text>
                  </HStack>
                ))}
              </HStack>
            </Stat>
          </CardBody>
        </Card>
        <Card as={RouterLink} to="/ai/models" bg={bg} _hover={{ shadow: 'md' }} cursor="pointer">
          <CardBody>
            <Stat>
              <KpiLabel
                label="Tokens Processed"
                tip="Total input and output tokens across all models in the period, with blended cost per 1K tokens."
              />
              <StatNumber>{(tokens.total / 1e6).toFixed(1)}M</StatNumber>
              <StatHelpText>${tokens.cost_per_1k?.toFixed(3) ?? '—'} per 1K · {tokens.requests?.toLocaleString()} requests</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card as={RouterLink} to="/ai/gpu" bg={bg} _hover={{ shadow: 'md' }} cursor="pointer">
          <CardBody>
            <Stat>
              <KpiLabel
                label="GPU Utilization"
                tip="Actual GPU hours divided by provisioned GPU hours across all AI clusters."
              />
              <StatNumber>{gpuUtilization.toFixed(0)}%</StatNumber>
              <StatHelpText>{aiHome?.gpu_used_hours ?? 0} / {aiHome?.gpu_provisioned_hours ?? 0} hours</StatHelpText>
              <Progress value={gpuUtilization} size="sm" colorScheme={gpuColor} mt={2} />
            </Stat>
          </CardBody>
        </Card>
        <Card as={RouterLink} to="/ai/show-chargeback" bg={bg} _hover={{ shadow: 'md' }} cursor="pointer">
          <CardBody>
            <Stat>
              <KpiLabel
                label="Unit Cost per AUoW"
                tip="Average cost per agentic unit of work across active AI workflows in the period."
              />
              <StatNumber>${costPerAUoW.toFixed(2)}</StatNumber>
              <StatHelpText>Team showback & chargeback →</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card bg={bg} mb={6}>
        <CardBody>
          <HStack justify="space-between" flexWrap="wrap" gap={4}>
            <VStack align="start" spacing={1}>
              <Text fontWeight="semibold">Operational signals</Text>
              <Text fontSize="sm" color={muted}>
                AI spend anomalies and optimization opportunities — use shortcuts when something needs attention.
              </Text>
            </VStack>
            <HStack spacing={3} flexWrap="wrap">
              <HStack>
                <Badge colorScheme={openAnomalyCount > 0 ? 'orange' : 'green'} fontSize="sm" px={2} py={1}>
                  {openAnomalyCount} open anomal{openAnomalyCount === 1 ? 'y' : 'ies'}
                </Badge>
                <Button as={RouterLink} to="/ai/anomalies" size="sm" variant="outline">
                  View Anomalies
                </Button>
              </HStack>
              <HStack>
                <Badge colorScheme="blue" fontSize="sm" px={2} py={1}>
                  {pendingRecCount} optimization opportunit{pendingRecCount === 1 ? 'y' : 'ies'}
                </Badge>
                <Button as={RouterLink} to="/ai/optimization" size="sm" variant="outline">
                  View Optimization
                </Button>
              </HStack>
              <Button as={RouterLink} to="/ai/show-chargeback" size="sm" variant="outline" colorScheme="purple">
                Showback / Chargeback
              </Button>
            </HStack>
          </HStack>
        </CardBody>
      </Card>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6} mb={6}>
        <Card bg={bg}>
          <CardBody>
            <Heading size="md" mb={4}>LLM Usage & Cost Trend</Heading>
            {costTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={costTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'white' }} />
                  <YAxis yAxisId="cost" tick={{ fontSize: 11, fill: 'white' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <YAxis yAxisId="tokens" orientation="right" tick={{ fontSize: 11, fill: 'white' }} tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} />
                  <Tooltip formatter={(value: number, name: string) => [name === 'cost' ? `$${Number(value).toFixed(2)}` : Number(value).toLocaleString(), name]} />
                  <Legend formatter={(value) => <span style={{ color: 'white' }}>{value}</span>} />
                  <Line yAxisId="cost" type="monotone" dataKey="cost" name="Cost" stroke="#8884d8" strokeWidth={2} dot={false} />
                  <Line yAxisId="tokens" type="monotone" dataKey="tokens" name="Tokens" stroke="#82ca9d" strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Text color={muted}>No AI cost data for this period.</Text>
            )}
          </CardBody>
        </Card>
        <Card bg={bg}>
          <CardBody>
            <Heading size="md" mb={2}>Top Models by Cost</Heading>
            <Text fontSize="sm" color={muted} mb={4}>
              Total this period: ${(totalAISpend / 1000).toFixed(1)}k
            </Text>
            {topModelsBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topModelsBreakdown} layout="vertical" margin={{ left: 20, right: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fill: 'white' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 9, fill: 'white' }} />
                  <Tooltip formatter={(value: number, _: unknown, props: any) => [`$${Number(value).toFixed(2)} (${props.payload.pct}%)`, 'Cost']} />
                  <Bar dataKey="value" fill="#8884d8" name="Cost" activeBar={false} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Text color={muted}>No model cost data for this period.</Text>
            )}
            <Button as={RouterLink} to="/ai/models" size="xs" mt={2} colorScheme="blue" variant="outline">
              View all models
            </Button>
          </CardBody>
        </Card>
      </Grid>

      <Card bg={bg} mb={6}>
        <CardBody>
          <Heading size="md" mb={4}>Workflows & Efficiency</Heading>
          <Table size="sm">
            <Thead>
              <Tr><Th>Workflow</Th><Th>Agents</Th><Th>Cost/exec</Th><Th>Monthly cost</Th></Tr>
            </Thead>
            <Tbody>
              {workflows.map((w: any) => (
                <Tr key={w.name}>
                  <Td>{w.name}</Td>
                  <Td>{w.agents}</Td>
                  <Td>${w.costPerExec?.toFixed(2)}</Td>
                  <Td>${(w.monthlyCost / 1000).toFixed(1)}k</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          <Button as={RouterLink} to="/ai/workflows" size="xs" mt={2} colorScheme="blue" variant="outline">
            Workflows & Agents
          </Button>
        </CardBody>
      </Card>
    </Box>
  );
}
