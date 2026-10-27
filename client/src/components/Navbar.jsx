import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">C</span> CampusCare
        </Link>
        <nav className="nav-links">
          {user.role === 'student' ? (
            <>
              <NavLink to="/complaints" end>My complaints</NavLink>
              <NavLink to="/complaints/new">New complaint</NavLink>
            </>
          ) : (
            <NavLink to="/admin">Dashboard</NavLink>
          )}
        </nav>
        <div className="nav-user">
          <span className="nav-name">{user?.name} <small>({user?.role})</small></span>
          <button className="btn btn-ghost" onClick={handleLogout}>Log out</button>
        </div>
      </div>
    </header>
  );
}
