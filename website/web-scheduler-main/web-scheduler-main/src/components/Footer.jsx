import { Link, useNavigate, useLocation } from 'react-router-dom';
import { SERVICES } from '../context/AppContext';
import './Footer.css';

function Footer() {
    const navigate = useNavigate();
    const location = useLocation();

    // Scroll to section or navigate home first
    const scrollToSection = (sectionId) => {
        if (location.pathname !== '/') {
            navigate('/');
            setTimeout(() => {
                const element = document.getElementById(sectionId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        } else {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <footer className="footer">
            <div className="footer-container">
                {/* Company Column */}
                <div className="footer-column">
                    <h3 className="footer-heading">Company</h3>
                    <ul className="footer-links">
                        <li><button onClick={() => scrollToSection('about')}>About us</button></li>
                        <li><button onClick={() => scrollToSection('services')}>Services</button></li>
                    </ul>
                </div>

                {/* Services Column */}
                <div className="footer-column">
                    <h3 className="footer-heading">Services</h3>
                    <ul className="footer-links">
                        {SERVICES.map(service => (
                            <li key={service.id}>
                                <button onClick={() => scrollToSection('services')}>{service.name}</button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Social & CTA Column */}
                <div className="footer-column footer-social">
                    <h3 className="footer-heading">Follow us on</h3>
                    <div className="social-icons">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                            </svg>
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                            </svg>
                        </a>
                        <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="X/Twitter">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </a>
                        <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="TikTok">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                            </svg>
                        </a>
                    </div>
                    <Link to="/appointment" className="btn btn-primary footer-cta">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        Book Now
                    </Link>
                </div>
            </div>

            {/* Footer Bottom */}
            <div className="footer-bottom">
                <Link to="/" className="footer-logo" onClick={() => scrollToSection('home')}>
                    <div className="logo-icon">
                        <svg viewBox="0 0 24 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <ellipse cx="12" cy="6" rx="4" ry="4" fill="#A4830D" />
                            <path d="M12 10C12 10 8 14 8 20C8 26 10 30 12 34C14 30 16 26 16 20C16 14 12 10 12 10Z" fill="#A4830D" />
                            <circle cx="12" cy="22" r="2" fill="#F5F2E8" />
                        </svg>
                    </div>
                    <span className="logo-text">Beauty Project</span>
                </Link>
            </div>
        </footer>
    );
}

export default Footer;
