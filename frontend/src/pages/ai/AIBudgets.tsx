import { useEffect, useState } from 'react';
import { useFinOps } from '../../contexts/FinOpsContext';
import { fetchAIBudgets } from './aiApi';
import {
  Box,
  Heading,
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
  SimpleGrid,
  Grid,
  useColorModeValue,
  Badge,
  Progress,
} from '@chakra-ui/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Line,
} from 'recharts';
import { AIPageHeader, KpiStatCard, ChartCard, CHART_COLORS, formatMoneyK } from './aiPageComponents';

export default function AIBudgets() {
  const { timeRangeFrom, timeRangeTo } = useFinOps();
  const [data, setData] = useState<any>(null);
  const bg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    fetchAIBudgets(timeRangeFrom, timeRangeTo)
      .then(setData)
      .catch(() => setData(null));
  }, [timeRangeFrom, timeRangeTo]);

  const periodSpend = data?.period_spend ?? 0;
  const budgets = data?.budgets ?? [];
  const roi = data?.roi ?? [];
  const summary = data?.summary;

  return (
    <Box>
      <AIPageHeader
        title="AI Budgets"
        subtitle="Project budgets, forecast tracking, and return on AI investment by initiative."
        from={timeRangeFrom}
        to={timeRangeTo}
      />

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
        <KpiStatCard
          label="Total AI Spend"
          tip="All AI scope spend in the selected period."
          value={formatMoneyK(periodSpend)}
          helpText={`Budget envelope: ${formatMoneyK(summary?.total_budget ?? 0)}`}
        />
        <KpiStatCard
          label="Budget Variance"
          tip="Overall actual spend vs combined project budgets."
          value={`${summary?.overall_variance_pct > 0 ? '+' : ''}${summary?.overall_variance_pct?.toFixed(1) ?? '—'}%`}
          helpText={`Forecast: ${formatMoneyK(summary?.total_forecast ?? 0)}`}
        />
        <KpiStatCard
          label="Projects On Track"
          tip="Projects where actual spend is at or below budget."
          value={`${summary?.projects_on_track ?? 0} / ${budgets.length}`}
          helpText="Under or at budget"
        />
        <KpiStatCard
          label="Avg Initiative ROI"
          tip="Average return multiple across tracked AI automation initiatives."
          value={`${summary?.avg_roi?.toFixed(1) ?? '—'}x`}
          helpText="Spend vs business outcome"
        />
      </SimpleGrid>

      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>Overview</Tab>
          <Tab>ROI</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}>
            <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6} mb={6}>
              <ChartCard title="Budget vs Actual vs Forecast">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data?.budget_chart ?? []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="project" tick={{ fontSize: 10, fill: 'white' }} />
                    <YAxis tickFormatter={(v) => formatMoneyK(v)} tick={{ fontSize: 10, fill: 'white' }} />
                    <RechartsTooltip formatter={(v: number) => [formatMoneyK(v), '']} />
                    <Legend formatter={(value) => <span style={{ color: 'white' }}>{value}</span>} />
                    <Bar dataKey="budget" fill="#cbd5e0" name="Budget" radius={[4, 4, 0, 0]} activeBar={false} />
                    <Bar dataKey="actual" fill="#4299e1" name="Actual" radius={[4, 4, 0, 0]} activeBar={false} />
                    <Line type="monotone" dataKey="forecast" stroke="#ed8936" strokeWidth={2} name="Forecast" dot />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartCard>
              <ChartCard title="AI Spend Mix">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.spend_mix ?? []}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      nameKey="name"
                      label={({ x, y, textAnchor, name, percent }) => (
                        <text x={x} y={y} fill="white" textAnchor={textAnchor} fontSize={11}>
                          {`${name} ${(percent * 100).toFixed(0)}%`}
                        </text>
                      )}
                    >
                      {(data?.spend_mix ?? []).map((_: unknown, i: number) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(v: number) => [formatMoneyK(v), 'Spend']} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>
            <Card bg={bg}>
              <CardBody>
                <Heading size="sm" mb={4}>Project budget detail</Heading>
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Project</Th>
                      <Th isNumeric>Budget</Th>
                      <Th isNumeric>Actual</Th>
                      <Th isNumeric>Forecast</Th>
                      <Th isNumeric>Variance</Th>
                      <Th>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {budgets.map((r: any) => (
                      <Tr key={r.project}>
                        <Td fontWeight="medium">{r.project}</Td>
                        <Td isNumeric>{formatMoneyK(r.budget)}</Td>
                        <Td isNumeric>{formatMoneyK(r.actual)}</Td>
                        <Td isNumeric>{formatMoneyK(r.forecast)}</Td>
                        <Td isNumeric color={r.variance < 0 ? 'green.500' : 'red.500'}>
                          {r.variance > 0 ? '+' : ''}{formatMoneyK(Math.abs(r.variance), 0)}
                        </Td>
                        <Td>
                          <Badge colorScheme={r.variance <= 0 ? 'green' : 'red'}>
                            {r.variance <= 0 ? 'On track' : 'Over budget'}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </TabPanel>

          <TabPanel px={0}>
            <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6} mb={6}>
              <ChartCard title="ROI by Initiative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roi}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'white' }} interval={0} angle={-12} textAnchor="end" height={50} />
                    <YAxis tickFormatter={(v) => `${v}x`} tick={{ fontSize: 10, fill: 'white' }} />
                    <RechartsTooltip formatter={(v: number) => [`${v}x`, 'ROI']} />
                    <Bar dataKey="roiValue" fill="#38a169" name="ROI" radius={[4, 4, 0, 0]} activeBar={false} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
              <ChartCard title="Spend vs ROI">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={roi}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'white' }} interval={0} angle={-12} textAnchor="end" height={50} />
                    <YAxis yAxisId="left" tickFormatter={(v) => formatMoneyK(v)} tick={{ fontSize: 10, fill: 'white' }} />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}x`} tick={{ fontSize: 10, fill: 'white' }} />
                    <RechartsTooltip />
                    <Legend formatter={(value) => <span style={{ color: 'white' }}>{value}</span>} />
                    <Bar yAxisId="left" dataKey="aiSpend" fill="#8884d8" name="AI spend" radius={[4, 4, 0, 0]} activeBar={false} />
                    <Line yAxisId="right" type="monotone" dataKey="roiValue" stroke="#38a169" strokeWidth={2} name="ROI" />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartCard>
            </Grid>
            <Card bg={bg}>
              <CardBody>
                <Heading size="sm" mb={4}>Initiative ROI detail</Heading>
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Initiative</Th>
                      <Th isNumeric>AI spend</Th>
                      <Th>Business outcome</Th>
                      <Th isNumeric>ROI</Th>
                      <Th>Value score</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {roi.map((r: any) => (
                      <Tr key={r.name}>
                        <Td fontWeight="medium">{r.name}</Td>
                        <Td isNumeric>{formatMoneyK(r.aiSpend)}</Td>
                        <Td>{r.metricChange}</Td>
                        <Td isNumeric>{r.roi}</Td>
                        <Td>
                          <Progress value={Math.min(r.roiValue * 25, 100)} size="sm" colorScheme="green" />
                        </Td>
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
