import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Spinner from './components/Spinner.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import MyComplaints from './pages/MyComplaints.jsx';
import ComplaintForm from './pages/ComplaintForm.jsx';
import ComplaintDetail from './pages/ComplaintDetail.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner full />;

  const home = user ? (user.role === 'admin' ? '/admin' : '/complaints') : '/login';

  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={user ? <Navigate to={home} /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to={home} /> : <Signup />} />

        {/* Student pages */}
        <Route path="/complaints" element={<ProtectedRoute role="student"><MyComplaints /></ProtectedRoute>} />
        <Route path="/complaints/new" element={<ProtectedRoute role="student"><ComplaintForm /></ProtectedRoute>} />
        <Route path="/complaints/:id/edit" element={<ProtectedRoute role="student"><ComplaintForm /></ProtectedRoute>} />

        {/* Shared detail page (student sees own, admin sees any) */}
        <Route path="/complaints/:id" element={<ProtectedRoute><ComplaintDetail /></ProtectedRoute>} />

        {/* Admin page */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />

        <Route path="/" element={<Navigate to={home} replace />} />
        <Route path="*" element={<Navigate to={home} replace />} />
      </Routes>
    </>
  );
}

