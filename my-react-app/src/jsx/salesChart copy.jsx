// import React, { useEffect, useRef } from "react";
// import Chart from "chart.js/auto";
// import ChartDataLabels from "chartjs-plugin-datalabels";
// import "../css/fonts.css";
// import "../css/color.css";

// const SalesChart = () => {
//   const chartRef = useRef(null);
//   const chartInstanceRef = useRef(null);

//   useEffect(() => {
//     const ctx = chartRef.current.getContext("2d");

//     // Destroy existing chart before creating new one
//     if (chartInstanceRef.current) {
//       chartInstanceRef.current.destroy();
//     }

//     chartInstanceRef.current = new Chart(ctx, {
//       type: "bar",
//       data: {
//         labels: [
//           "Jun 13, 2024",
//           "Apr 7, 2025",
//           "Aug 9, 2024",
//           "Jul 15, 2024",
//           "May 12, 2024",
//           "Sep 13, 2024",
//           "Oct 11, 2024",
//         ],
//         datasets: [
//           {
//             label: "Sales",
//             backgroundColor: "#b88b2d", // darker gold
//             data: [4000, 6000, 6500, 7000, 12000, 10000, 1000],
//             borderRadius: 8,
//           },
//           {
//             label: "Purchases",
//             backgroundColor: "#243c26",
//             data: [3000, 4000, 5800, 6500, 8500, 9500, 12500],
//             borderRadius: 8,
//           },
//         ],
//       },
//       options: {
//         responsive: true,
//         maintainAspectRatio: false,
//         plugins: {
//           legend: {
//             position: "top",
//             align: "end",
//             labels: {
//               boxWidth: 15,
//               padding: 10,
//               font: { size: 13 },
//               usePointStyle: true,
//             },
//             // Stack legend vertically
//             maxHeight: 100,
//           },
//           title: {
//             display: true,
//             text: "SALES",
//             align: "start",
//             color: "#0B4909", // using CSS variable
//             font: { size: 24, weight: "bold", family: "Poppins" },
//           },
//           datalabels: {
//             anchor: "end",
//             align: "end",
//             color: "#000",
//             font: {family: "DmSans", size: 12 },
//           },
//         },
//         scales: {
//           x: {
//             ticks: { 
//               color: "#444",
//             },
//             grid: { display: false },
//             stacked: false,
//             barPercentage: 0.6,
//             categoryPercentage: 0.5, // add spacing between groups
//           },
//           y: {
//             ticks: { color: "#444", stepSize: 2000 },
//           },
//         },
//       },
//       plugins: [ChartDataLabels],
//     });

//     return () => chartInstanceRef.current.destroy();
//   }, []);

//   return (
//     <div className="chart-container" style={{ height: "100%", width: "95%" }}>
//       <canvas ref={chartRef}></canvas>
//     </div>
//   );
// };

// export default SalesChart;
