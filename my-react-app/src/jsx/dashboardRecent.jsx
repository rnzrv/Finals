import React from "react";

const RecentCard = ({ name, product, amount, status, color }) => {
  // Define a set of colors to choose from
  const defaultColors = ["#6A5ACD", "#FF69B4", "#BDA55D", "#4CAF50", "#2196F3", "#FF9800"];

  // Generate initials from name
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("");

  // Fallback to a random color if no color is passed
  const randomColor = defaultColors[Math.floor(Math.random() * defaultColors.length)];
  const avatarColor = color || randomColor;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px",
        border: "1px solid #e0e0e0",
        borderRadius: "12px",
        marginBottom: "10px",
        backgroundColor: "#fff",
        width: "85%"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Circle with initials */}
        <div
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            backgroundColor: avatarColor,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#fff",
            fontWeight: "600",
            fontSize: "14px",
          }}
        >
          {initials}
        </div>

        {/* Name and treatment */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <p style={{ margin: 0, fontWeight: "600", fontSize: "14px" }}>{name}</p>
          <span style={{ fontSize: "12px", color: "#555" }}>{product}</span>
        </div>
      </div>

      {/* Time and status */}
      <div style={{ display: "flex", flexDirection:"column", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "12px", color: "#555" }}>{amount}</span>
        <span
          style={{
            padding: "4px 8px",
            borderRadius: "12px",
            fontSize: "10px",
            fontWeight: "600",
            color: "#fff",
            backgroundColor: status === "paid" ? "#4CAF50" : "#FFC107",
          }}
        >
          {status}
        </span>
      </div>
    </div>
  );
};

export default RecentCard;
