import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import "../../../css/modal/addProduct.css";
import x from '../../../icons/x.svg';

function ModalAddProduct({ onProductAdded }) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmMismatch, setConfirmMismatch] = useState(null); // holds mismatches array from backend
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

  const resetForm = () => {
    setFormData({
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
    setErrorMessage('');
    setConfirmMismatch(null);
  };

  // auto calculate grand total
  useEffect(() => {
    const cost = Number(formData.costUnit);
    const qty = Number(formData.quantity);

    if (Number.isFinite(cost) && Number.isFinite(qty)) {
      setFormData(f => ({ ...f, grandTotal: (cost * qty).toFixed(2) }));
    } else {
      setFormData(f => ({ ...f, grandTotal: '' }));
    }
  }, [formData.costUnit, formData.quantity]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const validate = () => {
    const { itemName, brand, code, costUnit, sellingPrice, reference, suppliers, quantity, grandTotal, expiryDate, category } = formData;
    const costUnitNum = Number(costUnit);
    const sellingPriceNum = Number(sellingPrice);
    const qtyNum = Number(quantity);
    const grandTotalNum = Number(grandTotal);
    const regexDate = /^\d{4}-\d{2}-\d{2}$/;

    if (!itemName.trim() || !brand.trim() || !code.trim() || !reference.trim() || !suppliers.trim() || !category.trim()) {
      setErrorMessage('All fields are required.');
      return false;
    }
    if (!Number.isFinite(costUnitNum) || costUnitNum <= 0) {
      setErrorMessage('Cost unit must be a number greater than 0.');
      return false;
    }
    if (!Number.isFinite(sellingPriceNum) || sellingPriceNum <= 0) {
      setErrorMessage('Selling price must be a number greater than 0.');
      return false;
    }
    if (!Number.isInteger(qtyNum) || qtyNum < 0) {
      setErrorMessage('Quantity must be an integer ≥ 0.');
      return false;
    }
    if (!Number.isFinite(grandTotalNum) || grandTotalNum < 0) {
      setErrorMessage('Grand Total must be a number ≥ 0.');
      return false;
    }
    if (category.trim() !== 'Product' && category.trim() !== 'Service') {
      setErrorMessage("Category must be either 'Product' or 'Service'.");
      return false;
    }
    if (!expiryDate.trim() || !regexDate.test(expiryDate.trim())) {
      setErrorMessage('Expiry date (YYYY-MM-DD) is required.');
      return false;
    }
    const today = new Date();
    const exp = new Date(expiryDate.trim());
    if (exp < today) {
      setErrorMessage('Expiry date must be a future date.');
      return false;
    }

    setErrorMessage('');
    return true;
  };

  const submitToBackend = async (forceUpdate = false) => {
    const token = sessionStorage.getItem('accessToken');
    const fd = new FormData();
    fd.append('itemName', formData.itemName.trim());
    fd.append('brand', formData.brand.trim());
    fd.append('code', formData.code.trim());
    fd.append('costUnit', Number(formData.costUnit));
    fd.append('sellingPrice', Number(formData.sellingPrice));
    fd.append('reference', formData.reference.trim());
    fd.append('suppliers', formData.suppliers.trim());
    fd.append('quantity', Number(formData.quantity));
    fd.append('grandTotal', Number(formData.grandTotal));
    fd.append('expiryDate', formData.expiryDate.trim());
    fd.append('category', formData.category.trim());
    if (forceUpdate) fd.append('forceUpdate', 'true');
    if (formData.logo) fd.append('logo', formData.logo);

    return await axios.post('http://localhost:8081/inventory/addInventory', fd, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const addProductHandle = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrorMessage('');

    try {
      await submitToBackend(false);
      onProductAdded && onProductAdded();
      resetForm();
      setIsOpen(false);
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;

      if (status === 409 && data?.canForceUpdate) {
        setConfirmMismatch(data?.mismatches || []);
        setErrorMessage('Existing product code has different details. Confirm to update fields and add quantity.');
      } else if (status === 409) {
        setErrorMessage(data?.error || 'Conflict: duplicate entry.');
      } else if (data?.error) {
        setErrorMessage(data.error);
      } else {
        setErrorMessage('Failed to add product.');
      }
      console.error('Error adding product:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmUpdateAndAddQty = async () => {
    setSubmitting(true);
    try {
      await submitToBackend(true);
      onProductAdded && onProductAdded();
      resetForm();
      setIsOpen(false);
    } catch (error) {
      const data = error?.response?.data;
      setErrorMessage(data?.error || 'Failed to update and add quantity.');
      console.error('Force update error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const mismatchModal = confirmMismatch && (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal">
        <div className="confirm-modal-header">
          <h3>Update Existing Item</h3>
          <button onClick={() => setConfirmMismatch(null)} aria-label="Close">×</button>
        </div>
        <div className="confirm-modal-body">
          <p>The code already exists with different details. Proceed to update fields and add quantity?</p>
          <ul>
            {confirmMismatch.map((m, i) => (
              <li key={i}>
                <strong>{m.field}:</strong> Existing = {String(m.existing)}, Incoming = {String(m.incoming)}
              </li>
            ))}
          </ul>
        </div>
        <div className="confirm-modal-actions">
          <button onClick={() => setConfirmMismatch(null)}>Cancel</button>
          <button onClick={confirmUpdateAndAddQty} disabled={submitting}>
            {submitting ? 'Updating...' : 'Update & Add Quantity'}
          </button>
        </div>
      </div>
    </div>
  );

  const modalAddProduct = (
    <div className={`addProduct ${isOpen ? 'open' : 'closed'}`}>
      <div className="add-inventory-product">
        <div className="add-inventory-product-title">
          <h2>Add Purchase</h2>
          <img src={x} alt="close-icon" onClick={() => setIsOpen(false)} />
        </div>

        {errorMessage && <div className="form-error">{errorMessage}</div>}

        <form className="form" onSubmit={addProductHandle}>
          <div className="form-top">
            <div className="form-left">
              <div className="item">
                <h1>Item Name:</h1>
                <input type="text" value={formData.itemName} onChange={(e) => setFormData(f => ({ ...f, itemName: e.target.value }))} required />
              </div>
              <div className="item">
                <h1>Brand:</h1>
                <input type="text" value={formData.brand} onChange={(e) => setFormData(f => ({ ...f, brand: e.target.value }))} required />
              </div>
              <div className="item">
                <h1>Code:</h1>
                <input type="text" value={formData.code} onChange={(e) => setFormData(f => ({ ...f, code: e.target.value }))} required />
              </div>
              <div className="item">
                <h1>Cost Unit:</h1>
                <input type="number" step="0.01" min="0" value={formData.costUnit} onChange={(e) => setFormData(f => ({ ...f, costUnit: e.target.value }))} required />
              </div>
              <div className="item">
                <h1>Selling Price:</h1>
                <input type="number" step="0.01" min="0" value={formData.sellingPrice} onChange={(e) => setFormData(f => ({ ...f, sellingPrice: e.target.value }))} required />
              </div>
              <div className="item category-item">
                <h1>Category</h1>
                <select value={formData.category} onChange={(e) => setFormData(f => ({ ...f, category: e.target.value }))} required>
                  <option value="">Select...</option>
                  <option value="Product">Product</option>
                  <option value="Service">Service</option>
                </select>
              </div>
            </div>

            <div className="form-right">
              <div className="item">
                <h1>Reference:</h1>
                <input type="text" value={formData.reference} onChange={(e) => setFormData(f => ({ ...f, reference: e.target.value }))} required />
              </div>
              <div className="item">
                <h1>Suppliers:</h1>
                <input type="text" value={formData.suppliers} onChange={(e) => setFormData(f => ({ ...f, suppliers: e.target.value }))} required />
              </div>
              <div className="item">
                <h1>Quantity</h1>
                <input type="number" min="0" step="1" value={formData.quantity} onChange={(e) => setFormData(f => ({ ...f, quantity: e.target.value }))} required />
              </div>
              <div className="item">
                <h1>Grand Total:</h1>
                <input  disabled type="number" min="0" step="0.01" value={formData.grandTotal} onChange={(e) => setFormData(f => ({ ...f, grandTotal: e.target.value }))} required />
              </div>
              <div className="item">
                <h1>Expiry Date:</h1>
                <input type="date" value={formData.expiryDate} onChange={(e) => setFormData(f => ({ ...f, expiryDate: e.target.value }))} required />
              </div>
              <div className="item-right">
                <h1>Logo (Optional)</h1>
                <input type="file" accept="image/*" onChange={(e) => setFormData(f => ({ ...f, logo: e.target.files?.[0] || null }))} />
              </div>
            </div>
          </div>

          <div className="form-bottom">
            <button type="button" className='Cancel' onClick={() => setIsOpen(false)} disabled={submitting}>Cancel</button>
            <button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Product'}</button>
          </div>
        </form>

        {mismatchModal}
      </div>
    </div>
  );

  return (
    <div>
      <button className="inventory-products-btn" onClick={() => setIsOpen(true)}>
        <div className="name">+ Add Purchase</div>
      </button>
      {isOpen && createPortal(modalAddProduct, document.body)}
    </div>
  );
}

export default ModalAddProduct;
