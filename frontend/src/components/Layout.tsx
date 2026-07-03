import { Box, Flex, Heading, Link, Spacer, HStack, useColorModeValue, Text, Button, VStack, Menu, MenuButton, MenuList, MenuItem, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useDisclosure, Input, FormControl, FormLabel } from '@chakra-ui/react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFinOpsOptional } from '../contexts/FinOpsContext';
import { useRoleAccess } from '../contexts/RoleContext';
import { Logo } from './Logo';
import { ScrollToTop } from './ScrollToTop';
import { ColorModeToggle } from './ColorModeToggle';
import { ViewAsRoleMenu } from './ViewAsRoleMenu';
import { RoleRouteGuard } from './RoleRouteGuard';
import { ReadOnlyBanner } from './ReadOnlyBanner';

function getIsActive(pathname: string, to: string): boolean {
  if (to === '/') return pathname === '/';
  if (to === '/ai/home') return pathname.startsWith('/ai');
  if (to === '/admin/agents') return pathname.startsWith('/admin');
  if (to === '/software/inventory') return pathname.startsWith('/software');
  if (to === '/data-ingestion') return pathname.startsWith('/data-ingestion');
  return pathname.startsWith(to);
}

const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = getIsActive(location.pathname, to);
  const activeColor = useColorModeValue('blue.500', 'blue.300');
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  return (
    <Link
      as={RouterLink}
      to={to}
      px={3}
      py={2}
      rounded="md"
      fontWeight={isActive ? 'bold' : 'normal'}
      color={isActive ? activeColor : 'inherit'}
      bg={isActive ? activeBg : 'transparent'}
      _hover={{ bg: hoverBg }}
    >
      {children}
    </Link>
  );
};

const TIME_RANGE_LABELS: Record<string, string> = { '7d': 'Last 7d', '30d': 'Last 30d', '90d': 'Last 90d', custom: 'Custom' };

function toYYYYMMDD(d: Date): string {
  return d.toISOString().split('T')[0];
}

function TimeRangeSelector({ finOps }: { finOps: NonNullable<ReturnType<typeof useFinOpsOptional>> }) {
  const [customFromInput, setCustomFromInput] = useState('');
  const [customToInput, setCustomToInput] = useState('');
  const { isOpen: isCustomOpen, onOpen: onCustomOpen, onClose: onCustomClose } = useDisclosure();

  const buttonLabel =
    finOps.timeRange === 'custom' && finOps.customFrom && finOps.customTo
      ? `Custom (${finOps.customFrom} â€“ ${finOps.customTo})`
      : TIME_RANGE_LABELS[finOps.timeRange] || 'Last 30d';

  const handleOpenCustom = () => {
    setCustomFromInput(finOps.customFrom || toYYYYMMDD(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)));
    setCustomToInput(finOps.customTo || toYYYYMMDD(new Date()));
    onCustomOpen();
  };

  const handleApplyCustom = () => {
    const from = customFromInput || toYYYYMMDD(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const to = customToInput || toYYYYMMDD(new Date());
    finOps.setCustomRange(from, to);
    onCustomClose();
  };

  return (
    <>
      <Menu>
        <MenuButton as={Button} size="sm" rightIcon={<ChevronDownIcon />} variant="outline">
          {buttonLabel}
        </MenuButton>
        <MenuList>
          {(['7d', '30d', '90d'] as const).map((key) => (
            <MenuItem key={key} onClick={() => finOps.setTimeRange(key)}>
              {TIME_RANGE_LABELS[key]}
            </MenuItem>
          ))}
          <MenuItem onClick={handleOpenCustom}>Custom...</MenuItem>
        </MenuList>
      </Menu>
      <Modal isOpen={isCustomOpen} onClose={onCustomClose} size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Custom date range</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel fontSize="sm">From</FormLabel>
              <Input
                type="date"
                size="sm"
                value={customFromInput}
                onChange={(e) => setCustomFromInput(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">To</FormLabel>
              <Input
                type="date"
                size="sm"
                value={customToInput}
                onChange={(e) => setCustomToInput(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button size="sm" variant="ghost" mr={2} onClick={onCustomClose}>Cancel</Button>
            <Button size="sm" colorScheme="blue" onClick={handleApplyCustom}>Apply</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const finOps = useFinOpsOptional();
  const { topNavItems } = useRoleAccess();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <ScrollToTop />
      {/* Fixed Header and Navigation */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={1000}
        borderBottom="1px"
        borderColor={borderColor}
        bg={bg}
        boxShadow="sm"
      >
        <VStack align="stretch" spacing={0}>
          {/* First row: Title and user controls */}
          <Flex px={6} py={4} align="center">
            <HStack spacing={3}>
              <Logo size={36} />
              <Heading size="lg" color="blue.600">Agentic FinOps Platform</Heading>
            </HStack>
            <Spacer />
            <HStack spacing={3}>
              <ViewAsRoleMenu />
              <ColorModeToggle />
              <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')}>
                Logged in as: <Text as="span" fontWeight="semibold">{user?.displayName || user?.username || 'User'}</Text>
              </Text>
              <Button
                size="sm"
                colorScheme="blue"
                variant="outline"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </HStack>
          </Flex>
          
          {/* Top navigation â€” primary destinations + period (right) */}
          <Flex px={6} pb={4} align="center" gap={2}>
            <Flex align="center" gap={1} flexWrap="wrap" rowGap={1} flex={1} minW={0}>
              {topNavItems.map((item) => (
                <NavLink key={item.to} to={item.to}>
                  {item.label}
                </NavLink>
              ))}
            </Flex>
            {finOps && (
              <Box flexShrink={0}>
                <TimeRangeSelector finOps={finOps} />
              </Box>
            )}
          </Flex>
        </VStack>
      </Box>
      
      {/* Content area with top padding to account for fixed header */}
      <Box pt={{ base: '168px', md: '156px' }} px={6} pb={8}>
        <RoleRouteGuard />
        <ReadOnlyBanner />
        {children}
      </Box>
    </Box>
  );
}


