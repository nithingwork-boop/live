import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  useColorModeValue,
  Progress,
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  List,
  ListItem,
  ListIcon,
  Grid,
  HStack,
  Badge,
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Area,
  Legend,
} from 'recharts';
import { useFinOps } from '../../contexts/FinOpsContext';
import { fetchAIGPU } from './aiApi';
import { AIPageHeader, KpiStatCard, ChartCard, CHART_COLORS, formatMoneyK } from './aiPageComponents';

type GPUCluster = {
  id: string;
  name: string;
  location: string;
  provider: string;
  gpuType: string;
  provisionedHours: number;
  usedHours: number;
  cost: number;
  trainingPct: number;
  inferencePct: number;
  utilization_pct: number;
};

export default function AIGPUInfra() {
  const { timeRangeFrom, timeRangeTo } = useFinOps();
  const [data, setData] = useState<any>(null);
  const [selected, setSelected] = useState<GPUCluster | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bg = useColorModeValue('white', 'gray.800');
  const muted = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    fetchAIGPU(timeRangeFrom, timeRangeTo).then(setData).catch(() => setData(null));
  }, [timeRangeFrom, timeRangeTo]);

  const clusters: GPUCluster[] = data?.clusters ?? [];
  const summary = data?.summary;
  const gpuSpend = data?.gpu_spend ?? 0;

  return (
    <Box>
      <AIPageHeader
        title="GPU & Infra"
        subtitle="GPU cluster utilization, idle cost, and training vs inference workload split."
        from={timeRangeFrom}
        to={timeRangeTo}
        badge="Accelerators"
      />

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
        <KpiStatCard
          label="GPU Spend"
          tip="GPU compute cost attributed to AI workloads in this period."
          value={formatMoneyK(gpuSpend)}
          helpText={`${summary?.gpu_share_of_ai_pct ?? 0}% of total AI spend`}
        />
        <KpiStatCard
          label="Aggregate Utilization"
          tip="Used GPU hours divided by provisioned GPU hours across all clusters."
          value={`${data?.aggregate_utilization_pct?.toFixed(0) ?? '—'}%`}
          helpText={`${summary?.gpu_hours_used ?? 0} / ${summary?.gpu_hours_provisioned ?? 0} hours`}
        />
        <KpiStatCard
          label="Idle GPU Cost"
          tip="Estimated waste from under-utilized provisioned GPU capacity."
          value={formatMoneyK(summary?.idle_cost ?? 0)}
          helpText={`${summary?.idle_hours ?? 0} idle hours`}
        />
        <KpiStatCard
          label="Active Clusters"
          tip="Number of GPU clusters with provisioned capacity in scope."
          value={summary?.cluster_count ?? 0}
          helpText="AWS · GCP regions"
        />
      </SimpleGrid>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6} mb={6}>
        <ChartCard title="GPU Cost & Utilization Trend">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data?.util_trend ?? data?.trend ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'white' }} />
              <YAxis yAxisId="cost" tickFormatter={(v) => `$${v}`} tick={{ fontSize: 10, fill: 'white' }} />
              <YAxis yAxisId="util" orientation="right" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: 'white' }} />
              <Tooltip />
              <Legend formatter={(value) => <span style={{ color: 'white' }}>{value}</span>} />
              <Area yAxisId="cost" type="monotone" dataKey="cost" fill="#8884d8" fillOpacity={0.4} stroke="#8884d8" name="GPU cost" />
              <Line yAxisId="util" type="monotone" dataKey="utilization" stroke="#82ca9d" strokeWidth={2} name="Utilization %" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Training vs Inference">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data?.workload_split ?? []}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                dataKey="value"
                nameKey="name"
                label={({ x, y, textAnchor, name, percent }) => (
                  <text x={x} y={y} fill="white" textAnchor={textAnchor} fontSize={11}>
                    {`${name} ${(percent * 100).toFixed(0)}%`}
                  </text>
                )}
              >
                {(data?.workload_split ?? []).map((_: unknown, i: number) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [formatMoneyK(v), 'Spend']} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </Grid>

      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6} mb={6}>
        <ChartCard title="Utilization by Cluster" height={260}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.util_by_cluster ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'white' }} interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: 'white' }} />
              <Tooltip formatter={(v: number, name: string) => [name === 'utilization' ? `${v}%` : formatMoneyK(v as number), name === 'utilization' ? 'Util' : 'Cost']} />
              <Bar dataKey="utilization" fill="#38a169" name="Utilization" radius={[4, 4, 0, 0]} activeBar={false} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Cost by GPU Type" height={260}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.cost_by_gpu_type ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'white' }} />
              <YAxis tickFormatter={(v) => formatMoneyK(v)} tick={{ fontSize: 10, fill: 'white' }} />
              <Tooltip formatter={(v: number) => [formatMoneyK(v), 'Cost']} />
              <Bar dataKey="cost" fill="#805ad5" radius={[4, 4, 0, 0]} activeBar={false} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </Grid>

      <Text fontWeight="semibold" mb={3}>GPU clusters</Text>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mb={6}>
        {clusters.map((c) => {
          const utilPct = c.utilization_pct;
          const utilColor = utilPct >= 70 ? 'green' : utilPct >= 40 ? 'yellow' : 'red';
          return (
            <Card key={c.id} bg={bg} cursor="pointer" onClick={() => { setSelected(c); onOpen(); }} _hover={{ shadow: 'md' }}>
              <CardBody>
                <HStack justify="space-between" mb={1}>
                  <Heading size="sm">{c.name}</Heading>
                  <Badge colorScheme={utilColor}>{utilPct.toFixed(0)}% util</Badge>
                </HStack>
                <Text fontSize="xs" color={muted}>{c.provider} · {c.location} · {c.gpuType}</Text>
                <Text fontWeight="bold" mt={2}>{formatMoneyK(c.cost)}</Text>
                <Text fontSize="xs" mt={1}>{c.usedHours} / {c.provisionedHours} GPU hours</Text>
                <Progress value={utilPct} size="sm" colorScheme={utilColor} mt={2} />
                <HStack mt={2} spacing={3} fontSize="xs" color={muted}>
                  <Text>Training {c.trainingPct}%</Text>
                  <Text>Inference {c.inferencePct}%</Text>
                </HStack>
              </CardBody>
            </Card>
          );
        })}
      </SimpleGrid>

      <ChartCard title="Forecast by Project" height={220}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data?.forecast ?? []} layout="vertical" margin={{ left: 20, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fill: 'white' }} tickFormatter={(v) => formatMoneyK(v)} />
            <YAxis type="category" dataKey="project" width={110} tick={{ fontSize: 10, fill: 'white' }} />
            <Tooltip formatter={(v: number, _: unknown, p: any) => [formatMoneyK(v), `${p.payload.gpuFamily} forecast`]} />
            <Bar dataKey="forecastCost" fill="#82ca9d" radius={[0, 4, 4, 0]} activeBar={false} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <Drawer isOpen={isOpen} onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Cluster: {selected?.name}</DrawerHeader>
          <DrawerBody>
            {selected && (
              <Tabs>
                <TabList>
                  <Tab>Projects</Tab>
                  <Tab>Rightsizing</Tab>
                  <Tab>Trend</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel px={0}>
                    <Table size="sm">
                      <Thead><Tr><Th>Project</Th><Th>GPU hrs</Th><Th>Cost</Th><Th>Util</Th></Tr></Thead>
                      <Tbody>
                        <Tr><Td>model-training-v2</Td><Td>320</Td><Td>{formatMoneyK(selected.cost * 0.6)}</Td><Td>68%</Td></Tr>
                        <Tr><Td>batch-inference</Td><Td>200</Td><Td>{formatMoneyK(selected.cost * 0.4)}</Td><Td>72%</Td></Tr>
                      </Tbody>
                    </Table>
                  </TabPanel>
                  <TabPanel px={0}>
                    <List spacing={3}>
                      <ListItem display="flex" gap={2}><ListIcon as={CheckCircleIcon} color="green.500" mt={1} /><Text fontSize="sm">Move batch jobs to spot/preemptible instances.</Text></ListItem>
                      <ListItem display="flex" gap={2}><ListIcon as={CheckCircleIcon} color="green.500" mt={1} /><Text fontSize="sm">Right-size {selected.gpuType} pool for current demand.</Text></ListItem>
                      <ListItem display="flex" gap={2}><ListIcon as={CheckCircleIcon} color="green.500" mt={1} /><Text fontSize="sm">Schedule training off-peak to raise utilization.</Text></ListItem>
                    </List>
                  </TabPanel>
                  <TabPanel px={0}>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={data?.trend ?? []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'white' }} />
                        <YAxis tickFormatter={(v) => `$${v}`} tick={{ fill: 'white' }} />
                        <Tooltip formatter={(v: number) => [`$${v}`, 'Cost']} />
                        <Line type="monotone" dataKey="cost" stroke="#8884d8" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
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
