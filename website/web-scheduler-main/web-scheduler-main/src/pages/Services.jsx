import ServiceCard from '../components/ServiceCard';
import { SERVICES } from '../context/AppContext';
import spaTreatment from '../assets/spa-treatment.png';
import './Services.css';

function Services() {
    // Use the spa treatment image for all service cards
    const servicesWithImages = SERVICES.map(service => ({
        ...service,
        image: spaTreatment,
    }));

    return (
        <div className="services-page">
            <section className="services-section">
                {/* Header */}
                <div className="services-header">
                    <h1 className="services-title">Our Services</h1>
                    <p className="services-description">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque porttitor velit
                        neque, at eleifend metus vestibulum Phasellus tempor tortor eu mi lacinia, sed
                        placerat eros porta. Fusce vel magna eu justo blandit imperdiet a eget
                    </p>
                </div>

                {/* Services Grid */}
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
        </div>
    );
}

export default Services;
