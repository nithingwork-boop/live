import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Text,
  Card,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  HStack,
  SimpleGrid,
  Grid,
  useColorModeValue,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  List,
  ListItem,
  ListIcon,
  Badge,
  Progress,
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useFinOps } from '../../contexts/FinOpsContext';
import { fetchAIModels, AI_PROVIDERS } from './aiApi';
import {
  AIPageHeader,
  KpiStatCard,
  ChartCard,
  CHART_COLORS,
  formatMoneyK,
} from './aiPageComponents';

type AIModel = {
  id: string;
  model: string;
  provider: string;
  cost: number;
  promptTokens: number;
  completionTokens: number;
  costPer1k: number;
  calls: number;
  latency: number;
  errorRate: number;
  tier: string;
  modelType?: string;
};

export default function AIModelsProviders() {
  const { timeRangeFrom, timeRangeTo } = useFinOps();
  const [data, setData] = useState<any>(null);
  const [providerFilter, setProviderFilter] = useState('All');
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bg = useColorModeValue('white', 'gray.800');
  const rowBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    fetchAIModels(timeRangeFrom, timeRangeTo, providerFilter)
      .then(setData)
      .catch(() => setData(null));
  }, [timeRangeFrom, timeRangeTo, providerFilter]);

  const models: AIModel[] = data?.models ?? [];
  const summary = data?.summary;
  const periodSpend = data?.period_spend ?? 0;

  const modelSparkline = useMemo(() => {
    if (!selectedModel || !data?.cost_trend) return [];
    const share = periodSpend ? selectedModel.cost / periodSpend : 0.2;
    return data.cost_trend.map((d: any) => ({
      date: d.date,
      cost: parseFloat((d.cost * share).toFixed(2)),
    }));
  }, [selectedModel, data?.cost_trend, periodSpend]);

  const openModel = (m: AIModel) => {
    setSelectedModel(m);
    onOpen();
  };

  return (
    <Box>
      <AIPageHeader
        title="Models & Providers"
        subtitle="LLM and embedding models — cost, token volume, latency, and error rates across providers."
        from={timeRangeFrom}
        to={timeRangeTo}
        badge="AI workloads only"
      />

      <HStack mb={4} spacing={4} flexWrap="wrap">
        <Select size="sm" maxW="180px" value={providerFilter} onChange={(e) => setProviderFilter(e.target.value)}>
          {AI_PROVIDERS.map((p) => (
            <option key={p} value={p}>{p === 'All' ? 'All providers' : p}</option>
          ))}
        </Select>
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
        <KpiStatCard
          label="Model Spend"
          tip="Total AI spend attributed to LLM models in the selected period."
          value={formatMoneyK(periodSpend)}
          helpText={`${summary?.active_models ?? 0} active models`}
        />
        <KpiStatCard
          label="Tokens Processed"
          tip="Combined prompt and completion tokens across all models."
          value={`${((summary?.total_tokens ?? 0) / 1e6).toFixed(1)}M`}
          helpText={`${(summary?.total_calls ?? 0).toLocaleString()} API calls`}
        />
        <KpiStatCard
          label="Blended Cost / 1K"
          tip="Average cost per 1,000 tokens weighted by model usage."
          value={`$${summary?.blended_cost_per_1k?.toFixed(3) ?? '—'}`}
          helpText={`Premium tier: ${summary?.premium_spend_pct ?? 0}% of spend`}
        />
        <KpiStatCard
          label="Avg Latency"
          tip="Cost-weighted average model response latency in milliseconds."
          value={`${summary?.avg_latency_ms ?? '—'} ms`}
          helpText="Lower is better for interactive flows"
        />
      </SimpleGrid>

      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr 1fr' }} gap={6} mb={6}>
        <ChartCard title="Spend by Provider">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data?.by_provider ?? []}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="cost"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {(data?.by_provider ?? []).map((_: unknown, i: number) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [formatMoneyK(v), 'Spend']} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Cost by Model">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.cost_by_model ?? []} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fill: 'white' }} tickFormatter={(v) => formatMoneyK(v)} />
              <YAxis type="category" dataKey="name" width={72} tick={{ fontSize: 10, fill: 'white' }} />
              <Tooltip formatter={(v: number, _: unknown, props: any) => [formatMoneyK(v), props.payload.fullName]} />
              <Bar dataKey="cost" fill="#8884d8" radius={[0, 4, 4, 0]} activeBar={false} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Token & Cost Trend">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.cost_trend ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'white' }} />
              <YAxis yAxisId="cost" tickFormatter={(v) => formatMoneyK(v)} tick={{ fontSize: 10, fill: 'white' }} />
              <YAxis yAxisId="tokens" orientation="right" tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} tick={{ fontSize: 10, fill: 'white' }} />
              <Tooltip />
              <Legend formatter={(value) => <span style={{ color: 'white' }}>{value}</span>} />
              <Line yAxisId="cost" type="monotone" dataKey="cost" name="Cost" stroke="#8884d8" strokeWidth={2} dot={false} />
              <Line yAxisId="tokens" type="monotone" dataKey="tokens" name="Tokens" stroke="#82ca9d" strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </Grid>

      <Grid templateColumns={{ base: '1fr', lg: '3fr 1fr' }} gap={6} mb={6}>
        <Card bg={bg}>
          <CardBody>
            <HStack justify="space-between" mb={4}>
              <Text fontWeight="semibold">Model inventory</Text>
              <Badge colorScheme="blue">{models.length} models</Badge>
            </HStack>
            <Box overflowX="auto">
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Model</Th>
                    <Th>Provider</Th>
                    <Th isNumeric>Cost</Th>
                    <Th>Tokens (P/C)</Th>
                    <Th isNumeric>$/1K</Th>
                    <Th isNumeric>Calls</Th>
                    <Th isNumeric>Latency</Th>
                    <Th isNumeric>Error</Th>
                    <Th>Tier</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {models.map((m) => (
                    <Tr key={m.id} cursor="pointer" _hover={{ bg: rowBg }} onClick={() => openModel(m)}>
                      <Td fontWeight="medium">{m.model}</Td>
                      <Td>{m.provider}</Td>
                      <Td isNumeric>{formatMoneyK(m.cost)}</Td>
                      <Td>{(m.promptTokens / 1e6).toFixed(1)}M / {(m.completionTokens / 1e6).toFixed(1)}M</Td>
                      <Td isNumeric>${m.costPer1k.toFixed(2)}</Td>
                      <Td isNumeric>{m.calls.toLocaleString()}</Td>
                      <Td isNumeric>{m.latency} ms</Td>
                      <Td isNumeric>{m.errorRate}%</Td>
                      <Td>
                        <Badge colorScheme={m.tier === 'Premium' ? 'purple' : 'green'} fontSize="xs">{m.tier}</Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </CardBody>
        </Card>
        <Card bg={bg}>
          <CardBody>
            <Text fontWeight="semibold" mb={4}>Tier mix</Text>
            {(data?.tier_split ?? []).map((t: any, i: number) => {
              const pct = periodSpend ? (t.value / periodSpend) * 100 : 0;
              return (
                <Box key={t.name} mb={4}>
                  <HStack justify="space-between" mb={1}>
                    <Text fontSize="sm">{t.name}</Text>
                    <Text fontSize="sm" fontWeight="medium">{formatMoneyK(t.value)}</Text>
                  </HStack>
                  <Progress value={pct} size="sm" colorScheme={i === 0 ? 'purple' : 'green'} />
                  <Text fontSize="xs" color="gray.500" mt={1}>{pct.toFixed(0)}% of model spend</Text>
                </Box>
              );
            })}
            <Text fontWeight="semibold" mt={6} mb={3}>Provider summary</Text>
            <VStack align="stretch" spacing={2}>
              {(data?.by_provider ?? []).map((p: any) => (
                <HStack key={p.name} justify="space-between" fontSize="sm">
                  <Text>{p.name}</Text>
                  <Text fontWeight="medium">{formatMoneyK(p.cost)}</Text>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </Grid>

      <Drawer isOpen={isOpen} onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Model: {selectedModel?.model}</DrawerHeader>
          <DrawerBody>
            {selectedModel && (
              <Tabs>
                <TabList>
                  <Tab>Overview</Tab>
                  <Tab>Workflows</Tab>
                  <Tab>Optimization</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel px={0}>
                    <SimpleGrid columns={2} spacing={3} mb={4}>
                      <Stat size="sm">
                        <StatLabel>Provider</StatLabel>
                        <StatNumber fontSize="md">{selectedModel.provider}</StatNumber>
                      </Stat>
                      <Stat size="sm">
                        <StatLabel>Cost</StatLabel>
                        <StatNumber fontSize="md">{formatMoneyK(selectedModel.cost)}</StatNumber>
                      </Stat>
                      <Stat size="sm">
                        <StatLabel>Tokens</StatLabel>
                        <StatNumber fontSize="sm">
                          {(selectedModel.promptTokens / 1e6).toFixed(1)}M / {(selectedModel.completionTokens / 1e6).toFixed(1)}M
                        </StatNumber>
                      </Stat>
                      <Stat size="sm">
                        <StatLabel>Latency · Error</StatLabel>
                        <StatNumber fontSize="sm">{selectedModel.latency} ms · {selectedModel.errorRate}%</StatNumber>
                      </Stat>
                    </SimpleGrid>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Cost trend (model share)</Text>
                    <ResponsiveContainer width="100%" height={160}>
                      <LineChart data={modelSparkline}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'white' }} />
                        <YAxis tick={{ fontSize: 9, fill: 'white' }} tickFormatter={(v) => `$${v}`} />
                        <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, 'Cost']} />
                        <Line type="monotone" dataKey="cost" stroke="#8884d8" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </TabPanel>
                  <TabPanel px={0}>
                    <Table size="sm">
                      <Thead><Tr><Th>Workflow</Th><Th>Agent</Th><Th>Share</Th><Th>Cost/exec</Th></Tr></Thead>
                      <Tbody>
                        <Tr><Td>Complaint Intake</Td><Td>CA</Td><Td>42%</Td><Td>$0.12</Td></Tr>
                        <Tr><Td>Document Triage</Td><Td>DT</Td><Td>28%</Td><Td>$0.08</Td></Tr>
                      </Tbody>
                    </Table>
                  </TabPanel>
                  <TabPanel px={0}>
                    <List spacing={3} mb={4}>
                      <ListItem display="flex" gap={2}>
                        <ListIcon as={CheckCircleIcon} color="green.500" mt={1} />
                        <Text fontSize="sm">Route simple cases to a smaller model tier.</Text>
                      </ListItem>
                      <ListItem display="flex" gap={2}>
                        <ListIcon as={CheckCircleIcon} color="green.500" mt={1} />
                        <Text fontSize="sm">Increase prompt caching for repeated system prompts.</Text>
                      </ListItem>
                    </List>
                    <HStack>
                      <Button size="sm" variant="outline" colorScheme="blue">View impact</Button>
                      <Button size="sm" colorScheme="blue">Open optimization</Button>
                    </HStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
