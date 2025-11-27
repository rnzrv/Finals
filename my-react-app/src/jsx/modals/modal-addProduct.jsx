import React, {useState, useEffect} from 'react'
import { createPortal } from 'react-dom';
import "../../css/modal/addProduct.css";
import x from '../../icons/x.svg';


function ModalAddProduct() {


    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        if(isOpen){
            setIsMounted(true);
            document.body.style.overflow = "hidden";
        }else{
            setIsMounted(false);
            document.body.style.overflow = "";}
        }, [isOpen]);

    const modalAddProduct = (
        // Logic to add product
        <div className={`addProduct ${isOpen ? 'open' : 'closed'}`}>
            <div className="add-inventory-product">
                <div className="add-inventory-product-title">
                    <h2>Add Product</h2>
                    <img src={x} alt="close-icon" onClick={() => setIsOpen(false)}/>    
                </div>        

                <form action="" className='form'>
                    <div className="form-left">
                        <div className="item">
                        <h1>Name</h1>
                        <input type="text" />
                        </div>
                        <div className="item">
                            <h1>Brand</h1>
                            <input type="text" />
                        </div>
                        <div className="item">
                            <h1>Category</h1>
                            <input type="dropdown" />
                        </div>
                    </div>
                    
                    <div className="form-right">
                        <div className="item">
                            <h1>Cost Unit</h1>
                            <input type="text" />
                        </div>
                        <div className="item">
                            <h1>Quantity</h1>
                            <input type="number" />
                        </div>
                        <div className="item-right">
                            <h1>Logo (Optional)</h1>
                            <input type="file" />
                        </div>
                    </div>
                    {/* LOGO insertion */}
                    
                </form>

                <div className="bottom">
                    <button onClick={() => setIsOpen(false)}>Save Product</button>
            
                </div>

                </div>
        </div>

        
    );
    
  return (
    <div>
      <button className='inventory-products-btn' onClick={() => setIsOpen(true)}>
        Add Product
      </button>

      {isMounted && createPortal(modalAddProduct, document.body)}
    </div>
  )
}

export default ModalAddProduct
