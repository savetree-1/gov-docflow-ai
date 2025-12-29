import React from "react";

export default function SearchBar({ value, onChange }) {
  return (
    <div style={{ position: "relative", width: "100%" }}>
      <span
        style={{
          position: "absolute",
          left: "15px",
          top: "50%",
          transform: "translateY(-50%)",
        }}
      >
        🔍
      </span>
      <input
        placeholder="Search documents by title or department..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "12px 12px 12px 40px",
          borderRadius: "8px",
          border: "2px solid #e0e0e0",
          fontSize: "16px",
          outline: "none",
          transition: "0.3s",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#004d40")}
        onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
      />
    </div>
  );
}
