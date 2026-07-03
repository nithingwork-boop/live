import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Text,
  Card,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  SimpleGrid,
  Grid,
  useColorModeValue,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  VStack,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  Badge,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  Flex,
  Tooltip as ChakraTooltip,
  Button,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronRightIcon, SearchIcon } from '@chakra-ui/icons';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useFinOps } from '../../contexts/FinOpsContext';
import { fetchAIObservability } from './aiApi';
import {
  AIPageHeader,
  KpiStatCard,
  ChartCard,
  CHART_COLORS,
  formatMoneyK,
} from './aiPageComponents';

export default function AIObservability() {
  const { timeRangeFrom, timeRangeTo } = useFinOps();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Expanded nodes state (root expanded by default)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    'soumit.nandi': true,
  });
  const [selectedTreeRoot, setSelectedTreeRoot] = useState<any>(null);

  const bg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const tooltipBg = useColorModeValue('white', 'gray.700');
  const tooltipColor = useColorModeValue('black', 'white');
  const muted = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    setLoading(true);
    fetchAIObservability(timeRangeFrom, timeRangeTo)
      .then((res) => {
        setData(res);
        
        if (res?.tree) {
          const findNodeById = (node: any, id: string): any => {
            if (!node) return null;
            if (node.userId === id) return node;
            if (node.children) {
              for (const child of node.children) {
                const found = findNodeById(child, id);
                if (found) return found;
              }
            }
            return null;
          };

          if (selectedTreeRoot) {
            const newRoot = findNodeById(res.tree, selectedTreeRoot.userId);
            setSelectedTreeRoot(newRoot);
          }
          if (selectedUser) {
            const newUser = findNodeById(res.tree, selectedUser.userId);
            setSelectedUser(newUser);
          }
        } else {
          setSelectedTreeRoot(null);
          setSelectedUser(null);
        }

        // Pre-expand directors when loaded to make it easy to explore
        if (res?.tree?.children) {
          const newExpanded: Record<string, boolean> = { 'soumit.nandi': true };
          res.tree.children.forEach((c: any) => {
            newExpanded[c.userId] = true;
            if (c.children) {
              c.children.forEach((d: any) => {
                newExpanded[d.userId] = true;
              });
            }
          });
          setExpanded(newExpanded);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch AI Observability data', err);
        setData(null);
        setSelectedTreeRoot(null);
        setSelectedUser(null);
      })
      .finally(() => setLoading(false));
  }, [timeRangeFrom, timeRangeTo]);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper to build list of rows based on tree structure & expand state
  const flatRows = useMemo(() => {
    const rootNode = selectedTreeRoot || data?.tree;
    if (!rootNode) return [];

    const getFlatRows = (node: any, depth = 0): any[] => {
      const rows = [];
      const hasChildren = node.children && node.children.length > 0;
      rows.push({
        node,
        depth,
        isLeaf: !hasChildren,
        hasChildren,
      });

      if (hasChildren && expanded[node.userId]) {
        node.children.forEach((child: any) => {
          rows.push(...getFlatRows(child, depth + 1));
        });
      }
      return rows;
    };

    return getFlatRows(rootNode, 0);
  }, [data, selectedTreeRoot, expanded]);

  // Helper to filter nodes if search is active
  const filteredUsers = useMemo(() => {
    const rootNode = selectedTreeRoot || data?.tree;
    if (!rootNode) return [];
    if (!searchQuery) return flatRows;

    const query = searchQuery.toLowerCase();
    const matches: any[] = [];

    const searchTree = (node: any, currentDepth = 0) => {
      const isMatch =
        node.userId.toLowerCase().includes(query) ||
        node.name.toLowerCase().includes(query) ||
        node.role.toLowerCase().includes(query);

      if (isMatch) {
        matches.push({
          node,
          depth: currentDepth,
          isLeaf: !node.children || node.children.length === 0,
          hasChildren: node.children && node.children.length > 0,
        });
      }

      if (node.children) {
        node.children.forEach((c: any) => searchTree(c, currentDepth + 1));
      }
    };

    searchTree(rootNode, 0);
    return matches;
  }, [data, selectedTreeRoot, searchQuery, flatRows]);

  const handleRowClick = (userNode: any) => {
    setSelectedUser(userNode);
    onOpen();
  };

  const renderHierarchyTable = () => {
    return (
      <Card bg={bg} border="1px solid" borderColor="purple.300" shadow="md">
        <CardBody>
          <HStack mb={4} justify="space-between" align="center" flexWrap="wrap" gap={3}>
            <VStack align="start" spacing={0}>
              <HStack>
                <Heading size="sm">User LLM Observability Hierarchy</Heading>
                {selectedTreeRoot && selectedTreeRoot.userId !== 'soumit.nandi' && (
                  <Badge colorScheme="purple">Scoped to {selectedTreeRoot.name}</Badge>
                )}
              </HStack>
              <Text fontSize="xs" color={muted}>
                {selectedTreeRoot && selectedTreeRoot.userId !== 'soumit.nandi' 
                  ? `Showing data under selected scope: ${selectedTreeRoot.name} (${selectedTreeRoot.role})`
                  : 'Showing entire organization hierarchy'
                }
              </Text>
            </VStack>
            <HStack spacing={2}>
              <InputGroup size="sm" maxW="300px">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search user ID, name, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  borderRadius="md"
                />
              </InputGroup>
            </HStack>
          </HStack>

          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>User / Team / Role</Th>
                  <Th>Direct Reports</Th>
                  <Th>Models Used</Th>
                  <Th>Workflows & Agents</Th>
                  <Th isNumeric>API Calls</Th>
                  <Th isNumeric>Input Tokens</Th>
                  <Th isNumeric>Output Tokens</Th>
                  <Th isNumeric>Avg Latency</Th>
                  <Th isNumeric>Total Cost</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredUsers.length === 0 ? (
                  <Tr>
                    <Td colSpan={9} py={8} textAlign="center">
                      <Text color={muted}>No matching users found.</Text>
                    </Td>
                  </Tr>
                ) : (
                  filteredUsers.map(({ node, depth, hasChildren }) => {
                    const isExpanded = expanded[node.userId];
                    const reportCount = node.children ? node.children.length : 0;
                    
                    const modelsStr = node.modelUsage.map((mu: any) => mu.model).join(', ');

                    return (
                      <Tr
                        key={node.userId}
                        onClick={() => handleRowClick(node)}
                        cursor="pointer"
                        _hover={{ bg: hoverBg }}
                        transition="background 0.2s"
                      >
                        <Td py={3}>
                          <Flex align="center" style={{ paddingLeft: `${depth * 20}px` }}>
                            {hasChildren ? (
                              <IconButton
                                aria-label="Toggle children"
                                icon={isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                                size="xs"
                                variant="ghost"
                                mr={1}
                                onClick={(e) => toggleExpand(node.userId, e)}
                              />
                            ) : (
                              <Box w="24px" mr={1} />
                            )}
                            <Box>
                              <Text fontWeight="semibold" fontSize="sm">
                                {node.name}
                              </Text>
                              <Text fontSize="xs" color={muted}>
                                {node.userId} • {node.role}
                              </Text>
                            </Box>
                          </Flex>
                        </Td>

                        <Td>
                          {hasChildren ? (
                            <Badge colorScheme="purple" variant="subtle">
                              {reportCount} direct {node.userId === 'soumit.nandi' ? '• 15 indirect' : ''}
                            </Badge>
                          ) : (
                            <Text color="gray.400" fontSize="xs">—</Text>
                          )}
                        </Td>

                        <Td maxW="200px" isTruncated>
                          <ChakraTooltip label={modelsStr} hasArrow placement="top">
                            <Box>
                              {node.modelUsage.slice(0, 2).map((mu: any) => (
                                <Badge key={mu.model} size="sm" colorScheme="blue" mr={1} variant="outline">
                                  {mu.model}
                                </Badge>
                              ))}
                              {node.modelUsage.length > 2 && (
                                <Badge size="sm" colorScheme="gray" variant="outline">
                                  +{node.modelUsage.length - 2} more
                                </Badge>
                              )}
                            </Box>
                          </ChakraTooltip>
                        </Td>

                        <Td maxW="220px" isTruncated>
                          <ChakraTooltip label={`Workflows: ${node.workflows?.join(', ') || ''} | Agents: ${node.agents?.join(', ') || ''}`} hasArrow placement="top">
                            <Box>
                              {node.workflows && node.workflows.slice(0, 1).map((w: any) => (
                                <Badge key={w} size="sm" colorScheme="purple" mr={1} variant="solid">
                                  {w}
                                </Badge>
                              ))}
                              {node.agents && node.agents.slice(0, 1).map((a: any) => (
                                <Badge key={a} size="sm" colorScheme="teal" mr={1} variant="subtle">
                                  {a.split(' ')[0]}
                                </Badge>
                              ))}
                              {((node.workflows?.length || 0) + (node.agents?.length || 0) > 2) && (
                                <Badge size="sm" colorScheme="gray" variant="outline">
                                  +{((node.workflows?.length || 0) + (node.agents?.length || 0) - 2)} more
                                </Badge>
                              )}
                            </Box>
                          </ChakraTooltip>
                        </Td>

                        <Td isNumeric>{node.calls.toLocaleString()}</Td>

                        <Td isNumeric>{(node.inputTokens / 1e3).toFixed(1)}k</Td>

                        <Td isNumeric>{(node.outputTokens / 1e3).toFixed(1)}k</Td>

                        <Td isNumeric>
                          <Text fontWeight="medium" color={node.avgLatencyMs > 150 ? 'orange.500' : 'inherit'}>
                            {node.avgLatencyMs} ms
                          </Text>
                        </Td>

                        <Td isNumeric fontWeight="bold" color="purple.500">
                          ${node.totalCost.toFixed(2)}
                        </Td>
                      </Tr>
                    );
                  })
                )}
              </Tbody>
            </Table>
          </Box>
        </CardBody>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box py={12} display="flex" justifyContent="center" alignItems="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" thickness="4px" />
          <Text color={muted} fontSize="lg">Loading AI Observability Metrics...</Text>
        </VStack>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box p={6}>
        <Text color="red.500" fontSize="lg">Error: Failed to load observability data. Please check connection.</Text>
      </Box>
    );
  }

  const { summary, byDepartment, byModel } = data;

  return (
    <Box pb={8}>
      <AIPageHeader
        title="AI User Observability"
        subtitle="Granular visibility into LLM usage, prompt/completion tokens, latencies, and costs for individual team members."
        from={timeRangeFrom}
        to={timeRangeTo}
        badge="Active Observability Pipeline"
      />

      {/* KPI Cards Row */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4} mb={6}>
        <KpiStatCard
          label="Total Cost"
          tip="Sum of all API token costs rolled up to root."
          value={formatMoneyK(summary.totalCost, 2)}
          helpText="Calculated from prompt/completion weights"
        />
        <KpiStatCard
          label="Tokens Processed"
          tip="Total volume of prompt and completion tokens."
          value={`${(summary.totalTokens / 1e6).toFixed(2)}M`}
          helpText={
            <Text fontSize="xs">
              In: {((summary.inputTokens) / 1e6).toFixed(2)}M | Out: {((summary.outputTokens) / 1e6).toFixed(2)}M
            </Text>
          }
        />
        <KpiStatCard
          label="Average Latency"
          tip="Weighted average latency of LLM responses across all users."
          value={`${summary.avgLatencyMs.toLocaleString()} ms`}
          helpText="Based on active model base latencies"
        />
        <KpiStatCard
          label="API Calls / Requests"
          tip="Total API transactions completed by all users in hierarchy."
          value={summary.totalCalls.toLocaleString()}
          helpText="Across 34 monitored users"
        />
      </SimpleGrid>

      {/* Charts Section */}
      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6} mb={6}>
        <ChartCard title="LLM Cost by Department / BU">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byDepartment} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={borderColor} />
              <XAxis dataKey="name" stroke={muted} fontSize={12} tick={{ fill: 'white' }} />
              <YAxis stroke={muted} fontSize={12} tick={{ fill: 'white' }} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: tooltipBg, borderColor: borderColor, borderRadius: '6px' }}
                itemStyle={{ color: tooltipColor }}
                labelStyle={{ fontWeight: 'bold', color: tooltipColor }}
                formatter={(value: any) => [`$${parseFloat(value).toFixed(2)}`, 'Total Cost']}
              />
              <Bar dataKey="cost" fill="#8884d8" radius={[4, 4, 0, 0]} activeBar={false}>
                {byDepartment.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Model Cost Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={byModel}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="cost"
              >
                {byModel.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: tooltipBg, borderColor: borderColor, borderRadius: '6px' }}
                itemStyle={{ color: tooltipColor }}
                labelStyle={{ fontWeight: 'bold', color: tooltipColor }}
                formatter={(value: any, name: any) => [`$${parseFloat(value).toFixed(2)}`, name]}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </Grid>

      {/* Interactive Org Tree Section */}
      <Card bg={bg} border="1px solid" borderColor={borderColor} shadow="sm" mb={6}>
        <CardBody>
          <Heading size="md" mb={2} color="purple.500">Interactive Organization Hierarchy</Heading>
          <Text fontSize="sm" color={muted} mb={6}>
            Click on any team member in the chart below to scope the detailed observability statistics to their sub-tree. Click again to close the table.
          </Text>
          
          <VStack spacing={0} align="center" w="100%">
            {/* Level 1: VP */}
            {data?.tree && (
              <Flex direction="column" align="center" position="relative" w="100%" py={2}>
                <ChakraTooltip
                  hasArrow
                  label={
                    <VStack align="start" spacing={1} p={1}>
                      <Text fontWeight="bold">{data.tree.name}</Text>
                      <Text fontSize="xs" color="gray.300">{data.tree.role}</Text>
                      <Box h="1px" w="100%" bg="whiteAlpha.400" my={1} />
                      <Text fontSize="xs">Org Spend: ${data.tree.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
                      <Text fontSize="xs">API Calls: {data.tree.calls.toLocaleString()}</Text>
                      <Text fontSize="xs">Total Reports: 33</Text>
                    </VStack>
                  }
                  bg="gray.800"
                  color="white"
                  borderRadius="md"
                  p={3}
                  placement="top"
                >
                  <Box
                    bg={selectedTreeRoot?.userId === data.tree.userId ? 'purple.600' : bg}
                    color={selectedTreeRoot?.userId === data.tree.userId ? 'white' : 'inherit'}
                    border="2px solid"
                    borderColor={selectedTreeRoot?.userId === data.tree.userId ? 'purple.500' : borderColor}
                    borderRadius="lg"
                    px={6}
                    py={3}
                    shadow={selectedTreeRoot?.userId === data.tree.userId ? 'lg' : 'sm'}
                    cursor="pointer"
                    onClick={() => {
                      if (selectedTreeRoot?.userId === data.tree.userId) {
                        setSelectedTreeRoot(null);
                      } else {
                        setSelectedTreeRoot(data.tree);
                      }
                    }}
                    _hover={{ transform: 'translateY(-2px)', shadow: 'md', borderColor: 'purple.400' }}
                    transition="all 0.2s"
                    minW="240px"
                    textAlign="center"
                    position="relative"
                    zIndex={1}
                  >
                    <Badge
                      position="absolute"
                      top="-10px"
                      left="50%"
                      transform="translateX(-50%)"
                      colorScheme="purple"
                      variant="solid"
                      fontSize="8px"
                      borderRadius="full"
                      px={2}
                    >
                      CTO / ROOT
                    </Badge>
                    <Text fontWeight="bold" fontSize="md">{data.tree.name}</Text>
                  </Box>
                </ChakraTooltip>
              </Flex>
            )}

            {/* Connecting lines and Level 2 & 3 Grid */}
            {data?.tree?.children && (
              <Flex direction="column" align="center" w="100%">
                <Box w="2px" h="20px" bg="purple.300" />
                <Box w="100%" position="relative" mb={4}>
                  <Box h="2px" bg="purple.300" position="absolute" top="0" left="16%" right="16%" />
                </Box>
                
                <Grid templateColumns={{ base: '1fr', md: '1fr 1fr 1fr' }} gap={6} w="100%" px={4}>
                  {data.tree.children.map((vp: any) => {
                    const isSelected = selectedTreeRoot?.userId === vp.userId;
                    const deptCost = vp.totalCost;
                    
                    let badgeScheme = 'blue';
                    if (vp.userId === 'vp.engineering') badgeScheme = 'purple';
                    if (vp.userId === 'vp.enterprise') badgeScheme = 'green';
                    if (vp.userId === 'vp.infra') badgeScheme = 'teal';

                    let cardBg = bg;
                    let textColor = 'inherit';

                    if (isSelected) {
                      cardBg = 'purple.600';
                      textColor = 'white';
                    }

                    return (
                      <VStack key={vp.userId} spacing={4} align="center" position="relative" w="100%">
                        {/* Vertical Connector Line behind Reports */}
                        <Box w="2px" bg="purple.200" position="absolute" top="0" bottom="20px" zIndex={0} />

                        {/* VP card */}
                        <VStack spacing={0} w="100%" align="center" zIndex={1}>
                          <Box w="2px" h="16px" bg="purple.300" />
                          <ChakraTooltip
                            hasArrow
                            label={
                              <VStack align="start" spacing={1} p={1}>
                                <Text fontWeight="bold">{vp.name}</Text>
                                <Text fontSize="xs" color="gray.300">{vp.role}</Text>
                                <Box h="1px" w="100%" bg="whiteAlpha.400" my={1} />
                                <Text fontSize="xs">VP Spend: ${deptCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
                                <Text fontSize="xs">API Calls: {vp.calls.toLocaleString()}</Text>
                              </VStack>
                            }
                            bg="gray.800"
                            color="white"
                            borderRadius="md"
                            p={3}
                            placement="top"
                          >
                            <Box
                              bg={cardBg}
                              color={textColor}
                              border="2px solid"
                              borderColor={isSelected ? 'purple.500' : borderColor}
                              borderRadius="lg"
                              p={4}
                              shadow="sm"
                              cursor="pointer"
                              onClick={() => {
                                if (selectedTreeRoot?.userId === vp.userId) {
                                  setSelectedTreeRoot(null);
                                } else {
                                  setSelectedTreeRoot(vp);
                                }
                              }}
                              _hover={{ transform: 'translateY(-2px)', shadow: 'md', borderColor: 'purple.400' }}
                              transition="all 0.2s"
                              w="220px"
                              textAlign="center"
                              position="relative"
                            >
                              <Badge
                                position="absolute"
                                top="-10px"
                                left="50%"
                                transform="translateX(-50%)"
                                colorScheme={badgeScheme}
                                variant="solid"
                                fontSize="8px"
                                borderRadius="full"
                                px={2}
                              >
                                VP
                              </Badge>
                              <Text fontWeight="bold" fontSize="sm">{vp.name}</Text>
                            </Box>
                          </ChakraTooltip>
                        </VStack>

                        {/* Director card */}
                        {vp.children && vp.children[0] && (() => {
                          const director = vp.children[0];
                          const isDirectorSelected = selectedTreeRoot?.userId === director.userId;
                          let dirCardBg = bg;
                          let dirTextColor = 'inherit';
                          if (isDirectorSelected) {
                            dirCardBg = 'purple.600';
                            dirTextColor = 'white';
                          }
                          return (
                            <VStack spacing={0} w="100%" align="center" zIndex={1}>
                              <Box w="2px" h="16px" bg="purple.300" />
                              <ChakraTooltip
                                hasArrow
                                label={
                                  <VStack align="start" spacing={1} p={1}>
                                    <Text fontWeight="bold">{director.name}</Text>
                                    <Text fontSize="xs" color="gray.300">{director.role}</Text>
                                    <Box h="1px" w="100%" bg="whiteAlpha.400" my={1} />
                                    <Text fontSize="xs">Dept Spend: ${director.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
                                    <Text fontSize="xs">API Calls: {director.calls.toLocaleString()}</Text>
                                    <Text fontSize="xs">Direct Reports: {director.children?.length || 0}</Text>
                                  </VStack>
                                }
                                bg="gray.800"
                                color="white"
                                borderRadius="md"
                                p={3}
                                placement="top"
                              >
                                <Box
                                  bg={dirCardBg}
                                  color={dirTextColor}
                                  border="2px solid"
                                  borderColor={isDirectorSelected ? 'purple.500' : borderColor}
                                  borderRadius="lg"
                                  p={4}
                                  shadow="sm"
                                  cursor="pointer"
                                  onClick={() => {
                                    if (selectedTreeRoot?.userId === director.userId) {
                                      setSelectedTreeRoot(null);
                                    } else {
                                      setSelectedTreeRoot(director);
                                    }
                                  }}
                                  _hover={{ transform: 'translateY(-2px)', shadow: 'md', borderColor: 'purple.400' }}
                                  transition="all 0.2s"
                                  w="220px"
                                  textAlign="center"
                                  position="relative"
                                >
                                  <Badge
                                    position="absolute"
                                    top="-10px"
                                    left="50%"
                                    transform="translateX(-50%)"
                                    colorScheme={badgeScheme}
                                    variant="solid"
                                    fontSize="8px"
                                    borderRadius="full"
                                    px={2}
                                  >
                                    DIRECTOR
                                  </Badge>
                                  <Text fontWeight="bold" fontSize="sm">{director.name}</Text>
                                </Box>
                              </ChakraTooltip>
                            </VStack>
                          );
                        })()}

                        {/* Reports List */}
                        {vp.children && vp.children[0] && (
                          <VStack spacing={2} w="100%" zIndex={1} pt={2}>
                            {(vp.children[0].children || []).map((report: any) => {
                              const isReportSelected = selectedTreeRoot?.userId === report.userId;
                              
                              return (
                                <ChakraTooltip
                                  key={report.userId}
                                  hasArrow
                                  label={
                                    <VStack align="start" spacing={1} p={1}>
                                      <Text fontWeight="bold">{report.name}</Text>
                                      <Text fontSize="xs" color="gray.300">{report.role}</Text>
                                      <Box h="1px" w="100%" bg="whiteAlpha.400" my={1} />
                                      <Text fontSize="xs">LLM Spend: ${report.totalCost.toFixed(2)}</Text>
                                      <Text fontSize="xs">API Calls: {report.calls.toLocaleString()}</Text>
                                      <Text fontSize="xs">Avg Latency: {report.avgLatencyMs} ms</Text>
                                    </VStack>
                                  }
                                  bg="gray.800"
                                  color="white"
                                  borderRadius="md"
                                  p={3}
                                  placement="right"
                                >
                                  <Box
                                    bg={isReportSelected ? 'purple.600' : bg}
                                    color={isReportSelected ? 'white' : 'inherit'}
                                    border="1px solid"
                                    borderColor={isReportSelected ? 'purple.500' : borderColor}
                                    borderRadius="md"
                                    px={4}
                                    py={2}
                                    shadow="xs"
                                    cursor="pointer"
                                    onClick={() => {
                                      if (selectedTreeRoot?.userId === report.userId) {
                                        setSelectedTreeRoot(null);
                                      } else {
                                        setSelectedTreeRoot(report);
                                      }
                                    }}
                                    _hover={{ bg: isReportSelected ? 'purple.700' : hoverBg, borderColor: 'purple.400' }}
                                    transition="all 0.2s"
                                    w="180px"
                                    textAlign="center"
                                  >
                                    <Text fontSize="xs" fontWeight="semibold" isTruncated>
                                      {report.name}
                                    </Text>
                                    <Badge variant="outline" colorScheme="gray" fontSize="7px" mt={1}>ASSOCIATE</Badge>
                                  </Box>
                                </ChakraTooltip>
                              );
                            })}
                          </VStack>
                        )}
                      </VStack>
                    );
                  })}
                </Grid>
              </Flex>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Render table below the entire tree if a node is selected */}
      {selectedTreeRoot && (
        <Box w="100%" mb={6}>
          {renderHierarchyTable()}
        </Box>
      )}

      {/* User Detail Side Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="lg">
        <DrawerOverlay />
        <DrawerContent bg={bg}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" borderColor={borderColor}>
            <Heading size="md">User LLM Usage Profile</Heading>
            {selectedUser && (
              <Text fontSize="sm" color={muted} fontWeight="normal" mt={1}>
                Detailed observability metrics for {selectedUser.name}
              </Text>
            )}
          </DrawerHeader>

          <DrawerBody py={6}>
            {selectedUser && (
              <VStack spacing={6} align="stretch">
                <Box p={4} borderRadius="md" bg={useColorModeValue('gray.50', 'gray.700')}>
                  <Heading size="xs" textTransform="uppercase" color={muted} mb={2}>User Profile</Heading>
                  <Text fontWeight="bold" fontSize="lg">{selectedUser.name}</Text>
                  <Text fontSize="sm">{selectedUser.role}</Text>
                  <Text fontSize="xs" color={muted} mt={1}>ID: {selectedUser.userId}</Text>
                  {selectedUser.parentId && (
                    <Text fontSize="xs" color={muted}>Reports To: {selectedUser.parentId}</Text>
                  )}
                </Box>

                <SimpleGrid columns={3} spacing={3}>
                  <Card size="sm" variant="outline">
                    <CardBody py={3}>
                      <Stat>
                        <StatLabel fontSize="xs">Period Cost</StatLabel>
                        <StatNumber fontSize="md" color="purple.500">${selectedUser.totalCost.toFixed(2)}</StatNumber>
                      </Stat>
                    </CardBody>
                  </Card>
                  <Card size="sm" variant="outline">
                    <CardBody py={3}>
                      <Stat>
                        <StatLabel fontSize="xs">API Requests</StatLabel>
                        <StatNumber fontSize="md">{selectedUser.calls.toLocaleString()}</StatNumber>
                      </Stat>
                    </CardBody>
                  </Card>
                  <Card size="sm" variant="outline">
                    <CardBody py={3}>
                      <Stat>
                        <StatLabel fontSize="xs">Avg Latency</StatLabel>
                        <StatNumber fontSize="md">{selectedUser.avgLatencyMs} ms</StatNumber>
                      </Stat>
                    </CardBody>
                  </Card>
                </SimpleGrid>

                <Box>
                  <Heading size="xs" textTransform="uppercase" color={muted} mb={3}>Model Cost Allocation</Heading>
                  <Box h="200px" border="1px solid" borderColor={borderColor} borderRadius="md" p={2}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={selectedUser.modelUsage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={borderColor} />
                        <XAxis dataKey="model" stroke={muted} fontSize={10} tick={{ fill: 'white' }} />
                        <YAxis stroke={muted} fontSize={10} tick={{ fill: 'white' }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: tooltipBg, borderColor: borderColor, borderRadius: '6px' }}
                          itemStyle={{ color: tooltipColor }}
                          labelStyle={{ fontWeight: 'bold', color: tooltipColor }}
                          formatter={(value: any) => [`$${parseFloat(value).toFixed(2)}`, 'Cost']}
                        />
                        <Bar dataKey="cost" fill="#82ca9d" radius={[4, 4, 0, 0]} activeBar={false} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>

                <Box>
                  <Heading size="xs" textTransform="uppercase" color={muted} mb={3}>Model Breakdown</Heading>
                  <Box overflowX="auto" border="1px solid" borderColor={borderColor} borderRadius="md">
                    <Table size="sm" variant="simple">
                      <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
                        <Tr>
                          <Th fontSize="10px">Model</Th>
                          <Th fontSize="10px" isNumeric>Calls</Th>
                          <Th fontSize="10px" isNumeric>Tokens (In/Out)</Th>
                          <Th fontSize="10px" isNumeric>Latency</Th>
                          <Th fontSize="10px" isNumeric>Cost</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {selectedUser.modelUsage.map((mu: any) => (
                          <Tr key={mu.model}>
                            <Td py={2}>
                              <Text fontWeight="semibold" fontSize="xs">{mu.model}</Text>
                              <Text fontSize="10px" color={muted}>{mu.provider}</Text>
                            </Td>
                            <Td py={2} isNumeric fontSize="xs">{mu.calls.toLocaleString()}</Td>
                            <Td py={2} isNumeric fontSize="xs">
                              {(mu.inputTokens / 1e3).toFixed(0)}k / {(mu.outputTokens / 1e3).toFixed(0)}k
                            </Td>
                            <Td py={2} isNumeric fontSize="xs">{mu.latencyMs} ms</Td>
                            <Td py={2} isNumeric fontSize="xs" fontWeight="bold" color="purple.500">
                              ${mu.cost.toFixed(2)}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </Box>

                <Box>
                  <Heading size="xs" textTransform="uppercase" color={muted} mb={3}>Individual Call History</Heading>
                  <Box overflowX="auto" border="1px solid" borderColor={borderColor} borderRadius="md" maxH="300px" overflowY="auto">
                    <Table size="xs" variant="simple">
                      <Thead bg={useColorModeValue('gray.50', 'gray.700')} position="sticky" top={0} zIndex={1}>
                        <Tr>
                          <Th fontSize="9px">Timestamp</Th>
                          <Th fontSize="9px">Workflow / Agent</Th>
                          <Th fontSize="9px">Model</Th>
                          <Th fontSize="9px" isNumeric>Tokens (In/Out)</Th>
                          <Th fontSize="9px" isNumeric>Latency</Th>
                          <Th fontSize="9px" isNumeric>Cost</Th>
                          <Th fontSize="9px" textAlign="center">Status</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {selectedUser.individualCalls && selectedUser.individualCalls.map((call: any, idx: number) => {
                          const timeStr = new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                          const dateStr = new Date(call.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
                          return (
                            <Tr key={idx}>
                              <Td py={2} fontSize="11px">
                                <Text fontWeight="medium">{dateStr}</Text>
                                <Text fontSize="9px" color={muted}>{timeStr}</Text>
                              </Td>
                              <Td py={2} fontSize="11px">
                                <Text fontWeight="semibold">{call.workflow}</Text>
                                <Text fontSize="9px" color={muted}>{call.agent}</Text>
                              </Td>
                              <Td py={2} fontSize="11px">
                                <Text fontWeight="semibold">{call.model}</Text>
                                <Text fontSize="9px" color={muted}>{call.provider}</Text>
                              </Td>
                              <Td py={2} isNumeric fontSize="11px">
                                {call.inputTokens.toLocaleString()} / {call.outputTokens.toLocaleString()}
                              </Td>
                              <Td py={2} isNumeric fontSize="11px">{call.latencyMs} ms</Td>
                              <Td py={2} isNumeric fontSize="11px" fontWeight="medium" color="purple.500">
                                ${call.cost.toFixed(4)}
                              </Td>
                              <Td py={2} textAlign="center">
                                <Badge colorScheme={call.status === 'success' ? 'green' : 'red'} size="xs" variant="subtle">
                                  {call.status === 'success' ? 'Success' : 'Error'}
                                </Badge>
                              </Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </Box>
                </Box>
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
