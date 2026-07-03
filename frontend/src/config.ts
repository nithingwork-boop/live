/**
 * Central API configuration.
 *
 * In production (Render) set the environment variable:
 *   VITE_API_URL=https://your-backend.onrender.com
 *
 * Locally it falls back to the dev server on port 8081.
 */
export const API_URL: string =
  (import.meta.env.VITE_API_URL as string) || 'http://localhost:8081';

export const API_V1 = `${API_URL}/v1`;
