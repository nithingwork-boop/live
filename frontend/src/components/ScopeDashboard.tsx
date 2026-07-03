import { useEffect, useState } from 'react';
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
  useColorModeValue,
  Grid,
  VStack,
  Spinner,
} from '@chakra-ui/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useFinOpsOptional } from '../contexts/FinOpsContext';

import { API_V1 as API_URL } from '../config';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export type ScopeType = 'cloud' | 'onprem' | 'ai';

interface ScopeDashboardProps {
  scope: ScopeType;
  title: string;
  subtitle: string;
  kpiLabels?: {
    totalSpend?: string;
    allocation?: string;
    waste?: string;
    savings?: string;
  };
}

export function ScopeDashboard({ scope, title, subtitle, kpiLabels }: ScopeDashboardProps) {
  const finOps = useFinOpsOptional();
  const fromStr = finOps?.timeRangeFrom ?? (() => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0]; })();
  const toStr = finOps?.timeRangeTo ?? new Date().toISOString().split('T')[0];
  // Re-fetch when scope or date range changes
  const rangeKey = `${scope}-${fromStr}-${toStr}`;
  const [costsData, setCostsData] = useState<any[]>([]);
  const [kpis, setKPIs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const bg = useColorModeValue('white', 'gray.800');
  const muted = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [costsRes, kpisRes] = await Promise.all([
          fetch(`${API_URL}/costs?granularity=day&period=daily&scope=${scope}&from=${fromStr}&to=${toStr}`),
          fetch(`${API_URL}/kpis`),
        ]);
        const costsJson = await costsRes.json();
        const kpisData = await kpisRes.json();
        setCostsData(costsJson.data || []);
        setKPIs(kpisData);
      } catch (e) {
        console.error('Scope dashboard fetch failed', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [rangeKey]);

  const costTrendData = costsData.map((c) => ({
    date: c.date
      ? new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : 'N/A',
    amount: c.amount || 0,
  }));

  const totalSpend = costsData.reduce((sum, c) => sum + (c.amount || 0), 0);
  const serviceBreakdown =
    costsData.length > 0
      ? Object.entries(
          costsData.reduce((acc: any, c: any) => {
            Object.entries(c.breakdown?.by_service || {}).forEach(([service, amount]: [string, any]) => {
              acc[service] = (acc[service] || 0) + amount;
            });
            return acc;
          }, {})
        )
          .slice(0, 6)
          .map(([name, value]: [string, any]) => ({ name, value }))
      : [];

  const labels = {
    totalSpend: kpiLabels?.totalSpend ?? 'Total Spend',
    allocation: kpiLabels?.allocation ?? 'Allocation Coverage',
    waste: kpiLabels?.waste ?? 'Waste %',
    savings: kpiLabels?.savings ?? 'Savings Pipeline',
  };

  if (loading) {
    return (
      <Box py={8} display="flex" justifyContent="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="lg" mb={2}>
        {title}
      </Heading>
      <Text color={muted} mb={6}>
        {subtitle}
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
        <Card bg={bg}>
          <CardBody>
            <Stat>
              <StatLabel>{labels.totalSpend}</StatLabel>
              <StatNumber>${(totalSpend / 1000).toFixed(1)}k</StatNumber>
              <StatHelpText>{fromStr} – {toStr}</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card bg={bg}>
          <CardBody>
            <Stat>
              <StatLabel>{labels.allocation}</StatLabel>
              <StatNumber>{kpis?.allocation_coverage?.value?.toFixed(1) ?? '—'}%</StatNumber>
              <StatHelpText>Target {kpis?.allocation_coverage?.target ?? 95}%</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card bg={bg}>
          <CardBody>
            <Stat>
              <StatLabel>{labels.waste}</StatLabel>
              <StatNumber>{kpis?.waste_percentage?.value?.toFixed(1) ?? '—'}%</StatNumber>
              <StatHelpText>Target {kpis?.waste_percentage?.target ?? 10}%</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card bg={bg}>
          <CardBody>
            <Stat>
              <StatLabel>{labels.savings}</StatLabel>
              <StatNumber>${(kpis?.savings_pipeline?.value / 1000 || 0).toFixed(0)}k</StatNumber>
              <StatHelpText>Pipeline</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
        <Card bg={bg}>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Cost Trend (30 Days)</Heading>
              {costTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={costTrendData}>
                    <defs>
                      <linearGradient id={`colorAmount-${scope}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'white' }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 11, fill: 'white' }} tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`} />
                    <Tooltip formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Amount']} />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#8884d8"
                      fillOpacity={1}
                      fill={`url(#colorAmount-${scope})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Text color={muted}>No cost data for this scope in the selected period.</Text>
              )}
            </VStack>
          </CardBody>
        </Card>

        <Card bg={bg}>
          <CardBody>
            <Heading size="md" mb={4}>
              Top {scope === 'ai' ? 'Services / Models' : 'Services'} by Cost
            </Heading>
            {serviceBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={serviceBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ x, y, textAnchor, name, percent }) => (
                      <text x={x} y={y} fill="white" textAnchor={textAnchor} fontSize={11}>
                        {`${name} ${(percent * 100).toFixed(0)}%`}
                      </text>
                    )}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {serviceBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Cost']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Text color={muted}>No breakdown available.</Text>
            )}
          </CardBody>
        </Card>
      </Grid>
    </Box>
  );
}
