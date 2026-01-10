import React, { useEffect, useState } from "react";
import { fetchBottlenecks } from "../../api/insightsAPI";
import { useSelector } from "react-redux";

const BottleneckChart = () => {
  const [data, setData] = useState([]);

  // 🛡️ FIX: Updated to match your Redux structure from the screenshot
  const token = useSelector((state) => {
    // 1. Check the confirmed path from your screenshot
    if (
      state.tokenReducer &&
      state.tokenReducer.token &&
      state.tokenReducer.token.accessToken
    ) {
      return state.tokenReducer.token.accessToken;
    }
    // 2. Fallback in case it's stored directly as a string
    if (
      state.tokenReducer &&
      state.tokenReducer.token &&
      typeof state.tokenReducer.token === "string"
    ) {
      return state.tokenReducer.token;
    }
    return null;
  });

  useEffect(() => {
    const loadData = async () => {
      if (!token) return;

      try {
        const result = await fetchBottlenecks(token);
        if (result && result.data) {
          setData(result.data);
        }
      } catch (err) {
        console.error("Failed to load analytics", err);
      }
    };

    loadData();
  }, [token]);

  // ... rest of your component (render logic) remains the same ...
  if (!data || data.length === 0) {
    return (
      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">
            Department Bottleneck Analysis
          </h6>
        </div>
        <div className="card-body text-center text-muted">
          {token ? "Loading analysis..." : "Waiting for authentication..."}
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow mb-4">
      <div className="card-header py-3">
        <h6 className="m-0 font-weight-bold text-primary">
          Department Bottleneck Analysis
        </h6>
      </div>
      <div className="card-body">
        {data.map((dept, index) => (
          <div key={index} className="mb-3">
            <h4 className="small font-weight-bold">
              {dept.departmentName}
              <span
                className={`float-right ${
                  dept.status === "High Risk" ? "text-danger" : "text-success"
                }`}
              >
                {dept.status} ({dept.bottleneckScore}%)
              </span>
            </h4>
            <div className="progress mb-4">
              <div
                className={`progress-bar ${
                  dept.status === "High Risk" ? "bg-danger" : "bg-info"
                }`}
                role="progressbar"
                style={{ width: `${dept.bottleneckScore}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BottleneckChart;
