import React, { useEffect, useState, useMemo } from 'react';
import Sidebar from "./Sidebar.jsx";
import "../css/pointofSales.css";
import x from "../icons/x.svg";
import trash from "../icons/trash.svg";
import card from "../icons/card.svg";
import logs from "../icons/logo.svg";
import axios from 'axios';
import AddService from "./modals/purchase-modal/add-service.jsx";
import Notification from './modals/notification/notification.jsx';
import LogoutModal from './modals/logout/logout.jsx';
import user from "../icons/user.svg";

function PointOfSales() {
  const [pos, setPOS] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [pwd, setIsPwd] = useState(false);
  const [totalPayment, setTotalPayment] = useState('');
  const [change, setChange] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState('');

  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');

  // Fetch customers
  useEffect(() => {
    try {
      const token = sessionStorage.getItem('accessToken');
      axios.get('http://localhost:8081/pos/getPatients/Customers', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      }).then(res => {
        setCustomers(Array.isArray(res.data) ? res.data : []);
      });
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    }
  }, []);

  // Fetch POS data
  const getPOSData = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await axios.get(`http://localhost:8081/pos/pos?${activeFilter}=true`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      setPOS(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching POS data:', error);
      setPOS([]);
    }
  };

  useEffect(() => { getPOSData(); }, []);
  useEffect(() => { getPOSData(); }, [activeFilter]);

  // Filter POS
  const q = search.trim().toLowerCase();
  const filteredPos = pos.filter(p => {
    const name = String(p?.itemName ?? '').toLowerCase();
    const code = String(p?.code ?? '').toLowerCase();
    const cat = String(p?.category ?? '').toLowerCase();
    return name.includes(q) || code.includes(q) || cat.includes(q);
  });

  // Stock map
  const stockMap = useMemo(() => {
    const map = {};
    pos.forEach(product => {
      const cartItem = cart.find(c => c.code === product.code);
      const cartQty = cartItem?.quantity || 0;
      map[product.code] = product.quantity == null ? Infinity : product.quantity - cartQty;
    });
    return map;
  }, [pos, cart]);

  const getRemainingStock = (code) => stockMap[code] || 0;

  // Cart functions
  const addToCart = (item) => {
    const existing = cart.find(c => c.code === item.code);
    const remainingStock = getRemainingStock(item.code);
    if (existing) {
      if (remainingStock > 0 || remainingStock === Infinity) {
        setCart(cart.map(c => c.code === item.code ? { ...c, quantity: c.quantity + 1 } : c));
      } else alert('Not enough stock available!');
    } else {
      if (item.quantity > 0 || item.quantity == null) {
        setCart([...cart, { ...item, quantity: 1 }]);
      } else alert('Out of stock!');
    }
  };

  const updateCartQty = (code, qty) => {
    const remainingStock = getRemainingStock(code);
    const cartItem = cart.find(c => c.code === code);
    const currentQty = cartItem?.quantity || 0;
    const maxAllowed = remainingStock === Infinity ? Infinity : remainingStock + currentQty;

    if (qty <= 0) setCart(cart.filter(c => c.code !== code));
    else if (qty <= maxAllowed) setCart(cart.map(c => c.code === code ? { ...c, quantity: qty } : c));
    else alert(`Only ${maxAllowed} items available in stock!`);
  };

  const removeFromCart = (code) => setCart(cart.filter(c => c.code !== code));

  const clearCart = () => {
    setCart([]);
    setDiscountPercentage(0);
    setIsPwd(false);
  };

  // Totals
  const subtotal = cart.reduce((sum, item) => sum + (Number(item.sellingPrice || 0) * item.quantity), 0);
  const tax = pwd ? 0 : subtotal * 0.1;
  const discount = subtotal * (discountPercentage / 100);
  const total = subtotal + tax - discount;

  // Change
  useEffect(() => {
    const payment = parseFloat(totalPayment) || 0;
    setChange(payment - total);
  }, [totalPayment, total]);

  // PWD Discount toggle
  const handlePWDDiscount = () => {
    if (cart.length === 0) return;
    if (!pwd) {
      setDiscountPercentage(20);
      setIsPwd(true);
    } else {
      setDiscountPercentage(0);
      setIsPwd(false);
    }
  };

  // Complete Sale
  const handleCompleteSale = async (paymentMethod = 'Cash') => {
    if (cart.length === 0) return alert('Cart is empty!');

    const payment = parseFloat(totalPayment) || 0;
    if (payment < total) return alert('Payment is not enough!');

    const saleData = {
      customerName: selectedCustomer || '',
      paymentMethod,
      subTotal: subtotal,
      taxAmount: tax,
      discount: discountPercentage,
      totalAmount: total,
      totalPayment: payment,
      changes: change,
      items: cart.map(item => ({
        code: item.code,
        itemName: item.itemName,
        quantity: item.quantity,
        sellingPrice: item.sellingPrice,
      })),
    };

    try {
      const token = sessionStorage.getItem('accessToken');
      const res = await axios.post('http://localhost:8081/pos/sales', saleData, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      alert(`Sale completed! Reference: ${res.data.reference}`);
      clearCart();
      setTotalPayment('');
      getPOSData();
    } catch (err) {
      console.error('Error completing sale:', err);
      alert('Failed to complete sale. Please try again.');
    }
  };

  const role = sessionStorage.getItem("role") || localStorage.getItem("role");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <div className='point-of-sales'>
      <Sidebar />
      <div className="point-of-sales-content">
        <header>
          <h2>POINT OF SALES</h2>
          <div className="inventory-account">
            <Notification />
            <button onClick={() => setShowLogoutModal(true)} className="inventory-user-btn">
              <img src={user} alt="Admin Icon"/>
              <p>{role}</p>
            </button>
          </div>
        </header>

        <div className="point-of-sales-main-content">
          {/* LEFT PANEL */}
          <div className="POS-left">
            {/* Customer selection */}
            <div className="POS-left-top">
              <h1>Customer</h1>
              <div className="POS-search-bar">
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={selectedCustomer}
                  onChange={e => setSelectedCustomer(e.target.value)}
                />
                <select
                  value={selectedCustomer}
                  onChange={e => setSelectedCustomer(e.target.value)}
                  className='customers-item'
                >
                  <option value="">Select Customer</option>
                  {customers
                    .filter(c => c.customerName.toLowerCase().includes(selectedCustomer.toLowerCase()))
                    .map(c => <option key={c.id} value={c.customerName}>{c.customerName}</option>)}
                </select>
              </div>
            </div>

            <div className="br"></div>

            {/* Cart items */}
            <div className="POS-product-list">
              {cart.length === 0 ? <p style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Cart is empty</p> :
                cart.map(item => (
                  <div className="cart-items" key={item.code}>
                    <div className="product-title-top">
                      <div className="product-title">
                        <h1>{item.itemName}</h1>
                        <h3>{item.code}</h3>
                      </div>
                      <div className="product-right">
                        <img src={x} alt="Remove" onClick={() => removeFromCart(item.code)} style={{ cursor: 'pointer' }} />
                      </div>
                    </div>
                    <div className="product-title-bottom">
                      <div className="quantity">
                        <div className="quality-controls">
                          <button onClick={() => updateCartQty(item.code, item.quantity - 1)}>-</button>
                          <input type="number" min="1" value={item.quantity} onChange={e => updateCartQty(item.code, Math.max(1, Number(e.target.value) || 1))} />
                          <button onClick={() => updateCartQty(item.code, item.quantity + 1)}>+</button>
                        </div>
                        <div className="price">
                          <h2>₱{(Number(item.sellingPrice || 0) * item.quantity).toFixed(2)}</h2>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>

            {/* Cart summary */}
            <div className="product-list-bottom">
              <div className="buttons">
                <button onClick={clearCart}><img src={trash} alt="Trash Icon" />Clear Cart</button>
              </div>
              <div className="subtotal-tax">
                <div className="subtotal">
                  <h1>Subtotal</h1>
                  <h2>₱{subtotal.toFixed(2)}</h2>
                </div>
                <div className="tax">
                  <h1>Tax (10%)</h1>
                  <h2>₱{tax.toFixed(2)}</h2>
                </div>
                <div className="tax discount" style={{'display': 'flex', 'gap': '2px'}}>
                  <h1 style={{'display': 'flex', 'gap': '2px'}}>
                    Discount 
                    <input
                      style={{'padding': '2px'}}
                      type="number"
                      min="0"
                      max="100"
                      value={discountPercentage}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setDiscountPercentage(''); // allow empty input temporarily
                        } else {
                          setDiscountPercentage(Math.max(0, Math.min(100, parseFloat(val))));
                        }
                      }}
                    />%
                  </h1>
                  Amount: ₱{discount.toFixed(2)}
                </div>
              </div>

              <div className="product-total">
                <h1>Total</h1>
                <h2>₱{total.toFixed(2)}</h2>
              </div>

              <div className="payment-section">
                <label>Total Payment:</label>
                <input type="number" min="0" value={totalPayment} onChange={e => setTotalPayment(e.target.value)} />
              </div>
              <div className="payment-section">
                <label>Change:</label>
                <h2>₱{change.toFixed(2)}</h2>
              </div>

              <div className="complete-sale">
                <button disabled={cart.length === 0} onClick={() => handleCompleteSale('Cash')}>Complete Sale</button>
              </div>

              <div className="payment-method">
                <button onClick={() => handleCompleteSale('Cash')}>₱ Cash</button>
                <button onClick={() => handleCompleteSale('Card')}><img src={card} alt="Card Icon" />Card</button>
                <button onClick={() => handleCompleteSale('GCash')}><img src={card} alt="Card Icon" />GCash</button>
                <button onClick={handlePWDDiscount}>PWD</button>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="POS-right">
            <div className="right-content">
              <input
                type="text"
                placeholder="Search product or Services"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="right-buttons">
              <div className="left">
                <button className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>All</button>
                <button className={`filter-btn ${activeFilter === 'product' ? 'active' : ''}`} onClick={() => setActiveFilter('product')}>Product</button>
                <button className={`filter-btn ${activeFilter === 'services' ? 'active' : ''}`} onClick={() => setActiveFilter('services')}>Services</button>
              </div>
              <div className="pos-rightButtons"><AddService /></div>
            </div>

            <div className="right-grid">
              <div className="right-grid-container">
                {filteredPos.map((item, index) => {
                  const remainingStock = getRemainingStock(item.code);
                  return (
                    <div className="right-grid-item" key={item.code || index} onClick={() => addToCart(item)} style={{ cursor: 'pointer' }}>
                      <div className="right-grid-top">
                        {item?.logo && (
                          <div className="product-image">
                            <img
                              src={`http://localhost:8081/${item.logo}`}
                              alt={item?.itemName || 'Product'}
                              onError={e => { e.currentTarget.src = logs; }}
                            />
                          </div>
                        )}
                        <div className={`category ${item.category.toLowerCase()}`}>{item.category}</div>
                      </div>
                      <div className="product-details">
                        <div className="product-title-right">
                          <h1>{item.itemName}</h1>
                          <h3>{item.code}</h3>
                        </div>
                        <div className="product-price-stock">
                          {remainingStock !== Infinity && <h3>In Stock: {remainingStock}</h3>}
                          <h2>₱{Number(item.sellingPrice || 0).toFixed(2)}</h2>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {showLogoutModal && (
              <LogoutModal
                open={showLogoutModal}
                onCancel={() => setShowLogoutModal(false)}
                onConfirm={() => {
                  sessionStorage.clear();
                  window.location.href = "/";
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PointOfSales;
