import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  DEFAULT_ROLE_ID,
  ROLES,
  canAccessArea,
  canAccessPath,
  filterScopeNavItems,
  filterTopNavItems,
  getRole,
  type AppArea,
  type AppRole,
  type RoleId,
} from '../config/roles';
import type { ScopeNavItem } from '../components/ScopeSidebar';

const STORAGE_KEY = 'flow-view-as-role';

function readStoredRoleId(): RoleId {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ROLES.some((r) => r.id === stored)) {
      return stored as RoleId;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_ROLE_ID;
}

interface RoleContextValue {
  viewAsRoleId: RoleId;
  role: AppRole;
  setViewAsRoleId: (id: RoleId) => void;
  canAccessPath: (pathname: string) => boolean;
  canAccessArea: (area: AppArea) => boolean;
  isReadOnly: boolean;
  filterScopeNavItems: (items: ScopeNavItem[]) => ScopeNavItem[];
  topNavItems: ReturnType<typeof filterTopNavItems>;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [viewAsRoleId, setViewAsRoleIdState] = useState<RoleId>(readStoredRoleId);

  const setViewAsRoleId = useCallback((id: RoleId) => {
    setViewAsRoleIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const role = useMemo(() => getRole(viewAsRoleId), [viewAsRoleId]);

  const value = useMemo<RoleContextValue>(
    () => ({
      viewAsRoleId,
      role,
      setViewAsRoleId,
      canAccessPath: (pathname: string) => canAccessPath(role, pathname),
      canAccessArea: (area: AppArea) => canAccessArea(role, area),
      isReadOnly: role.readOnly,
      filterScopeNavItems: (items: ScopeNavItem[]) => filterScopeNavItems(role, items),
      topNavItems: filterTopNavItems(role),
    }),
    [viewAsRoleId, role, setViewAsRoleId],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRoleAccess(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error('useRoleAccess must be used within RoleProvider');
  }
  return ctx;
}

export function useRoleAccessOptional(): RoleContextValue | null {
  return useContext(RoleContext);
}
