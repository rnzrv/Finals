import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Header.css';

function Header() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('home');
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user, logout } = useApp();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Track active section on scroll (only on home page)
    useEffect(() => {
        if (location.pathname !== '/') return;

        const handleScroll = () => {
            const sections = ['home', 'about', 'services'];
            const scrollPosition = window.scrollY + 150;

            for (const sectionId of sections) {
                const element = document.getElementById(sectionId);
                if (element) {
                    const offsetTop = element.offsetTop;
                    const offsetHeight = element.offsetHeight;

                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(sectionId);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check initial position
        return () => window.removeEventListener('scroll', handleScroll);
    }, [location.pathname]);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleLogout = () => {
        logout();
        setIsDropdownOpen(false);
        navigate('/');
    };

    // Scroll to section or navigate home first
    const scrollToSection = (sectionId) => {
        setIsMobileMenuOpen(false);

        if (location.pathname !== '/') {
            // Navigate to home first, then scroll
            navigate('/');
            setTimeout(() => {
                const element = document.getElementById(sectionId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        } else {
            // Already on home, just scroll
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    // Check if we're on the main landing page
    const isLandingPage = location.pathname === '/';
    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

    // Account dropdown content (reused for desktop and mobile)
    const AccountDropdown = ({ isMobile = false }) => (
        <div className={`dropdown ${isDropdownOpen || isMobile ? 'open' : ''}`}>
            {isAuthenticated ? (
                <>
                    <Link
                        to="/appointment"
                        className="dropdown-btn primary"
                        onClick={() => { setIsDropdownOpen(false); setIsMobileMenuOpen(false); }}
                    >
                        Book Appointment
                    </Link>
                    <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="dropdown-link">
                        Logout
                    </button>
                </>
            ) : (
                <>
                    <Link
                        to="/login"
                        className="dropdown-btn primary"
                        onClick={() => { setIsDropdownOpen(false); setIsMobileMenuOpen(false); }}
                    >
                        Login your Account
                    </Link>
                    <Link
                        to="/signup"
                        className="dropdown-link"
                        onClick={() => { setIsDropdownOpen(false); setIsMobileMenuOpen(false); }}
                    >
                        Sign up now!
                    </Link>
                </>
            )}
        </div>
    );

    return (
        <header className={`header ${isAuthPage ? 'auth' : ''} ${isMobileMenuOpen ? 'menu-open' : ''}`}>
            <div className="header-container">
                {/* Logo */}
                <Link to="/" className="logo" onClick={() => scrollToSection('home')}>
                    <img src="/favicon.png" alt="Beauty Project Logo" className="logo-icon" />
                    <span className="logo-text">Beauty Project</span>
                </Link>

                {/* Mobile Menu Button */}
                <button
                    className="mobile-menu-btn"
                    onClick={toggleMobileMenu}
                    aria-label="Toggle mobile menu"
                >
                    <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}></span>
                </button>

                {/* Navigation - centered on desktop (hidden on auth pages) */}
                {!isAuthPage && (
                    <nav className={`nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                        <button
                            onClick={() => scrollToSection('home')}
                            className={`nav-link ${isLandingPage && activeSection === 'home' ? 'active' : ''}`}
                        >
                            Home
                        </button>
                        <button
                            onClick={() => scrollToSection('about')}
                            className={`nav-link ${isLandingPage && activeSection === 'about' ? 'active' : ''}`}
                        >
                            About us
                        </button>
                        <button
                            onClick={() => scrollToSection('services')}
                            className={`nav-link ${isLandingPage && activeSection === 'services' ? 'active' : ''}`}
                        >
                            Services
                        </button>

                        {/* Account Section - only visible in mobile drawer */}
                        <div className="account-section mobile-only">
                            <AccountDropdown isMobile={true} />
                        </div>
                    </nav>
                )}

                {/* Desktop Account Section - separate from nav */}
                <div className="account-section desktop-only" ref={dropdownRef}>
                    <button
                        className="account-btn"
                        onClick={toggleDropdown}
                        aria-expanded={isDropdownOpen}
                        aria-haspopup="true"
                    >
                        <svg className="user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="7" r="4" />
                            <path d="M5.5 21c0-4 6.5-6 6.5-6s6.5 2 6.5 6" />
                        </svg>
                        <span>{isAuthenticated ? user?.firstName : 'Guest Account'}</span>
                        <svg className={`chevron ${isDropdownOpen ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>
                    <AccountDropdown />
                </div>
            </div>
        </header>
    );
}

export default Header;
