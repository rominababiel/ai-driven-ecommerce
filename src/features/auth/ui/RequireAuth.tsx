import { Navigate, Outlet, useLocation } from 'react-router';
import { PageSpinner } from '@/shared/ui/Spinner';
import { hasRole, type Role } from '../domain/user';
import { useAuth } from '../state/AuthContext';

export function RequireAuth({ role }: { role?: Role }) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <PageSpinner />;
  if (status === 'anonymous') return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (role && !hasRole(user, role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
