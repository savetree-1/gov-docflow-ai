import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Header from "./components/header/Header";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main style={{ padding: "40px 20px", textAlign: "center" }}>
          <h1>Welcome to Document One</h1>
          <p>Integrated Government Document Portal</p>
        </main>
      </div>
    </Router>
  );
}

export default App;
