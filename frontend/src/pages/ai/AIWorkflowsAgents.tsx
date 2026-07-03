import { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
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
  useColorModeValue,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Badge,
  Select,
  HStack,
  VStack,
  List,
  ListItem,
  ListIcon,
  Stat,
  StatLabel,
  StatNumber,
  Button,
  Grid,
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line,
} from 'recharts';
import { useFinOps } from '../../contexts/FinOpsContext';
import { fetchAIWorkflows } from './aiApi';
import { AIPageHeader, KpiStatCard, ChartCard, CHART_COLORS, formatMoneyK } from './aiPageComponents';

type AgentCostRow = { agent: string; model: string; costPerIter: number; itersPerCase: number; costPerCase: number };

type WorkflowRow = {
  id: string;
  name: string;
  description: string;
  agents: string;
  costPerExec: number;
  monthlyVolume: number;
  monthlyCost: number;
  p50: number;
  p90: number;
  p99: number;
  breakdown: AgentCostRow[];
};

type AgentRow = {
  id: string;
  name: string;
  purpose: string;
  model: string;
  costPerExec: number;
  monthlyExec: number;
  monthlyCost: number;
  team: string;
};

export default function AIWorkflowsAgents() {
  const { timeRangeFrom, timeRangeTo } = useFinOps();
  const [data, setData] = useState<any>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowRow | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentRow | null>(null);
  const [agentSortBy, setAgentSortBy] = useState<'cost' | 'name' | 'model' | 'owner'>('cost');
  const { isOpen: workflowDrawerOpen, onOpen: onWorkflowOpen, onClose: onWorkflowClose } = useDisclosure();
  const { isOpen: agentDrawerOpen, onOpen: onAgentOpen, onClose: onAgentClose } = useDisclosure();
  const bg = useColorModeValue('white', 'gray.800');
  const muted = useColorModeValue('gray.600', 'gray.400');
  const rowBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    fetchAIWorkflows(timeRangeFrom, timeRangeTo).then(setData).catch(() => setData(null));
  }, [timeRangeFrom, timeRangeTo]);

  const workflows: WorkflowRow[] = data?.workflows ?? [];
  const agents: AgentRow[] = data?.agents ?? [];
  const summary = data?.summary;

  const sortedAgents = useMemo(() => {
    const list = [...agents];
    list.sort((a, b) => {
      switch (agentSortBy) {
        case 'cost': return b.monthlyCost - a.monthlyCost;
        case 'name': return a.name.localeCompare(b.name);
        case 'model': return a.model.localeCompare(b.model);
        case 'owner': return a.team.localeCompare(b.team);
        default: return 0;
      }
    });
    return list;
  }, [agents, agentSortBy]);

  const auowChartData = useMemo(() => {
    const byWorkflow: Record<string, any> = {};
    (data?.auow_bands ?? []).forEach((b: any) => {
      if (!byWorkflow[b.workflow]) byWorkflow[b.workflow] = { workflow: b.workflow.length > 14 ? `${b.workflow.slice(0, 12)}…` : b.workflow };
      byWorkflow[b.workflow][b.band] = b.cost;
    });
    return Object.values(byWorkflow);
  }, [data?.auow_bands]);

  return (
    <Box>
      <AIPageHeader
        title="Workflows & Agents"
        subtitle="End-to-end agent workflows with per-AUoW cost bands, volume, and model attribution."
        from={timeRangeFrom}
        to={timeRangeTo}
        badge="E1 unit economics"
      />

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
        <KpiStatCard
          label="Workflow Spend"
          tip="Total scaled monthly cost across all agent workflows in the period."
          value={formatMoneyK(summary?.total_monthly_cost ?? 0)}
          helpText={`${summary?.workflow_count ?? 0} workflows · ${summary?.agent_count ?? 0} agents`}
        />
        <KpiStatCard
          label="Executions"
          tip="Total workflow executions (cases / AUoW) in the scaled period."
          value={(summary?.total_executions ?? 0).toLocaleString()}
          helpText="Cases processed end-to-end"
        />
        <KpiStatCard
          label="Avg Cost / Exec"
          tip="Blended cost per workflow execution across all flows."
          value={`$${summary?.avg_cost_per_exec?.toFixed(2) ?? '—'}`}
          helpText={`P50 AUoW: $${summary?.avg_p50_auow?.toFixed(2) ?? '—'}`}
        />
        <KpiStatCard
          label="Total AI Scope"
          tip="All AI spend in period for context vs workflow-attributed cost."
          value={formatMoneyK(data?.period_spend ?? 0)}
          helpText="Includes LLM, GPU, and PaaS"
        />
      </SimpleGrid>

      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6} mb={6}>
        <ChartCard title="Monthly Cost by Workflow">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.workflow_cost_chart ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'white' }} />
              <YAxis tickFormatter={(v) => formatMoneyK(v)} tick={{ fontSize: 10, fill: 'white' }} />
              <Tooltip formatter={(v: number, _: unknown, p: any) => [formatMoneyK(v), p.payload.fullName]} />
              <Bar dataKey="cost" fill="#8884d8" radius={[4, 4, 0, 0]} activeBar={false} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Agent Cost Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.agent_chart ?? []} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fill: 'white' }} tickFormatter={(v) => formatMoneyK(v)} />
              <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10, fill: 'white' }} />
              <Tooltip formatter={(v: number) => [formatMoneyK(v), 'Monthly cost']} />
              <Bar dataKey="cost" fill="#82ca9d" radius={[0, 4, 4, 0]} activeBar={false} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </Grid>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6} mb={6}>
        <ChartCard title="AUoW Cost Bands (P50 / P90 / P99)" height={240}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={auowChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="workflow" tick={{ fontSize: 10, fill: 'white' }} />
              <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 10, fill: 'white' }} />
              <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, '']} />
              <Legend formatter={(value) => <span style={{ color: 'white' }}>{value}</span>} />
              <Bar dataKey="P50" fill={CHART_COLORS[0]} activeBar={false} />
              <Bar dataKey="P90" fill={CHART_COLORS[1]} activeBar={false} />
              <Line type="monotone" dataKey="P99" stroke={CHART_COLORS[3]} strokeWidth={2} name="P99" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Spend by Team" height={240}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.team_spend ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'white' }} />
              <YAxis tickFormatter={(v) => formatMoneyK(v)} tick={{ fontSize: 10, fill: 'white' }} />
              <Tooltip formatter={(v: number) => [formatMoneyK(v), 'Agent cost']} />
              <Bar dataKey="cost" fill="#FF8042" radius={[4, 4, 0, 0]} activeBar={false} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </Grid>

      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>Workflows ({workflows.length})</Tab>
          <Tab>Agents ({agents.length})</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {workflows.map((w) => (
                <Card key={w.id} bg={bg} cursor="pointer" onClick={() => { setSelectedWorkflow(w); onWorkflowOpen(); }} _hover={{ shadow: 'md' }}>
                  <CardBody>
                    <Heading size="sm" mb={1}>{w.name}</Heading>
                    <Text fontSize="sm" color={muted} mb={2} noOfLines={2}>{w.description}</Text>
                    <Text fontSize="sm" mb={2}>Agents: <Badge colorScheme="blue">{w.agents}</Badge></Text>
                    <HStack justify="space-between">
                      <Text fontWeight="bold">${w.costPerExec.toFixed(2)}/exec</Text>
                      <Text fontSize="sm">{formatMoneyK(w.monthlyCost)}/mo</Text>
                    </HStack>
                    <Text fontSize="xs" color={muted} mt={2}>
                      {w.monthlyVolume.toLocaleString()} exec/mo · P50 ${w.p50.toFixed(2)}
                    </Text>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </TabPanel>
          <TabPanel px={0}>
            <HStack mb={4}>
              <Text fontSize="sm" color={muted}>Sort by</Text>
              <Select size="sm" maxW="160px" value={agentSortBy} onChange={(e) => setAgentSortBy(e.target.value as typeof agentSortBy)}>
                <option value="cost">Cost (monthly)</option>
                <option value="name">Name</option>
                <option value="model">Model</option>
                <option value="owner">Team</option>
              </Select>
            </HStack>
            <Card bg={bg}>
              <CardBody>
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Agent</Th>
                      <Th>Purpose</Th>
                      <Th>Model</Th>
                      <Th isNumeric>Cost/exec</Th>
                      <Th isNumeric>Monthly exec</Th>
                      <Th isNumeric>Monthly cost</Th>
                      <Th>Team</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {sortedAgents.map((a) => (
                      <Tr key={a.id} cursor="pointer" _hover={{ bg: rowBg }} onClick={() => { setSelectedAgent(a); onAgentOpen(); }}>
                        <Td fontWeight="medium">{a.name}</Td>
                        <Td>{a.purpose}</Td>
                        <Td><Badge fontSize="xs">{a.model}</Badge></Td>
                        <Td isNumeric>${a.costPerExec.toFixed(2)}</Td>
                        <Td isNumeric>{a.monthlyExec.toLocaleString()}</Td>
                        <Td isNumeric>{formatMoneyK(a.monthlyCost)}</Td>
                        <Td>{a.team}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Drawer isOpen={workflowDrawerOpen} onClose={onWorkflowClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Workflow: {selectedWorkflow?.name}</DrawerHeader>
          <DrawerBody>
            {selectedWorkflow && (
              <Tabs>
                <TabList><Tab>Cost Breakdown</Tab><Tab>Performance</Tab><Tab>Optimization</Tab></TabList>
                <TabPanels>
                  <TabPanel px={0}>
                    <Table size="sm" mb={4}>
                      <Thead><Tr><Th>Agent</Th><Th>Model</Th><Th>$/iter</Th><Th>Iters</Th><Th>$/case</Th></Tr></Thead>
                      <Tbody>
                        {selectedWorkflow.breakdown.map((r) => (
                          <Tr key={r.agent}>
                            <Td>{r.agent}</Td><Td>{r.model}</Td><Td>${r.costPerIter.toFixed(2)}</Td><Td>{r.itersPerCase}</Td><Td>${r.costPerCase.toFixed(2)}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={selectedWorkflow.breakdown} layout="vertical" margin={{ left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tick={{ fill: 'white' }} tickFormatter={(v) => `$${v}`} />
                        <YAxis type="category" dataKey="agent" width={40} tick={{ fill: 'white' }} />
                        <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, 'Cost/case']} />
                        <Bar dataKey="costPerCase" fill="#8884d8" activeBar={false} />
                      </BarChart>
                    </ResponsiveContainer>
                  </TabPanel>
                  <TabPanel px={0}>
                    <SimpleGrid columns={3} spacing={3}>
                      <Stat size="sm"><StatLabel>AHT</StatLabel><StatNumber fontSize="md">2.4 min</StatNumber></Stat>
                      <Stat size="sm"><StatLabel>CSAT</StatLabel><StatNumber fontSize="md">4.2</StatNumber></Stat>
                      <Stat size="sm"><StatLabel>Accuracy</StatLabel><StatNumber fontSize="md">94%</StatNumber></Stat>
                    </SimpleGrid>
                  </TabPanel>
                  <TabPanel px={0}>
                    <List spacing={2} mb={4}>
                      <ListItem><ListIcon as={CheckCircleIcon} color="green.500" />Tier models by step complexity</ListItem>
                      <ListItem><ListIcon as={CheckCircleIcon} color="green.500" />Enable caching on repeated prompts</ListItem>
                    </List>
                    <Button size="sm" colorScheme="blue">Create optimization plan</Button>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Drawer isOpen={agentDrawerOpen} onClose={onAgentClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{selectedAgent?.name}</DrawerHeader>
          <DrawerBody>
            {selectedAgent && (
              <VStack align="stretch" spacing={4}>
                <Text fontSize="sm">{selectedAgent.purpose}</Text>
                <SimpleGrid columns={2} spacing={3} w="100%">
                  <Stat size="sm"><StatLabel>Model</StatLabel><StatNumber fontSize="sm">{selectedAgent.model}</StatNumber></Stat>
                  <Stat size="sm"><StatLabel>Team</StatLabel><StatNumber fontSize="sm">{selectedAgent.team}</StatNumber></Stat>
                  <Stat size="sm"><StatLabel>Cost/exec</StatLabel><StatNumber fontSize="sm">${selectedAgent.costPerExec.toFixed(2)}</StatNumber></Stat>
                  <Stat size="sm"><StatLabel>Monthly</StatLabel><StatNumber fontSize="sm">{formatMoneyK(selectedAgent.monthlyCost)}</StatNumber></Stat>
                </SimpleGrid>
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
