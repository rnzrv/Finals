import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CartSidebar.css';
import axios from 'axios';
import spaTreatment from '../images/spa-treatment.png';


function CartSidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [activeStatus, setActiveStatus] = useState('Scheduled');

    const navigate = useNavigate();

    const getScheduledAppointments = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(
                'http://localhost:8081/website/services/getScheduledAppointments',
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setCartItems(res.data || []);
        } catch (error) {
            console.error('Failed to fetch scheduled appointments', error);
        }
    };

    useEffect(() => {
        getScheduledAppointments();
    }, []);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const closeSidebar = () => {
        setIsOpen(false);
    };

    // ✅ FIXED: use requestId (matches backend)
    const removeItem = (requestId) => {
        setCartItems(cartItems.filter(item => item.requestId !== requestId));
    };

    const statusToClass = (status) => {
        switch ((status || '').toLowerCase()) {
            case 'pending':
                return 'pending';
            case 'scheduled':
                return 'scheduled';
            case 'declined':
                return 'declined';
            default:
                return 'default';
        }
    };

    const filteredItems = cartItems.filter(item => item.status === activeStatus);

    const getTotalItems = () => filteredItems.length;

    const getTotalPrice = () =>
        filteredItems
            .reduce((total, item) => total + Number(item.price || 0), 0)
            .toFixed(2);

    return (
        <>
            {/* Cart Toggle Button */}
            <button
                className="cart-toggle-btn"
                onClick={toggleSidebar}
                aria-label="Toggle cart sidebar"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>

                {getTotalItems() > 0 && (
                    <span className="cart-badge">{getTotalItems()}</span>
                )}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div className="cart-overlay" onClick={closeSidebar}></div>
            )}

            {/* Cart Sidebar */}
            <aside className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="cart-header">
                    <h2>Shopping Cart</h2>
                    <button
                        className="close-btn"
                        onClick={closeSidebar}
                        aria-label="Close cart"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="cart-content">
                    <div className="status-filter-group" role="tablist" aria-label="Filter by status">
                        {['Pending', 'Scheduled', 'Declined'].map(status => (
                            <button
                                key={status}
                                className={`status-filter ${activeStatus === status ? 'active' : ''}`}
                                onClick={() => setActiveStatus(status)}
                                aria-pressed={activeStatus === status}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                    {filteredItems.length === 0 ? (
                        <div className="empty-cart">
                            <p>{cartItems.length === 0 ? 'Your cart is empty' : 'No appointments with this status'}</p>
                            <button
                                className="continue-shopping-btn"
                                onClick={closeSidebar}
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="cart-items">
                                {filteredItems.map(item => (
                                    <div className="cart-item" key={item.requestId}>
                                        {item.logo && (
                                            <img
                                                src={item.logo ? `http://localhost:8081/${item.logo}` : spaTreatment}
                                                alt={item.serviceName}
                                                className="item-image"
                                            />
                                        )}

                                        <div className="item-details">
                                            <h3 className="item-name">{item.serviceName}</h3>
                                            <p className="item-date">
                                                Date: {item.preferred_date}
                                            </p>
                                            <p className="item-time">
                                                Time: {item.preferred_time}
                                            </p>
                                            <p className="item-price">
                                                ₱{Number(item.price).toFixed(2)}
                                            </p>
                                            <span className={`status-badge ${statusToClass(item.status)}`}>
                                                {item.status}
                                            </span>
                                            {(item.status || '').toLowerCase() === 'declined' && (
                                                <button
                                                    className="remove-item-btn"
                                                    onClick={() => removeItem(item.requestId)}
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="cart-summary">
                                <div className="summary-row">
                                    <span>Subtotal:</span>
                                    <span>₱{getTotalPrice()}</span>
                                </div>
                                <div className="summary-row total">
                                    <span>Total:</span>
                                    <span>₱{getTotalPrice()}</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </aside>
        </>
    );
}

export default CartSidebar;
