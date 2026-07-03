import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Card,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Input,
  HStack,
  useColorModeValue,
  Text,
  Code,
  VStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { useAdminScope, ScopeTag } from '../contexts/AdminScopeContext';
import { getAuditScope, matchesScopeFilter } from './admin/adminScope';

import { API_V1 as API_URL } from '../config';

export default function Audit() {
  const { scopeFilter } = useAdminScope();
  const [auditTrail, setAuditTrail] = useState<any[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [agentFilter, setAgentFilter] = useState<string>('');
  const bg = useColorModeValue('white', 'gray.800');
  const rowHover = useColorModeValue('gray.50', 'gray.700');
  const rowSelected = useColorModeValue('blue.50', 'blue.900');

  useEffect(() => {
    const params = new URLSearchParams({ limit: '100' });
    if (agentFilter) params.set('agent', agentFilter);
    fetch(`${API_URL}/audit?${params}`)
      .then((r) => r.json())
      .then((data) => setAuditTrail(data.data || []));
  }, [agentFilter]);

  const filteredTrail = auditTrail.filter((entry) =>
    matchesScopeFilter(getAuditScope(entry), scopeFilter),
  );

  const getActionColor = (action: string) => {
    if (action.includes('tagging') || action.includes('gpu')) return 'blue';
    if (action.includes('cleanup') || action.includes('token')) return 'orange';
    if (action.includes('recommendation') || action.includes('tiering') || action.includes('caching')) return 'green';
    if (action.includes('alert')) return 'red';
    if (action.includes('model') || action.includes('prompt')) return 'purple';
    return 'gray';
  };

  return (
    <Box>
      <Heading size="lg" mb={2}>Audit & Explainability Explorer</Heading>
      <Text fontSize="sm" color="gray.500" mb={6}>
        Immutable audit trail for Cloud FinOps, AI FinOps, and shared platform agents. Use the domain filter above to narrow results.
      </Text>

      <Card bg={bg} mb={6}>
        <CardBody>
          <HStack mb={4} flexWrap="wrap">
            <Input
              placeholder="Filter by agent name..."
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              maxW="300px"
            />
            <Text fontSize="sm" color="gray.500">
              {filteredTrail.length} entries
            </Text>
          </HStack>

          <Box overflowX="auto">
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th>Timestamp</Th>
                  <Th>Scope</Th>
                  <Th>Agent</Th>
                  <Th>Action</Th>
                  <Th>Decision</Th>
                  <Th>Confidence</Th>
                  <Th>Hash</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredTrail.map((entry) => (
                  <>
                    <Tr
                      key={entry.id}
                      cursor="pointer"
                      bg={selectedEntry?.id === entry.id ? rowSelected : 'transparent'}
                      _hover={{ bg: rowHover }}
                      onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
                    >
                      <Td>{new Date(entry.timestamp).toLocaleString()}</Td>
                      <Td><ScopeTag domain={getAuditScope(entry)} /></Td>
                      <Td fontWeight="semibold">{entry.agent}</Td>
                      <Td>
                        <Badge colorScheme={getActionColor(entry.action)}>
                          {entry.action.replace(/_/g, ' ')}
                        </Badge>
                      </Td>
                      <Td maxW="300px" isTruncated>{entry.decision}</Td>
                      <Td isNumeric>{(entry.confidence * 100).toFixed(0)}%</Td>
                      <Td>
                        <Code fontSize="xs">{entry.hash.substring(0, 16)}...</Code>
                      </Td>
                    </Tr>
                    {selectedEntry?.id === entry.id && (
                      <Tr key={`${entry.id}-details`}>
                        <Td colSpan={7} p={0}>
                          <Accordion allowToggle defaultIndex={[0]}>
                            <AccordionItem border="none">
                              <AccordionButton px={4} py={2}>
                                <Box flex="1" textAlign="left" fontWeight="semibold">
                                  Audit Details
                                </Box>
                                <AccordionIcon />
                              </AccordionButton>
                              <AccordionPanel pb={4} px={4}>
                                <VStack align="stretch" spacing={3}>
                                  <Text fontSize="sm"><strong>Decision:</strong> {entry.decision}</Text>
                                  {entry.audit_bundle && (
                                    <Box>
                                      <Text fontSize="sm" fontWeight="semibold" mb={1}>Reasoning Steps</Text>
                                      {entry.audit_bundle.reasoning_steps?.map((step: string, i: number) => (
                                        <Text key={i} fontSize="sm" color="gray.600">• {step}</Text>
                                      ))}
                                    </Box>
                                  )}
                                </VStack>
                              </AccordionPanel>
                            </AccordionItem>
                          </Accordion>
                        </Td>
                      </Tr>
                    )}
                  </>
                ))}
              </Tbody>
            </Table>
          </Box>
        </CardBody>
      </Card>
    </Box>
  );
}
