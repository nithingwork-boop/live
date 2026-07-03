import { createContext, useContext, useState, ReactNode } from 'react';
import { Badge, Button, ButtonGroup, HStack, Text, useColorModeValue } from '@chakra-ui/react';
import type { AdminScopeFilter } from '../pages/admin/adminScope';

interface AdminScopeContextValue {
  scopeFilter: AdminScopeFilter;
  setScopeFilter: (v: AdminScopeFilter) => void;
}

const AdminScopeContext = createContext<AdminScopeContextValue | null>(null);

const FILTER_OPTIONS: { value: AdminScopeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'ai', label: 'AI' },
  { value: 'shared', label: 'Shared' },
  { value: 'software', label: 'Software' },
];

export function AdminScopeProvider({ children }: { children: ReactNode }) {
  const [scopeFilter, setScopeFilter] = useState<AdminScopeFilter>('all');
  return (
    <AdminScopeContext.Provider value={{ scopeFilter, setScopeFilter }}>
      {children}
    </AdminScopeContext.Provider>
  );
}

export function useAdminScope() {
  const ctx = useContext(AdminScopeContext);
  if (!ctx) throw new Error('useAdminScope must be used within AdminScopeProvider');
  return ctx;
}

export function AdminScopeBar() {
  const { scopeFilter, setScopeFilter } = useAdminScope();
  const barBg = useColorModeValue('gray.50', 'gray.900');
  const muted = useColorModeValue('gray.600', 'gray.400');

  return (
    <HStack
      mb={6}
      p={3}
      bg={barBg}
      borderRadius="md"
      flexWrap="wrap"
      spacing={4}
      justify="space-between"
    >
      <HStack spacing={2} flexWrap="wrap">
        <Text fontSize="sm" fontWeight="semibold">
          Domain filter
        </Text>
        <Text fontSize="sm" color={muted}>
          Show agents, tools, crews, and workflows by AI, software, or shared platform scope
        </Text>
      </HStack>
      <ButtonGroup size="sm" isAttached variant="outline">
        {FILTER_OPTIONS.map(({ value, label }) => (
          <Button
            key={value}
            onClick={() => setScopeFilter(value)}
            colorScheme={scopeFilter === value ? 'blue' : 'gray'}
            variant={scopeFilter === value ? 'solid' : 'outline'}
          >
            {label}
          </Button>
        ))}
      </ButtonGroup>
    </HStack>
  );
}

export function ScopeTag({ domain }: { domain: string }) {
  const colors: Record<string, string> = {
    ai: 'purple',
    shared: 'gray',
    software: 'teal',
  };
  return (
    <Badge colorScheme={colors[domain] ?? 'gray'} fontSize="xs" textTransform="capitalize">
      {domain}
    </Badge>
  );
}
