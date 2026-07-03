import { Box, Heading, Text, SimpleGrid, Card, CardBody, VStack, HStack, Badge, useColorModeValue, List, ListItem, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';

const pricingCategories = [
  {
    title: 'License-Based Pricing',
    badge: 'SaaS',
    points: [
      'Seat-based pricing with volume discounts',
      'Enterprise agreements with true-up clauses',
      'Term licensing for on-prem software'
    ]
  },
  {
    title: 'Usage-Based Pricing',
    badge: 'Cloud',
    points: [
      'Pay-as-you-go consumption for cloud services',
      'Tiered pricing based on usage thresholds',
      'Commitment-based discounts (RI, SP, CUD)'
    ]
  },
  {
    title: 'Hybrid Pricing Models',
    badge: 'Hybrid',
    points: [
      'Base license + consumption overage',
      'Bring-your-own-license (BYOL) models',
      'Credits-based billing for platform usage'
    ]
  }
];

const optimizationLevers = [
  {
    title: 'Commitment Planning',
    description: 'Analyze historical usage, forecast demand, and purchase the right mix of commitments (RIs, Savings Plans, CUDs) to reduce variable costs.'
  },
  {
    title: 'Contract Negotiation',
    description: 'Leverage utilization data and benchmarking to negotiate enterprise agreements, custom pricing tiers, and contract flexibility.'
  },
  {
    title: 'Chargeback Models',
    description: 'Allocate costs to business units using showback/chargeback models that reflect actual usage and incentivize cost efficiency.'
  }
];

const pricingFitRows = [
  {
    scenario: 'High variance usage with unpredictable spikes',
    recommended: 'Usage-based with budgets and automated anomaly alerts',
    notes: 'Set guardrails, negotiate per-unit price breaks, enable quota notifications.'
  },
  {
    scenario: 'Broad, stable adoption across the enterprise',
    recommended: 'Flat/site license or per-active user model',
    notes: 'Bundle premium features, enforce SSO deprovisioning to avoid zombie seats.'
  },
  {
    scenario: 'Strategic platform with critical workflows',
    recommended: 'Hybrid pricing (base fee + usage) with outcome KPIs',
    notes: 'Track unit economics per outcome, ensure premium support is included.'
  },
  {
    scenario: 'Early-stage or pilot adoption with uncertain demand',
    recommended: 'Monthly, low-commit contract with easy exit terms',
    notes: 'Avoid long-term lock-in; review after MVP validation.'
  },
  {
    scenario: 'Vendor consolidation initiative',
    recommended: 'Multi-year commitments with co-termed renewals',
    notes: 'Leverage volume for discounts, negotiate swap rights for future tools.'
  }
];

export default function PricingModels() {
  const cardBg = useColorModeValue('white', 'gray.800');

  return (
    <Box>
      <Heading size="lg" mb={4}>Pricing Models</Heading>
      <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} mb={8} maxW="4xl">
        Understand the pricing strategies used across the software portfolio. Combine license optimization with cloud commitment planning
        to build a holistic view of software spend and savings opportunities.
      </Text>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={8}>
        {pricingCategories.map((category) => (
          <Card key={category.title} bg={cardBg} borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
            <CardBody>
              <VStack align="start" spacing={3}>
                <HStack spacing={2}>
                  <Badge colorScheme="teal" fontSize="xs">{category.badge}</Badge>
                  <Heading size="sm">{category.title}</Heading>
                </HStack>
                <List spacing={2} fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                  {category.points.map((point) => (
                    <ListItem key={point}>• {point}</ListItem>
                  ))}
                </List>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      <Heading size="md" mb={4}>Optimization Levers</Heading>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        {optimizationLevers.map((lever) => (
          <Card key={lever.title} bg={cardBg} borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
            <CardBody>
              <VStack align="start" spacing={3}>
                <Badge colorScheme="orange" fontSize="xs">Leverage</Badge>
                <Heading size="sm">{lever.title}</Heading>
                <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                  {lever.description}
                </Text>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      <Card bg={cardBg} mt={8} borderWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
        <CardBody>
          <Heading size="md" mb={4}>Pricing Fit Decision Matrix</Heading>
          <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} mb={4}>
            Use these heuristics (drawn from the pricing playbook) to align contract models with usage patterns and risk appetite.
          </Text>
          <Box overflowX="auto">
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th>Scenario</Th>
                  <Th>Recommended Model</Th>
                  <Th>Notes</Th>
                </Tr>
              </Thead>
              <Tbody>
                {pricingFitRows.map((row) => (
                  <Tr key={row.scenario}>
                    <Td fontWeight="semibold">{row.scenario}</Td>
                    <Td>{row.recommended}</Td>
                    <Td>{row.notes}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </CardBody>
      </Card>
    </Box>
  );
}
