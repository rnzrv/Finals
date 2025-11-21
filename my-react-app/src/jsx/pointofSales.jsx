import React from 'react'
import Sidebar from "./Sidebar.jsx";
import "../css/pointofSales.css";
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
                <h1>Products</h1>
              </div>
              
            </div>

          </div>



        </div>


      </div>
    </div>
  )
}

export default PointOfSales



 