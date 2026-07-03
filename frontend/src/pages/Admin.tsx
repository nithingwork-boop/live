import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import {
  ChatIcon,
  SettingsIcon,
  ViewIcon,
  RepeatIcon,
  CalendarIcon,
  InfoIcon,
} from '@chakra-ui/icons';
import { useMemo } from 'react';
import { ScopePageLayout, ScopeSidebar, type ScopeNavItem } from '../components/ScopeSidebar';
import { AdminScopeProvider, AdminScopeBar } from '../contexts/AdminScopeContext';
import { useRoleAccess } from '../contexts/RoleContext';
import AgentsAndTasks from './admin/AgentsAndTasks';
import ToolsForAgents from './admin/ToolsForAgents';
import Crews from './admin/Crews';
import AdminWorkflows from './admin/AdminWorkflows';
import WorkflowScheduling from './admin/WorkflowScheduling';
import Audit from './Audit';

const NAV_ITEMS: ScopeNavItem[] = [
  {
    path: '/admin/agents',
    label: 'Agents & Tasks',
    icon: ChatIcon,
    isActive: (p) => p.includes('/admin/agents') || p.includes('/admin/tasks'),
  },
  { path: '/admin/tools', label: 'Tools for Agents', icon: SettingsIcon },
  { path: '/admin/crews', label: 'Crews', icon: ViewIcon },
  { path: '/admin/workflows', label: 'Active Workflows', icon: RepeatIcon },
  { path: '/admin/scheduling', label: 'Workflow Scheduling', icon: CalendarIcon },
  { path: '/admin/audit', label: 'Audit', icon: InfoIcon },
];

export default function Admin() {
  const location = useLocation();
  const { filterScopeNavItems } = useRoleAccess();
  const navItems = useMemo(() => filterScopeNavItems(NAV_ITEMS), [filterScopeNavItems]);

  return (
    <AdminScopeProvider>
      <ScopePageLayout sidebar={<ScopeSidebar items={navItems} accentColor="blue" storageKey="sidebar-admin" />}>
        <AdminScopeBar />
        <Routes location={location}>
          <Route path="agents" element={<AgentsAndTasks />} />
          <Route path="tasks" element={<AgentsAndTasks />} />
          <Route path="tools" element={<ToolsForAgents />} />
          <Route path="crews" element={<Crews />} />
          <Route path="workflows" element={<AdminWorkflows />} />
          <Route path="scheduling" element={<WorkflowScheduling />} />
          <Route path="audit" element={<Audit />} />
          <Route path="" element={<Navigate to="/admin/agents" replace />} />
        </Routes>
      </ScopePageLayout>
    </AdminScopeProvider>
  );
}
