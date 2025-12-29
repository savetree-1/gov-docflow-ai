import React from "react";
import auditLogs from "../data/auditLogs";

const Audit = () => {
  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{ color: "#004d40" }}>Audit & Traceability Logs</h2>
      <p style={{ marginBottom: "20px", color: "#666" }}>
        Secure log of all system activities.
      </p>

      <div
        style={{
          overflowX: "auto",
          backgroundColor: "#fff",
          borderRadius: "10px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#004d40", color: "white" }}>
              <th style={{ padding: "15px" }}>Date & Time</th>
              <th style={{ padding: "15px" }}>User</th>
              <th style={{ padding: "15px" }}>Action</th>
              <th style={{ padding: "15px" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log) => (
              <tr key={log.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "15px", fontSize: "14px" }}>
                  {log.timestamp}
                </td>
                <td style={{ padding: "15px", fontWeight: "bold" }}>
                  {log.user}
                </td>
                <td style={{ padding: "15px" }}>{log.action}</td>
                <td
                  style={{
                    padding: "15px",
                    color: log.status === "Success" ? "#2e7d32" : "red",
                  }}
                >
                  ● {log.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Audit;
