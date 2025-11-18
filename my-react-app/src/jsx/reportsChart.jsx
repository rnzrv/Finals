import React from "react";
import {Chart as ChartJs, scales} from "chart.js/auto";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import "../css/reportsChart.css";
import "../css/fonts.css";


const ReportsChart = () => {
    const data = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: [
            {
                label: 'Sales',
                data: [120, 1900, 3000, 5500, 2300, 3400],
                backgroundColor: "#b88b2d",
                borderRadius: 8,
                maxBarThickness: 70,
           
            },

            {
                label: 'Expenses',
                data: [800, 1500, 2000, 3000, 1800, 2500],
                backgroundColor: "#243c26",
                borderRadius: 8,
                maxBarThickness: 70,
               
            }
             
            
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                anchor: 'end',
                align: 'top',
                color: '#000',
                font: {
                    size: 12,
                    fontFamily: 'Poppins',
                },
            },
            legend: {
                display: false,
            }
        },
        scales: {
            x: {
                categoryPercentage: 0.9,
                barPercentage: 0.9,
                
                
            }
        },
    };

    return <Bar data={data} options={options} plugins={[ChartDataLabels]} />;
};


export default ReportsChart;
