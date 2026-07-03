import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  useColorModeValue,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
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
  Badge,
  HStack,
  VStack,
  Progress,
  Button,
  Select,
  Spinner,
} from '@chakra-ui/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { API_V1 as API_URL } from '../config';

interface Contract {
  id: string;
  name: string;
  vendor: string;
  contract_type: 'license' | 'cloud' | 'ai';
  status: string;
  committed_annual: number;
  used_annual: number;
  utilization_pct: number;
  over_committed: boolean;
  currency: string;
  renewal_date: string | null;
  term_months: number;
  owner: string;
  products?: string[];
  scope?: string;
  seats_committed?: number | null;
  seats_used?: number | null;
}

interface ContractOptimization {
  id: string;
  contract_id: string;
  contract_name: string;
  contract_type: string;
  type: string;
  title: string;
  description: string;
  estimated_savings: number;
  risk_level: string;
  status: string;
  agent: string;
  created_at: string;
}

interface ContractsSummary {
  total_contracts: number;
  total_committed: number;
  total_used: number;
  avg_utilization_pct: number;
  renewals_within_90d: number;
  open_optimizations: number;
  potential_savings: number;
}

const TYPE_LABELS: Record<string, string> = {
  license: 'License',
  cloud: 'Cloud',
  ai: 'AI',
};

const TYPE_COLORS: Record<string, string> = {
  license: 'teal',
  cloud: 'blue',
  ai: 'purple',
};

const OPT_TYPE_LABELS: Record<string, string> = {
  renegotiation: 'Renegotiation',
  'unused-seats': 'Unused Seats',
  'true-up-risk': 'True-up Risk',
  'commitment-adjustment': 'Commitment',
  'co-term': 'Co-term',
  rightsizing: 'Rightsizing',
};

function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function utilizationColor(pct: number, overCommitted?: boolean) {
  if (overCommitted) return 'red';
  if (pct < 60) return 'orange';
  if (pct < 85) return 'yellow';
  return 'green';
}

export default function ContractsOptimization() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [optimizations, setOptimizations] = useState<ContractOptimization[]>([]);
  const [summary, setSummary] = useState<ContractsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [tabIndex, setTabIndex] = useState(0);

  const bg = useColorModeValue('white', 'gray.800');
  const muted = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const rowHoverBg = useColorModeValue('gray.50', 'gray.700');
  const chartCommitted = useColorModeValue('#3182CE', '#63B3ED');
  const chartUsed = useColorModeValue('#38A169', '#68D391');

  useEffect(() => {
    const params = typeFilter !== 'all' ? `?type=${typeFilter}` : '';
    setLoading(true);
    fetch(`${API_URL}/contracts${params}`)
      .then((r) => r.json())
      .then((data) => {
        setContracts(data.contracts || []);
        setOptimizations(data.optimizations || []);
        setSummary(data.summary || null);
      })
      .catch(() => {
        setContracts([]);
        setOptimizations([]);
        setSummary(null);
      })
      .finally(() => setLoading(false));
  }, [typeFilter]);

  const filteredOptimizations = useMemo(() => {
    if (!selectedContractId) return optimizations;
    return optimizations.filter((o) => o.contract_id === selectedContractId);
  }, [optimizations, selectedContractId]);

  const usageChartData = useMemo(
    () =>
      contracts.map((c) => ({
        name: c.name.length > 22 ? `${c.name.slice(0, 20)}…` : c.name,
        committed: Math.round(c.committed_annual / 1000),
        used: Math.round(c.used_annual / 1000),
        fullName: c.name,
      })),
    [contracts],
  );

  if (loading && !summary) {
    return (
      <Box py={12} textAlign="center">
        <Spinner size="lg" />
        <Text mt={4} color={muted}>Loading contracts…</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="lg" mb={2}>Contracts & Optimization</Heading>
      <Text color={muted} mb={6} maxW="4xl">
        Unified view of cloud, AI, and licensing contracts — track usage vs commitment, renewal risk, and
        optimization opportunities surfaced by the Vendor & License Agent.
      </Text>

      {summary && (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4} mb={6}>
          <Card bg={bg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Annual Committed</StatLabel>
                <StatNumber fontSize="xl">{formatCurrency(summary.total_committed)}</StatNumber>
                <StatHelpText>{summary.total_contracts} contracts tracked</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={bg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Avg Utilization</StatLabel>
                <StatNumber fontSize="xl">{summary.avg_utilization_pct}%</StatNumber>
                <StatHelpText>{formatCurrency(summary.total_used)} consumed YTD</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={bg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Renewals (90d)</StatLabel>
                <StatNumber fontSize="xl" color={summary.renewals_within_90d > 0 ? 'orange.500' : undefined}>
                  {summary.renewals_within_90d}
                </StatNumber>
                <StatHelpText>Contracts approaching renewal</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={bg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Potential Savings</StatLabel>
                <StatNumber fontSize="xl" color="green.500">
                  {formatCurrency(summary.potential_savings)}
                </StatNumber>
                <StatHelpText>{summary.open_optimizations} open recommendations</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>
      )}

      <HStack mb={4} spacing={3} flexWrap="wrap">
        <Text fontSize="sm" color={muted}>Filter by type:</Text>
        <Select
          size="sm"
          maxW="200px"
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setSelectedContractId(null);
          }}
        >
          <option value="all">All types</option>
          <option value="license">License</option>
          <option value="cloud">Cloud</option>
          <option value="ai">AI</option>
        </Select>
        {selectedContractId && (
          <Button size="sm" variant="ghost" onClick={() => setSelectedContractId(null)}>
            Clear contract filter
          </Button>
        )}
      </HStack>

      <Tabs colorScheme="blue" variant="enclosed" index={tabIndex} onChange={setTabIndex}>
        <TabList>
          <Tab>Contracts</Tab>
          <Tab>Usage vs Commitment</Tab>
          <Tab>Optimization ({filteredOptimizations.length})</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <Card bg={bg} borderWidth="1px" borderColor={borderColor}>
              <CardBody p={0}>
                <Box overflowX="auto">
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Contract</Th>
                        <Th>Type</Th>
                        <Th>Status</Th>
                        <Th isNumeric>Committed</Th>
                        <Th isNumeric>Used</Th>
                        <Th>Utilization</Th>
                        <Th>Renewal</Th>
                        <Th>Owner</Th>
                        <Th />
                      </Tr>
                    </Thead>
                    <Tbody>
                      {contracts.map((c) => (
                        <Tr key={c.id} _hover={{ bg: rowHoverBg }}>
                          <Td>
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="semibold" fontSize="sm">{c.name}</Text>
                              <Text fontSize="xs" color={muted}>{c.vendor}</Text>
                            </VStack>
                          </Td>
                          <Td>
                            <Badge colorScheme={TYPE_COLORS[c.contract_type] || 'gray'}>
                              {TYPE_LABELS[c.contract_type] || c.contract_type}
                            </Badge>
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={
                                c.status === 'active' ? 'green' : c.status === 'renewal_pending' ? 'yellow' : 'orange'
                              }
                            >
                              {c.status.replace('_', ' ')}
                            </Badge>
                          </Td>
                          <Td isNumeric>{formatCurrency(c.committed_annual, c.currency)}</Td>
                          <Td isNumeric>{formatCurrency(c.used_annual, c.currency)}</Td>
                          <Td minW="140px">
                            <HStack spacing={2}>
                              <Progress
                                value={Math.min(c.utilization_pct, 100)}
                                size="sm"
                                flex={1}
                                colorScheme={utilizationColor(c.utilization_pct, c.over_committed)}
                                borderRadius="full"
                              />
                              <Text fontSize="xs" minW="36px">
                                {c.utilization_pct}%
                                {c.over_committed && '+'}
                              </Text>
                            </HStack>
                          </Td>
                          <Td fontSize="sm">{formatDate(c.renewal_date)}</Td>
                          <Td fontSize="sm">{c.owner}</Td>
                          <Td>
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => {
                                setSelectedContractId(c.id);
                                setTabIndex(2);
                              }}
                            >
                              View opts
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </CardBody>
            </Card>
          </TabPanel>

          <TabPanel px={0}>
            <Card bg={bg} borderWidth="1px" borderColor={borderColor} mb={6}>
              <CardBody>
                <Heading size="sm" mb={4}>Committed vs Used (thousands USD)</Heading>
                <Box h="320px">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={usageChartData} margin={{ top: 8, right: 16, left: 0, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-35} textAnchor="end" height={70} tick={{ fontSize: 11, fill: 'white' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'white' }} />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          `$${value}k`,
                          name === 'committed' ? 'Committed' : 'Used',
                        ]}
                        labelFormatter={(_, payload: any[]) => payload?.[0]?.payload?.fullName || ''}
                      />
                      <Legend formatter={(value) => <span style={{ color: 'white' }}>{value}</span>} />
                      <Bar dataKey="committed" name="Committed" fill={chartCommitted} radius={[4, 4, 0, 0]} activeBar={false} />
                      <Bar dataKey="used" name="Used" fill={chartUsed} radius={[4, 4, 0, 0]} activeBar={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardBody>
            </Card>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {contracts.map((c) => (
                <Card key={c.id} bg={bg} borderWidth="1px" borderColor={borderColor}>
                  <CardBody>
                    <HStack justify="space-between" mb={2}>
                      <Badge colorScheme={TYPE_COLORS[c.contract_type]}>{TYPE_LABELS[c.contract_type]}</Badge>
                      {c.over_committed && <Badge colorScheme="red">Over committed</Badge>}
                    </HStack>
                    <Heading size="sm" mb={1}>{c.name}</Heading>
                    <Text fontSize="xs" color={muted} mb={3}>
                      {formatCurrency(c.used_annual)} of {formatCurrency(c.committed_annual)} annual
                    </Text>
                    <Progress
                      value={Math.min(c.utilization_pct, 100)}
                      size="sm"
                      colorScheme={utilizationColor(c.utilization_pct, c.over_committed)}
                      borderRadius="full"
                      mb={2}
                    />
                    <HStack justify="space-between" fontSize="xs" color={muted}>
                      <Text>{c.utilization_pct}% utilized</Text>
                      <Text>Renews {formatDate(c.renewal_date)}</Text>
                    </HStack>
                    {c.seats_committed != null && c.seats_committed > 0 && (
                      <Text fontSize="xs" color={muted} mt={2}>
                        Seats: {c.seats_used?.toLocaleString()} / {c.seats_committed.toLocaleString()}
                      </Text>
                    )}
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </TabPanel>

          <TabPanel px={0}>
            <VStack align="stretch" spacing={4}>
              {filteredOptimizations.length === 0 ? (
                <Card bg={bg}>
                  <CardBody>
                    <Text color={muted}>No optimization recommendations for the current filter.</Text>
                  </CardBody>
                </Card>
              ) : (
                filteredOptimizations.map((opt) => (
                  <Card key={opt.id} bg={bg} borderWidth="1px" borderColor={borderColor}>
                    <CardBody>
                      <HStack justify="space-between" align="start" flexWrap="wrap" gap={2} mb={2}>
                        <HStack flexWrap="wrap">
                          <Badge colorScheme={TYPE_COLORS[opt.contract_type] || 'gray'}>
                            {TYPE_LABELS[opt.contract_type] || opt.contract_type}
                          </Badge>
                          <Badge colorScheme="orange">{OPT_TYPE_LABELS[opt.type] || opt.type}</Badge>
                          <Badge colorScheme={opt.risk_level === 'high' ? 'red' : opt.risk_level === 'low' ? 'green' : 'yellow'}>
                            {opt.risk_level} risk
                          </Badge>
                          <Badge>{opt.status}</Badge>
                        </HStack>
                        <Text fontWeight="bold" color="green.500">
                          {formatCurrency(opt.estimated_savings)} / yr
                        </Text>
                      </HStack>
                      <Heading size="sm" mb={1}>{opt.title}</Heading>
                      <Text fontSize="sm" color={muted} mb={2}>{opt.description}</Text>
                      <HStack fontSize="xs" color={muted} spacing={4} flexWrap="wrap">
                        <Text>Contract: <strong>{opt.contract_name}</strong></Text>
                        <Text>Agent: {opt.agent}</Text>
                        <Text>Created: {formatDate(opt.created_at.slice(0, 10))}</Text>
                      </HStack>
                    </CardBody>
                  </Card>
                ))
              )}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
