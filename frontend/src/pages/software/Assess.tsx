import { Box, Heading, Text, Card, CardBody, useColorModeValue, Table, Thead, Tbody, Tr, Th, Td, SimpleGrid, VStack, List, ListItem, Badge } from '@chakra-ui/react';

const recommendationRows = [
  {
    focus: 'Collaboration & Knowledge Management',
    observation: 'Confluence and SharePoint both serve documentation hubs with <60% active usage overlap.',
    action: 'Consolidate to a single platform per business unit; migrate passive spaces to archive tier.',
    impact: 'Eliminate duplicate licenses and reduce support overhead.'
  },
  {
    focus: 'Automation & Monitoring Tooling',
    observation: 'Prometheus, Datadog, and custom scripts running for the same environments.',
    action: 'Standardize on unified monitoring stack; decommission custom scripts after parity validation.',
    impact: 'Lower maintenance costs and negotiated savings with single vendor.'
  },
  {
    focus: 'Design & Creative Suite',
    observation: 'Adobe Creative Cloud licensed for entire engineering org; <30% monthly active.',
    action: 'Shift to active-user licensing with quarterly utilization reviews; retire unused add-ons.',
    impact: 'Immediate cost reduction and aligned entitlements to demand.'
  },
  {
    focus: 'Low-Code Platforms',
    observation: 'Multiple SaaS workflow builders with overlapping use cases and limited automation hand-offs.',
    action: 'Apply canonical process guardrails, sunset redundant tools, and enforce intake governance.',
    impact: 'Streamlined support model and reduced shadow IT risk.'
  }
];

const timeMatrix = [
  {
    quadrant: 'Invest',
    description: 'High value, healthy products that differentiate the business.',
    candidates: 'FinOps Orchestrator, Salesforce Platform'
  },
  {
    quadrant: 'Migrate',
    description: 'Valuable products with technical debt or poor fit—modernize or replace.',
    candidates: 'Legacy CMDB, custom reporting scripts'
  },
  {
    quadrant: 'Tolerate',
    description: 'Necessary systems with acceptable cost/effort until natural replacement.',
    candidates: 'Oracle Database for regulated workloads'
  },
  {
    quadrant: 'Eliminate',
    description: 'Low value or redundant services; plan retirement or consolidation.',
    candidates: 'Duplicate wiki tools, niche SaaS with low adoption'
  }
];

const sixRAssessment = [
  {
    option: 'Retain',
    when: 'Mission-critical with strong adoption and roadmap alignment.',
    examples: 'Salesforce CRM, Azure DevOps'
  },
  {
    option: 'Rehost',
    when: 'Lift-and-shift viable workloads to cloud-managed equivalents.',
    examples: 'Legacy BI server to managed SQL warehouse'
  },
  {
    option: 'Replatform',
    when: 'Replace underlying platform to unlock elasticity or integrations.',
    examples: 'On-prem ECM to SaaS collaboration suite'
  },
  {
    option: 'Refactor',
    when: 'Rewrite components to remove customization debt and reduce license tier.',
    examples: 'Heavily customized ITSM workflows'
  },
  {
    option: 'Repurchase',
    when: 'Switch to SaaS alternative with better economics or compliance.',
    examples: 'Replace bespoke monitoring with Datadog'
  },
  {
    option: 'Retire',
    when: 'Low value, redundant, or end-of-life systems.',
    examples: 'Legacy intranet portals after SharePoint consolidation'
  }
];

const cadenceSteps = [
  'Inventory & tag owners, renewal dates, data classifications.',
  'Measure usage: logins, feature adoption, cost per active user.',
  'Score products via the weighted rubric and visualize Time/Cost matrices.',
  'Decide actions (invest / consolidate / replace / retire) with accountable owners.',
  'Align commercial steps: co-term renewals, renegotiate tiers, adjust pricing models.',
  'Establish governance cadence with quarterly reviews and standardized intake.'
];

export default function Assess() {
  const tableBg = useColorModeValue('white', 'gray.800');

  return (
    <Box>
      <Heading size="lg" mb={4}>Assess</Heading>
      <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} mb={8} maxW="4xl">
        Evaluate the software estate through multiple portfolio lenses (Gartner TIME, 6R modernization, weighted scoring) to drive
        rationalization decisions. Insights below synthesize functional overlap, unit economics, and risk signals found in the inventory.
      </Text>

      <Card bg={tableBg} mb={8}>
        <CardBody>
          <Heading size="md" mb={4}>Assessment Recommendations</Heading>
          <Table size="sm" variant="striped">
            <Thead>
              <Tr>
                <Th>Focus Area</Th>
                <Th>Observation</Th>
                <Th>Recommended Action</Th>
                <Th>Impact</Th>
              </Tr>
            </Thead>
            <Tbody>
              {recommendationRows.map((row) => (
                <Tr key={row.focus}>
                  <Td fontWeight="semibold">{row.focus}</Td>
                  <Td>{row.observation}</Td>
                  <Td>{row.action}</Td>
                  <Td>{row.impact}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={8}>
        <Card bg={tableBg}>
          <CardBody>
            <Heading size="sm" mb={3}>Gartner TIME Assessment</Heading>
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th>Quadrant</Th>
                  <Th>Description</Th>
                  <Th>Candidate Products</Th>
                </Tr>
              </Thead>
              <Tbody>
                {timeMatrix.map((item) => (
                  <Tr key={item.quadrant}>
                    <Td fontWeight="semibold">{item.quadrant}</Td>
                    <Td>{item.description}</Td>
                    <Td>{item.candidates}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>

        <Card bg={tableBg}>
          <CardBody>
            <Heading size="sm" mb={3}>6R Modernization Lens</Heading>
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th>Option</Th>
                  <Th>When to Choose</Th>
                  <Th>Example Candidates</Th>
                </Tr>
              </Thead>
              <Tbody>
                {sixRAssessment.map((item) => (
                  <Tr key={item.option}>
                    <Td fontWeight="semibold">{item.option}</Td>
                    <Td>{item.when}</Td>
                    <Td>{item.examples}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card bg={tableBg}>
        <CardBody>
          <Heading size="md" mb={3}>Operating Cadence</Heading>
          <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} mb={4}>
            Follow this lightweight playbook to keep rationalization disciplined and transparent.
          </Text>
          <VStack align="stretch" spacing={3}>
            {cadenceSteps.map((step, index) => (
              <List key={step} spacing={1}>
                <ListItem>
                  <Badge colorScheme="blue" mr={2}>Step {index + 1}</Badge>
                  {step}
                </ListItem>
              </List>
            ))}
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
}
