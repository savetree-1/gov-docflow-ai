import React, { useState, useEffect } from "react";
import api from "../../api/config";

const BottleneckChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBottleneckData = async () => {
      try {
        const response = await api.get('/api/analytics/bottlenecks');
        
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching bottleneck data:', err);
        if (err?.response?.status === 401) {
          setError('Please log in to view analytics data');
        } else {
          setError('Failed to load analytics data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBottleneckData();
  }, []);

  const getStatusColor = (score) => {
    if (score >= 60) return '#ef4444'; // Red for high risk
    if (score >= 30) return '#f59e0b'; // Orange for moderate
    return '#14b8a6'; // Teal for normal
  };

  if (loading) {
    return (
      <div className="bottleneck-analysis">
        <div className="section-header">
          <h3>Department Workload Analysis</h3>
          <p>Loading real-time data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bottleneck-analysis">
        <div className="section-header">
          <h3>Department Workload Analysis</h3>
          <p style={{ color: '#ef4444' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bottleneck-analysis">
      <div className="section-header">
        <h3>Department Workload Analysis</h3>
        <p>Real-time processing capacity and bottleneck detection</p>
      </div>
      
      <div className="departments-list">
        {data.map((dept, index) => (
          <div key={index} className="department-row">
            <div className="dept-info">
              <div className="dept-name">{dept.departmentName}</div>
              <div className="dept-stats">
                {dept.processedCount} documents • {dept.status}
              </div>
            </div>
            
            <div className="progress-section">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${dept.bottleneckScore}%`,
                    backgroundColor: getStatusColor(dept.bottleneckScore)
                  }}
                />
              </div>
              <div className="score-label">{dept.bottleneckScore}%</div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .bottleneck-analysis {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          margin-bottom: 24px;
        }

        .section-header {
          margin-bottom: 24px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 16px;
        }

        .section-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 4px 0;
        }

        .section-header p {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .departments-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .department-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
          transition: background 0.2s;
        }

        .department-row:hover {
          background: #f3f4f6;
        }

        .dept-info {
          flex: 1;
          min-width: 0;
        }

        .dept-name {
          font-size: 15px;
          font-weight: 500;
          color: #111827;
          margin-bottom: 4px;
        }

        .dept-stats {
          font-size: 13px;
          color: #6b7280;
        }

        .progress-section {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 200px;
        }

        .progress-bar {
          flex: 1;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .score-label {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
          min-width: 42px;
          text-align: right;
        }

        @media (max-width: 768px) {
          .bottleneck-analysis {
            padding: 16px;
          }

          .department-row {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .progress-section {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default BottleneckChart;
