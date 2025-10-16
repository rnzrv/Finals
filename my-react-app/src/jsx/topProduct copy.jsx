import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import "../css/fonts.css";
import "../css/color.css";

const TopProduct = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");

    // Destroy existing chart before creating new one
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Product A", "Product B", "Product C", "Product D", "Product E"],
        datasets: [
          {
            label: "Top Products",
            backgroundColor: [
              "#b88b2d", // Gold
              "#243c26", // Dark Green
              "#f0e68c", // Light Gold
              "#90ee90", // Light Green
              "#ffd700", // Bright Gold
            ],
            data: [300, 50, 100, 80, 120],
            borderWidth: 1,
            borderColor: "#ffffff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            align: "center",
            labels: {
              boxWidth: 15,
              padding: 10,
              font: { size: 13, family: "DmSans" },
              usePointStyle: true,
            },
          },
          datalabels: {
            color: "#000",
            font: {
              family: "DmSans",
              weight: "bold",
              size: 14,
            },
            formatter: (value, context) => {
              // Show percentage with 1 decimal place
              const data = context.chart.data.datasets[0].data;
              const total = data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${percentage}%`;
            },
            anchor: "center",
            align: "center",
          },
          title: {
            display: true,
            text: "Top Selling Products",
            color: "var(--primary-color)",
            font: { size: 24, weight: "bold", family: "DmSans" },
            padding: {
              bottom: 20,
            },
          },
        },
      },
      plugins: [ChartDataLabels],
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="chart-container" style={{ height: "100%", width: "100%", margin: "auto" }}>
      <canvas ref={chartRef} />
    </div>
  );
};

export default TopProduct;
