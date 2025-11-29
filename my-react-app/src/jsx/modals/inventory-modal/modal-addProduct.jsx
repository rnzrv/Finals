import React, {useState, useEffect} from 'react'
import { createPortal } from 'react-dom';
import axios from 'axios';
import "../../../css/modal/addProduct.css";
import x from '../../../icons/x.svg';

function ModalAddProduct({ onProductAdded }) {

  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    itemName: '',
    brand: '',
    code: '',
    category: '',
    price: '',
    quantity: '',
    logo: null,
  });

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const validate = () => {
    const { itemName, brand, code, category, price, quantity } = formData;
    const p = Number(price);
    const q = Number(quantity);
    if (!itemName.trim() || !brand.trim() || !code.trim() || !category.trim()) {
      setErrorMessage('All fields are required.');
      return false;
    }
    if (!Number.isFinite(p) || p <= 0) {
      setErrorMessage('Price must be a number greater than 0.');
      return false;
    }
    if (!Number.isInteger(q) || q < 0) {
      setErrorMessage('Quantity must be an integer ≥ 0.');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const normalize = () => ({
    itemName: formData.itemName.trim(),
    brand: formData.brand.trim(),
    code: formData.code.trim(),
    category: formData.category.trim(),
    price: Number(formData.price),
    quantity: Number(formData.quantity),
    logo: null, // send null unless backend supports uploads
  });

  const addProductHandle = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      await axios.post('http://localhost:8081/inventory/addInventory', normalize(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      onProductAdded && onProductAdded(); // let parent refresh/append
      setFormData({ itemName:'', brand:'', code:'', category:'', price:'', quantity:'', logo:null });
      setIsOpen(false);
    } catch (error) {
      if (error?.response?.status === 409) setErrorMessage('Product code already exists.');
      else if (error?.response?.data?.error) setErrorMessage(error.response.data.error);
      else setErrorMessage('Failed to add product.');
      console.error('Error adding product:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const modalAddProduct = (
    <div className={`addProduct ${isOpen ? 'open' : 'closed'}`}>
      <div className="add-inventory-product">
        <div className="add-inventory-product-title">
          <h2>Add Product</h2>
          <img src={x} alt="close-icon" onClick={() => setIsOpen(false)}/>
        </div>

        {errorMessage && <div className="form-error">{errorMessage}</div>}

        <form className='form' onSubmit={addProductHandle}>
          <div className="form-left">
            <div className="item">
              <h1>Name</h1>
              <input
                type="text"
                value={formData.itemName}
                onChange={(e)=>setFormData(f=>({...f, itemName:e.target.value}))}
                required
              />
            </div>
            <div className="item">
              <h1>Brand</h1>
              <input
                type="text"
                value={formData.brand}
                onChange={(e)=>setFormData(f=>({...f, brand:e.target.value}))}
                required
              />
            </div>
            <div className="item">
              <h1>Code</h1>
              <input
                type="text"
                value={formData.code}
                onChange={(e)=>setFormData(f=>({...f, code:e.target.value}))}
                required
              />
            </div>
            <div className="item">
              <h1>Category</h1>
              <input
                type="text"
                value={formData.category}
                onChange={(e)=>setFormData(f=>({...f, category:e.target.value}))}
                required
              />
            </div>
          </div>

          <div className="form-right">
            <div className="item">
              <h1>Price</h1>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e)=>setFormData(f=>({...f, price:e.target.value}))}
                required
              />
            </div>
            <div className="item">
              <h1>Quantity</h1>
              <input
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e)=>setFormData(f=>({...f, quantity:e.target.value}))}
                required
              />
            </div>
            <div className="item-right">
              <h1>Logo (Optional)</h1>
              <input
                type="file"
                accept="image/*"
                onChange={(e)=>setFormData(f=>({...f, logo: e.target.files?.[0] || null}))}
              />
            </div>
          </div>

          <div className="bottom">
            <button type="button" onClick={()=>setIsOpen(false)} disabled={submitting}>Cancel</button>
            <button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Product'}</button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div>
      <button className='inventory-products-btn' onClick={() => setIsOpen(true)}>
        Add Product
      </button>
      {isOpen && createPortal(modalAddProduct, document.body)}
    </div>
  );
}

export default ModalAddProduct;