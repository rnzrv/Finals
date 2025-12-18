import { Link } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';
import { SERVICES } from '../context/AppContext';
import clinicHero from '../images/clinic-hero.png';
import spaTreatment from '../images/spa-treatment.png';
import './Home.css';

function Home() {
    // Use the spa treatment image for all service cards
    const servicesWithImages = SERVICES.map(service => ({
        ...service,
        image: spaTreatment,
    }));

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section id="home" className="hero" style={{ backgroundImage: `url(${clinicHero})` }}>
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1 className="hero-title">TAGLINE HERE</h1>
                    <p className="hero-description">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Pellentesque porttitor velit neque, at eleifend metus vestibulum sed.
                        Phasellus tempor tortor eu mi lacinia, sed placerat eros porta.
                        Fusce vel magna eu justo blandit imperdiet a eget ligula.
                        Suspendisse potenti.
                    </p>
                    <Link to="/appointment" className="btn btn-green hero-cta">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        Book Now
                    </Link>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="services-section">
                <div className="services-header">
                    <h2 className="services-title">Our Services</h2>
                    <p className="services-description">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque porttitor velit
                        neque, at eleifend metus vestibulum Phasellus tempor tortor eu mi lacinia, sed
                        placerat eros porta. Fusce vel magna eu justo blandit imperdiet a eget
                    </p>
                </div>

                <div className="services-grid">
                    {servicesWithImages.map(service => (
                        <ServiceCard
                            key={service.id}
                            title={service.name}
                            description={service.description}
                            image={service.image}
                        />
                    ))}
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="about-section">
                <div className="about-container">
                    {/* Image Column */}
                    <div className="about-image">
                        <img src={clinicHero} alt="Beauty Project Clinic Interior" />
                    </div>

                    {/* Content Column */}
                    <div className="about-content">
                        <h2 className="about-title">How We Started</h2>
                        <div className="about-text">
                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                Pellentesque porttitor velit neque, at eleifend metus vestibulum
                                Phasellus tempor tortor eu mi lacinia, sed placerat eros porta. Fusce
                                vel magna eu justo blandit imperdiet a eget Pellentesque porttitor
                                velit neque, at eleifend metus vestibulum Phasellus tempor tortor eu
                                mi lacinia, sed placerat eros porta. Fusce vel magna eu justo blandit
                                imperdiet a eget Pellentesque porttitor velit neque, at eleifend metus
                                vestibulum Phasellus tempor tortor eu mi lacinia, sed placerat eros
                                porta. Fusce vel magna eu justo blandit imperdiet a eget porttitor
                                velit neque, at eleifend metus vestibulum Phasellus tempor tortor eu
                                mi lacinia, sed placerat eros porta. Fusce
                            </p>
                            <p>
                                vel magna eu justo blandit imperdiet a eget porttitor
                                velit neque, at eleifend metus vestibulum Phasellus tempor tortor eu
                                mi lacinia, sed placerat eros porta. Fusce
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
