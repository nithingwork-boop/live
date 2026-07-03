import { API_V1 as API_URL } from '../../config';

async function aiGet<T>(path: string, from: string, to: string, extra?: Record<string, string>): Promise<T> {
  const params = new URLSearchParams({ from, to, ...extra });
  const res = await fetch(`${API_URL}/ai/${path}?${params}`);
  return res.json();
}

export function fetchAIHome(from: string, to: string, provider?: string) {
  return aiGet<any>('home', from, to, provider && provider !== 'All' ? { provider } : undefined);
}

export function fetchAIModels(from: string, to: string, provider?: string) {
  return aiGet<any>('models', from, to, provider && provider !== 'All' ? { provider } : undefined);
}

export function fetchAIWorkflows(from: string, to: string) {
  return aiGet<any>('workflows', from, to);
}

export function fetchAIGPU(from: string, to: string) {
  return aiGet<any>('gpu', from, to);
}

export function fetchAIBudgets(from: string, to: string) {
  return aiGet<any>('budgets', from, to);
}

export function fetchAIChargeback(from: string, to: string) {
  return aiGet<any>('chargeback', from, to);
}

export function fetchAIAttribution(from: string, to: string, dimension = 'team') {
  return aiGet<any>('attribution', from, to, { dimension });
}

export function fetchAIObservability(from: string, to: string) {
  return aiGet<any>('observability', from, to);
}

export const AI_PROVIDERS = ['All', 'OpenAI', 'Azure OpenAI', 'Anthropic', 'Bedrock', 'Vertex AI'] as const;
