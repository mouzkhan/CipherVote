import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth, ADMIN_EMAIL } from "../firebase";
import { useAuth } from "../context/AuthContext";
import "../styles/navbar.css";

/**
 * Responsive Navbar Component
 * 
 * Mobile: Hamburger menu with slide-out drawer
 * Desktop: Horizontal navigation bar
 * 
 * Shows different navigation based on user type:
 * - Not logged in: Home, About, Pricing, Login, Get Started
 * - Logged in: Dashboard, Verify Vote, Logout
 */
export default function Navbar() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle scroll state
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/");
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Check if current path is voter-facing (invitation link)
  const isVoterPath = location.pathname.startsWith("/election/") && 
                      !location.pathname.includes("/org/");

  return (
    <>
      <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
        <div className="navbar-container">
          {/* Brand Logo */}
          <Link to="/" className="navbar-brand">
            <span className="brand-icon">🗳️</span>
            <span className="brand-text">Cipher<span>Vote</span></span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="navbar-links-desktop">
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/pricing" className="nav-link">Pricing</Link>
            
            {user ? (
              <>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/verify" className="nav-link">Verify Vote</Link>
                <button onClick={handleLogout} className="nav-link nav-btn">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link nav-link-btn">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm nav-cta">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button 
            className={`mobile-menu-toggle ${mobileMenuOpen ? "active" : ""}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`mobile-menu-overlay ${mobileMenuOpen ? "active" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Menu Drawer */}
      <div className={`mobile-menu-drawer ${mobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-menu-header">
          <Link to="/" className="navbar-brand" onClick={() => setMobileMenuOpen(false)}>
            <span className="brand-icon">🗳️</span>
            <span className="brand-text">Cipher<span>Vote</span></span>
          </Link>
          <button 
            className="mobile-menu-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <div className="mobile-menu-content">
          {/* Main Navigation */}
          <div className="mobile-nav-section">
            <Link to="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              <span className="nav-icon">🏠</span>
              Home
            </Link>
            <Link to="/about" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              <span className="nav-icon">ℹ️</span>
              About
            </Link>
            <Link to="/pricing" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              <span className="nav-icon">💰</span>
              Pricing
            </Link>
          </div>

          {/* User Section */}
          <div className="mobile-nav-section">
            {user ? (
              <>
                <div className="mobile-section-title">Account</div>
                <Link to="/dashboard" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                  <span className="nav-icon">📊</span>
                  Dashboard
                </Link>
                <Link to="/verify" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                  <span className="nav-icon">🔍</span>
                  Verify Vote
                </Link>
                <button onClick={handleLogout} className="mobile-nav-link mobile-nav-btn">
                  <span className="nav-icon">🚪</span>
                  Logout
                </button>
              </>
            ) : (
              <>
                <div className="mobile-section-title">Get Started</div>
                <Link to="/login" className="mobile-nav-link mobile-nav-btn" onClick={() => setMobileMenuOpen(false)}>
                  <span className="nav-icon">🔑</span>
                  Login
                </Link>
                <Link to="/register" className="mobile-nav-link mobile-nav-btn highlight" onClick={() => setMobileMenuOpen(false)}>
                  <span className="nav-icon">✨</span>
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Creator Info */}
          <div className="mobile-creator-info">
            <div className="mobile-section-title">Created By</div>
            <p className="creator-name">M Mouz Ishaq</p>
            <p className="creator-contact">
              <a href="mailto:mouzk41@gmail.com">mouzk41@gmail.com</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}