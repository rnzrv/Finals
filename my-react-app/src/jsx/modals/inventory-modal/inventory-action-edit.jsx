import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import check from '../../../icons/checkbook.svg';
import '../../../css/modal/inventory/edit.css';
import x from '../../../icons/x.svg';

function toDateInput(value) {
  if (!value) return '';
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  // Try mm-dd-YYYY
  const mdy = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (mdy) return `${mdy[3]}-${mdy[1]}-${mdy[2]}`;
  // Fallback to Date parsing
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function InventoryEditAction({ item, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [logoFile, setLogoFile] = useState(null);

  const [formData, setFormData] = useState({
    itemName: item.itemName || '',
    brand: item.brand || '',
    code: item.code || '',
    costUnit: item.costUnit ?? '',
    sellingPrice: item.sellingPrice ?? '',
    category: item.category || '',
    quantity: item.quantity ?? '',
    expiryDate: toDateInput(item.expiryDate),
    logo: item.logo || '',
  });

  const validate = () => {
    const { itemName, brand, code, category, costUnit, sellingPrice, quantity, expiryDate } = formData;

    if (!itemName.trim() || !brand.trim() || !code.trim() || !category.trim()) {
      setErrorMessage('All text fields are required.');
      return false;
    }

    const cu = Number(costUnit);
    const sp = Number(sellingPrice);
    const q = Number(quantity);

    if (!Number.isFinite(cu) || cu < 0) {
      setErrorMessage('Cost unit must be a number ≥ 0.');
      return false;
    }
    if (!Number.isFinite(sp) || sp <= 0) {
      setErrorMessage('Selling price must be a number > 0.');
      return false;
    }
    if (!Number.isInteger(q) || q < 0) {
      setErrorMessage('Quantity must be an integer ≥ 0.');
      return false;
    }

    // expiryDate is optional; if present must be valid
    if (expiryDate && Number.isNaN(Date.parse(expiryDate))) {
      setErrorMessage('Expiry date must be a valid date (YYYY-MM-DD).');
      return false;
    }

    setErrorMessage('');
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/^image\/(png|jpe?g|gif|webp)$/)) {
        setErrorMessage('Only image files (png, jpg, jpeg, gif, webp) are allowed');
        e.target.value = '';
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('File size must be less than 5MB');
        e.target.value = '';
        return;
      }
      setLogoFile(file);
      setErrorMessage('');
    }
  };

  const editProductHandle = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const token = sessionStorage.getItem('accessToken');

      const fd = new FormData();
      fd.append('itemName', formData.itemName.trim());
      fd.append('brand', formData.brand.trim());
      fd.append('code', formData.code.trim());
      fd.append('costUnit', Number(formData.costUnit));
      fd.append('sellingPrice', Number(formData.sellingPrice));
      fd.append('category', formData.category.trim());
      fd.append('quantity', Number(formData.quantity));
      fd.append('expiryDate', formData.expiryDate || '');

      if (logoFile) {
        fd.append('logo', logoFile);
      }

      await axios.put(
        `http://localhost:8081/inventory/updateInventory/${item.itemId}`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      onUpdate && onUpdate();
      setIsOpen(false);
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Failed to update inventory item.');
      console.error('Update error:', error);
    } finally {
      setSubmitting(false);
    }
  };


  const inventoryEditModal = (
    <div className="inventory-edit-action-modal-overlay">
      <div className="inventory-edit-action-modal">
        <div className="inventory-edit-modal-header">
          <h2 className="inventory-edit-action-modal-header">Edit Inventory Item</h2>
           <button className="inventory-edit-close" onClick={() => setIsOpen(false)}>
              <img src={x} alt="Close" />
        </button>
        </div>

        <div className="inventory-edit-action-modal-body">
          {errorMessage && <div className="inv-edit-error">{errorMessage}</div>}

          <form className="inventory-action-form" onSubmit={editProductHandle}>
            <div className="inv-act-edit-whole">
              <div className="inv-act-edit-top">
                <div className="inventory-edit-action-left">
                      <label>
                        Item Name:
                        <input
                          type="text"
                          name="itemName"
                          value={formData.itemName}
                          onChange={handleChange}
                          required
                        />
                      </label>

                      <label>
                        Brand:
                        <input
                          type="text"
                          name="brand"
                          value={formData.brand}
                          onChange={handleChange}
                          required
                        />
                      </label>
                    

                      <label>
                        Code:
                        <input
                          type="text"
                          name="code"
                          value={formData.code}
                          onChange={handleChange}
                          required
                        />
                      </label>

                      <label>
                        Cost Unit:
                        <input
                          type="number"
                          name="costUnit"
                          value={formData.costUnit}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          required
                        />
                      </label>
                    </div>

                    <div className="inventory-edit-action-right">
                      <label>
                        Selling Price:
                        <input
                          type="number"
                          name="sellingPrice"
                          value={formData.sellingPrice}
                          onChange={handleChange}
                          min="0"
                          step="0.01"
                          required
                        />
                      </label>

                      <label>
                        Category:
                        <input
                          type="text"
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          required
                        />
                      </label>

                      <label>
                        Quantity:
                        <input
                          type="number"
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleChange}
                          min="0"
                          step="1"
                          required
                        />
                      </label>

                      <label>
                        Expiry Date:
                        <input
                          type="date"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleChange}
                        />
                      </label>

                    </div>
                </div>
                <div className="inventory-edit-action-bottom">
                  <label>
                            Logo (Image File)
                            <input
                              type="file"
                              name="logoFile"
                              accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                              onChange={handleFileChange}
                            />
                            {formData.logo && !logoFile && (
                              <small style={{ display: 'block', marginTop: '4px', color: '#666' }}>
                                Current: {formData.logo.split('/').pop()}
                              </small>
                            )}
                            {logoFile && (
                              <small style={{ display: 'block', marginTop: '4px', color: '#4CAF50' }}>
                                New file selected: {logoFile.name}
                              </small>
                            )}
                  </label>
                </div>

            <div className="inventory-edit-actions">
              <button type="button" onClick={() => setIsOpen(false)} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
          </form>
        </div>

       
      </div>
    </div>
  );

  return (
    <div>
      <button className="inventory-action-btn inventory-action-edit" onClick={() => setIsOpen(true)}>
        <img src={check} alt="Edit" />
      </button>
      {isOpen && createPortal(inventoryEditModal, document.body)}
    </div>
  );
}

export default InventoryEditAction;