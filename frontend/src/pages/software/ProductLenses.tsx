import {
  Box,
  Heading,
  Text,
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
  HStack,
  Badge,
  Button,
  Divider,
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

const kanoRows = [
  {
    product: 'Confluence',
    differentiation: 'Performance',
    notes: 'Must-have for engineering knowledge; consolidate duplicate spaces'
  },
  {
    product: 'Experimentation Platform',
    differentiation: 'Delighter',
    notes: 'Supports rapid innovation; ensure guardrails and clear KPIs'
  },
  {
    product: 'Legacy CMDB',
    differentiation: 'Basic Expectation',
    notes: 'Hygiene capability; migrate to integrated ITSM solution'
  },
  {
    product: 'Teams Telephony Add-on',
    differentiation: 'Exciter',
    notes: 'Pilot feature; confirm ROI before enterprise rollout'
  },
  {
    product: 'Adobe Creative Cloud',
    differentiation: 'Performance',
    notes: 'Critical for design teams; optimize seat allocation and add-ons'
  }
];

const weightedScoringRows = [
  {
    product: 'Confluence',
    businessValue: 5,
    functionalFit: 5,
    tco: 3,
    risk: 3,
    integration: 4,
    vendorHealth: 4,
    weightedScore: 4.3,
    action: 'Invest / standardize',
    notes: 'Retire redundant wikis, enforce SCIM provisioning'
  },
  {
    product: 'Legacy BI Server',
    businessValue: 2,
    functionalFit: 2,
    tco: 1,
    risk: 3,
    integration: 2,
    vendorHealth: 2,
    weightedScore: 2.1,
    action: 'Migrate / eliminate',
    notes: 'Move dashboards to cloud warehouse by Q2'
  },
  {
    product: 'Datadog',
    businessValue: 5,
    functionalFit: 4,
    tco: 2,
    risk: 4,
    integration: 4,
    vendorHealth: 5,
    weightedScore: 3.9,
    action: 'Tolerate / optimize',
    notes: 'Consolidate agents, renegotiate enterprise plan'
  },
  {
    product: 'Adobe Creative Cloud',
    businessValue: 4,
    functionalFit: 4,
    tco: 2,
    risk: 3,
    integration: 3,
    vendorHealth: 4,
    weightedScore: 3.5,
    action: 'Tolerate / optimize',
    notes: 'Shift to active-user model, enforce SSO/SCIM'
  },
  {
    product: 'Teams Telephony Add-on',
    businessValue: 3,
    functionalFit: 3,
    tco: 3,
    risk: 3,
    integration: 4,
    vendorHealth: 4,
    weightedScore: 3.2,
    action: 'Pilot / validate',
    notes: 'Measure adoption, align with UC roadmap'
  }
];

const reportMetadata = {
  sixR: {
    agent: '6R Modernization Agent v1.5',
    runAt: '2025-01-15T11:10:00Z',
    durationMinutes: 2.7
  },
  kano: {
    agent: 'Value Differentiation Agent v1.2',
    runAt: '2025-01-15T11:13:00Z',
    durationMinutes: 2.1
  },
  scoring: {
    agent: 'Weighted Scoring Agent v1.7',
    runAt: '2025-01-15T11:17:00Z',
    durationMinutes: 3.4
  }
};

const sixRReportRows = [
  {
    product: 'Confluence',
    capability: 'Knowledge Management',
    sixR: 'Retain',
    rationale: 'High adoption, strategic differentiator for engineering squads',
    action: 'Invest in standardization; retire overlapping wiki tools; enforce SCIM automation'
  },
  {
    product: 'Legacy BI Server',
    capability: 'Analytics & Reporting',
    sixR: 'Migrate',
    rationale: 'High TCO, overlapping capability with cloud warehouse dashboards',
    action: 'Migrate reports to cloud BI platform; decommission hardware by Q2'
  },
  {
    product: 'Adobe Creative Cloud',
    capability: 'Design & Creative',
    sixR: 'Refactor',
    rationale: 'Critical asset with license inefficiencies',
    action: 'Refactor licensing to active-user model; remove unused add-ons; enforce SSO/SCIM'
  },
  {
    product: 'Teams Telephony Add-on',
    capability: 'Unified Communications',
    sixR: 'Repurchase',
    rationale: 'Pilot indicates better economics with alternate vendor',
    action: 'Evaluate repurchase with preferred UC platform; ensure integration parity before rollout'
  },
  {
    product: 'Legacy CMDB',
    capability: 'Service Management',
    sixR: 'Retire',
    rationale: 'Low adoption, high maintenance, replaced by modern ITSM module',
    action: 'Archive data and retire after ITSM migration completion'
  },
  {
    product: 'Experimentation Platform',
    capability: 'Product Growth',
    sixR: 'Rehost',
    rationale: 'Valuable experimentation stack needing elasticity and managed services',
    action: 'Rehost to managed Kubernetes cluster with automated scaling and observability'
  }
];

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

export default function ProductLenses() {
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
      <Button size="xs" variant="ghost" colorScheme="blue">
        View history
      </Button>
    </HStack>
  );

  return (
    <Box>
      <Heading size="lg" mb={4}>Product / Solution Lenses</Heading>
      <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} mb={6} maxW="4xl">
        Product-level agents evaluate each solution using multiple frameworks (6R modernization, Kano, Weighted Scoring) to drive
        rationalization decisions. Reports below combine portfolio insights with scoring templates and inventory snapshots.
      </Text>

      <Tabs colorScheme="blue" variant="enclosed">
        <TabList>
          <Tab>
            <HStack spacing={2}>
              <span>6R Modernization Report</span>
              <Popover placement="bottom" isLazy>
                <PopoverTrigger>
                  <Icon as={InfoOutlineIcon} w={3} h={3} color="blue.400" cursor="pointer" />
                </PopoverTrigger>
                <PopoverContent fontSize="xs" _focus={{ boxShadow: 'none' }}>
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverHeader fontWeight="semibold">6R Lens</PopoverHeader>
                  <PopoverBody>
                    Shows modernization recommendation (Retain, Rehost, Replatform, Refactor, Repurchase, Retire) per product.
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </HStack>
          </Tab>
          <Tab>
            <HStack spacing={2}>
              <span>Kano / Value vs. Differentiation</span>
              <Popover placement="bottom" isLazy>
                <PopoverTrigger>
                  <Icon as={InfoOutlineIcon} w={3} h={3} color="blue.400" cursor="pointer" />
                </PopoverTrigger>
                <PopoverContent fontSize="xs" _focus={{ boxShadow: 'none' }}>
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverHeader fontWeight="semibold">Kano Classification</PopoverHeader>
                  <PopoverBody>
                    Differentiates products as delighters, exciters, or hygiene features to inform keep vs. standardize decisions.
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </HStack>
          </Tab>
          <Tab>
            <HStack spacing={2}>
              <span>Weighted Scoring (RICE-style)</span>
              <Popover placement="bottom" isLazy>
                <PopoverTrigger>
                  <Icon as={InfoOutlineIcon} w={3} h={3} color="blue.400" cursor="pointer" />
                </PopoverTrigger>
                <PopoverContent fontSize="xs" _focus={{ boxShadow: 'none' }}>
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverHeader fontWeight="semibold">Weighted Scoring</PopoverHeader>
                  <PopoverBody>
                    Displays weighted rubric (Business Value, Functional Fit, TCO, Risk, Integration, Vendor Health) and recommended actions.
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </HStack>
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            {renderMetadata('sixR')}
            <Box bg={cardBg} borderRadius="md" borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')} p={4}>
              <Heading size="sm" mb={4}>6R Modernization Report</Heading>
              <Table size="sm" variant="striped">
                <Thead>
                  <Tr>
                    <Th>Product</Th>
                    <Th>Business Capability</Th>
                    <Th>6R Decision</Th>
                    <Th>Rationale</Th>
                    <Th>Recommended Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {sixRReportRows.map((row) => (
                    <Tr key={row.product}>
                      <Td fontWeight="semibold">{row.product}</Td>
                      <Td>{row.capability}</Td>
                      <Td>
                        <Badge colorScheme={
                          row.sixR === 'Retain'
                            ? 'green'
                            : row.sixR === 'Migrate'
                            ? 'yellow'
                            : row.sixR === 'Retire'
                            ? 'red'
                            : 'blue'
                        }>
                          {row.sixR}
                        </Badge>
                      </Td>
                      <Td>{row.rationale}</Td>
                      <Td>{row.action}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </TabPanel>

          <TabPanel>
            {renderMetadata('kano')}
            <Box bg={cardBg} borderRadius="md" borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')} p={4}>
              <Heading size="sm" mb={4}>Kano / Value vs. Differentiation</Heading>
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Product</Th>
                    <Th>Classification</Th>
                    <Th>Notes</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {kanoRows.map((row) => (
                    <Tr key={row.product}>
                      <Td fontWeight="semibold">{row.product}</Td>
                      <Td>
                        <Badge colorScheme={row.differentiation === 'Delighter' ? 'purple' : row.differentiation === 'Exciter' ? 'green' : 'blue'}>
                          {row.differentiation}
                        </Badge>
                      </Td>
                      <Td>{row.notes}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </TabPanel>

          <TabPanel>
            {renderMetadata('scoring')}
            <Box bg={cardBg} borderRadius="md" borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')} p={4}>
              <Heading size="sm" mb={4}>Weighted Scoring Snapshot</Heading>
              <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')} mb={2}>
                Weighted Score = Σ(score × weight). Criteria weights from rubric: Business Value 25, Functional Fit 15, TCO 20, Risk 15, Integration 15, Vendor Health 10.
              </Text>
              <Table size="sm" variant="striped">
                <Thead>
                  <Tr>
                    <Th>Product</Th>
                    <Th>BV</Th>
                    <Th>Fit</Th>
                    <Th>TCO</Th>
                    <Th>Risk</Th>
                    <Th>Integration</Th>
                    <Th>Vendor</Th>
                    <Th>Weighted Score</Th>
                    <Th>Action</Th>
                    <Th>Notes</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {weightedScoringRows.map((row) => (
                    <Tr key={row.product}>
                      <Td fontWeight="semibold">{row.product}</Td>
                      <Td>{row.businessValue}</Td>
                      <Td>{row.functionalFit}</Td>
                      <Td>{row.tco}</Td>
                      <Td>{row.risk}</Td>
                      <Td>{row.integration}</Td>
                      <Td>{row.vendorHealth}</Td>
                      <Td>
                        <Badge colorScheme={row.weightedScore >= 4 ? 'green' : row.weightedScore >= 3 ? 'yellow' : 'red'}>
                          {row.weightedScore.toFixed(1)}
                        </Badge>
                      </Td>
                      <Td>{row.action}</Td>
                      <Td>{row.notes}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Divider my={8} />

    </Box>
  );
}
