import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  Stat,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Badge,
  HStack,
} from '@chakra-ui/react';
import { KpiLabel } from '../../components/KpiLabel';

export const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export { KpiLabel };

export function formatMoneyK(value: number, decimals = 1) {
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(decimals)}k`;
  return `$${value.toFixed(decimals === 1 ? 0 : 2)}`;
}

export function AIPageHeader({
  title,
  subtitle,
  from,
  to,
  badge,
}: {
  title: string;
  subtitle: string;
  from: string;
  to: string;
  badge?: string;
}) {
  const muted = useColorModeValue('gray.600', 'gray.400');
  return (
    <Box mb={6}>
      <HStack mb={2} flexWrap="wrap" gap={2}>
        <Heading size="lg">{title}</Heading>
        {badge && (
          <Badge colorScheme="purple" fontSize="sm">
            {badge}
          </Badge>
        )}
      </HStack>
      <Text color={muted} mb={1}>{subtitle}</Text>
      <Text fontSize="sm" color={muted}>Period: {from} – {to}</Text>
    </Box>
  );
}

export function KpiStatCard({
  label,
  tip,
  value,
  helpText,
  children,
}: {
  label: string;
  tip: string;
  value: React.ReactNode;
  helpText?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const bg = useColorModeValue('white', 'gray.800');
  return (
    <Card bg={bg}>
      <CardBody>
        <Stat size="sm">
          <KpiLabel label={label} tip={tip} />
          <StatNumber fontSize="xl">{value}</StatNumber>
          {helpText && <StatHelpText>{helpText}</StatHelpText>}
          {children}
        </Stat>
      </CardBody>
    </Card>
  );
}

export function ChartCard({ title, children, height = 280 }: { title: string; children: React.ReactNode; height?: number }) {
  const bg = useColorModeValue('white', 'gray.800');
  return (
    <Card bg={bg} h="100%">
      <CardBody>
        <Heading size="sm" mb={4}>{title}</Heading>
        <Box h={`${height}px`}>{children}</Box>
      </CardBody>
    </Card>
  );
}
