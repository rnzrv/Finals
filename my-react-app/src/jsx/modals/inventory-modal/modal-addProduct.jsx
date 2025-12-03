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
    costUnit: '',
    sellingPrice: '',
    reference: '',
    suppliers: '',
    quantity: '',
    grandTotal: '',
    expiryDate: '',
    category: '',
    logo: null,
  });

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const validate = () => {
    const { itemName, brand, code, costUnit, sellingPrice, date, reference, suppliers, quantity, grandTotal, expiryDate, category } = formData;
    const costUnitNum = Number(costUnit);
    const sellingPriceNum = Number(sellingPrice);
    const qtyNum = Number(quantity);
    const regexDate = /^\d{4}-\d{2}-\d{2}$/;
    if (!itemName.trim() || !brand.trim() || !code.trim() || !category.trim() || !expiryDate.trim()) {
      setErrorMessage('All fields are required.');
      return false;
    }
    if (!Number.isFinite(costUnitNum) || costUnitNum <= 0) {
      setErrorMessage('Cost unit must be a number greater than 0.');
      return false;
    }
    if (!Number.isInteger(qtyNum) || qtyNum < 0) {
      setErrorMessage('Quantity must be an integer ≥ 0.');
      return false;
    }
    if(!Number.isFinite(sellingPriceNum) || sellingPriceNum <= 0) {
      setErrorMessage('Selling price must be a number greater than 0.');
      return false;
    }

    if (category.trim() !== 'Product' && category.trim() !== 'Service') {
      setErrorMessage("Category must be either 'Product' or 'Service'.");
      return false;
    }

    if (category.trim() === 'Product') {
      if (!expiryDate.trim() || !regexDate.test(expiryDate.trim())) {
        setErrorMessage('Expiry date (YYYY-MM-DD) is required for products.');
        return false;
      }
      const today = new Date();
      const exp = new Date(expiryDate.trim());
      if (exp < today) {
        setErrorMessage('Expiry date must be a future date.');
        return false;
      }
    }
    setErrorMessage('');
    return true;
  };


  const addProductHandle = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      const formDataToSend = new FormData();

      formDataToSend.append('itemName', formData.itemName.trim());
      formDataToSend.append('brand', formData.brand.trim());
      formDataToSend.append('code', formData.code.trim());
      formDataToSend.append('costUnit', Number(formData.costUnit));
      formDataToSend.append('sellingPrice', Number(formData.sellingPrice));
      formDataToSend.append('reference', formData.reference.trim());
      formDataToSend.append('suppliers', formData.suppliers.trim());
      formDataToSend.append('quantity', Number(formData.quantity));
      formDataToSend.append('grandTotal', Number(formData.grandTotal));  
      formDataToSend.append('expiryDate', formData.expiryDate.trim());
      formDataToSend.append('category', formData.category.trim());
      if (formData.logo) {
        formDataToSend.append('logo', formData.logo);
      }
      await axios.post('http://localhost:8081/inventory/addInventory', formDataToSend, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onProductAdded && onProductAdded(); // let parent refresh/append
      setFormData({ itemName:'', brand:'', code:'', costUnit:'', sellingPrice:'', date:'', reference:'', suppliers:'', quantity:'', grandTotal:'', expiryDate:'', category:'', logo:null });
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
              <h1>Item Name:</h1>
              <input
                type="text"
                value={formData.itemName}
                onChange={(e)=>setFormData(f=>({...f, itemName:e.target.value}))}
                required
              />

            </div>
            <div className="item">
              <h1>Brand: </h1>
              <input
                type="text"
                value={formData.brand}
                onChange={(e)=>setFormData(f=>({...f, brand:e.target.value}))}
                required
              />
            </div>
            <div className="item">
              <h1>Code: </h1>
              <input
                type="text"
                value={formData.code}
                onChange={(e)=>setFormData(f=>({...f, code:e.target.value}))}
                required
              />
            </div>
            <div className="item">
              <h1>Cost Unit: </h1>
              <input
                type="text"
                value={formData.costUnit}
                onChange={(e)=>setFormData(f=>({...f, costUnit:e.target.value}))}
                required
              />
            </div>

            <div className="item">
              <h1>Selling Price: </h1>
              <input
                type="text"
                value={formData.sellingPrice}
                onChange={(e)=>setFormData(f=>({...f, sellingPrice:e.target.value}))}
                required
              />
            </div>
            
          </div>

          <div className="form-right">
            {/* <div className="item">
              <h1>Price</h1>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e)=>setFormData(f=>({...f, price:e.target.value}))}
                required
              />
            </div> */}
            <div className="item">
              <h1>Reference: </h1>
              <input
                type="text"
                value={formData.reference}
                onChange={(e)=>setFormData(f=>({...f, reference:e.target.value}))}
                required
              />
            </div>

            <div className="item">
              <h1>Suppliers: </h1>
              <input
                type="text"
                value={formData.suppliers}
                onChange={(e)=>setFormData(f=>({...f, suppliers:e.target.value}))}
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

            <div className="item">
              <h1>Grand Total:</h1>
              <input
                type="number"
                min="0"
                value={formData.grandTotal}
                onChange={(e)=>setFormData(f=>({...f, grandTotal:e.target.value}))}
                required
              />
            </div>
            <div className="item">
              <h1>Expiry Date: </h1>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e)=>setFormData(f=>({...f, expiryDate:e.target.value}))}
                required
              />
            </div>
            <div className="item">
              <h1>Category</h1>
              <select
                value={formData.category}
                onChange={(e)=>setFormData(f=>({...f, category:e.target.value}))}
                required
              >

              <option value="">Select...</option>
              <option value="Product">Product</option>
              <option value="Service">Service</option>
              </select>
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