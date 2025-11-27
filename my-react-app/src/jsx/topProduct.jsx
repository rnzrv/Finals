import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import "../css/fonts.css";
import "../css/color.css";

const TopProduct = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current?.getContext("2d");
    if (!ctx) return;

    // Destroy old instance if it exists
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
            backgroundColor: ["#b88b2d", "#243c26", "#f0e68c", "#90ee90", "#ffd700"],
            data: [300, 50, 100, 80, 120],
            borderWidth: 1,
            borderColor: "#fff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }, // hide built-in legend
          title: { display: false },  // only header will be used
          datalabels: {
            color: "#000",
            font: { family: "DmSans", weight: "bold", size: 14 },
            formatter: (value, context) => {
              const data = context.chart.data.datasets[0].data;
              const total = data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${percentage}%`;
            },
          },
        },
      },
      plugins: [ChartDataLabels],
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, []);

  const legendItems = [
    { label: "Product A", color: "#b88b2d" },
    { label: "Product B", color: "#243c26" },
    { label: "Product C", color: "#f0e68c" },
    { label: "Product D", color: "#90ee90" },
    { label: "Product E", color: "#ffd700" },
  ];

  return (
    <div
      className="chart-wrapper"
      style={{ display: "flex", flexDirection: "column", width: "95%", height: "100%" }}
    >
      {/* ✅ Header with only chart title */}
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

      {/* ✅ Chart Canvas */}
      <div
        className="chart-container"
        style={{
          height: "380px",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <canvas ref={chartRef}></canvas>
      </div>

      {/* ✅ Custom legend at the bottom, horizontally centered */}
      <div
        className="custom-legend"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "16px",
          marginTop: "15px",
          flexWrap: "wrap", // ensures legend doesn't overflow on small screens
        }}
      >
        {legendItems.map((item) => (
          <div
            key={item.label}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <span
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: item.color,
                display: "inline-block",
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
