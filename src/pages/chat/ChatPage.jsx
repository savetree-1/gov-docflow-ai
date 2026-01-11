/**
 * Standalone Chat Page
 * Full-screen chat interface for admins
 */

import React from 'react';
import Sidebar from '../../components/dashboardSidebar/Sidebar';
import OfficerChat from '../../components/chat/OfficerChat';
import { useSelector } from 'react-redux';
import '../dashboards/SuperAdminDashboard.css';

const ChatPage = () => {
  const user = useSelector((state) => state.authReducer?.user?.data);
  
  // Determine role
  let rawRole = (user?.role || "").toLowerCase();
  let userRole = rawRole.replace(/_/g, "");
  if (!userRole && user?.firstName === "Super") userRole = "superadmin";
  if (
    userRole !== "superadmin" &&
    (userRole.includes("admin") || (user?.email || "").includes("admin"))
  )
    userRole = "admin";

  // Determine sidebar role
  const sidebarRole = userRole === "superadmin" ? "SUPER_ADMIN" : "DEPARTMENT_ADMIN";

  return (
    <div className="dashboard-layout">
      <Sidebar role={sidebarRole} />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1>
              Department <span className="dashboard-highlight">Chat</span>
            </h1>
            <p className="dashboard-subtitle">
              Real-time communication between departments and super admin
            </p>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <OfficerChat />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
