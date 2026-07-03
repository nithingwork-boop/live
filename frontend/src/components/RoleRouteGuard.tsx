import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRoleAccess } from '../contexts/RoleContext';

/** Redirects when the current path is not allowed for the active view-as role. */
export function RoleRouteGuard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { canAccessPath, role } = useRoleAccess();

  useEffect(() => {
    if (!canAccessPath(location.pathname)) {
      navigate(role.defaultRoute, { replace: true });
    }
  }, [location.pathname, role.id, role.defaultRoute, canAccessPath, navigate]);

  return null;
}
