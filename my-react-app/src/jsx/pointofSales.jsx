import React from 'react'
import Sidebar from "./Sidebar.jsx";
import "../css/pointofSales.css";
import x from "../icons/x.svg";
import trash from "../icons/trash.svg";
import card from "../icons/card.svg";
import logo from "../icons/logo.svg";
import category from "../icons/category.svg";
import arrowup from "../icons/arrow-up.svg";
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
                <div className="product-title-top">
                  <div className="product-title">
                    <h1>Products Name</h1>
                  <h3>Product_serial_num</h3>
                  </div>
                  <div className="product-right">
                    <img src={x} alt="" />
                  </div>
                </div>

                <div className="product-title-bottom">
                  <div className="quantity">
                    <div className="quality-controls">
                      <button>-</button>
                      <input type="text" value={"1000"} onChange={""} onBlur={""}/>
                      <button>+</button>
                    </div>

                    
                    <div className="price">
                      <h2>$00.00</h2>
                    </div>
                  </div>
                </div>              
              </div>
              <div className="cart-items">
                <div className="product-title-top">
                  <div className="product-title">
                    <h1>Products Name</h1>
                  <h3>Product_serial_num</h3>
                  </div>
                  <div className="product-right">
                    <img src={x} alt="" />
                  </div>
                </div>

                <div className="product-title-bottom">
                  <div className="quantity">
                    <div className="quality-controls">
                      <button>-</button>
                      <input type="text" value={"1000"} onChange={""} onBlur={""}/>
                      <button>+</button>
                    </div>

                    
                    <div className="price">
                      <h2>$00.00</h2>
                    </div>
                  </div>
                </div>              
              </div><div className="cart-items">
                <div className="product-title-top">
                  <div className="product-title">
                    <h1>Products Name</h1>
                  <h3>Product_serial_num</h3>
                  </div>
                  <div className="product-right">
                    <img src={x} alt="" />
                  </div>
                </div>

                <div className="product-title-bottom">
                  <div className="quantity">
                    <div className="quality-controls">
                      <button>-</button>
                      <input type="text" value={"1000"} onChange={""} onBlur={""}/>
                      <button>+</button>
                    </div>

                    
                    <div className="price">
                      <h2>$00.00</h2>
                    </div>
                  </div>
                </div>              
              </div><div className="cart-items">
                <div className="product-title-top">
                  <div className="product-title">
                    <h1>Products Name</h1>
                  <h3>Product_serial_num</h3>
                  </div>
                  <div className="product-right">
                    <img src={x} alt="" />
                  </div>
                </div>

                <div className="product-title-bottom">
                  <div className="quantity">
                    <div className="quality-controls">
                      <button>-</button>
                      <input type="text" value={"1000"} onChange={""} onBlur={""}/>
                      <button>+</button>
                    </div>

                    
                    <div className="price">
                      <h2>$00.00</h2>
                    </div>
                  </div>
                </div>              
              </div><div className="cart-items">
                <div className="product-title-top">
                  <div className="product-title">
                    <h1>Products Name</h1>
                  <h3>Product_serial_num</h3>
                  </div>
                  <div className="product-right">
                    <img src={x} alt="" />
                  </div>
                </div>

                <div className="product-title-bottom">
                  <div className="quantity">
                    <div className="quality-controls">
                      <button>-</button>
                      <input type="text" value={"1000"} onChange={""} onBlur={""}/>
                      <button>+</button>
                    </div>

                    
                    <div className="price">
                      <h2>$00.00</h2>
                    </div>
                  </div>
                </div>              
              </div>
              
              
            </div>

            <div className="product-list-bottom">
              <div className="buttons">
                
              <button><img src={trash} alt="Trash Icon" />Clear Cart</button>
              </div>
              <div className="subtotal-tax">
                <div className="subtotal">
                  <h1>Subtotal</h1>
                  <h2>$18,000</h2>
                </div>
                <div className="tax">
                  <h1>Tax(10%)</h1>
                  <h2>$1000</h2>
                </div>
              </div>
              <div className="product-total">
                <h1>Total</h1>
                <h2>$19,000</h2>
              </div>
              <div className="complete-sale">
                <button>Complete Sale</button>
              </div>
              <div className="payment-method">
                <button> ₱ Cash</button>
                <button><img src={card} alt="Card Icon" />card</button>
              </div>
            </div>

          </div>
          <div className="POS-right">
            <div className="right-content">
              <input type="text" value={"Search product or Services"}/>
            </div>
            <div className="right-buttons">
              <button id = "all">All</button>
              <button id = "category">Category 1</button>
              <button id = "category">Category 2</button>
              <button id = "category">Category 3</button>
            </div>

            <div className="right-grid">
              <div className="right-grid-container">
                <div className="right-grid-item">
                  <div className="right-grid-top">
                    <div className="product-image"><img src={logo} alt="" /></div>
                    <div className="category">Facial</div>

                  </div>
                  
                  <div className="product-details">
                    <div className="product-title-right">
                      <h1>Product Name</h1>
                      <h3>Product_serial_num</h3>
                    </div>
                    <div className="product-price-stock">
                      <h3>In Stock: 1000</h3>
                      <h2>$00.00</h2>

                    </div>
                  </div>
                </div>
                <div className="right-grid-item">
                  <div className="right-grid-top">
                    <div className="product-image"><img src={logo} alt="" /></div>
                    <div className="category">Facial</div>

                  </div>
                  
                  <div className="product-details">
                    <div className="product-title-right">
                      <h1>Product Name</h1>
                      <h3>Product_serial_num</h3>
                    </div>
                    <div className="product-price-stock">
                      <h3>In Stock: 1000</h3>
                      <h2>$00.00</h2>

                    </div>
                  </div>
                </div><div className="right-grid-item">
                  <div className="right-grid-top">
                    <div className="product-image"><img src={logo} alt="" /></div>
                    <div className="category">Facial</div>

                  </div>
                  
                  <div className="product-details">
                    <div className="product-title-right">
                      <h1>Product Name</h1>
                      <h3>Product_serial_num</h3>
                    </div>
                    <div className="product-price-stock">
                      <h3>In Stock: 1000</h3>
                      <h2>$00.00</h2>

                    </div>
                  </div>
                </div><div className="right-grid-item">
                  <div className="right-grid-top">
                    <div className="product-image"><img src={logo} alt="" /></div>
                    <div className="category">Facial</div>

                  </div>
                  
                  <div className="product-details">
                    <div className="product-title-right">
                      <h1>Product Name</h1>
                      <h3>Product_serial_num</h3>
                    </div>
                    <div className="product-price-stock">
                      <h3>In Stock: 1000</h3>
                      <h2>$00.00</h2>

                    </div>
                  </div>
                </div><div className="right-grid-item">
                  <div className="right-grid-top">
                    <div className="product-image"><img src={logo} alt="" /></div>
                    <div className="category">Facial</div>

                  </div>
                  
                  <div className="product-details">
                    <div className="product-title-right">
                      <h1>Product Name</h1>
                      <h3>Product_serial_num</h3>
                    </div>
                    <div className="product-price-stock">
                      <h3>In Stock: 1000</h3>
                      <h2>$00.00</h2>

                    </div>
                  </div>
                </div><div className="right-grid-item">
                  <div className="right-grid-top">
                    <div className="product-image"><img src={logo} alt="" /></div>
                    <div className="category">Facial</div>

                  </div>
                  
                  <div className="product-details">
                    <div className="product-title-right">
                      <h1>Product Name</h1>
                      <h3>Product_serial_num</h3>
                    </div>
                    <div className="product-price-stock">
                      <h3>In Stock: 1000</h3>
                      <h2>$00.00</h2>

                    </div>
                  </div>
                </div><div className="right-grid-item">
                  <div className="right-grid-top">
                    <div className="product-image"><img src={logo} alt="" /></div>
                    <div className="category">Facial</div>

                  </div>
                  
                  <div className="product-details">
                    <div className="product-title-right">
                      <h1>Product Name</h1>
                      <h3>Product_serial_num</h3>
                    </div>
                    <div className="product-price-stock">
                      <h3>In Stock: 1000</h3>
                      <h2>$00.00</h2>

                    </div>
                  </div>
                </div><div className="right-grid-item">
                  <div className="right-grid-top">
                    <div className="product-image"><img src={logo} alt="" /></div>
                    <div className="category">Facial</div>

                  </div>
                  
                  <div className="product-details">
                    <div className="product-title-right">
                      <h1>Product Name</h1>
                      <h3>Product_serial_num</h3>
                    </div>
                    <div className="product-price-stock">
                      <h3>In Stock: 1000</h3>
                      <h2>$00.00</h2>

                    </div>
                  </div>
                </div><div className="right-grid-item">
                  <div className="right-grid-top">
                    <div className="product-image"><img src={logo} alt="" /></div>
                    <div className="category">Facial</div>

                  </div>
                  
                  <div className="product-details">
                    <div className="product-title-right">
                      <h1>Product Name</h1>
                      <h3>Product_serial_num</h3>
                    </div>
                    <div className="product-price-stock">
                      <h3>In Stock: 1000</h3>
                      <h2>$00.00</h2>

                    </div>
                  </div>
                </div>
     
        
        
        
        
                
              </div>
            </div>

            <div className="right-bottom">
              <h1>Sales History</h1>
              <img src={arrowup} alt="Arrow Up" />
            </div>
          </div>



        </div>


      </div>
    </div>
  )
}

export default PointOfSales



 