import clinicHero from '../assets/clinic-hero.png';
import './About.css';

function About() {
    return (
        <div className="about-page">
            <section className="about-section">
                <div className="about-container">
                    {/* Image Column */}
                    <div className="about-image">
                        <img src={clinicHero} alt="Beauty Project Clinic Interior" />
                    </div>

                    {/* Content Column */}
                    <div className="about-content">
                        <h1 className="about-title">How We Started</h1>
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

export default About;
