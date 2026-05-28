import { useEffect } from 'react';
import { useLocation, Redirect } from 'wouter';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/common/Spinner';

/**
 * Wrap routes that require auth (and optionally a specific role).
 * Usage:
 *   <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
 */
export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const [location] = useLocation();

  if (loading) return <PageLoader />;

  if (!user) {
    const redirectTo = `/sign-in?next=${encodeURIComponent(location)}`;
    return <Redirect to={redirectTo} />;
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <Redirect to="/" />;
  }

  return children;
}
