import React from "react";

const Settings = () => {
  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ color: "#004d40" }}>Settings & Access Control</h2>
      <div
        style={{
          backgroundColor: "#fff",
          padding: "30px",
          borderRadius: "12px",
          border: "1px solid #eee",
          marginTop: "20px",
        }}
      >
        <h3
          style={{
            color: "#2e7d32",
            marginBottom: "20px",
            borderBottom: "1px solid #eee",
            paddingBottom: "10px",
          }}
        >
          Permissions
        </h3>

        {[
          "Enable Blockchain Traceability",
          "Allow External Downloads",
          "Staff Multi-Factor Auth",
        ].map((item) => (
          <div
            key={item}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "15px 0",
              borderBottom: "1px solid #f9f9f9",
            }}
          >
            <span>{item}</span>
            <input
              type="checkbox"
              style={{ width: "20px", height: "20px", accentColor: "#004d40" }}
              defaultChecked
            />
          </div>
        ))}

        <button
          style={{
            marginTop: "30px",
            width: "100%",
            backgroundColor: "#004d40",
            color: "white",
            padding: "12px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;
