import Sidebar from './Sidebar.jsx';
import '../css/inventory.css';
import user from "../icons/user.svg";
import date from "../icons/date.svg";
import dropDown from "../icons/drop_down.svg";
import search from "../icons/search.svg";
import eye from "../icons/eye.svg";
import check from "../icons/checkbook.svg";
import x from "../icons/x.svg";

function Inventory() {
  return (
    <div className="inventory">
      <Sidebar />

      <div className="inventory-content">
        <header>
          <h2>INVENTORY</h2>
          <div className="inventory-account">
            <img src={user} alt="Admin Icon" />
            <p>Admin</p>
          </div>
        </header>

        <div className="inventory-main-content">
          <div className="inventory-utensil">
            <div className="inventory-select-period">
              <h3>Select Period:</h3>
              <div className="inventory-date">
                <img src={date} alt="Date Icon" />
                <h6>10 April 2024 - 30 June 2024</h6>
              </div>
            </div>

            <div className="inventory-export-product">
              <button className="inventory-products-btn">Add product</button>
              <button className="inventory-export-btn">
                Export <img src={dropDown} alt="Dropdown Icon" />
              </button>
            </div>
          </div>

          <div className="inventory-data">
            <div className="inventory-data-header">
              <h3>Inventory Overview</h3>
              <div className="inventory-search">
                <img src={search} alt="Search Icon" />
                <input type="text" placeholder="Search..." />
              </div>
            </div>

            <div className="inventory-table-container">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Brand</th>
                    <th>Code</th>
                    <th>Cost Unit</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="inventory-item-name">Shampoo</td>
                    <td className="inventory-item-text">Miniso</td>
                    <td className="inventory-item-text">C123</td>
                    <td className="inventory-item-text">₱50</td>
                    <td><span className="inventory-category-badge">Hair Care</span></td>
                    <td className="inventory-item-text">120</td>
                    <td>
                      <div className="inventory-actions-cell">
                        <button className="inventory-action-btn inventory-action-view">
                          <img src={eye} alt="View" />
                        </button>
                        <button className="inventory-action-btn inventory-action-edit">
                          <img src={check} alt="Edit" />
                        </button>
                        <button className="inventory-action-btn inventory-action-delete">
                          <img src={x} alt="Delete" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="inventory-item-name">Shampoo</td>
                    <td className="inventory-item-text">Miniso</td>
                    <td className="inventory-item-text">C123</td>
                    <td className="inventory-item-text">₱50</td>
                    <td><span className="inventory-category-badge">Hair Care</span></td>
                    <td className="inventory-item-text">120</td>
                    <td>
                      <div className="inventory-actions-cell">
                        <button className="inventory-action-btn inventory-action-view">
                          <img src={eye} alt="View" />
                        </button>
                        <button className="inventory-action-btn inventory-action-edit">
                          <img src={check} alt="Edit" />
                        </button>
                        <button className="inventory-action-btn inventory-action-delete">
                          <img src={x} alt="Delete" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Inventory;
