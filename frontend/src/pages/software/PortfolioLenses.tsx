import {
  Box,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  HStack,
  VStack,
  Button,
  useColorModeValue,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  SimpleGrid,
  List,
  ListItem,
  Divider,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  Link,
  Icon
} from '@chakra-ui/react';
import { InfoOutlineIcon } from '@chakra-ui/icons';

const reportMetadata = {
  gartner: {
    runAt: '2025-01-15T10:30:00Z',
    durationMinutes: 3.8,
    agent: 'Portfolio TIME Lens Agent v2.1'
  },
  costValue: {
    runAt: '2025-01-15T10:34:00Z',
    durationMinutes: 2.4,
    agent: 'Cost-Value Quadrant Agent v1.4'
  },
  bcg: {
    runAt: '2025-01-15T10:37:00Z',
    durationMinutes: 4.2,
    agent: 'Adoption Growth Matrix Agent v1.2'
  },
  pace: {
    runAt: '2025-01-15T10:41:00Z',
    durationMinutes: 2.9,
    agent: 'Pace-Layered Portfolio Agent v1.0'
  },
  lean: {
    runAt: '2025-01-15T10:44:00Z',
    durationMinutes: 3.1,
    agent: 'SAFe Portfolio Flow Agent v0.9'
  },
  tbm: {
    runAt: '2025-01-15T10:48:00Z',
    durationMinutes: 3.6,
    agent: 'TBM Capability Lens Agent v1.3'
  }
};

const gartnerRows = [
  {
    product: 'Confluence',
    businessValue: 4,
    condition: 'Good',
    quadrant: 'Invest',
    action: 'Standardize for documentation, retire overlapping wikis'
  },
  {
    product: 'SharePoint On-Prem',
    businessValue: 3,
    condition: 'Needs modernization',
    quadrant: 'Migrate',
    action: 'Move remaining workloads to Online or Confluence by Q3'
  },
  {
    product: 'Legacy CMDB',
    businessValue: 2,
    condition: 'Poor',
    quadrant: 'Eliminate',
    action: 'Replace with integrated ITSM module after data migration'
  },
  {
    product: 'Adobe Creative Cloud',
    businessValue: 3,
    condition: 'Healthy',
    quadrant: 'Tolerate',
    action: 'Shift to active-user licensing, enforce SSO deprovisioning'
  },
  {
    product: 'Teams Telephony Add-on',
    businessValue: 3,
    condition: 'Emerging usage',
    quadrant: 'Invest',
    action: 'Complete pilot, integrate with unified communications stack'
  },
  {
    product: 'Legacy BI Server',
    businessValue: 2,
    condition: 'End-of-life',
    quadrant: 'Eliminate',
    action: 'Sunset after migrating dashboards to cloud warehouse'
  }
];

const costValueRows = [
  {
    product: 'Datadog',
    businessValue: 'High',
    tco: 'High',
    quadrant: 'High value / High cost',
    action: 'Optimize dashboards, consolidate agents, negotiate enterprise plan'
  },
  {
    product: 'Prometheus Stack',
    businessValue: 'Medium',
    tco: 'Low',
    quadrant: 'High value / Low cost',
    action: 'Retain as cost-effective edge monitoring; align exporters'
  },
  {
    product: 'Confluence',
    businessValue: 'High',
    tco: 'Medium',
    quadrant: 'High value / Medium cost',
    action: 'Consolidate spaces, retire redundant wikis to reduce TCO'
  },
  {
    product: 'Legacy BI Server',
    businessValue: 'Low',
    tco: 'High',
    quadrant: 'Low value / High cost',
    action: 'Sunset after migrating dashboards to cloud warehouse'
  },
  {
    product: 'Adobe Creative Cloud',
    businessValue: 'Medium',
    tco: 'High',
    quadrant: 'Medium value / High cost',
    action: 'Shift to active-user licensing, reduce premium add-ons'
  },
  {
    product: 'GitHub Enterprise',
    businessValue: 'High',
    tco: 'Medium',
    quadrant: 'High value / Medium cost',
    action: 'Maintain, automate seat reclamation via SCIM'
  }
];

const bcgRows = [
  {
    product: 'Salesforce Platform',
    adoption: 'High',
    growth: 'High',
    segment: 'Star',
    action: 'Invest in automation backlog and advanced analytics'
  },
  {
    product: 'Teams Telephony Add-on',
    adoption: 'Medium',
    growth: 'High',
    segment: 'Question Mark',
    action: 'Assess ROI and complete pilot before broad rollout'
  },
  {
    product: 'Legacy Reporting Tool',
    adoption: 'Low',
    growth: 'Low',
    segment: 'Dog',
    action: 'Plan retirement and user migration to unified BI'
  },
  {
    product: 'Office 365 Core Suite',
    adoption: 'High',
    growth: 'Low',
    segment: 'Cash Cow',
    action: 'Maintain, focus on cost control and governance'
  },
  {
    product: 'Experimentation Platform',
    adoption: 'Medium',
    growth: 'High',
    segment: 'Star',
    action: 'Scale successful experiments, ensure guardrails in place'
  },
  {
    product: 'Legacy CMDB',
    adoption: 'Low',
    growth: 'Low',
    segment: 'Dog',
    action: 'Retire after ITSM migration'
  }
];

const paceRows = [
  {
    product: 'Oracle Financials',
    layer: 'System of Record',
    value: 'Regulatory reporting & compliance backbone',
    guardrails: 'Keep stable, limit customizations, enforce quarterly releases'
  },
  {
    product: 'FinOps Insights Portal',
    layer: 'System of Differentiation',
    value: 'Provides cost transparency for engineering squads',
    guardrails: 'Standard APIs, modular architecture, quarterly steering review'
  },
  {
    product: 'Experimentation Platform',
    layer: 'System of Innovation',
    value: 'Supports rapid experimentation for growth teams',
    guardrails: 'Short lifecycle, lightweight governance, sunset after learnings'
  },
  {
    product: 'Customer 360 Data Hub',
    layer: 'System of Record',
    value: 'Master data for customer success and marketing analytics',
    guardrails: 'Strong data quality SLAs, restricted change windows'
  },
  {
    product: 'Digital Adoption Platform',
    layer: 'System of Differentiation',
    value: 'Accelerates onboarding and feature adoption for SaaS tools',
    guardrails: 'Integrate with identity, review analytics quarterly'
  },
  {
    product: 'Innovation Sandbox',
    layer: 'System of Innovation',
    value: 'Environment for testing emerging automation tooling',
    guardrails: 'Isolated data, 90-day evaluation window, mandatory exit review'
  }
];

const leanRows = [
  {
    stage: 'Funnel',
    description: 'Backlog of tool requests (45 active) scored via weighted rubric',
    action: 'Gate new requests with capability owner sign-off and TBM mapping'
  },
  {
    stage: 'Review',
    description: 'Monthly portfolio sync with Security/Finance/Platform',
    action: 'Decide invest/consolidate/retire path per weighted score'
  },
  {
    stage: 'MVP / Guardrails',
    description: 'Pilot stage for approved tools with success metrics & guardrails',
    action: 'Set SSO/SCIM requirements, integration standards, exit criteria'
  },
  {
    stage: 'Operate / Scale',
    description: 'Embed into catalog with showback, anomaly alerts, lifecycle policy',
    action: 'Automate renewal reviews, align co-terms, monitor savings'
  },
  {
    stage: 'Continuous Improve',
    description: 'Retro on realized value, user satisfaction, and cost performance',
    action: 'Feed insights back into backlog, adjust commitments, refine guardrails'
  }
];

const tbmRows = [
  {
    capability: 'Developer Productivity',
    unitEconomics: 'Cost per active engineer per month',
    topTools: 'GitHub, Atlassian Suite, Teams',
    insight: 'Optimize seat mix, shift idle seats to shared pools'
  },
  {
    capability: 'Customer Success',
    unitEconomics: 'Cost per active customer case',
    topTools: 'Salesforce Service Cloud, Jira Service Management',
    insight: 'Right-size premium support modules, consolidate reporting stack'
  },
  {
    capability: 'Finance & FP&A',
    unitEconomics: 'Cost per statement close cycle',
    topTools: 'Oracle Financials, Anaplan',
    insight: 'Align Anaplan usage tiers with forecasting cadence'
  },
  {
    capability: 'Growth & Marketing',
    unitEconomics: 'Cost per qualified lead',
    topTools: 'HubSpot, Segment, Data Warehouse',
    insight: 'Review license overlap with BI tools, implement usage-based tiers'
  },
  {
    capability: 'Security & Compliance',
    unitEconomics: 'Cost per audit finding resolved',
    topTools: 'Okta, Splunk, GRC Platform',
    insight: 'Consolidate logging tools, enforce SSO/SCIM across estate'
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

export default function PortfolioLenses() {
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
      <Heading size="lg" mb={4}>Portfolio-level Lenses</Heading>
      <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} mb={8} maxW="4xl">
        Portfolio agents continuously analyze the software estate using multiple frameworks. Each report below captures latest insights,
        prioritized actions, and references to the underlying common dimensions (business value, functional overlap, TCO, risk, integration fit,
        and strategic alignment).
      </Text>

      <Tabs colorScheme="blue" variant="enclosed">
        <TabList>
          <Tab>
            <HStack spacing={2}>
              <span>Gartner TIME</span>
              <Popover placement="bottom" isLazy>
                <PopoverTrigger>
                  <Icon as={InfoOutlineIcon} w={3} h={3} color="blue.400" cursor="pointer" />
                </PopoverTrigger>
                <PopoverContent fontSize="xs" _focus={{ boxShadow: 'none' }}>
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverHeader fontWeight="semibold">TIME Lens</PopoverHeader>
                  <PopoverBody>
                    Tolerate / Invest / Migrate / Eliminate segmentation by business value vs. condition.
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </HStack>
          </Tab>
          <Tab>
            <HStack spacing={2}>
              <span>Cost–Value Quadrant</span>
              <Popover placement="bottom" isLazy>
                <PopoverTrigger>
                  <Icon as={InfoOutlineIcon} w={3} h={3} color="blue.400" cursor="pointer" />
                </PopoverTrigger>
                <PopoverContent fontSize="xs" _focus={{ boxShadow: 'none' }}>
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverHeader fontWeight="semibold">Cost vs. Value</PopoverHeader>
                  <PopoverBody>
                    Highlights products by business value and total cost (or risk) for prioritization.
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </HStack>
          </Tab>
          <Tab>
            <HStack spacing={2}>
              <span>BCG Matrix</span>
              <Popover placement="bottom" isLazy>
                <PopoverTrigger>
                  <Icon as={InfoOutlineIcon} w={3} h={3} color="blue.400" cursor="pointer" />
                </PopoverTrigger>
                <PopoverContent fontSize="xs" _focus={{ boxShadow: 'none' }}>
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverHeader fontWeight="semibold">Adoption vs. Growth</PopoverHeader>
                  <PopoverBody>
                    Classifies tools as Stars, Cash Cows, Question Marks, or Dogs based on adoption and growth.
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </HStack>
          </Tab>
          <Tab>
            <HStack spacing={2}>
              <span>Pace-Layered</span>
              <Popover placement="bottom" isLazy>
                <PopoverTrigger>
                  <Icon as={InfoOutlineIcon} w={3} h={3} color="blue.400" cursor="pointer" />
                </PopoverTrigger>
                <PopoverContent fontSize="xs" _focus={{ boxShadow: 'none' }}>
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverHeader fontWeight="semibold">Pace-Layered</PopoverHeader>
                  <PopoverBody>
                    Categorizes systems as Record, Differentiation, or Innovation to set guardrails.
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </HStack>
          </Tab>
          <Tab>
            <HStack spacing={2}>
              <span>Lean Portfolio (SAFe)</span>
              <Popover placement="bottom" isLazy>
                <PopoverTrigger>
                  <Icon as={InfoOutlineIcon} w={3} h={3} color="blue.400" cursor="pointer" />
                </PopoverTrigger>
                <PopoverContent fontSize="xs" _focus={{ boxShadow: 'none' }}>
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverHeader fontWeight="semibold">Lean Portfolio Flow</PopoverHeader>
                  <PopoverBody>
                    Shows funnel → review → MVP/guardrails → operate flow for tool intake.
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </HStack>
          </Tab>
          <Tab>
            <HStack spacing={2}>
              <span>TBM / FinOps View</span>
              <Popover placement="bottom" isLazy>
                <PopoverTrigger>
                  <Icon as={InfoOutlineIcon} w={3} h={3} color="blue.400" cursor="pointer" />
                </PopoverTrigger>
                <PopoverContent fontSize="xs" _focus={{ boxShadow: 'none' }}>
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverHeader fontWeight="semibold">TBM/FinOps</PopoverHeader>
                  <PopoverBody>
                    Maps cost to business capabilities and unit economics for decision support.
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </HStack>
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            {renderMetadata('gartner')}
            <Box bg={cardBg} borderRadius="md" borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')} p={4}>
              <Heading size="sm" mb={4}>TIME Classification</Heading>
              <Table size="sm" variant="striped">
                <Thead>
                  <Tr>
                    <Th>Product</Th>
                    <Th>Business Value (1-5)</Th>
                    <Th>Condition</Th>
                    <Th>Quadrant</Th>
                    <Th>Recommended Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {gartnerRows.map((row) => (
                    <Tr key={row.product}>
                      <Td fontWeight="semibold">{row.product}</Td>
                      <Td>{row.businessValue}</Td>
                      <Td>{row.condition}</Td>
                      <Td>
                        <Badge colorScheme={row.quadrant === 'Invest' ? 'green' : row.quadrant === 'Migrate' ? 'yellow' : row.quadrant === 'Eliminate' ? 'red' : 'blue'}>
                          {row.quadrant}
                        </Badge>
                      </Td>
                      <Td>{row.action}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </TabPanel>

          <TabPanel>
            {renderMetadata('costValue')}
            <Box bg={cardBg} borderRadius="md" borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')} p={4}>
              <Heading size="sm" mb={4}>Cost vs. Value Quadrant</Heading>
              <Table size="sm" variant="striped">
                <Thead>
                  <Tr>
                    <Th>Product</Th>
                    <Th>Business Value</Th>
                    <Th>TCO / Risk</Th>
                    <Th>Quadrant</Th>
                    <Th>Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {costValueRows.map((row) => (
                    <Tr key={row.product}>
                      <Td fontWeight="semibold">{row.product}</Td>
                      <Td>{row.businessValue}</Td>
                      <Td>{row.tco}</Td>
                      <Td>{row.quadrant}</Td>
                      <Td>{row.action}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </TabPanel>

          <TabPanel>
            {renderMetadata('bcg')}
            <Box bg={cardBg} borderRadius="md" borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')} p={4}>
              <Heading size="sm" mb={4}>Adoption vs. Growth (BCG)</Heading>
              <Table size="sm" variant="striped">
                <Thead>
                  <Tr>
                    <Th>Product</Th>
                    <Th>Adoption</Th>
                    <Th>Growth</Th>
                    <Th>Segment</Th>
                    <Th>Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {bcgRows.map((row) => (
                    <Tr key={row.product}>
                      <Td fontWeight="semibold">{row.product}</Td>
                      <Td>{row.adoption}</Td>
                      <Td>{row.growth}</Td>
                      <Td>{row.segment}</Td>
                      <Td>{row.action}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </TabPanel>

          <TabPanel>
            {renderMetadata('pace')}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              {paceRows.map((row) => (
                <Box
                  key={row.product}
                  bg={cardBg}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor={useColorModeValue('gray.200', 'gray.700')}
                  p={4}
                >
                  <Heading size="sm" mb={2}>{row.product}</Heading>
                  <Badge colorScheme={row.layer === 'System of Record' ? 'orange' : row.layer === 'System of Differentiation' ? 'blue' : 'purple'} mb={2}>
                    {row.layer}
                  </Badge>
                  <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} mb={2}>{row.value}</Text>
                  <Divider mb={2} />
                  <Text fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
                    Guardrails: {row.guardrails}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </TabPanel>

          <TabPanel>
            {renderMetadata('lean')}
            <Box bg={cardBg} borderRadius="md" borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')} p={4}>
              <Heading size="sm" mb={4}>Lean Portfolio Flow</Heading>
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Stage</Th>
                    <Th>Description</Th>
                    <Th>Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {leanRows.map((row) => (
                    <Tr key={row.stage}>
                      <Td fontWeight="semibold">{row.stage}</Td>
                      <Td>{row.description}</Td>
                      <Td>{row.action}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </TabPanel>

          <TabPanel>
            {renderMetadata('tbm')}
            <Box bg={cardBg} borderRadius="md" borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')} p={4}>
              <Heading size="sm" mb={4}>TBM / FinOps Capability View</Heading>
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Business Capability</Th>
                    <Th>Unit Economics</Th>
                    <Th>Top Tools</Th>
                    <Th>Insight</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {tbmRows.map((row) => (
                    <Tr key={row.capability}>
                      <Td fontWeight="semibold">{row.capability}</Td>
                      <Td>{row.unitEconomics}</Td>
                      <Td>{row.topTools}</Td>
                      <Td>{row.insight}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
