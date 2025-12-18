import './ServiceCard.css';

function ServiceCard({ title, description, image }) {
    return (
        <div className="service-card">
            <div className="service-card-image">
                <img src={image} alt={title} />
                <div className="service-card-overlay"></div>
            </div>
            <div className="service-card-content">
                <h3 className="service-card-title">{title}</h3>
                <p className="service-card-description">{description}</p>
            </div>
        </div>
    );
}

export default ServiceCard;
