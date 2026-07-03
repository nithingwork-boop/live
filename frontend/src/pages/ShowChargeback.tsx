import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Stat,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  VStack,
  HStack,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { useFinOps } from '../contexts/FinOpsContext';
import { fetchAIChargeback } from './ai/aiApi';
import { KpiLabel } from '../components/KpiLabel';

export default function ShowChargeback() {
  const { timeRange, timeRangeFrom, timeRangeTo, timeRangeDays } = useFinOps();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const muted = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    setLoading(true);
    fetchAIChargeback(timeRangeFrom, timeRangeTo)
      .then(setData)
      .finally(() => setLoading(false));
  }, [timeRangeFrom, timeRangeTo]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  const varianceBadge = (value: number) => (
    <Badge colorScheme={value >= 0 ? 'green' : 'red'} fontSize="xs">
      {value >= 0 ? '+' : ''}
      {formatCurrency(Math.abs(value))}
    </Badge>
  );

  const periodLabel = useMemo(
    () => (timeRange === 'custom' ? `${timeRangeFrom} to ${timeRangeTo}` : `Last ${timeRangeDays} days`),
    [timeRange, timeRangeFrom, timeRangeTo, timeRangeDays],
  );

  if (loading || !data) {
    return (
      <Box py={8} display="flex" justifyContent="center">
        <Spinner size="lg" />
      </Box>
    );
  }

  const recoveryRate = data.recovery_rate ?? 0;
  const rows: any[] = data.allocations || [];
  const avgVariance = rows.length
    ? rows.reduce((s: number, b: any) => s + (b.varianceRate ?? 0), 0) / rows.length
    : 0;
  const avgCoverage =
    data.recovery_buckets?.length
      ? (data.recovery_buckets.reduce((s: number, b: any) => s + b.coverage, 0) / data.recovery_buckets.length) * 100
      : 0;

  const kpiTips = {
    showback: 'Total AI spend allocated to teams and workflows for internal visibility in the period.',
    chargeback: 'Amount invoiced or recovered from business units based on AI usage and allocation rules.',
    variance: 'Difference between chargeback invoiced and showback allocated. Positive means over-recovery.',
    coverage: 'Average recovery rate across LLM, GPU, and training cost buckets with complete attribution metadata.',
  };

  return (
    <Box>
      <Heading size="lg" mb={2}>Showback / Chargeback</Heading>
      <Text color={muted} fontSize="sm" mb={6}>
        AI spend allocation recovery for {periodLabel}, attributed by team, workflow, and model usage.
      </Text>

      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <KpiLabel label="Total Showback" tip={kpiTips.showback} />
              <StatNumber fontSize="2xl">{formatCurrency(data.total_showback)}</StatNumber>
              <StatHelpText fontSize="xs">{periodLabel}</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <KpiLabel label="Chargeback Invoiced" tip={kpiTips.chargeback} />
              <StatNumber fontSize="2xl">{formatCurrency(data.total_chargeback)}</StatNumber>
              <StatHelpText fontSize="xs">Recovery {(recoveryRate * 100).toFixed(1)}%</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <KpiLabel label="Net Variance" tip={kpiTips.variance} />
              <StatNumber fontSize="2xl" color={data.net_variance >= 0 ? 'green.400' : 'red.400'}>
                {formatCurrency(data.net_variance)}
              </StatNumber>
              <StatHelpText fontSize="xs">Avg {avgVariance.toFixed(1)}%</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <KpiLabel label="Allocation Coverage" tip={kpiTips.coverage} />
              <StatNumber fontSize="2xl">{avgCoverage.toFixed(0)}%</StatNumber>
              <StatHelpText fontSize="xs">Across recovery buckets</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={6}>
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Chargeback vs Showback Trend</Heading>
              <Box h="280px">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.trend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fill: 'white' }} />
                    <YAxis tick={{ fill: 'white' }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend formatter={(value) => <span style={{ color: 'white' }}>{value}</span>} />
                    <Bar dataKey="showback" name="Showback" fill="#9f7aea" radius={[4, 4, 0, 0]} activeBar={false} />
                    <Bar dataKey="chargeback" name="Chargeback" fill="#805ad5" radius={[4, 4, 0, 0]} activeBar={false} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </VStack>
          </CardBody>
        </Card>
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Recovery Coverage by Bucket</Heading>
              <VStack spacing={3} align="stretch">
                {(data.recovery_buckets || []).map((bucket: any) => (
                  <Box key={bucket.bucket} borderWidth="1px" borderColor={borderColor} borderRadius="md" p={4}>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="semibold">{bucket.bucket}</Text>
                        <Text fontSize="sm" color="gray.600">{formatCurrency(bucket.amount)} recovered</Text>
                      </VStack>
                      <Badge colorScheme={bucket.coverage >= 0.85 ? 'green' : bucket.coverage >= 0.75 ? 'yellow' : 'red'}>
                        {(bucket.coverage * 100).toFixed(0)}%
                      </Badge>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} mt={6}>
        <CardBody>
          <Heading size="md" mb={4}>Team & Workflow Allocations</Heading>
          <TableContainer>
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th>Team</Th>
                  <Th>Primary Workflow</Th>
                  <Th isNumeric>Showback</Th>
                  <Th isNumeric>Chargeback</Th>
                  <Th isNumeric>Variance</Th>
                  <Th>Model</Th>
                  <Th>Owner</Th>
                  <Th>Period End</Th>
                </Tr>
              </Thead>
              <Tbody>
                {rows.map((item: any) => (
                  <Tr key={item.team}>
                    <Td fontWeight="semibold">{item.team}</Td>
                    <Td><Text fontSize="sm">{item.workflow}</Text></Td>
                    <Td isNumeric>{formatCurrency(item.showback)}</Td>
                    <Td isNumeric>{formatCurrency(item.chargeback)}</Td>
                    <Td isNumeric>{varianceBadge(item.variance)}</Td>
                    <Td><Text fontSize="xs" color="gray.600">{item.allocationModel}</Text></Td>
                    <Td><Text fontSize="sm">{item.owner}</Text></Td>
                    <Td><Badge fontSize="xs">{item.lastUpdated}</Badge></Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>
    </Box>
  );
}
