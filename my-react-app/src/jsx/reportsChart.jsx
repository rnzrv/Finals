import React from "react";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import "../css/reportsChart.css";
import "../css/fonts.css";

const ReportsChart = ({ data }) => {
    // Prepare the chart data using the prop
    const chartData = {
        labels: data?.labels || [],
        datasets: [
            {
                label: 'Sales',
                data: data?.datasets?.[0]?.data || [],
                backgroundColor: "#b88b2d",
                borderRadius: 8,
                maxBarThickness: 70,
            },
            {
                label: 'Expenses',
                data: data?.datasets?.[1]?.data || [],
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

    return <Bar data={chartData} options={options} plugins={[ChartDataLabels]} />;
};

export default ReportsChart;
