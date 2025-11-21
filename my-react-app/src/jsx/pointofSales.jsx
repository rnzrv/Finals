import React from 'react'
import Sidebar from "./Sidebar.jsx";
import "../css/pointofSales.css";
import x from "../icons/x.svg";
const PointOfSales = () => {
  return (

    
    <div className='point-of-sales'>
      {/* const cart = [{

      }] */}
      <Sidebar />

      <div className="point-of-sales-content">
        <header>
          <h2>POINT OF SALES</h2>
        </header>

        <div className="point-of-sales-main-content">
          <div className="POS-left">
            <div className="POS-left-top">
              <h1>Customer</h1>
              <div className="POS-search-bar">
                <input type="text" placeholder="" />
              </div>
            </div>
            
            <div className="br"></div>
            
            <div className="POS-product-list">
              <div className="cart-items">
                <div className="product-title">
                  <h1>Products Name</h1>
                <h3>Product_serial_num</h3>

                </div>

                <div className="product-right">
                  <img src={x} alt="" />
                </div>
                
                
              </div>
              
            </div>

          </div>



        </div>


      </div>
    </div>
  )
}

export default PointOfSales



 