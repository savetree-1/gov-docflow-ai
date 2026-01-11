import "./App.css";
import Home from "./pages/Home";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getProfile } from "./api/profileAPI";
import {
  getLoginAction,
  getSaveProfileAction,
  getSaveTokenAction
} from "./redux/actions";
import ProtectedRoute from "./components/ProtectedRoute";
import { Routes, Route, Navigate } from "react-router-dom";
import SupportAdmin from "./components/ChatSupport/SupportAdmin/index";
import SupportEngine from "./components/ChatSupport/SupportEngine/index";
import Cookies from "js-cookie";

//Pages
import GovLogin from "./pages/GovLogin";
import DepartmentRegistration from "./pages/DepartmentRegistration";
import Help from "./pages/Help";
import Header from "./components/header/Header";
import FAQ from "./pages/FAQ";
import Footer from "./components/footer/Footer";
import VerifyOTP from "./components/verify-otp";
import ContactUs from "./pages/ContactUs/ContactUs";
import UpdateProfile from "./pages/updateProfile/index";

// ===== OLD PROJECT FILES MOVED TO _legacy_old_project =====
// These imports were from the agricultural equipment rental system (Krishi Sadhan)
// import Dashboard from "./pages/dashboard/Dashboard";
// import AddProduct from "./pages/addProduct/AddProduct";
// import Product from "./pages/product/Product";
// import PartnerDispute from "./pages/PartnerDispute";
// import CancellationForm from "./components/cancellationForm";
// import Chat from "./pages/chat/Chat";
// import BookingRequest from "./pages/bookingRequest/BookingRequest";
// import CancellationPolicy from "./pages/cancellationPage/CancellationPolicy";
// import BookingHistory from "./pages/bookingHistory";
// import Feedback from "./pages/feedback/Feedback";
// import EquipmentReport from "./pages/EquipmentReport";
// import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

// Dashboard Imports
import SuperAdminDashboard from "./pages/dashboards/SuperAdminDashboardNew";

import DepartmentAdminDashboard from "./pages/dashboards/DepartmentAdminDashboard";
import OfficerDashboard from "./pages/dashboards/OfficerDashboard";
import AuditorDashboard from "./pages/dashboards/AuditorDashboard";
import ChatPage from "./pages/chat/ChatPage";
import Settings from "./pages/settings/Settings";
import DocumentUpload from "./pages/documentUpload/DocumentUpload";
import DocumentDetail from "./pages/documentDetail/DocumentDetail";
import UserManagement from "./pages/userManagement/UserManagement";
import RoutingConfiguration from "./pages/routingConfiguration/RoutingConfiguration";
import MyDocuments from "./pages/MyDocuments";
import Notifications from "./pages/Notifications";
import WhatsNew from "./pages/WhatsNew";
import AboutPravaah from "./pages/AboutPravah";
import HowItWorks from "./pages/HowItWorks";
import Departments from "./pages/Departments";
import DepartmentManagement from "./pages/departmentManagement/DepartmentManagement";
import SystemLogs from "./pages/systemLogs/SystemLogs";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    if (accessToken && refreshToken) {
      dispatch(getLoginAction());
      dispatch(
        getSaveTokenAction({
          accessToken: accessToken,
          refreshToken: refreshToken
        })
      );
    }
  }, [dispatch]);

  useEffect(() => {
    const fetchProfile = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const userData = localStorage.getItem("user");
      if (accessToken && userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          dispatch(getSaveProfileAction({ data: parsedUserData }));
          
          // Optionally refresh from server
          const uuid = parsedUserData.id || parsedUserData.userId;
          if (uuid) {
            const data = await getProfile({ uuid, accessToken });
            dispatch(getSaveProfileAction(data));
          }
        } catch (error) {
          console.log("Error restoring user data:", error);
        }
      }
    };
    fetchProfile();
  }, [dispatch]);

  return (
    <>
      {/*       
      <p id="transcript">Transcript: {transcript}</p>

      <button onClick={SpeechRecognition.startListening}>Start</button> */}
      <Header />
      <Routes>
        <Route path="/" element={<><Home /><Footer /></>} />
        <Route path="login" element={<GovLogin />} />
        <Route path="department-registration" element={<DepartmentRegistration />} />
        <Route path="verify-otp" element={<><VerifyOTP /><Footer /></>} />
        <Route path="help" element={<><Help /><Footer /></>} />
        <Route path="whats-new" element={<><WhatsNew /><Footer /></>} />
        <Route path="about" element={<><AboutPravaah /><Footer /></>} />
        <Route path="how-it-works" element={<><HowItWorks /><Footer /></>} />
        <Route path="departments" element={<><Departments /><Footer /></>} />
        
        {/* Role-Based Dashboards */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/department/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['DEPARTMENT_ADMIN']}>
              <DepartmentAdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['OFFICER']}>
              <OfficerDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/audit/search" 
          element={
            <ProtectedRoute allowedRoles={['AUDITOR']}>
              <AuditorDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Chat Routes */}
        <Route 
          path="/admin/chat" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <ChatPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/department/chat" 
          element={
            <ProtectedRoute allowedRoles={['DEPARTMENT_ADMIN']}>
              <ChatPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Settings - All Roles */}
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'OFFICER', 'AUDITOR']}>
              <Settings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/settings" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <Settings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/department/settings" 
          element={
            <ProtectedRoute allowedRoles={['DEPARTMENT_ADMIN']}>
              <Settings />
            </ProtectedRoute>
          } 
        />
        
        {/* Document Upload - Officers and Dept Admins */}
        <Route 
          path="/document/upload" 
          element={
            <ProtectedRoute allowedRoles={['OFFICER', 'DEPARTMENT_ADMIN']}>
              <DocumentUpload />
            </ProtectedRoute>
          } 
        />
        
        {/* Document Detail - All Roles */}
        <Route 
          path="/document/:id" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'OFFICER', 'AUDITOR']}>
              <DocumentDetail />
            </ProtectedRoute>
          } 
        />
        
        {/* My Documents - All Roles */}
        <Route 
          path="/my-documents" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'OFFICER', 'AUDITOR']}>
              <MyDocuments />
            </ProtectedRoute>
          } 
        />
        
        {/* Department Documents */}
        <Route 
          path="/department/documents" 
          element={
            <ProtectedRoute allowedRoles={['DEPARTMENT_ADMIN']}>
              <MyDocuments />
            </ProtectedRoute>
          } 
        />
        
        {/* Notifications - All Roles */}
        <Route 
          path="/notifications" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'OFFICER', 'AUDITOR']}>
              <Notifications />
            </ProtectedRoute>
          } 
        />
        
        {/* User Management - Super Admin and Dept Admin */}
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <UserManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/department/users" 
          element={
            <ProtectedRoute allowedRoles={['DEPARTMENT_ADMIN']}>
              <UserManagement />
            </ProtectedRoute>
          } 
        />
        
        {/* Department Management - Super Admin */}
        <Route 
          path="/admin/departments" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <DepartmentManagement />
            </ProtectedRoute>
          } 
        />
        
        {/* System Logs - Super Admin */}
        <Route 
          path="/admin/logs" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <SystemLogs />
            </ProtectedRoute>
          } 
        />
        
        {/* Department Audit Logs */}
        <Route 
          path="/department/audit" 
          element={
            <ProtectedRoute allowedRoles={['DEPARTMENT_ADMIN']}>
              <SystemLogs />
            </ProtectedRoute>
          } 
        />
        
        {/* Auditor Logs */}
        <Route 
          path="/audit/logs" 
          element={
            <ProtectedRoute allowedRoles={['AUDITOR']}>
              <SystemLogs />
            </ProtectedRoute>
          } 
        />
        
        {/* Routing Configuration - Super Admin and Dept Admin */}
        <Route 
          path="/admin/routing" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <RoutingConfiguration />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/department/routing" 
          element={
            <ProtectedRoute allowedRoles={['DEPARTMENT_ADMIN']}>
              <RoutingConfiguration />
            </ProtectedRoute>
          } 
        />
        
        {/* Still Useful Routes */}
        <Route path="update-profile" element={<><UpdateProfile /><Footer /></>} />
        <Route path="contact" element={<><ContactUs /><Footer /></>} />
        <Route path="faq" element={<><FAQ /><Footer /></>} />
        <Route path="support" element={<SupportAdmin />} />
        
        {/* ===== OLD PROJECT ROUTES - COMMENTED OUT ===== */}
        {/* These were from the agricultural equipment rental system (Krishi Sadhan) */}
        {/* <Route path="addProduct" element={<><AddProduct /><Footer /></>} /> */}
        {/* <Route path="product/:id" element={<><Product /><Footer /></>} /> */}
        {/* <Route path="bookingRequest/:id" element={<><BookingRequest /><Footer /></>} /> */}
        {/* <Route path="chat" element={<><Chat /><Footer /></>} /> */}
        {/* <Route path="booking-history" element={<><BookingHistory /><Footer /></>} /> */}
        {/* <Route path="partner-dispute" element={<><PartnerDispute /><Footer /></>} /> */}
        {/* <Route path="policy" element={<><CancellationPolicy /><Footer /></>} /> */}
        {/* <Route path="equipment-report/:id" element={<><EquipmentReport /><Footer /></>} /> */}
        {/* <Route path="feedback" element={<><Feedback /><Footer /></>} /> */}
        
        {/* Redirect old registrations URL to dashboard */}
        <Route path="/admin/registrations" element={<Navigate to="/admin/dashboard" replace />} />
        
        <Route path="*" element={<><div>Not Found</div><Footer /></>} />
      </Routes>

      <SupportEngine />
    </>
  );
}

export default App;
