import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Blocks pages for logged-out users, and for users with the wrong role
export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/complaints'} replace />;
  }
  return children;
}
