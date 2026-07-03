import { createContext, useContext, useState, useMemo, ReactNode } from 'react';

export type TimeRangeKey = '7d' | '30d' | '90d' | 'custom';
export type ScopeKey = 'ai' | 'software' | 'all';

interface FinOpsState {
  timeRange: TimeRangeKey;
  scope: ScopeKey;
  /** When timeRange === 'custom', ISO date strings YYYY-MM-DD */
  customFrom?: string;
  customTo?: string;
}

interface FinOpsContextValue extends FinOpsState {
  setTimeRange: (v: TimeRangeKey) => void;
  setScope: (v: ScopeKey) => void;
  setCustomRange: (from: string, to: string) => void;
  /** Days for API (7, 30, 90, or derived from custom range). */
  timeRangeDays: number;
  /** From date for API (YYYY-MM-DD). Use when fetching costs. */
  timeRangeFrom: string;
  /** To date for API (YYYY-MM-DD). */
  timeRangeTo: string;
  /** Scope for API calls, or undefined for "all". */
  scopeParam: string | undefined;
}

function toYYYYMMDD(d: Date): string {
  return d.toISOString().split('T')[0];
}

const defaultState: FinOpsState = {
  timeRange: '30d',
  scope: 'ai',
};

const FinOpsContext = createContext<FinOpsContextValue | null>(null);

export function FinOpsProvider({ children }: { children: ReactNode }) {
  const [timeRange, setTimeRangeState] = useState<TimeRangeKey>(defaultState.timeRange);
  const [scope, setScope] = useState<ScopeKey>(defaultState.scope);
  const [customFrom, setCustomFrom] = useState<string | undefined>();
  const [customTo, setCustomTo] = useState<string | undefined>();

  const setTimeRange = (v: TimeRangeKey) => {
    setTimeRangeState(v);
    if (v !== 'custom') {
      setCustomFrom(undefined);
      setCustomTo(undefined);
    }
  };

  const setCustomRange = (from: string, to: string) => {
    setTimeRangeState('custom');
    setCustomFrom(from);
    setCustomTo(to);
  };

  const { timeRangeFrom, timeRangeTo, timeRangeDays } = useMemo(() => {
    const to = new Date();
    if (timeRange === 'custom' && customFrom && customTo) {
      const from = new Date(customFrom);
      const toDate = new Date(customTo);
      const days = Math.max(1, Math.ceil((toDate.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)));
      return {
        timeRangeFrom: customFrom,
        timeRangeTo: customTo,
        timeRangeDays: days,
      };
    }
    let days = 30;
    switch (timeRange) {
      case '7d': days = 7; break;
      case '30d': days = 30; break;
      case '90d': days = 90; break;
      default: days = 30;
    }
    const from = new Date(to);
    from.setDate(from.getDate() - days);
    return {
      timeRangeFrom: toYYYYMMDD(from),
      timeRangeTo: toYYYYMMDD(to),
      timeRangeDays: days,
    };
  }, [timeRange, customFrom, customTo]);

  const scopeParam = useMemo(() => {
    if (scope === 'all') return undefined;
    return scope;
  }, [scope]);

  const value: FinOpsContextValue = useMemo(
    () => ({
      timeRange,
      scope,
      customFrom,
      customTo,
      setTimeRange,
      setScope,
      setCustomRange,
      timeRangeDays,
      timeRangeFrom,
      timeRangeTo,
      scopeParam,
    }),
    [timeRange, scope, customFrom, customTo, timeRangeDays, timeRangeFrom, timeRangeTo, scopeParam]
  );

  return (
    <FinOpsContext.Provider value={value}>
      {children}
    </FinOpsContext.Provider>
  );
}

export function useFinOps() {
  const ctx = useContext(FinOpsContext);
  if (!ctx) throw new Error('useFinOps must be used within FinOpsProvider');
  return ctx;
}

export function useFinOpsOptional() {
  return useContext(FinOpsContext);
}
