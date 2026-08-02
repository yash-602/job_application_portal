import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <nav className="navbar" style={{ padding: '0 40px', borderBottom: 'none' }}>
      {/* Left side: Logo */}
      <Link to="/" className="navbar-logo" style={{ display: 'flex', alignItems: 'center', gap: '0px', textDecoration: 'none' }}>
        <img 
          src="/undocked-logo-only.png" 
          alt="Undocked Logo" 
          style={{ height: '40px', width: 'auto', display: 'block', marginRight: '4px' }} 
        />
        <span style={{ 
          fontWeight: 800, 
          fontSize: '1.2rem', 
          letterSpacing: '0.05em', 
          color: '#ffffff', 
          lineHeight: 1 
        }}>
          UNDOCKED
        </span>
      </Link>

      {/* Center/Right side: Nav Links */}
      <div className="navbar-links" style={{ gap: '28px', marginLeft: 'auto', marginRight: '32px' }}>
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
        <Link to="/what-we-do" className={location.pathname === '/what-we-do' ? 'active' : ''}>What We Do</Link>
        <Link to="/meridian" className={location.pathname === '/meridian' ? 'active' : ''}>Meridian</Link>
        <Link to="/insights" className={location.pathname === '/insights' ? 'active' : ''}>Insights</Link>
        
        {/* Careers tab linking to external website, colored red */}
        <a 
          href="https://undocked.net" 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ color: '#e53e3e', fontWeight: 500 }}
        >
          Careers
        </a>
        
        <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About</Link>
        <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Contact</Link>
      </div>

      {/* Far Right side: Let's Connect / Auth */}
      <div className="navbar-actions" style={{ gap: '16px' }}>
        {isAuthenticated ? (
          <>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
              {user?.email}
            </span>
            <button className="btn btn-outline btn-sm" onClick={handleLogout} style={{ borderRadius: '20px' }}>
              <LogOut size={14} style={{ marginRight: '4px' }} />
              Logout
            </button>
          </>
        ) : (
          <Link 
            to="/register" 
            className="btn btn-outline" 
            style={{ 
              borderRadius: '24px', 
              padding: '8px 24px', 
              fontSize: '0.9rem',
              fontWeight: 500,
              borderColor: 'rgba(255, 255, 255, 0.3)'
            }}
          >
            Let's Connect
          </Link>
        )}
      </div>
    </nav>
  );
}
