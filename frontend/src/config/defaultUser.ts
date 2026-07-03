/**
 * Default user credentials configuration
 * 
 * In production, these should be:
 * - Stored securely (environment variables, secrets management)
 * - Managed through a proper authentication system (OAuth, Keycloak, etc.)
 * - Retrieved from a backend API
 */
export const DEFAULT_USER_CONFIG = {
  username: 'admin',
  password: 'admin123',
  email: 'admin@finops.local',
  displayName: 'Super User',
};

