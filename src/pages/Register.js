import React from "react";

const Register = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        background: "white",
        padding: "30px",
        borderRadius: "8px",
        maxWidth: "400px",
        width: "90%"
      }}>
        <h2>Sign Up</h2>
        <p>Registration form will be implemented here</p>
        <button onClick={onClose} style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "#0f5e59",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}>
          Close
        </button>
      </div>
    </div>
  );
};

export default Register;
