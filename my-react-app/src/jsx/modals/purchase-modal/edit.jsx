import React, {useState} from 'react'
import { createPortal } from 'react-dom'
import check from '../../../icons/checkbook.svg'; 
import '../../../css/modal/purchase/edit.css';
function InventoryEditAction({item}) {

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
                    Item Name:
                    <input type="text" name="itemName" defaultValue={item?.itemName} />
                  </label>
                    <label>
                    Date:
                    <input type="text" name="itemName" defaultValue={item?.date}/>
                    </label>
                

                    <label>
                    Reference:
                    <input type="text" name="reference" defaultValue={item?.reference} />
                    </label>
                </div>
                <div className="inventory-edit-action-middle">
                    <label>
                    Suppliers:
                    <input type="text" name="suppliers" defaultValue={item?.suppliers} />
                    </label>

                    <label>
                    Quantity:
                    <input type="number" name="quantity" defaultValue={item?.quantity} />
                    </label>
                </div>

                <div className="inventory-edit-action-right">                
                    <label>
                    Grand Total:
                    <input type="number" name="grandTotal" defaultValue={item?.grandTotal} />
                    </label>

                    <label>
                    Expiry Date:
                    <input type="Date" name="expiryDate" defaultValue={item?.expiryDate} />
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
