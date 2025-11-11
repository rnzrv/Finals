import Sidebar from "./Sidebar.jsx";
import user from "../icons/user.svg";
import "../css/reports.css";
import calendar from "../icons/calendar.svg";
import uptrend from "../icons/uptrend.svg";
import downtrend from "../icons/downtrend.svg";
import percent from "../icons/percent.svg";
function Reports() {
  return (
    <div className="reports">
      <Sidebar />

      <div className="dashboard-content">
        <header>
          <h2>REPORTS</h2>
          <div className="dashboard-account">
            <img src={user} alt="Admin Icon" />
            <p>Admin</p>
          </div>
        </header>

        <div className="reports-container">
          <div className="reports-utilities">
            <div className="reports-util-left">
              <img src={calendar} alt="Calendar Icon" />
              <h1>Period:</h1>
              <input
                type="text"
                placeholder="10 April 2024 - 30 June 2024"
                className="period-input"
              />
            </div>

            <div className="reports-util-mid">
              <button>Weekly</button>
              <button>Monthly</button>
              <button>Quarterly</button>
              <button>Yearly</button>
            </div>

            <div className="reports-util-right">
              <button className="export-btn">Export</button>
            </div>

            
          </div>
          <div className="reports-performance">
                <h3>Financial Reports</h3>
                
          </div>

          <div className="reports-essentials">
            <div className="reports-essential-container">
              <div className="reports-essential-item1 reports-essential-item">
                <div className="reports-essential-item1-logo">
                  <h1>₱</h1>
                </div>

                <div className="reports-essential-item1-title">
                  <h3>Total Revenue</h3>
                  <h2>₱ 120,000</h2>
                  <h1>vs from last month</h1>
                </div>
                
              </div>
              <div className="reports-essential-item2 reports-essential-item">
                <div className="reports-essential-item2-logo">
                  <img src={uptrend} alt="" />
                </div>

                <div className="reports-essential-item2-title">
                  <h3>Net Profit</h3>
                  <h2>$85,000</h2>
                  <h1>+3% from last month</h1>
                </div>
              </div>
              <div className="reports-essential-item3 reports-essential-item">
                <div className="reports-essential-item3-logo">
                  <img src={downtrend} alt="" />
                </div>

                <div className="reports-essential-item3-title">
                  <h3>Total Expenses</h3>
                  <h2>$35,000</h2>
                  <h1>+8% from last month</h1>
                </div>
              </div>
              <div className="reports-essential-item4 reports-essential-item">
                <div className="reports-essential-item4-logo">
                  <img src={percent} alt="" />
                </div>

                <div className="reports-essential-item4-title">
                  <h3>Profit Margin</h3>
                  <h2>12.5%</h2>
                  <h1>+2% from last month</h1>
                </div>
              </div>
              <div className="revenue-by-service-type">
                <div className="revenue-by-service-type-title">
                  <h3>Revenue by Service Type</h3>
                  <h1>Performances</h1>
                </div>
                

                <div className="revenue-by-service-type-chart">
                  <div className="progress-container">
                    <div className="progress-top">
                      <h1>IV Treatment</h1>
                      <h2>$59, 400</h2>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar" style={{width: '55.6%'}}>
                        <span className="progress-text">55.6%</span>
                      </div>
                    </div>
                    <div className="progress-bottom">
                      <h1>32 Transactions</h1>
                    </div>
                  </div>

                  <div className="progress-container">

                    <div className="progress-top">
                      <h1>Foot Spa</h1>
                      <h2>$45, 000</h2>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar" style={{width: '75%'}}>
                        <span className="progress-text">75%</span>
                      </div>
                    </div>
                    <div className="progress-bottom">
                      <h1>32 Transactions</h1>
                    </div>
                  </div>

                  <div className="progress-container">
                    
                                     
                    <div className="progress-top">
                        <h1>IV Treatment</h1>
                        <h2>$59, 400</h2>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar" style={{width: '60%'}}>
                        <span className="progress-text">60%</span>
                      </div>
                    </div>
                    <div className="progress-bottom">
                      <h1>32 Transactions</h1>
                    </div>
                  </div>

                  <div className="progress-container">
                  <div className="progress-top">
                      <h1>Facial Services</h1>
                      <h2>$45, 000</h2>
                    </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar" style={{width: '80%'}}>
                      <span className="progress-text">80%</span>
                    </div>
                  </div>
                    <div className="progress-bottom">
                      <h1>32 Transactions</h1>
                    </div>
                </div>
                </div>
              
              
              </div>
              <div className="customer-segmentation">
                <div className="customer-segmentation-title">
                  <h3>Customer Segmentation</h3>
                  <h1>Revenue Distribution by customer type</h1>
                </div>

                <div className="customer-segmentation-body">
                  <div className="customer-segmentation-body-top">
                    .
                  </div>
                  <div className="customer-segmentation-body-mid">
                    .
                  </div>
                  <div className="customer-segmentation-body-bottom">
                    .
                  </div>
                </div>
                      
              </div>
            </div>






          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
