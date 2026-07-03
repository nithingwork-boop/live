import { useEffect, useState, forwardRef } from 'react';
import {
  Box,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  SimpleGrid,
  Card,
  CardBody,
  Badge,
  HStack,
  Icon,
  Tooltip as ChakraTooltip,
  VStack,
  Button,
  Spinner,
  Divider,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useFinOps } from '../contexts/FinOpsContext';

const InfoIcon = forwardRef<SVGSVGElement, any>((props, ref) => (
  <Icon viewBox="0 0 24 24" ref={ref} {...props}>
    <path
      fill="currentColor"
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
    />
  </Icon>
));
InfoIcon.displayName = 'InfoIcon';

import { API_V1 as API_URL } from '../config';

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

function formatMoney(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

function formatTokens(v: number) {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return `${v}`;
}

export default function Overview() {
  const { timeRangeFrom, timeRangeTo, timeRangeDays } = useFinOps();
  const [aiKpis, setAiKpis] = useState<any>(null);
  const [aiSignals, setAiSignals] = useState({ anomalies: 0, optimizations: 0 });
  const [loading, setLoading] = useState(true);

  const bg = useColorModeValue('white', 'gray.800');
  const muted = useColorModeValue('gray.600', 'gray.400');
  const aiAccent = useColorModeValue('purple.500', 'purple.300');
  const aiBorder = useColorModeValue('purple.100', 'purple.900');

  useEffect(() => {
    setLoading(true);
    const q = `from=${timeRangeFrom}&to=${timeRangeTo}`;
    Promise.all([
      fetch(`${API_URL}/kpis?scope=ai&${q}`).then((r) => r.json()),
      fetch(`${API_URL}/anomalies?scope=ai&${q}`).then((r) => r.json()),
      fetch(`${API_URL}/recommendations?scope=ai&${q}`).then((r) => r.json()),
    ])
      .then(([aiK, aiAnom, aiRec]) => {
        setAiKpis(aiK);
        const aAnoms = aiAnom.data || [];
        const aRecs = aiRec.data || [];
        setAiSignals({
          anomalies: aAnoms.filter((a: any) => a.status !== 'resolved').length,
          optimizations: aRecs.filter((r: any) => r.status !== 'approved').length,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [timeRangeFrom, timeRangeTo]);

  if (loading) {
    return (
      <Box textAlign="center" py={16}>
        <Spinner size="xl" />
      </Box>
    );
  }

  const dataFreshness = aiKpis?.data_freshness_minutes?.value;

  return (
    <Box>
      <VStack align="stretch" spacing={2} mb={8}>
        <Heading size="lg">Executive AI FinOps Overview</Heading>
        <Text color={muted}>
          High-level AI spend health for the last {timeRangeDays} days ({timeRangeFrom} to {timeRangeTo}).
        </Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={8}>
        <Card bg={bg}>
          <CardBody>
            <Stat>
              <KpiLabel label="AI Period Spend" tip="Total AI spend in the selected period." />
              <StatNumber>{formatMoney(aiKpis?.period_spend ?? 0)}</StatNumber>
              <StatHelpText>Models, tokens, GPU, and agentic workloads</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card bg={bg}>
          <CardBody>
            <Stat>
              <KpiLabel label="Open Operational Items" tip="Unresolved AI anomalies and pending AI optimizations." />
              <StatNumber>{aiSignals.anomalies + aiSignals.optimizations}</StatNumber>
              <StatHelpText>
                {aiSignals.anomalies} anomalies - {aiSignals.optimizations} optimizations
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card bg={bg}>
          <CardBody>
            <Stat>
              <KpiLabel label="Data Freshness" tip="Minutes since last successful AI cost data sync." />
              <StatNumber>{dataFreshness ?? '-'} min</StatNumber>
              <StatHelpText>Target &lt; {aiKpis?.data_freshness_minutes?.target ?? 10} min</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card bg={bg} borderWidth="1px" borderColor={aiBorder}>
        <CardBody>
          <HStack justify="space-between" mb={4} flexWrap="wrap" gap={2}>
            <HStack>
              <Box w={3} h={3} borderRadius="full" bg={aiAccent} />
              <Heading size="md">AI FinOps</Heading>
              <Badge colorScheme="purple">Models & Agents</Badge>
            </HStack>
            <Button as={RouterLink} to="/ai/home" size="sm" colorScheme="purple" variant="outline">
              Open AI FinOps
            </Button>
          </HStack>

          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4} mb={4}>
            <Stat size="sm">
              <KpiLabel label="Period Spend" tip="Total AI scope spend in period." />
              <StatNumber fontSize="2xl">{formatMoney(aiKpis?.period_spend ?? 0)}</StatNumber>
            </Stat>
            <Stat size="sm">
              <KpiLabel label="Tokens Processed" tip="Total input + output tokens across AI workloads." />
              <StatNumber fontSize="2xl">{formatTokens(aiKpis?.tokens_processed ?? 0)}</StatNumber>
            </Stat>
            <Stat size="sm">
              <KpiLabel label="Cost per 1K Tokens" tip="Blended cost efficiency across providers and models." />
              <StatNumber fontSize="2xl">${aiKpis?.cost_per_1k_tokens?.toFixed(4) ?? '-'}</StatNumber>
            </Stat>
            <Stat size="sm">
              <KpiLabel label="GPU Utilization" tip="Average GPU cluster utilization for training and inference." />
              <StatNumber fontSize="2xl">{aiKpis?.gpu_utilization?.toFixed(1) ?? '-'}%</StatNumber>
            </Stat>
            <Stat size="sm">
              <KpiLabel label="Cost per AUoW" tip="Average cost per Agentic Unit of Work across workflows." />
              <StatNumber fontSize="2xl">${aiKpis?.cost_per_auow?.toFixed(2) ?? '-'}</StatNumber>
            </Stat>
            <Stat size="sm">
              <KpiLabel label="Savings Pipeline" tip="Estimated savings from open AI optimization recommendations." />
              <StatNumber fontSize="2xl" color="green.500">
                {formatMoney(aiKpis?.savings_pipeline?.value ?? 0)}
              </StatNumber>
            </Stat>
          </SimpleGrid>

          <Divider my={4} />
          <HStack spacing={3} flexWrap="wrap">
            <Badge colorScheme={aiSignals.anomalies > 0 ? 'orange' : 'green'} px={2} py={1}>
              {aiSignals.anomalies} open anomalies
            </Badge>
            <Badge colorScheme={aiSignals.optimizations > 0 ? 'purple' : 'gray'} px={2} py={1}>
              {aiSignals.optimizations} pending optimizations
            </Badge>
            <Button as={RouterLink} to="/ai/anomalies" size="xs" variant="ghost" colorScheme="purple">
              Review anomalies
            </Button>
            <Button as={RouterLink} to="/ai/optimization" size="xs" variant="ghost" colorScheme="purple">
              View optimizations
            </Button>
            <Button as={RouterLink} to="/ai/show-chargeback" size="xs" variant="ghost" colorScheme="purple">
              Showback / chargeback
            </Button>
          </HStack>
        </CardBody>
      </Card>
    </Box>
  );
}
