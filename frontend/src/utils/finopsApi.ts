import { API_V1 as API_URL } from '../config';

export type FinOpsListScope = 'ai';

export interface FinOpsListPageProps {
  scope?: FinOpsListScope;
  useFinOpsPeriod?: boolean;
  title?: string;
  subtitle?: string;
}

function appendParams(params: URLSearchParams, entries: Record<string, string | undefined>) {
  Object.entries(entries).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
}

export function buildAnomaliesUrl(
  filter: string,
  scope?: FinOpsListScope,
  from?: string,
  to?: string,
): string {
  const params = new URLSearchParams();
  appendParams(params, { status: filter, scope, from, to });
  const q = params.toString();
  return `${API_URL}/anomalies${q ? `?${q}` : ''}`;
}

export function buildRecommendationsUrl(
  filter: string,
  scope?: FinOpsListScope,
  from?: string,
  to?: string,
): string {
  const params = new URLSearchParams();
  appendParams(params, { status: filter, scope, from, to });
  const q = params.toString();
  return `${API_URL}/recommendations${q ? `?${q}` : ''}`;
}

