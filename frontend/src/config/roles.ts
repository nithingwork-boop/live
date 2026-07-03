import type { ScopeNavItem } from '../components/ScopeSidebar';

export type AppArea = 'overview' | 'ai' | 'software' | 'integrations' | 'admin';

export type RoleId =
  | 'super_user'
  | 'admin'
  | 'finops'
  | 'ai_ops'
  | 'software'
  | 'cio'
  | 'cfo'
  | 'bu_gm';

export interface AppRole {
  id: RoleId;
  label: string;
  description: string;
  areas: AppArea[];
  readOnly: boolean;
  defaultRoute: string;
  /** When set, only these paths are allowed within an area (top-level area access still required). */
  sidebarAllowlist?: Partial<Record<AppArea, string[]>>;
}

export const TOP_NAV_ITEMS: { to: string; label: string; area: AppArea }[] = [
  { to: '/', label: 'Overview', area: 'overview' },
  { to: '/ai/home', label: 'AI FinOps', area: 'ai' },
  { to: '/software/inventory', label: 'Product Management', area: 'software' },
  { to: '/data-ingestion', label: 'Integrations', area: 'integrations' },
  { to: '/admin/agents', label: 'Admin', area: 'admin' },
];

export const ROLES: AppRole[] = [
  {
    id: 'super_user',
    label: 'Super User',
    description: 'Full platform access across AI, software, integrations, and admin',
    areas: ['overview', 'ai', 'software', 'integrations', 'admin'],
    readOnly: false,
    defaultRoute: '/',
  },
  {
    id: 'admin',
    label: 'Admin User',
    description: 'Agent registry, integrations, and platform configuration',
    areas: ['overview', 'integrations', 'admin'],
    readOnly: false,
    defaultRoute: '/admin/agents',
  },
  {
    id: 'finops',
    label: 'FinOps Lead',
    description: 'AI FinOps and integration management across scopes',
    areas: ['overview', 'ai', 'integrations'],
    readOnly: false,
    defaultRoute: '/ai/home',
  },
  {
    id: 'ai_ops',
    label: 'AI Ops',
    description: 'AI FinOps â€” models, workflows, GPU, and spend controls',
    areas: ['overview', 'ai'],
    readOnly: false,
    defaultRoute: '/ai/home',
  },
  {
    id: 'software',
    label: 'Software Portfolio',
    description: 'Product inventory, contracts, and portfolio lenses',
    areas: ['overview', 'software'],
    readOnly: false,
    defaultRoute: '/software/inventory',
  },
  {
    id: 'cio',
    label: 'CIO',
    description: 'Executive view â€” dashboards and showback across AI spend',
    areas: ['overview', 'ai'],
    readOnly: true,
    defaultRoute: '/',
    sidebarAllowlist: {
      ai: ['/ai/home', '/ai/show-chargeback', '/ai/budgets'],
    },
  },
  {
    id: 'cfo',
    label: 'CFO',
    description: 'Financial oversight â€” AI showback, budgets, and contracts',
    areas: ['overview', 'ai', 'software'],
    readOnly: true,
    defaultRoute: '/',
    sidebarAllowlist: {
      ai: ['/ai/home', '/ai/show-chargeback', '/ai/budgets', '/ai/attribution'],
      software: ['/software/inventory', '/software/contracts'],
    },
  },
  {
    id: 'bu_gm',
    label: 'BU GM',
    description: 'Business unit view â€” AI showback and budgets for owned spend',
    areas: ['overview', 'ai'],
    readOnly: true,
    defaultRoute: '/ai/show-chargeback',
    sidebarAllowlist: {
      ai: ['/ai/show-chargeback', '/ai/budgets'],
    },
  },
];

export const DEFAULT_ROLE_ID: RoleId = 'super_user';

export function getRole(id: RoleId): AppRole {
  return ROLES.find((r) => r.id === id) ?? ROLES[0];
}

export function pathToArea(pathname: string): AppArea | null {
  if (pathname === '/' || pathname.startsWith('/?')) return 'overview';
  if (pathname.startsWith('/ai') || pathname.startsWith('/workflows')) return 'ai';
  if (pathname.startsWith('/software') || pathname.startsWith('/contracts')) return 'software';
  if (pathname.startsWith('/data-ingestion')) return 'integrations';
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/anomalies') || pathname.startsWith('/recommendations') || pathname.startsWith('/tagging')) {
    return 'ai';
  }
  return null;
}

function pathMatchesAllowlist(pathname: string, allowed: string[]): boolean {
  return allowed.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function canAccessPath(role: AppRole, pathname: string): boolean {
  if (role.id === 'super_user') return true;

  const area = pathToArea(pathname);
  if (area === null) return false;
  if (!role.areas.includes(area)) return false;
  if (area === 'overview') return true;

  const allowlist = role.sidebarAllowlist?.[area];
  if (!allowlist) return true;

  return pathMatchesAllowlist(pathname, allowlist);
}

export function canAccessArea(role: AppRole, area: AppArea): boolean {
  return role.areas.includes(area);
}

export function filterScopeNavItems(role: AppRole, items: ScopeNavItem[]): ScopeNavItem[] {
  return items.filter((item) => canAccessPath(role, item.path));
}

export function filterTopNavItems(role: AppRole) {
  return TOP_NAV_ITEMS.filter((item) => canAccessArea(role, item.area));
}

