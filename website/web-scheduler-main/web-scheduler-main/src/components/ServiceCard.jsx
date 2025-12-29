import './ServiceCard.css';

function ServiceCard({ title, description, image, price }) {
    return (
        <div className="service-card">
            <div className="service-card-image">
                <img src={image} alt={title} />
                <div className="service-card-overlay"></div>
            </div>

            <div className="service-card-content">
                <h3>{title}</h3>
                <p>{description}</p>
                <p className="service-card-price">
                    ₱{Number(price).toLocaleString()}
                </p>
            </div>
        </div>
    );
}


export default ServiceCard;
