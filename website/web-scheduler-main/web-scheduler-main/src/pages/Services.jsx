import ServiceCard from '../components/ServiceCard';
import './Services.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Services() {
    const [fetchedServices, setFetchedServices] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8081/website/services/getServices')
            .then(response => {
                console.log(response.data); // DEBUG
                setFetchedServices(response.data); // ✅ FIX
            })
            .catch(error => {
                console.error('Error fetching services:', error);
            });
    }, []);

    return (
        <div className="services-page">
            <section className="services-section">

                <div className="services-header">
                    <h1 className="services-title">Our Services</h1>
                </div>

                <div className="services-grid">
                    {fetchedServices.length === 0 && (
                        <p>No services found</p>
                    )}

                    {fetchedServices.map(service => (
                        <ServiceCard
                            key={service.serviceId}
                            title={service.serviceName}
                            description={service.description}
                            image={`http://localhost:8081/${service.logo}`}
                            price={service.price}
                        />
                    ))}
                </div>

            </section>
        </div>
    );
}

export default Services;
