import Sidebar from "./Sidebar.jsx";
import user from "../icons/user.svg";
import "../css/reports.css";
import calendar from "../icons/calendar.svg";
import uptrend from "../icons/uptrend.svg";
import downtrend from "../icons/downtrend.svg";
import percent from "../icons/percent.svg";
import group from "../icons/group.svg";
import groupBlue from "../icons/group-blue.svg";
import groupPurple from "../icons/group-purple.svg";
import groupAdd from "../icons/group-add.svg";
import retention from "../icons/retention.svg";
import star from "../icons/star.svg";
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
              <div className="revenue-by-service-type reports-essential-item5">
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
              <div className="customer-segmentation reports-essential-item6">
                <div className="customer-segmentation-title">
                  <h3>Customer Segmentation</h3>
                  <h1>Revenue Distribution by customer type</h1>
                </div>

                <div className="customer-segmentation-body">
                  <div className="customer-segmentation-data">
                    <div className="customer-segmentation-data-left">
                      <div className="customer-segmentation-img">
                        <img src={group} alt="" id="Regular"/>
                      </div>
                      <div className="customer-segmentation-data-info">
                        <h3>Regular Customers</h3>
                        <h2>125 Customers</h2>
                        <h5>Avg. Spend per Customer</h5>
                      </div>
                    </div>
                    <div className="customer-segmentation-data-right">
                      <h3>$75,000</h3>
                      <h2>62.5% of Total Revenue</h2>
                      <h5>$2,200</h5>
                    </div>
                  </div>

                  <div className="customer-segmentation-data">
                    <div className="customer-segmentation-data-left">
                      <div className="customer-segmentation-img-new">
                        <img src={groupBlue} alt="" />
                      </div>
                      <div className="customer-segmentation-data-info">
                        <h3>New Customers</h3>
                        <h2>80 Customers</h2>
                        <h5>Avg. Spend per Customer</h5>
                      </div>
                    </div>
                    <div className="customer-segmentation-data-right">
                      <h3>$30,000</h3>
                      <h2>25% of Total Revenue</h2>
                      <h5>$1,500</h5>
                    </div>
                  </div>

                  <div className="customer-segmentation-data">
                    <div className="customer-segmentation-data-left">
                      <div className="customer-segmentation-img-inactive">
                        <img src={groupBlue} alt="" id="" />
                      </div>
                      <div className="customer-segmentation-data-info">
                        <h3>Inactive</h3>
                        <h2>45 Customers</h2>
                        <h5>Avg. Spend per Customer</h5>
                      </div>
                    </div>
                    <div className="customer-segmentation-data-right">
                      <h3>$15,000</h3>
                      <h2>12.5% of Total Revenue</h2>
                      <h5>$3,333</h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="reports-performance">
              <h3>Business Growth Metrics</h3>
            </div>

            <div className="business-growth-metrics">
              <div className="business-growth-metrics-item1 business-growth-metrics-item">
                <div className="business-growth-metrics-left">
                  <img src={groupPurple} alt="" />
                </div>
                <div className="business-growth-metrics-right">
                  <h3>Total Customers</h3>
                  <h1>412</h1>
                </div>
              </div>
              <div className="business-growth-metrics-item2 business-growth-metrics-item">
                <div className="business-growth-metrics-left">
                  <img src={groupAdd} alt="" />
                </div>
                <div className="business-growth-metrics-right">
                  <h3>New Customers</h3>
                  <h1>52</h1>
                </div>
              </div>
              <div className="business-growth-metrics-item3 business-growth-metrics-item">
                <div className="business-growth-metrics-left">
                  <img src={retention} alt="" />
                </div>
                <div className="business-growth-metrics-right">
                  <h3>Retention Rate</h3>
                  <h1>76%</h1>
                </div>
              </div>
              <div className="business-growth-metrics-item4 business-growth-metrics-item">

                <div className="business-growth-metrics-left">
                  <h1>₱</h1>
                </div>
                <div className="business-growth-metrics-right">
                  <h3>Avg Transaction</h3>
                  <h1>₱1,500</h1>
                </div>
              </div>
              <div className="business-growth-metrics-item5 business-growth-metrics-item">
                <div className="business-growth-metrics-item5-table-title">
                  <img src={star} alt="" />
                  <h3>Top Performing Services</h3>
                  
                </div>
                
                <div className="business-growth-metrics-item5-table">
                  <table>
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Service Name</th>
                          <th>Revenue</th>
                          <th>Transactions</th>
                      
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>#1</td>
                          <td>IV Treatment</td>
                          <td>₱100,000</td>
                          <td>100</td>
                        </tr>
                        <tr>
                          <td>#2</td>
                          <td>Foot Spa</td>
                          <td>₱80,000</td>
                          <td>80</td>
                        </tr>
                        <tr>
                          <td>#3</td>
                          <td>Facial Services</td>
                          <td>₱60,000</td>
                          <td>60</td>
                        </tr>
                        <tr>
                          <td>#4</td>
                          <td>Massage Therapy</td>
                          <td>₱40,000</td>
                          <td>40</td>
                        </tr>
                        <tr>
                          <td>#5</td>
                          <td>Wellness Packages</td>
                          <td>₱20,000</td>
                          <td>20</td>
                        </tr>
                      </tbody>
                    </table>
                </div>
                
              </div>

{/* TO BE EDITED THIS ENTIRE BLOCK - it's a duplicate */}
              <div className="customer-segmentation reports-essential-item6">
                <div className="customer-segmentation-title">
                  <h3>Customer Segmentation</h3>
                  <h1>Revenue Distribution by customer type</h1>
                </div>

                <div className="customer-segmentation-body">
                  <div className="customer-segmentation-data">
                    <div className="customer-segmentation-data-left">
                      <div className="customer-segmentation-img">
                        <img src={group} alt="" id="Regular"/>
                      </div>
                      <div className="customer-segmentation-data-info">
                        <h3>Regular Customers</h3>
                        <h2>125 Customers</h2>
                        <h5>Avg. Spend per Customer</h5>
                      </div>
                    </div>
                    <div className="customer-segmentation-data-right">
                      <h3>$75,000</h3>
                      <h2>62.5% of Total Revenue</h2>
                      <h5>$2,200</h5>
                    </div>
                  </div>

                  <div className="customer-segmentation-data">
                    <div className="customer-segmentation-data-left">
                      <div className="customer-segmentation-img-new">
                        <img src={groupBlue} alt="" />
                      </div>
                      <div className="customer-segmentation-data-info">
                        <h3>New Customers</h3>
                        <h2>80 Customers</h2>
                        <h5>Avg. Spend per Customer</h5>
                      </div>
                    </div>
                    <div className="customer-segmentation-data-right">
                      <h3>$30,000</h3>
                      <h2>25% of Total Revenue</h2>
                      <h5>$1,500</h5>
                    </div>
                  </div>

                  <div className="customer-segmentation-data">
                    <div className="customer-segmentation-data-left">
                      <div className="customer-segmentation-img-inactive">
                        <img src={groupBlue} alt="" id="" />
                      </div>
                      <div className="customer-segmentation-data-info">
                        <h3>Inactive</h3>
                        <h2>45 Customers</h2>
                        <h5>Avg. Spend per Customer</h5>
                      </div>
                    </div>
                    <div className="customer-segmentation-data-right">
                      <h3>$15,000</h3>
                      <h2>12.5% of Total Revenue</h2>
                      <h5>$3,333</h5>
                    </div>
                  </div>
                </div>
              </div>

              <div className="revenue-by-service-type reports-essential-item5">
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

              

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
