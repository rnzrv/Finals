import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import "../css/fonts.css";
import "../css/color.css";

const SalesChart = ({ labels = [], sales = [], purchases = [] }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const legendItems = [
    { label: "Sales", color: "#b88b2d" },
    { label: "Purchases", color: "#243c26" },
  ];

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Sales",
            backgroundColor: "#b88b2d",
            data: sales,
            borderRadius: 8,
          },
          {
            label: "Purchases",
            backgroundColor: "#243c26",
            data: purchases,
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          datalabels: {
            anchor: "end",
            align: "end",
            color: "#000",
            font: { family: "DmSans", size: 12 },
          },
        },
        scales: {
          x: { ticks: { color: "#444" }, grid: { display: false } },
          y: { ticks: { color: "#444" } },
        },
      },
      plugins: [ChartDataLabels],
    });

    return () => chartInstanceRef.current?.destroy();
  }, [labels, sales, purchases]);

  return (
    <div
      className="chart-wrapper"
      style={{ display: "flex", flexDirection: "column", width: "95%", height: "100%" }}
    >
      {/* ✅ Chart Header */}
      <div
        className="chart-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
          width: "100%",
          padding: "10px",
          height: "60px",
        }}
      >
        <h2
          style={{
            color: "var(--primary-color--)",
            fontFamily: "Poppins",
            fontWeight: "600",
            fontSize: "20px",
            marginLeft: "40px",
          }}
        >
          Sales Overview
        </h2>

        {/* ✅ Custom Legend */}
        <div
          className="custom-legend"
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
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
                }}
              ></span>
              <span
                style={{
                  fontSize: "14px",
                  fontFamily: "DmSans",
                  color: "var(--text-color--)",
                }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div
        className="chart-container"
        style={{
          height: "400px",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "10px",
        }}
      >
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default SalesChart;
