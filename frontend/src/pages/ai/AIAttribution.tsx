import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  useColorModeValue,
  SimpleGrid,
  Spinner,
  Progress,
  Grid,
  HStack,
  Link,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { useFinOps } from '../../contexts/FinOpsContext';
import { fetchAIAttribution } from './aiApi';
import { KpiStatCard } from './aiPageComponents';

type AttributionDimension = 'team' | 'workflow' | 'model' | 'provider' | 'agent';

const DIMENSION_LABELS: Record<AttributionDimension, string> = {
  team: 'Team / BU',
  workflow: 'Workflow',
  model: 'Model',
  provider: 'Provider',
  agent: 'Agent',
};

const DRILL_DOWN: Partial<Record<AttributionDimension, { label: string; to: string }>> = {
  workflow: { label: 'Workflows & Agents', to: '/ai/workflows' },
  model: { label: 'Models & Providers', to: '/ai/models' },
  agent: { label: 'Workflows & Agents', to: '/ai/workflows' },
};

const PIE_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#a0aec0'];

export default function AIAttribution() {
  const { timeRangeFrom, timeRangeTo } = useFinOps();
  const [data, setData] = useState<any>(null);
  const [dimension, setDimension] = useState<AttributionDimension>('team');
  const [loading, setLoading] = useState(true);
  const bg = useColorModeValue('white', 'gray.800');
  const muted = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    setLoading(true);
    fetchAIAttribution(timeRangeFrom, timeRangeTo, dimension)
      .then(setData)
      .finally(() => setLoading(false));
  }, [timeRangeFrom, timeRangeTo, dimension]);

  const rows = data?.rows ?? [];
  const coverageColor =
    (data?.coverage_pct ?? 0) >= (data?.target_coverage ?? 92)
      ? 'green'
      : (data?.coverage_pct ?? 0) >= 80
        ? 'yellow'
        : 'red';

  const chartData = useMemo(
    () => rows.slice(0, 8).map((r: { name: string; value: number }) => ({ name: r.name, value: r.value })),
    [rows],
  );

  const drillDown = DRILL_DOWN[dimension];

  if (loading || !data) {
    return (
      <Box py={8} display="flex" justifyContent="center">
        <Spinner size="lg" />
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="lg" mb={2}>Attribution</Heading>
      <Text color={muted} mb={6} maxW="3xl">
        AI spend by team, workflow, model, provider, and agent for {timeRangeFrom} – {timeRangeTo}.
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6} maxW="2xl">
        <KpiStatCard
          label="Attribution coverage"
          tip="Share of AI spend with complete team, workflow, model, and provider metadata attached to traces."
          value={
            <Text as="span" color={`${coverageColor}.500`}>
              {data.coverage_pct}%
            </Text>
          }
          helpText={`Target ${data.target_coverage}% · $${(data.unallocated_spend / 1000).toFixed(1)}k unallocated`}
        >
          <Progress value={data.coverage_pct} size="sm" mt={2} colorScheme={coverageColor} />
        </KpiStatCard>
        <KpiStatCard
          label="Attributed spend"
          tip="Portion of total AI spend successfully mapped to a team, workflow, model, provider, or agent dimension in the period."
          value={`$${((data.period_spend - data.unallocated_spend) / 1000).toFixed(1)}k`}
          helpText={`${timeRangeFrom} – ${timeRangeTo} · of $${(data.period_spend / 1000).toFixed(1)}k total`}
        />
      </SimpleGrid>

      <Tabs variant="enclosed" colorScheme="purple">
        <TabList>
          <Tab>Spend by dimension</Tab>
          <Tab>Coverage & gaps</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}>
            <Card bg={bg} borderWidth="1px" borderColor={borderColor}>
              <CardBody>
                <HStack mb={4} flexWrap="wrap" gap={3} justify="space-between">
                  <Select
                    size="sm"
                    maxW="240px"
                    value={dimension}
                    onChange={(e) => setDimension(e.target.value as AttributionDimension)}
                  >
                    <option value="team">Group by Team / BU</option>
                    <option value="workflow">Group by Workflow</option>
                    <option value="model">Group by Model</option>
                    <option value="provider">Group by Provider</option>
                    <option value="agent">Group by Agent</option>
                  </Select>
                  {drillDown && (
                    <Text fontSize="sm" color={muted}>
                      Drill down in{' '}
                      <Link as={RouterLink} to={drillDown.to} color="purple.500" fontWeight="medium">
                        {drillDown.label}
                      </Link>
                    </Text>
                  )}
                </HStack>
                <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name.length > 12 ? `${name.slice(0, 10)}…` : name} ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={90}
                          dataKey="value"
                        >
                          {chartData.map((_: unknown, i: number) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => [`$${(v / 1000).toFixed(2)}k`, 'Cost']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Text color={muted}>No attribution data for this period.</Text>
                  )}
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>{DIMENSION_LABELS[dimension]}</Th>
                        <Th isNumeric>Cost</Th>
                        <Th isNumeric>% of total</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {rows.map((r: { name: string; value: number; pct: number; provider?: string; model?: string; owner?: string; allocationModel?: string }) => (
                        <Tr key={r.name}>
                          <Td>
                            <Text fontWeight="medium">{r.name}</Text>
                            {dimension === 'agent' && r.model && (
                              <Text fontSize="xs" color={muted}>{r.model}</Text>
                            )}
                            {dimension === 'model' && r.provider && (
                              <Text fontSize="xs" color={muted}>{r.provider}</Text>
                            )}
                            {dimension === 'team' && r.owner && (
                              <Text fontSize="xs" color={muted}>{r.owner}</Text>
                            )}
                          </Td>
                          <Td isNumeric>${(r.value / 1000).toFixed(2)}k</Td>
                          <Td isNumeric>
                            <HStack justify="flex-end" spacing={2}>
                              <Text fontSize="sm">{r.pct.toFixed(1)}%</Text>
                              <Progress value={r.pct} size="xs" w="60px" colorScheme="purple" />
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Grid>
                {rows.length > 0 && (
                  <Box mt={6} h="240px">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tick={{ fill: 'white' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: 'white' }} />
                        <Tooltip formatter={(v: number) => [`$${(v / 1000).toFixed(2)}k`, 'Spend']} />
                        <Bar dataKey="value" fill="#805AD5" radius={[0, 4, 4, 0]} activeBar={false} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          <TabPanel px={0}>
            <Card bg={bg} mb={4} borderWidth="1px" borderColor={borderColor}>
              <CardBody>
                <Heading size="sm" mb={4}>Coverage by metadata key</Heading>
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Key</Th>
                      <Th isNumeric>Coverage</Th>
                      <Th isNumeric>Missing traces</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {(data.coverage_by_key ?? []).map((k: { key: string; label: string; coverage: number; missing: number }) => (
                      <Tr key={k.key}>
                        <Td>{k.label}</Td>
                        <Td isNumeric>
                          <HStack justify="flex-end" spacing={2}>
                            <Text>{k.coverage}%</Text>
                            <Progress
                              value={k.coverage}
                              size="xs"
                              w="80px"
                              colorScheme={k.coverage >= 90 ? 'green' : 'yellow'}
                            />
                          </HStack>
                        </Td>
                        <Td isNumeric>{k.missing}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
            <Card bg={bg} borderWidth="1px" borderColor={borderColor}>
              <CardBody>
                <Heading size="sm" mb={4}>Unallocated spend & gaps</Heading>
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Scope</Th>
                      <Th isNumeric>Unallocated</Th>
                      <Th>Gap</Th>
                      <Th>Suggested owner</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {(data.issues ?? []).map((issue: { scope: string; unallocated: number; missing: string; suggested_owner: string }) => (
                      <Tr key={issue.scope}>
                        <Td fontWeight="medium">{issue.scope}</Td>
                        <Td isNumeric>${issue.unallocated.toLocaleString()}</Td>
                        <Td fontSize="sm" color={muted}>{issue.missing}</Td>
                        <Td>{issue.suggested_owner}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
