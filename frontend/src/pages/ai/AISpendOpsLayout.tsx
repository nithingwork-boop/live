import { Outlet, useLocation } from 'react-router-dom';
import {
  ViewIcon,
  StarIcon,
  RepeatIcon,
  TimeIcon,
  HamburgerIcon,
  CalendarIcon,
  WarningIcon,
  CheckCircleIcon,
  SettingsIcon,
  InfoIcon,
} from '@chakra-ui/icons';
import { useMemo } from 'react';
import { ScopePageLayout, ScopeSidebar, type ScopeNavItem } from '../../components/ScopeSidebar';
import { useRoleAccess } from '../../contexts/RoleContext';

const NAV_ITEMS: ScopeNavItem[] = [
  { path: '/ai/home', label: 'Home', icon: ViewIcon },
  { path: '/ai/models', label: 'Models & Providers', icon: StarIcon },
  { path: '/ai/workflows', label: 'Workflows & Agents', icon: RepeatIcon },
  { path: '/ai/observability', label: 'AI Observability', icon: TimeIcon },
  { path: '/ai/gpu', label: 'GPU & Infra', icon: HamburgerIcon },
  { path: '/ai/budgets', label: 'Budgets', icon: CalendarIcon },
  { path: '/ai/show-chargeback', label: 'Showback / Chargeback', icon: InfoIcon },
  { path: '/ai/attribution', label: 'Attribution', icon: CheckCircleIcon },
  { path: '/ai/anomalies', label: 'Anomalies', icon: WarningIcon },
  { path: '/ai/optimization', label: 'Optimization', icon: SettingsIcon },
];

export default function AISpendOpsLayout() {
  const location = useLocation();
  const { filterScopeNavItems } = useRoleAccess();

  const items = useMemo(() => {
    const filtered = filterScopeNavItems(NAV_ITEMS);
    return filtered.map((item) =>
      item.path === '/ai/home'
        ? {
            ...item,
            isActive: (pathname: string) => pathname === '/ai/home' || pathname === '/ai',
          }
        : {
            ...item,
            isActive: (pathname: string) =>
              pathname === item.path || (item.path !== '/ai/home' && pathname.startsWith(item.path)),
          },
    );
  }, [filterScopeNavItems]);

  return (
    <ScopePageLayout sidebar={<ScopeSidebar items={items} accentColor="purple" storageKey="sidebar-ai" />}>
      <Outlet key={location.pathname} />
    </ScopePageLayout>
  );
}
