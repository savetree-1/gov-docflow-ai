import React, { useState } from "react";
import documents from "../data/document";
import SearchBar from "../components/search/SearchBar";

const Search = () => {
  const [query, setQuery] = useState("");
  const handleDownload = (docTitle) => {
    alert(`Downloading: ${docTitle}.pdf\nSection: Secure Government Cloud`);
  };

  const filteredDocs = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(query.toLowerCase()) ||
      doc.department.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "1200px",
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ color: "#004d40", marginBottom: "10px" }}>
        Document Repository
      </h1>
      <p style={{ color: "#666", marginBottom: "30px" }}>
        Search and manage official government records.
      </p>
      <div style={{ display: "flex", gap: "20px", marginBottom: "40px" }}>
        <div style={statCardStyle}>
          <span style={{ fontSize: "12px", color: "#666" }}>TOTAL RECORDS</span>
          <div
            style={{ fontSize: "24px", fontWeight: "bold", color: "#004d40" }}
          >
            {documents.length}
          </div>
        </div>
        <div style={statCardStyle}>
          <span style={{ fontSize: "12px", color: "#666" }}>
            FILTERED RESULTS
          </span>
          <div
            style={{ fontSize: "24px", fontWeight: "bold", color: "#2e7d32" }}
          >
            {filteredDocs.length}
          </div>
        </div>
      </div>
      <div style={{ marginBottom: "40px", maxWidth: "500px" }}>
        <SearchBar value={query} onChange={setQuery} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              borderTop: "6px solid #004d40",
            }}
          >
            <small style={{ color: "#2e7d32", fontWeight: "bold" }}>
              {doc.department.toUpperCase()}
            </small>
            <h3 style={{ margin: "10px 0", fontSize: "18px" }}>{doc.title}</h3>
            <p style={{ fontSize: "14px", color: "#777" }}>{doc.description}</p>

            <div
              style={{
                marginTop: "20px",
                display: "flex",
                gap: "10px",
                alignItems: "center",
              }}
            >
              <button
                onClick={() => handleDownload(doc.title)}
                style={{
                  backgroundColor: "#2e7d32",
                  color: "white",
                  border: "none",
                  padding: "10px 15px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "5px",
                }}
              >
                <span>📄</span> Download PDF
              </button>

              <button
                style={{
                  backgroundColor: "transparent",
                  color: "#004d40",
                  border: "1px solid #004d40",
                  padding: "10px 15px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
const statCardStyle = {
  flex: 1,
  padding: "15px",
  backgroundColor: "#fff",
  borderRadius: "8px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  borderLeft: "4px solid #004d40",
};

export default Search;
