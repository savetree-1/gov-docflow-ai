import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      // Header
      "skipToContent": "Skip to main content",
      "sitemap": "Sitemap",
      "screenReader": "Screen Reader Access",
      "login": "Login",
      "logout": "Logout",
      "register": "Register",
      "profile": "Profile",
      "notifications": "Notifications",
      
      // Navigation
      "home": "Home",
      "about": "About",
      "aboutPravaah": "About Pravaah",
      "departments": "Departments",
      "contact": "Contact",
      "howItWorks": "How It Works",
      "whatsNew": "What's New",
      "help": "Help",
      "registerDepartment": "Register Department",
      
      // Dashboard
      "dashboard": "Dashboard",
      "myDocuments": "My Documents",
      "uploadDocument": "Upload Document",
      "userManagement": "User Management",
      "departmentManagement": "Department Management",
      "documentManagement": "Document Management",
      
      // Common
      "welcome": "Welcome",
      "viewAll": "View All",
      "search": "Search",
      "filter": "Filter",
      "status": "Status",
      "actions": "Actions",
      "edit": "Edit",
      "delete": "Delete",
      "view": "View",
      "save": "Save",
      "cancel": "Cancel",
      "submit": "Submit",
      "approve": "Approve",
      "reject": "Reject",
      "loading": "Loading...",
      "noData": "No data available",
      
      // Metrics
      "totalDepartments": "Total Departments",
      "activeDepartments": "Active Departments",
      "inactiveDepartments": "Inactive Departments",
      "totalUsers": "Total Users",
      "documentsProcessed": "Documents Processed",
      "pendingRegistrations": "Pending Registrations",
      "loadingDepartments": "Loading departments...",
      "noDepartmentsFound": "No Departments Found",
      "noApprovedDepartments": "No approved departments yet. Approve department registrations from the dashboard.",
      "noFilteredDepartments": "No {{filter}} departments found.",
      
      // Status
      "pending": "Pending",
      "approved": "Approved",
      "rejected": "Rejected",
      "inProgress": "In Progress",
      "completed": "Completed",
      "active": "Active",
      "inactive": "Inactive",
      
      // Document
      "category": "Category",
      "department": "Department",
      "created": "Created",
      "title": "Title",
      "description": "Description",
      
      // User Management
      "employeeId": "Employee ID",
      "name": "Name",
      "email": "Email",
      "addUser": "Add User",
      "firstName": "First Name",
      "lastName": "Last Name",
      "role": "Role",
      
      // Messages
      "successMessage": "Operation completed successfully",
      "errorMessage": "An error occurred",
      "confirmDelete": "Are you sure you want to delete?",
      "noDocuments": "No documents found",
      "uploadSuccess": "Document uploaded successfully",
    }
  },
  hi: {
    translation: {
      // Header
      "skipToContent": "मुख्य सामग्री पर जाएं",
      "sitemap": "साइटमैप",
      "screenReader": "स्क्रीन रीडर एक्सेस",
      "login": "लॉगिन",
      "logout": "लॉगआउट",
      "register": "रजिस्टर",
      "profile": "प्रोफाइल",
      "notifications": "सूचनाएं",
      
      // Navigation
      "home": "होम",
      "about": "के बारे में",
      "aboutPravaah": "प्रवाह के बारे में",
      "departments": "विभाग",
      "contact": "संपर्क",
      "howItWorks": "यह कैसे काम करता है",
      "whatsNew": "नया क्या है",
      "help": "सहायता",
      "registerDepartment": "विभाग पंजीकरण",
      
      // Dashboard
      "dashboard": "डैशबोर्ड",
      "myDocuments": "मेरे दस्तावेज़",
      "uploadDocument": "दस्तावेज़ अपलोड करें",
      "userManagement": "उपयोगकर्ता प्रबंधन",
      "departmentManagement": "विभाग प्रबंधन",
      "documentManagement": "दस्तावेज़ प्रबंधन",
      
      // Common
      "welcome": "स्वागत है",
      "viewAll": "सभी देखें",
      "search": "खोजें",
      "filter": "फ़िल्टर",
      "status": "स्थिति",
      "actions": "कार्रवाई",
      "edit": "संपादित करें",
      "delete": "हटाएं",
      "view": "देखें",
      "save": "सहेजें",
      "cancel": "रद्द करें",
      "submit": "जमा करें",
      "approve": "स्वीकृत करें",
      "reject": "अस्वीकार करें",
      "loading": "लोड हो रहा है...",
      "noData": "कोई डेटा उपलब्ध नहीं है",
      
      // Metrics
      "totalDepartments": "कुल विभाग",
      "activeDepartments": "सक्रिय विभाग",
      "inactiveDepartments": "निष्क्रिय विभाग",
      "totalUsers": "कुल उपयोगकर्ता",
      "documentsProcessed": "संसाधित दस्तावेज़",
      "pendingRegistrations": "लंबित पंजीकरण",
      "loadingDepartments": "विभाग लोड हो रहे हैं...",
      "noDepartmentsFound": "कोई विभाग नहीं मिला",
      "noApprovedDepartments": "अभी तक कोई स्वीकृत विभाग नहीं। डैशबोर्ड से विभाग पंजीकरण स्वीकृत करें।",
      "noFilteredDepartments": "कोई {{filter}} विभाग नहीं मिला।",
      
      // Status
      "pending": "लंबित",
      "approved": "स्वीकृत",
      "rejected": "अस्वीकृत",
      "inProgress": "प्रगति में",
      "completed": "पूर्ण",
      "active": "सक्रिय",
      "inactive": "निष्क्रिय",
      
      // Document
      "category": "श्रेणी",
      "department": "विभाग",
      "created": "बनाया गया",
      "title": "शीर्षक",
      "description": "विवरण",
      
      // User Management
      "employeeId": "कर्मचारी आईडी",
      "name": "नाम",
      "email": "ईमेल",
      "addUser": "उपयोगकर्ता जोड़ें",
      "firstName": "प्रथम नाम",
      "lastName": "अंतिम नाम",
      "role": "भूमिका",
      
      // Messages
      "successMessage": "ऑपरेशन सफलतापूर्वक पूर्ण हुआ",
      "errorMessage": "एक त्रुटि हुई",
      "confirmDelete": "क्या आप वाकई हटाना चाहते हैं?",
      "noDocuments": "कोई दस्तावेज़ नहीं मिला",
      "uploadSuccess": "दस्तावेज़ सफलतापूर्वक अपलोड किया गया",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
