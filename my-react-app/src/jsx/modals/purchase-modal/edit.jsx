import React, {useState} from 'react'
import { createPortal } from 'react-dom'
import check from '../../../icons/checkbook.svg'; 
import '../../../css/modal/inventory/edit.css';
function InventoryEditAction() {

    const [isOpen, setIsOpen] = useState(false);

    const inventoryEditModal = (
        <div className="inventory-edit-action-modal-overlay">
          <div className="inventory-edit-action-modal">
            <div className="inventory-edit-modal-header">
              <h2 className="inventory-edit-action-modal-header">Edit Purchase Item</h2>
            </div>
            <div className="inventory-edit-action-modal-body">
            <form className='inventory-action-form'>
                <div className="inventory-edit-action-left">
                    <label>
                    Date:
                    <input type="text" name="itemName" />
                    </label>
                

                    <label>
                    Reference:
                    <input type="text" name="brand" />
                    </label>
                </div>
                <div className="inventory-edit-action-middle">
                    <label>
                    Suppliers:
                    <input type="text" name="code" />
                    </label>

                    <label>
                    Quantity:
                    <input type="number" name="price" />
                    </label>
                </div>

                <div className="inventory-edit-action-right">                
                    <label>
                    Grand Total:
                    <input type="number" name="sellingPrice" />
                    </label>

                    <label>
                    Expiry Date:
                    <input type="Date" name="sellingPrice" />
                    </label>
                </div>
            </form>
            
            </div>
            <button onClick={()=> setIsOpen(false)}>Close</button>

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
  )
}

export default InventoryEditAction
