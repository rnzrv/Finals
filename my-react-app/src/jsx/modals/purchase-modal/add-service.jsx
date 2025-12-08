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
  const [logo, setLogo] = useState("");
  const [inventory, setInventory] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  const token = sessionStorage.getItem("accessToken");

  // ✅ Load inventory when modal opens
  useEffect(() => {
    if (isOpen) {
      axios.get("http://localhost:8081/pos/pos", {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setInventory(res.data);
      });
    }
  }, [isOpen]);

  // ✅ Toggle inventory item
  const toggleItem = (item) => {
    const exists = selectedItems.find(i => i.code === item.code);

    if (exists) {
      setSelectedItems(selectedItems.filter(i => i.code !== item.code));
    } else {
      setSelectedItems([
        ...selectedItems,
        { ...item, qty: 1, price: item.sellingPrice }
      ]);
    }
  };

  const changeQty = (code, qty) => {
    setSelectedItems(selectedItems.map(item =>
      item.code === code ? { ...item, qty: Number(qty) } : item
    ));
  };

  // ✅ Submit Service
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!serviceName || !price || selectedItems.length === 0) {
      alert("Fill all required fields");
      return;
    }

    const payload = {
      serviceName,
      description,
      price,
      logo,
      items: selectedItems.map(item => ({
        code: item.code,
        itemName: item.itemName,
        qty: item.qty,
        price: item.price
      }))
    };

    try {
      await axios.post("http://localhost:8081/services/services", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      alert("Service added successfully!");
      onSuccess && onSuccess();
      setIsOpen(false);

      setServiceName("");
      setDescription("");
      setPrice("");
      setLogo("");
      setSelectedItems([]);

    } catch (err) {
      console.error(err);
      alert("Failed to add service");
    }
  };

  // ✅ MODAL JSX (PORTAL)
  const serviceModal = (
    <div className="modal-backdrop">
      <div className="modal-box">

        <h2>Add New Service</h2>

        <form onSubmit={handleSubmit}>

          <input
            placeholder="Service Name"
            value={serviceName}
            onChange={e => setServiceName(e.target.value)}
          />

          <input
            placeholder="Service Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          <input
            placeholder="Service Price"
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
          />

          <input
            placeholder="Logo Filename (optional)"
            value={logo}
            onChange={e => setLogo(e.target.value)}
          />

          <h3>Select Inventory Items</h3>

          <div className="inventory-list">
            {inventory.map(item => (
              <div key={item.code} className="inventory-item">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedItems.some(i => i.code === item.code)}
                    onChange={() => toggleItem(item)}
                  />
                  {item.itemName} (Stock: {item.quantity})
                </label>

                {selectedItems.some(i => i.code === item.code) && (
                  <input
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

  // ✅ BUTTON + PORTAL RENDER
  return (
    <div>
      <button className="inventory-action-btn" onClick={() => setIsOpen(true)}>
        <img src={check} alt="Add Service" />
      </button>

      {isOpen && createPortal(serviceModal, document.body)}
    </div>
  );
}

export default AddServiceAction;
