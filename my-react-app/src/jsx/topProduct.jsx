import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import "../css/fonts.css";
import "../css/color.css";

const TopProduct = ({ products = [] }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // Extract labels + values based on your backend JSON
  const labels = products.map((p) => p.serviceName);
  const values = products.map((p) => p.totalSold);

  // Auto-generate colors
  const colors = [
    "#b88b2d",
    "#243c26",
    "#f0e68c",
    "#90ee90",
    "#ffd700",
    "#d8bfd8",
    "#ffa07a",
    "#87ceeb",
  ];
  
  const chartColors = labels.map((_, i) => colors[i % colors.length]);

  useEffect(() => {
    const ctx = chartRef.current?.getContext("2d");
    if (!ctx) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: "pie",
      data: {
        labels,
        datasets: [
          {
            label: "Top Selling Services",
            data: values,
            backgroundColor: chartColors,
            borderWidth: 1,
            borderColor: "#fff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          datalabels: {
            color: "#000",
            font: { family: "DmSans", weight: "bold", size: 14 },
            formatter: (value, context) => {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              return `${((value / total) * 100).toFixed(1)}%`;
            },
          },
        },
      },
      plugins: [ChartDataLabels],
    });

    return () => {
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    };
  }, [products]);

  // Dynamic legend
  const legendItems = labels.map((label, i) => ({
    label,
    color: chartColors[i],
  }));

  return (
    <div
      className="chart-wrapper"
      style={{ display: "flex", flexDirection: "column", width: "95%", height: "100%" }}
    >
      {/* Header */}
      <div
        className="chart-header"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "10px",
          width: "100%",
          padding: "10px",
        }}
      >
        <h2
          style={{
            color: "var(--primary-color)",
            fontFamily: "Poppins",
            fontWeight: "600",
            fontSize: "30px",
            margin: 0,
          }}
        >
          Top Selling Services
        </h2>
      </div>

      {/* Chart */}
      <div
        className="chart-container"
        style={{ height: "380px", display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <canvas ref={chartRef}></canvas>
      </div>

      {/* Legend */}
      <div
        className="custom-legend"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginTop: "15px",
        }}
      >
        {legendItems.map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: item.color,
              }}
            ></span>
            <span
              style={{
                fontSize: "14px",
                fontFamily: "DmSans",
                color: "var(--text-color)",
              }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopProduct;
