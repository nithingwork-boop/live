import {
  Box,
  Heading,
  Text,
  useColorModeValue,
  Card,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  VStack,
  List,
  ListItem,
  Link,
  Button,
  HStack,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  Icon
} from '@chakra-ui/react';
import { InfoOutlineIcon } from '@chakra-ui/icons';

const vendorRiskRows = [
  {
    vendor: 'Vendor A (Marketing Automation)',
    financialHealth: 'Stable (Series D, profitable)',
    compliance: 'SOC 2 Type II, ISO 27001, GDPR',
    dataResidency: 'EU/US',
    notes: 'Monitor AI/Privacy roadmap; ensure DPA aligns with regional requirements'
  },
  {
    vendor: 'Vendor B (BI Platform)',
    financialHealth: 'Moderate (Private equity-backed)',
    compliance: 'SOC 2 Type I, HIPAA optional',
    dataResidency: 'US-only',
    notes: 'Assess multi-region expansion; add exit clause in renewal'
  },
  {
    vendor: 'Vendor C (Point Tool)',
    financialHealth: 'Early-stage startup',
    compliance: 'Pending SOC 2; limited privacy posture',
    dataResidency: 'Unknown',
    notes: 'High vendor risk; consider consolidation or contingency plan'
  }
];

const operationalFitRows = [
  {
    product: 'ExampleTool A',
    sso: 'Enabled',
    provisioning: 'SCIM automated',
    auditLogs: 'Available (90-day retention)',
    sla: '99.9% uptime, 1h P1 response',
    notes: 'Meets enterprise guardrails; track anomaly budget integration'
  },
  {
    product: 'ExampleApp B',
    sso: 'Enabled',
    provisioning: 'Manual (pending SCIM roadmap)',
    auditLogs: 'Limited (export via API)',
    sla: '99.5% uptime, 4h P1 response',
    notes: 'Prioritize SCIM support; align monitoring with SOC team'
  },
  {
    product: 'Legacy CMDB',
    sso: 'Disabled',
    provisioning: 'Manual',
    auditLogs: 'Minimal',
    sla: 'N/A (on-prem)',
    notes: 'High operational risk; migrate to integrated ITSM platform'
  }
];

const exitRiskRows = [
  {
    product: 'Marketing Automation Suite',
    lockIn: 'Medium (custom workflows)',
    export: 'API + bulk CSV available',
    switchCost: 'Moderate (3-month rollout)',
    notes: 'Document runbooks, align co-termination, pilot alternative vendors'
  },
  {
    product: 'Data Visualization COTS',
    lockIn: 'High (proprietary formats)',
    export: 'Limited; requires custom ETL',
    switchCost: 'High (training + dual-run)',
    notes: 'Plan modernization to cloud BI; ensure phased migration funding'
  },
  {
    product: 'Point SaaS Tool',
    lockIn: 'Low',
    export: 'CSV / API with webhook support',
    switchCost: 'Low (single team usage)',
    notes: 'Maintain contingency tool; monitor vendor viability'
  }
];

const reportMetadata = {
  vendor: {
    agent: 'Vendor Risk Agent v1.1',
    runAt: '2025-01-15T11:25:00Z',
    durationMinutes: 2.2
  },
  operational: {
    agent: 'Operational Fit Agent v1.0',
    runAt: '2025-01-15T11:28:00Z',
    durationMinutes: 2.6
  },
  exit: {
    agent: 'Exit Risk Agent v1.3',
    runAt: '2025-01-15T11:31:00Z',
    durationMinutes: 2.9
  }
};

const formatRunTimestamp = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });
};

export default function RiskOverlay() {
  const cardBg = useColorModeValue('white', 'gray.800');

  const renderMetadata = (key: keyof typeof reportMetadata) => (
    <HStack spacing={4} mb={4} justify="space-between" flexWrap="wrap">
      <HStack spacing={3}>
        <Badge colorScheme="blue">{reportMetadata[key].agent}</Badge>
        <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}>
          Report generated: <strong>{formatRunTimestamp(reportMetadata[key].runAt)}</strong>
        </Text>
        <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}>
          Execution time: <strong>{reportMetadata[key].durationMinutes.toFixed(1)} minutes</strong>
        </Text>
      </HStack>
      <HStack spacing={2}>
        {key === 'exit' && (
          <Popover placement="bottom-end" isLazy>
            <PopoverTrigger>
              <Link fontSize="xs" color={useColorModeValue('blue.600', 'blue.300')} cursor="pointer">
                View risk checklist
              </Link>
            </PopoverTrigger>
            <PopoverContent fontSize="sm" _focus={{ boxShadow: 'none' }}>
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverHeader fontWeight="semibold">Risk Checklist</PopoverHeader>
              <PopoverBody>
                <List spacing={1} color={useColorModeValue('gray.600', 'gray.400')}>
                  <ListItem>• Confirm DPAs, security questionnaires, and regional compliance requirements.</ListItem>
                  <ListItem>• Enforce SSO/SCIM, least-privilege roles, and audit log integrations for every SaaS.</ListItem>
                  <ListItem>• Maintain exit plans with export formats, data retention timelines, and alternate vendors.</ListItem>
                  <ListItem>• Align renewal notice periods with risk posture; co-term contracts for negotiation leverage.</ListItem>
                  <ListItem>• Feed risk findings back into scoring rubric and portfolio review cadence.</ListItem>
                </List>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        )}
        <Button size="xs" variant="ghost" colorScheme="blue">
          View history
        </Button>
      </HStack>
    </HStack>
  );

  return (
    <Box>
      <Heading size="lg" mb={4}>Risk & Compliance Overlay</Heading>
      <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} mb={6} maxW="4xl">
        Risk agents evaluate each vendor and product across compliance, operational fit, and exit readiness. Use these overlays to prioritize
        guardrails, contract clauses, and remediation work before renewals.
      </Text>

      <Tabs colorScheme="blue" variant="enclosed">
        <TabList>
          <Tab>
            <HStack spacing={2}>
              <span>Vendor Risk</span>
              <Popover placement="bottom" isLazy>
                <PopoverTrigger>
                  <Icon as={InfoOutlineIcon} w={3} h={3} color="blue.400" cursor="pointer" />
                </PopoverTrigger>
                <PopoverContent fontSize="xs" _focus={{ boxShadow: 'none' }}>
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverHeader fontWeight="semibold">Vendor Risk</PopoverHeader>
                  <PopoverBody>
                    Evaluates financial health, compliance posture, and data residency for each vendor.
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </HStack>
          </Tab>
          <Tab>
            <HStack spacing={2}>
              <span>Operational Fit</span>
              <Popover placement="bottom" isLazy>
                <PopoverTrigger>
                  <Icon as={InfoOutlineIcon} w={3} h={3} color="blue.400" cursor="pointer" />
                </PopoverTrigger>
                <PopoverContent fontSize="xs" _focus={{ boxShadow: 'none' }}>
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverHeader fontWeight="semibold">Operational Fit</PopoverHeader>
                  <PopoverBody>
                    Checks SSO/SCIM readiness, audit logs, and incident SLAs to ensure enterprise guardrails.
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </HStack>
          </Tab>
          <Tab>
            <HStack spacing={2}>
              <span>Exit Risk</span>
              <Popover placement="bottom" isLazy>
                <PopoverTrigger>
                  <Icon as={InfoOutlineIcon} w={3} h={3} color="blue.400" cursor="pointer" />
                </PopoverTrigger>
                <PopoverContent fontSize="xs" _focus={{ boxShadow: 'none' }}>
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverHeader fontWeight="semibold">Exit Risk</PopoverHeader>
                  <PopoverBody>
                    Assesses vendor lock-in, data export readiness, and switching costs for contingency planning.
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </HStack>
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            {renderMetadata('vendor')}
            <Card bg={cardBg}>
              <CardBody>
                <Heading size="sm" mb={4}>Vendor Risk Snapshot</Heading>
                <Table size="sm" variant="striped">
                  <Thead>
                    <Tr>
                      <Th>Vendor / Product</Th>
                      <Th>Financial Health</Th>
                      <Th>Compliance & Certifications</Th>
                      <Th>Data Residency</Th>
                      <Th>Notes</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {vendorRiskRows.map((row) => (
                      <Tr key={row.vendor}>
                        <Td fontWeight="semibold">{row.vendor}</Td>
                        <Td>{row.financialHealth}</Td>
                        <Td>{row.compliance}</Td>
                        <Td>{row.dataResidency}</Td>
                        <Td>{row.notes}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </TabPanel>

          <TabPanel>
            {renderMetadata('operational')}
            <Card bg={cardBg}>
              <CardBody>
                <Heading size="sm" mb={4}>Operational Fit & Controls</Heading>
                <Table size="sm" variant="striped">
                  <Thead>
                    <Tr>
                      <Th>Product</Th>
                      <Th>SSO</Th>
                      <Th>Provisioning</Th>
                      <Th>Audit Logs</Th>
                      <Th>Incident SLA</Th>
                      <Th>Notes</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {operationalFitRows.map((row) => (
                      <Tr key={row.product}>
                        <Td fontWeight="semibold">{row.product}</Td>
                        <Td>{row.sso}</Td>
                        <Td>{row.provisioning}</Td>
                        <Td>{row.auditLogs}</Td>
                        <Td>{row.sla}</Td>
                        <Td>{row.notes}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </TabPanel>

          <TabPanel>
            {renderMetadata('exit')}
            <Card bg={cardBg}>
              <CardBody>
                <Heading size="sm" mb={4}>Exit & Switching Risk</Heading>
                <Table size="sm" variant="striped">
                  <Thead>
                    <Tr>
                      <Th>Product / Service</Th>
                      <Th>Vendor Lock-in</Th>
                      <Th>Data Export Readiness</Th>
                      <Th>Switching Cost</Th>
                      <Th>Notes</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {exitRiskRows.map((row) => (
                      <Tr key={row.product}>
                        <Td fontWeight="semibold">{row.product}</Td>
                        <Td>{row.lockIn}</Td>
                        <Td>{row.export}</Td>
                        <Td>{row.switchCost}</Td>
                        <Td>{row.notes}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>

            {/* Risk checklist accessible via metadata popover */}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
