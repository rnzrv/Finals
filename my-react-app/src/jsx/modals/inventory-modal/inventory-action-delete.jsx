import React, { useState } from 'react'
import { createPortal } from 'react-dom';
import x from '../../../icons/x.svg';
import '../../../css/modal/inventory/delete.css';

function InventoryDeleteAction({ item, onDelete }) {

  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = () => {
    onDelete(item.id);
    setIsOpen(false);
  };

  const inventoryDeleteModal = (
    <div className="inventory-delete-action-modal-overlay">
      <div className="inventory-delete-action-modal">
        <div className="inventory-delete-modal-header">
          <h2 className="inventory-delete-action-modal-header">Delete Inventory Item</h2>
          <img src={x} alt="Close" onClick={()=> setIsOpen(false)}/>
        </div>
        
        <p className="inventory-delete-action-modal-message">
          Are you sure you want to delete <strong>{item?.itemName}</strong>?
        </p>
        <div className="modal-actions">
          <button onClick={() => setIsOpen(false)}>No</button>
          <button onClick={handleDelete}>Yes</button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button className="inventory-action-btn inventory-action-delete" onClick={() => setIsOpen(true)}>
        <img src={x} alt="Delete" />
      </button>
      {isOpen && createPortal(inventoryDeleteModal, document.body)}
    </>
  );
}

export default InventoryDeleteAction;