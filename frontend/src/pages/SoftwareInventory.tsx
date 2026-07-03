import { useEffect, useState, forwardRef } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  Card,
  CardBody,
  Badge,
  Link,
  HStack,
  Icon,
  Text,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Button,
  useDisclosure,
  Tooltip as ChakraTooltip
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';

// Info icon component with forwardRef to work with Tooltip
const InfoIcon = forwardRef<SVGSVGElement, any>((props, ref) => (
  <Icon viewBox="0 0 24 24" ref={ref} {...props}>
    <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
  </Icon>
));
InfoIcon.displayName = 'InfoIcon';

import { API_V1 as API_URL } from '../config';

interface SoftwareItem {
  id: string;
  product_name: string;
  vendor: string;
  product_type: string;
  license_type: string;
  license_cost: number;
  currency: string;
  last_paid: string;
  next_billing: string | null;
  contract_id: string;
  status: string;
  users_seats?: number;
  renewal_date?: string | null;
}

export default function SoftwareInventory() {
  const [inventory, setInventory] = useState<SoftwareItem[]>([]);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [selectedContract, setSelectedContract] = useState<{ contractId: string; productName: string } | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bg = useColorModeValue('white', 'gray.800');

  const [licenseInsights, setLicenseInsights] = useState<any>(null);
  const [agentActivity, setAgentActivity] = useState<string>('');
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const { isOpen: isInsightOpen, onOpen: onInsightOpen, onClose: onInsightClose } = useDisclosure();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    fetch(`${API_URL}/software-inventory`)
      .then(r => r.json())
      .then(data => {
        const items = data.data || [];
        setInventory(items);
        const total = items.reduce((sum: number, item: SoftwareItem) => sum + (item.license_cost || 0), 0);
        setTotalCost(total);
        
        // Calculate Vendor & License Agent insights based on ACTUAL data
        const activeItems = items.filter((item: SoftwareItem) => item.status === 'Active');
        
        // Items with high seat count (potential true-up risk)
        const overUtilized = items.filter((item: SoftwareItem) => {
          if (!item.users_seats || !item.license_type) return false;
          // Consider enterprise licenses with >500 seats as over-utilized
          return item.license_type.includes('Enterprise') && item.users_seats > 500;
        });
        
        // Items with low seat count (optimization opportunity)
        const underUtilized = items.filter((item: SoftwareItem) => {
          if (!item.users_seats || !item.license_type) return false;
          // Consider items with <50 seats and enterprise licenses as under-utilized
          return item.license_type.includes('Enterprise') && item.users_seats < 50;
        });
        
        // Renewals approaching - align with Summary section which shows status='Renewal Pending'
        // This ensures exact match between Insights and Summary
        const renewalsApproaching = items.filter((item: SoftwareItem) => item.status === 'Renewal Pending');
        
        // Total licenses analyzed (sum of seats for ACTIVE licenses only)
        // This aligns with "Active Licenses" concept in the Summary section
        const totalLicenses = activeItems.reduce((sum: number, item: SoftwareItem) => sum + (item.users_seats || 0), 0);
        
        const insights = {
          contractsTracked: items.length,
          activeContracts: activeItems.length,
          licensesAnalyzed: totalLicenses,
          trueupRisks: overUtilized.length,
          trueupRiskItems: overUtilized,
          optimizationOpportunities: underUtilized.length,
          optimizationItems: underUtilized,
          renewalsApproaching: renewalsApproaching.length,
          renewalItems: renewalsApproaching,
        };
        
        setLicenseInsights(insights);
        
        // Generate dynamic activity messages based on actual data
        const activityMessages = [
          `Analyzing ${insights.contractsTracked} SaaS contracts and ${insights.licensesAnalyzed.toLocaleString()} license entitlements`,
          insights.trueupRisks > 0 || insights.optimizationOpportunities > 0
            ? `Identified ${insights.trueupRisks} over-utilized licenses (risk of true-up) and ${insights.optimizationOpportunities} under-utilized licenses`
            : 'Monitoring license utilization vs. entitlements',
          insights.renewalsApproaching > 0
            ? `${insights.renewalsApproaching} contract${insights.renewalsApproaching > 1 ? 's' : ''} pending renewal`
            : 'All contracts are active',
          'Monitoring license utilization vs. entitlements',
        ];
        
        // Set initial message
        setAgentActivity(activityMessages[0]);
        
        // Rotate messages every 5 seconds
        let messageIndex = 0;
        interval = setInterval(() => {
          messageIndex = (messageIndex + 1) % activityMessages.length;
          setAgentActivity(activityMessages[messageIndex]);
        }, 5000);
      });

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'green';
      case 'renewal pending':
        return 'yellow';
      case 'expired':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'saas':
        return 'blue';
      case 'iaas':
        return 'purple';
      case 'paas':
        return 'cyan';
      case 'cots':
        return 'orange';
      case 'custom':
        return 'pink';
      case 'open source':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const assessmentSummaryRows = [
    {
      area: 'Collaboration & Knowledge Mgmt',
      signal: 'Multiple wiki/work management suites with <60% active overlap.',
      recommendation: 'Standardize on a primary suite per BU, decommission redundant spaces, archive legacy content.',
      priority: 'High'
    },
    {
      area: 'Monitoring & Automation',
      signal: 'Datadog, Prometheus, and bespoke scripts monitoring the same workloads.',
      recommendation: 'Move to unified monitoring tier, retire custom scripts post cutover, co-term contracts.',
      priority: 'Medium'
    },
    {
      area: 'Design & Creative Tooling',
      signal: 'Enterprise Creative Cloud seats with <30% monthly active usage.',
      recommendation: 'Shift to active-user licensing, enforce SSO/SCIM for deprovisioning, downgrade unused add-ons.',
      priority: 'High'
    },
    {
      area: 'Low-Code Workflow Apps',
      signal: 'Point solutions growing without governance; overlapping feature sets.',
      recommendation: 'Apply intake guardrails, migrate commodity workflows to platform standards, retire niche tools.',
      priority: 'Medium'
    }
  ];

  const frameworkSnapshotRows = [
    {
      framework: 'Gartner TIME',
      highlight: 'Invest: Salesforce Platform, Migrate: Legacy CMDB, Eliminate: Redundant wikis.',
      nextStep: 'Approve modernization roadmap and schedule retirements.'
    },
    {
      framework: '6R Modernization',
      highlight: 'Retain differentiators, Repurchase redundant SaaS with consolidated suites, Retire low-value utilities.',
      nextStep: 'Align 6R outcomes with FY roadmap and procurement plans.'
    },
    {
      framework: 'Cost-Value Quadrant',
      highlight: 'Prioritize high-cost/low-value tools for elimination; nurture high-value/low-cost winners.',
      nextStep: 'Share unit economics dashboard with finance & product owners.'
    }
  ];

  const handleViewContract = (contractId: string, productName: string) => {
    setSelectedContract({ contractId, productName });
    onOpen();
  };

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between" align="center">
          <Heading size="lg">Product Inventory</Heading>
          <VStack align="end" spacing={1}>
            <Box>
              <Text fontSize="sm" color="gray.500" mb={1}>Total License Cost</Text>
              <Heading size="md" color="blue.600">
                {formatCurrency(totalCost)}
              </Heading>
            </Box>
            {agentActivity && (
              <HStack spacing={2}>
                <Box
                  w="8px"
                  h="8px"
                  borderRadius="full"
                  bg="blue.500"
                  sx={{
                    animation: 'pulse 2s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.3 },
                    }
                  }}
                />
                <Text fontSize="xs" color="blue.600" fontStyle="italic">
                  {agentActivity}
                </Text>
              </HStack>
            )}
          </VStack>
        </HStack>

        {licenseInsights && (
          <Card bg={bg} borderLeft="4px" borderColor="blue.500">
            <CardBody>
              <HStack justify="space-between" mb={3}>
                <Heading size="sm">Vendor & License Agent Insights</Heading>
                <Badge colorScheme="blue">Agent Analysis</Badge>
              </HStack>
              <HStack spacing={6} flexWrap="wrap">
                <Box
                  cursor="pointer"
                  onClick={() => {
                    setSelectedInsight('contracts');
                    onInsightOpen();
                  }}
                  _hover={{ transform: 'scale(1.05)' }}
                  transition="all 0.2s"
                >
                  <HStack spacing={1}>
                    <Text fontSize="xs" color="gray.500">Contracts Tracked</Text>
                    <ChakraTooltip 
                      label="Total number of software contracts and licenses being tracked in the inventory system. Includes all active, pending, and inactive contracts."
                      placement="top"
                      hasArrow
                    >
                      <Icon as={InfoIcon} color="gray.400" w={3} h={3} cursor="help" />
                    </ChakraTooltip>
                  </HStack>
                  <Text fontSize="lg" fontWeight="bold" color="blue.600">{licenseInsights.contractsTracked}</Text>
                </Box>
                <Box
                  cursor="pointer"
                  onClick={() => {
                    setSelectedInsight('licenses');
                    onInsightOpen();
                  }}
                  _hover={{ transform: 'scale(1.05)' }}
                  transition="all 0.2s"
                >
                  <HStack spacing={1}>
                    <Text fontSize="xs" color="gray.500">Licenses Analyzed</Text>
                    <ChakraTooltip 
                      label="Total number of user seats/licenses across all active software products. This represents the sum of all user seats from active contracts only."
                      placement="top"
                      hasArrow
                    >
                      <Icon as={InfoIcon} color="gray.400" w={3} h={3} cursor="help" />
                    </ChakraTooltip>
                  </HStack>
                  <Text fontSize="lg" fontWeight="bold" color="blue.600">{licenseInsights.licensesAnalyzed.toLocaleString()}</Text>
                </Box>
                <Box
                  cursor="pointer"
                  onClick={() => {
                    setSelectedInsight('trueup');
                    onInsightOpen();
                  }}
                  _hover={{ transform: 'scale(1.05)' }}
                  transition="all 0.2s"
                >
                  <HStack spacing={1}>
                    <Text fontSize="xs" color="red.600">True-up Risks</Text>
                    <ChakraTooltip 
                      label="Enterprise licenses with high utilization (>500 seats) that may require true-up charges at contract renewal. These represent potential unbudgeted costs."
                      placement="top"
                      hasArrow
                    >
                      <Icon as={InfoIcon} color="red.400" w={3} h={3} cursor="help" />
                    </ChakraTooltip>
                  </HStack>
                  <Text fontSize="lg" fontWeight="bold" color="red.600">{licenseInsights.trueupRisks}</Text>
                </Box>
                <Box
                  cursor="pointer"
                  onClick={() => {
                    setSelectedInsight('optimization');
                    onInsightOpen();
                  }}
                  _hover={{ transform: 'scale(1.05)' }}
                  transition="all 0.2s"
                >
                  <HStack spacing={1}>
                    <Text fontSize="xs" color="green.600">Optimization Opportunities</Text>
                    <ChakraTooltip 
                      label="Enterprise licenses with low utilization (<50 seats) that may be downsized or consolidated to reduce costs. These represent potential cost savings opportunities."
                      placement="top"
                      hasArrow
                    >
                      <Icon as={InfoIcon} color="green.400" w={3} h={3} cursor="help" />
                    </ChakraTooltip>
                  </HStack>
                  <Text fontSize="lg" fontWeight="bold" color="green.600">{licenseInsights.optimizationOpportunities}</Text>
                </Box>
                <Box
                  cursor="pointer"
                  onClick={() => {
                    setSelectedInsight('renewals');
                    onInsightOpen();
                  }}
                  _hover={{ transform: 'scale(1.05)' }}
                  transition="all 0.2s"
                >
                  <HStack spacing={1}>
                    <Text fontSize="xs" color="yellow.600">Renewals Approaching</Text>
                    <ChakraTooltip 
                      label="Contracts with status 'Renewal Pending' that require attention. These contracts are approaching their renewal date and may need review or renegotiation."
                      placement="top"
                      hasArrow
                    >
                      <Icon as={InfoIcon} color="yellow.400" w={3} h={3} cursor="help" />
                    </ChakraTooltip>
                  </HStack>
                  <Text fontSize="lg" fontWeight="bold" color="yellow.600">{licenseInsights.renewalsApproaching}</Text>
                </Box>
              </HStack>
            </CardBody>
          </Card>
        )}

        <Card bg={bg}>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Summary</Heading>
              <HStack spacing={8} flexWrap="wrap">
                <Box>
                  <HStack spacing={1}>
                    <Text fontSize="sm" color="gray.500">Total Products</Text>
                    <ChakraTooltip 
                      label="Total number of software products and licenses in the inventory, including all statuses (active, renewal pending, etc.)"
                      placement="top"
                      hasArrow
                    >
                      <Icon as={InfoIcon} color="gray.400" w={3} h={3} cursor="help" />
                    </ChakraTooltip>
                  </HStack>
                  <Text fontSize="2xl" fontWeight="bold">{inventory.length}</Text>
                </Box>
                <Box>
                  <HStack spacing={1}>
                    <Text fontSize="sm" color="gray.500">Active Licenses</Text>
                    <ChakraTooltip 
                      label="Number of software contracts currently active and in use. These are fully operational with no pending actions required."
                      placement="top"
                      hasArrow
                    >
                      <Icon as={InfoIcon} color="gray.400" w={3} h={3} cursor="help" />
                    </ChakraTooltip>
                  </HStack>
                  <Text fontSize="2xl" fontWeight="bold">
                    {inventory.filter(i => i.status === 'Active').length}
                  </Text>
                </Box>
                <Box>
                  <HStack spacing={1}>
                    <Text fontSize="sm" color="gray.500">Pending Renewals</Text>
                    <ChakraTooltip 
                      label="Contracts with renewal pending status that require attention. These need review before the renewal date to avoid service interruption."
                      placement="top"
                      hasArrow
                    >
                      <Icon as={InfoIcon} color="gray.400" w={3} h={3} cursor="help" />
                    </ChakraTooltip>
                  </HStack>
                  <Text fontSize="2xl" fontWeight="bold">
                    {inventory.filter(i => i.status === 'Renewal Pending').length}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500">Monthly Recurring</Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {formatCurrency(
                      inventory
                        .filter(i => i.license_type.includes('Monthly'))
                        .reduce((sum, i) => sum + i.license_cost, 0)
                    )}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.500">Yearly Recurring</Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {formatCurrency(
                      inventory
                        .filter(i => i.license_type.includes('Yearly'))
                        .reduce((sum, i) => sum + i.license_cost, 0)
                    )}
                  </Text>
                </Box>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={bg}>
          <CardBody>
            <Box overflowX="auto">
              <Table size="md" variant="striped">
                <Thead>
                  <Tr>
                    <Th>Product Name</Th>
                    <Th>Vendor</Th>
                    <Th>Type</Th>
                    <Th>License Type</Th>
                    <Th isNumeric>License Cost</Th>
                    <Th>Last Paid</Th>
                    <Th>Next Billing</Th>
                    <Th>Status</Th>
                    <Th>Contract</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {inventory.length === 0 ? (
                    <Tr>
                      <Td colSpan={9} textAlign="center" py={8}>
                        <Text color="gray.500">Loading software inventory...</Text>
                      </Td>
                    </Tr>
                  ) : (
                    inventory.map((item) => (
                      <Tr key={item.id}>
                        <Td fontWeight="medium">{item.product_name}</Td>
                        <Td>{item.vendor}</Td>
                        <Td>
                          <Badge colorScheme={getTypeColor(item.product_type)}>
                            {item.product_type}
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontSize="sm">{item.license_type}</Text>
                        </Td>
                        <Td isNumeric fontWeight="semibold">
                          {formatCurrency(item.license_cost, item.currency)}
                          {item.users_seats && (
                            <Text fontSize="xs" color="gray.500" fontWeight="normal">
                              ({item.users_seats} seats)
                            </Text>
                          )}
                        </Td>
                        <Td>{formatDate(item.last_paid)}</Td>
                        <Td>
                          {item.next_billing ? (
                            <Text>
                              {formatDate(item.next_billing)}
                              {item.renewal_date && new Date(item.renewal_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                                <Badge ml={2} colorScheme="yellow" fontSize="xs">
                                  Soon
                                </Badge>
                              )}
                            </Text>
                          ) : (
                            <Text color="gray.500" fontStyle="italic">N/A</Text>
                          )}
                        </Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </Td>
                        <Td>
                          <Link
                            onClick={() => handleViewContract(item.contract_id, item.product_name)}
                            color="blue.500"
                            _hover={{ color: 'blue.700', textDecoration: 'underline' }}
                            cursor="pointer"
                            display="flex"
                            alignItems="center"
                            gap={1}
                          >
                            <Text fontSize="sm">View</Text>
                            <Icon as={ExternalLinkIcon} w={3} h={3} />
                          </Link>
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </Box>
          </CardBody>
        </Card>

        <Card bg={bg}>
          <CardBody>
            <Heading size="md" mb={4}>Assessment Findings</Heading>
            <Text fontSize="sm" color="gray.500" mb={4}>
              Aggregated recommendations from the portfolio review (frameworks: Gartner TIME, Cost–Value, 6R modernization).
            </Text>
            <Box overflowX="auto">
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Area</Th>
                    <Th>Signal Observed</Th>
                    <Th>Recommended Action</Th>
                    <Th>Priority</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {assessmentSummaryRows.map((row) => (
                    <Tr key={row.area}>
                      <Td fontWeight="semibold">{row.area}</Td>
                      <Td>{row.signal}</Td>
                      <Td>{row.recommendation}</Td>
                      <Td>
                        <Badge colorScheme={row.priority === 'High' ? 'red' : 'yellow'}>{row.priority}</Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </CardBody>
        </Card>

        <Card bg={bg}>
          <CardBody>
            <Heading size="md" mb={4}>Framework Snapshot</Heading>
            <Box overflowX="auto">
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>Framework</Th>
                    <Th>Key Insight</Th>
                    <Th>Next Step</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {frameworkSnapshotRows.map((row) => (
                    <Tr key={row.framework}>
                      <Td fontWeight="semibold">{row.framework}</Td>
                      <Td>{row.highlight}</Td>
                      <Td>{row.nextStep}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </CardBody>
        </Card>

      </VStack>
 
      {/* Contract View Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Contract Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch" py={4}>
              <Box textAlign="center">
                <Text fontSize="4xl" mb={4}>📄</Text>
                <Heading size="md" mb={2} color="blue.600">
                  Contract Details
                </Heading>
                <Text fontSize="lg" mb={4} fontWeight="semibold">
                  Contract ID: {selectedContract?.contractId}
                </Text>
                <Text fontSize="md" mb={2}>
                  Product: {selectedContract?.productName}
                </Text>
                <Text fontSize="sm" color="gray.600" mt={4}>
                  Full contract documents, terms, pricing, renewal dates, and legal agreements
                  would appear here once connected to your document management and CLM systems.
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* License Insights Details Modal */}
      <Modal isOpen={isInsightOpen} onClose={onInsightClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedInsight === 'contracts' && 'All Contracts'}
            {selectedInsight === 'licenses' && 'License Utilization Details'}
            {selectedInsight === 'trueup' && 'True-up Risk Items'}
            {selectedInsight === 'optimization' && 'Optimization Opportunities'}
            {selectedInsight === 'renewals' && 'Renewals Approaching'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedInsight === 'contracts' && licenseInsights && (
              <VStack align="stretch" spacing={3}>
                <Text fontSize="sm" color="gray.600">
                  Total contracts tracked: <strong>{licenseInsights.contractsTracked}</strong>
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Active contracts: <strong>{licenseInsights.activeContracts}</strong>
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Pending renewals: <strong>{licenseInsights.renewalsApproaching}</strong>
                </Text>
              </VStack>
            )}
            {selectedInsight === 'licenses' && licenseInsights && (
              <VStack align="stretch" spacing={3}>
                <Text fontSize="sm" color="gray.600">
                  Total licenses/seats analyzed: <strong>{licenseInsights.licensesAnalyzed.toLocaleString()}</strong>
                </Text>
                <Text fontSize="sm" color="gray.600">
                  This represents the sum of all user seats across <strong>active</strong> software products in the inventory.
                </Text>
                <Text fontSize="xs" color="gray.500" fontStyle="italic" mt={2}>
                  Note: Only active contracts are included in this count, aligning with the "Active Licenses" metric in the Summary section.
                </Text>
              </VStack>
            )}
            {selectedInsight === 'trueup' && licenseInsights && (
              <VStack align="stretch" spacing={3}>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  <strong>{licenseInsights.trueupRisks}</strong> products with high license utilization (potential true-up risk):
                </Text>
                {licenseInsights.trueupRiskItems && licenseInsights.trueupRiskItems.length > 0 ? (
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Product</Th>
                        <Th>Vendor</Th>
                        <Th>Seats</Th>
                        <Th>Cost</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {licenseInsights.trueupRiskItems.map((item: SoftwareItem) => (
                        <Tr key={item.id}>
                          <Td fontWeight="medium">{item.product_name}</Td>
                          <Td>{item.vendor}</Td>
                          <Td>{item.users_seats}</Td>
                          <Td>{formatCurrency(item.license_cost, item.currency)}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                ) : (
                  <Text fontSize="sm" color="gray.500" fontStyle="italic">
                    No true-up risks identified.
                  </Text>
                )}
              </VStack>
            )}
            {selectedInsight === 'optimization' && licenseInsights && (
              <VStack align="stretch" spacing={3}>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  <strong>{licenseInsights.optimizationOpportunities}</strong> products with low license utilization (optimization opportunity):
                </Text>
                {licenseInsights.optimizationItems && licenseInsights.optimizationItems.length > 0 ? (
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Product</Th>
                        <Th>Vendor</Th>
                        <Th>Seats</Th>
                        <Th>Cost</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {licenseInsights.optimizationItems.map((item: SoftwareItem) => (
                        <Tr key={item.id}>
                          <Td fontWeight="medium">{item.product_name}</Td>
                          <Td>{item.vendor}</Td>
                          <Td>{item.users_seats}</Td>
                          <Td>{formatCurrency(item.license_cost, item.currency)}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                ) : (
                  <Text fontSize="sm" color="gray.500" fontStyle="italic">
                    No optimization opportunities identified.
                  </Text>
                )}
              </VStack>
            )}
            {selectedInsight === 'renewals' && licenseInsights && (
              <VStack align="stretch" spacing={3}>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  <strong>{licenseInsights.renewalsApproaching}</strong> contract{licenseInsights.renewalsApproaching !== 1 ? 's' : ''} pending renewal:
                </Text>
                {licenseInsights.renewalItems && licenseInsights.renewalItems.length > 0 ? (
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Product</Th>
                        <Th>Vendor</Th>
                        <Th>Renewal Date</Th>
                        <Th>Cost</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {licenseInsights.renewalItems.map((item: SoftwareItem) => (
                        <Tr key={item.id}>
                          <Td fontWeight="medium">{item.product_name}</Td>
                          <Td>{item.vendor}</Td>
                          <Td>{formatDate(item.renewal_date || '')}</Td>
                          <Td>{formatCurrency(item.license_cost, item.currency)}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                ) : (
                  <Text fontSize="sm" color="gray.500" fontStyle="italic">
                    No contracts pending renewal.
                  </Text>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onInsightClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

