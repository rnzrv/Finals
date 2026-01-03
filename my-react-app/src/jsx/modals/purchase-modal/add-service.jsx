import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import "../../../css/modal/POS/addService.css";
import check from "../../../icons/checkbook.svg";

function AddServiceAction({ onSuccess }) {
  const [isOpen, setIsOpen] = useState(false);
  const [serviceName, setServiceName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [logo, setLogo] = useState(null);
  const [consentForm, setConsentForm] = useState(null); // ✅ Add consent form state
  const [inventory, setInventory] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  const token = sessionStorage.getItem("accessToken");

  useEffect(() => {
    if (isOpen) {
      axios.get("http://localhost:8081/pos/pos?product=true", {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setInventory(res.data);
      });
    }
  }, [isOpen]);

  const toggleItem = (item) => {
    const exists = selectedItems.find(i => i.code === item.code);
    if (exists) {
      setSelectedItems(selectedItems.filter(i => i.code !== item.code));
    } else {
      setSelectedItems([...selectedItems, { ...item, qty: 1, price: item.sellingPrice }]);
    }
  };

  const changeQty = (code, value) => {
    setSelectedItems(items =>
      items.map(item => item.code === code ? { ...item, qty: value } : item)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!serviceName || !price || selectedItems.length === 0) {
      alert("Fill all required fields");
      return;
    }

    const formData = new FormData();
    formData.append("serviceName", serviceName);
    formData.append("description", description);
    formData.append("price", price);

    if (logo) formData.append("logo", logo);
    if (consentForm) formData.append("consentForm", consentForm); // ✅ Append consent form

    formData.append(
      "items",
      JSON.stringify(
        selectedItems.map(item => ({
          code: item.code,
          itemName: item.itemName,
          qty: Number(item.qty) || 1,
          price: item.price
        }))
      )
    );

    try {
      await axios.post(
        "http://localhost:8081/services/services",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      alert("Service added successfully!");
      onSuccess && onSuccess();
      setIsOpen(false);

      setServiceName("");
      setDescription("");
      setPrice("");
      setLogo(null);
      setConsentForm(null); // ✅ Reset consent form
      setSelectedItems([]);
    } catch (err) {
      console.error(err);
      alert("Failed to add service");
    }
  };

  const serviceModal = (
    <div className="modal-backdrop">
      <div className="modal-box">
        <h2>Add New Service</h2>
        <form onSubmit={handleSubmit}>

      <div className="add-service-top-bottom">
        <div className="add-service-top">
          
          <div className="add-service-item">Service Name:</div>
          <input
            placeholder="Service Name"
            value={serviceName}
            onChange={e => setServiceName(e.target.value)}
          />
          <div className="add-service-item">Service Description:</div>
          <input
            placeholder="Service Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <div className="add-service-item">Service Price:</div>
          <input
            placeholder="Service Price"
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
          />
        </div>

        <div className="add-service-bottom">
          <div className="add-service-item">LOGO</div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogo(e.target.files[0])}
          />

          <div className="add-service-item">Consent Form</div>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setConsentForm(e.target.files[0])} // ✅ Handle change
          />
        </div>
      </div>

          <h3>Select Inventory Items</h3>
          <div className="inventory-list">
            {inventory.map(item => (
              <div key={item.code} className="inventory-item">
                <label>{item.itemName} (Stock: {item.quantity})</label>
                <input
                  type="checkbox"
                  checked={selectedItems.some(i => i.code === item.code)}
                  onChange={() => toggleItem(item)}
                />
                {selectedItems.some(i => i.code === item.code) && (
                  <input
                    className="qty"
                    type="number"
                    min="1"
                    value={selectedItems.find(i => i.code === item.code).qty}
                    onChange={(e) => changeQty(item.code, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="modal-actions">
            <button type="submit">Save Service</button>
            <button type="button" onClick={() => setIsOpen(false)}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div>
      <button className="inventory-action-btn" onClick={() => setIsOpen(true)}>
        <img src={check} alt="Add Service" />  Add Service
      </button>
      {isOpen && createPortal(serviceModal, document.body)}
    </div>
  );
}

export default AddServiceAction;
