import { Routes, Route, Navigate } from 'react-router-dom';
import {
  ViewIcon,
  RepeatIcon,
  StarIcon,
  EditIcon,
  WarningIcon,
} from '@chakra-ui/icons';
import { useMemo } from 'react';
import { ScopePageLayout, ScopeSidebar, type ScopeNavItem } from '../../components/ScopeSidebar';
import { useRoleAccess } from '../../contexts/RoleContext';
import SoftwareInventory from '../SoftwareInventory';
import ContractsOptimization from '../ContractsOptimization';
import PortfolioLenses from './PortfolioLenses';
import ProductLenses from './ProductLenses';
import RiskOverlay from './RiskOverlay';

const NAV_ITEMS: ScopeNavItem[] = [
  { path: '/software/inventory', label: 'Product Inventory', icon: ViewIcon },
  { path: '/software/contracts', label: 'Contracts & Optimization', icon: RepeatIcon },
  { path: '/software/portfolio', label: 'Portfolio-level Lenses', icon: StarIcon },
  { path: '/software/solutions', label: 'Product / Solution Lenses', icon: EditIcon },
  { path: '/software/risk', label: 'Risk & Compliance Overlay', icon: WarningIcon },
];

export default function Software() {
  const { filterScopeNavItems } = useRoleAccess();
  const navItems = useMemo(() => filterScopeNavItems(NAV_ITEMS), [filterScopeNavItems]);

  return (
    <ScopePageLayout sidebar={<ScopeSidebar items={navItems} accentColor="blue" storageKey="sidebar-software" />}>
      <Routes>
        <Route path="inventory" element={<SoftwareInventory />} />
        <Route path="contracts" element={<ContractsOptimization />} />
        <Route path="portfolio" element={<PortfolioLenses />} />
        <Route path="solutions" element={<ProductLenses />} />
        <Route path="risk" element={<RiskOverlay />} />
        <Route path="" element={<Navigate to="/software/inventory" replace />} />
      </Routes>
    </ScopePageLayout>
  );
}
