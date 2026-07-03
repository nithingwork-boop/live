import { Outlet, useLocation } from 'react-router-dom';
import { Box, Heading, Text, useColorModeValue } from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import { useMemo } from 'react';
import { ScopePageLayout, ScopeSidebar, type ScopeNavItem } from '../components/ScopeSidebar';
import { useRoleAccess } from '../contexts/RoleContext';

const NAV_ITEMS: ScopeNavItem[] = [
  { path: '/data-ingestion/ai', label: 'AI Integrations', icon: StarIcon },
];

export default function IntegrationsLayout() {
  const location = useLocation();
  const muted = useColorModeValue('gray.600', 'gray.400');
  const { filterScopeNavItems } = useRoleAccess();
  const navItems = useMemo(() => filterScopeNavItems(NAV_ITEMS), [filterScopeNavItems]);

  return (
    <ScopePageLayout
      sidebar={<ScopeSidebar items={navItems} accentColor="purple" storageKey="sidebar-integrations" />}
    >
      <Box mb={6}>
        <Heading size="lg" mb={2}>
          Integrations
        </Heading>
        <Text color={muted} fontSize="sm">
          Data connectors for AI FinOps across LLM providers, observability traces, and GPU infrastructure.
        </Text>
      </Box>
      <Outlet key={location.pathname} />
    </ScopePageLayout>
  );
}
