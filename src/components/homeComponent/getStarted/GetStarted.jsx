import React from "react";
import { useNavigate } from "react-router-dom";
import "./GetStarted.css";

const GetStarted = () => {
  const navigate = useNavigate();

  return (
    <div className="getStartedSection py-16 bg-gradient-to-b from-[#f3f7f6] to-white">
      {/* Full Width Container */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
        {/* Compact Heading */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold mb-3">
            Access the <span className="text-[#0f5e59]">Pravaah</span> Platform
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed" style={{ lineHeight: '1.8' }}>
            Internal document management and routing system for Uttarakhand Government departments.
          </p>
        </div>

        {/* Wide Access Panel - Full Width */}
        <div className="getStartedCard bg-white rounded-xl border border-[#0f5e59]/15 hover:border-[#0f5e59]/30 transition-all duration-300 shadow-md hover:shadow-lg overflow-hidden">
          {/* Top Accent Border */}
          <div style={{ height: '4px', background: '#0f5e59' }}></div>
          
          <div className="p-10">
            {/* Section Label - Compact */}
            <div className="text-center mb-10">
              <p className="text-xs font-bold text-[#0f5e59] uppercase tracking-wider mb-2">
                Authorized Government Access
              </p>
              <h3 className="text-xl font-bold text-[#0f5e59] mb-3">
                Government Officials & Departments
              </h3>
              <p className="text-base text-gray-600 leading-relaxed mx-auto" style={{ maxWidth: '800px', lineHeight: '1.7' }}>
                <strong>For authorized government personnel only.</strong> Complete role-based access control for document management.
              </p>
            </div>

            {/* Role Cards - 4 Columns with Icons */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
              <div className="bg-gradient-to-br from-[#0f5e59]/5 to-white p-7 rounded-xl border border-[#0f5e59]/15 hover:border-[#0f5e59]/30 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <p className="text-xl font-bold text-[#0f5e59] mb-2">Super Admin</p>
                <p className="text-sm text-gray-600 mb-3" style={{ lineHeight: '1.6' }}>State-level oversight</p>
                <ul className="text-sm text-gray-700 space-y-2" style={{ lineHeight: '1.6' }}>
                  <li>• Approves registrations</li>
                  <li>• Oversees system activity</li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-[#0f5e59]/5 to-white p-7 rounded-xl border border-[#0f5e59]/15 hover:border-[#0f5e59]/30 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <p className="text-xl font-bold text-[#0f5e59] mb-2">Dept Admin</p>
                <p className="text-sm text-gray-600 mb-3" style={{ lineHeight: '1.6' }}>Department coordination</p>
                <ul className="text-sm text-gray-700 space-y-2" style={{ lineHeight: '1.6' }}>
                  <li>• Manages users</li>
                  <li>• Routes documents</li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-[#0f5e59]/5 to-white p-7 rounded-xl border border-[#0f5e59]/15 hover:border-[#0f5e59]/30 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <p className="text-xl font-bold text-[#0f5e59] mb-2">Officer</p>
                <p className="text-sm text-gray-600 mb-3" style={{ lineHeight: '1.6' }}>Document processing</p>
                <ul className="text-sm text-gray-700 space-y-2" style={{ lineHeight: '1.6' }}>
                  <li>• Uploads documents</li>
                  <li>• Processes files</li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-[#0f5e59]/5 to-white p-7 rounded-xl border border-[#0f5e59]/15 hover:border-[#0f5e59]/30 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <p className="text-xl font-bold text-[#0f5e59] mb-2">Auditor</p>
                <p className="text-sm text-gray-600 mb-3" style={{ lineHeight: '1.6' }}>Compliance review</p>
                <ul className="text-sm text-gray-700 space-y-2" style={{ lineHeight: '1.6' }}>
                  <li>• Reviews logs</li>
                  <li>• Read-only access</li>
                </ul>
              </div>
            </div>

            {/* How Access Works - Enhanced Visual Flow */}
            <div className="mb-10 bg-gradient-to-r from-[#0f5e59]/5 via-white to-[#0f5e59]/5 p-8 rounded-xl border border-[#0f5e59]/10">
              <p className="text-base text-[#0f5e59] uppercase tracking-wider font-bold text-center mb-8">
                System Access Workflow
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Step 1 */}
                <div className="text-center">
                  <div className="relative mx-auto mb-4" style={{ width: '70px', height: '70px' }}>
                    <div className="absolute inset-0 bg-[#0f5e59] rounded-full opacity-10 animate-pulse"></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-[#0f5e59] to-[#0d5a4d] rounded-full flex items-center justify-center shadow-md">
                      <span className="text-3xl font-bold text-white">1</span>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-[#0f5e59] mb-2">Department Registers</p>
                  <p className="text-sm text-gray-600 leading-relaxed">Submit registration form with department details</p>
                </div>

                {/* Step 2 */}
                <div className="text-center">
                  <div className="relative mx-auto mb-4" style={{ width: '70px', height: '70px' }}>
                    <div className="absolute inset-0 bg-[#0f5e59] rounded-full opacity-10 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-[#0f5e59] to-[#0d5a4d] rounded-full flex items-center justify-center shadow-md">
                      <span className="text-3xl font-bold text-white">2</span>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-[#0f5e59] mb-2">Admin Approval</p>
                  <p className="text-sm text-gray-600 leading-relaxed">State Administrator reviews and verifies</p>
                </div>

                {/* Step 3 */}
                <div className="text-center">
                  <div className="relative mx-auto mb-4" style={{ width: '70px', height: '70px' }}>
                    <div className="absolute inset-0 bg-[#0f5e59] rounded-full opacity-10 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-[#0f5e59] to-[#0d5a4d] rounded-full flex items-center justify-center shadow-md">
                      <span className="text-3xl font-bold text-white">3</span>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-[#0f5e59] mb-2">Officers Onboarded</p>
                  <p className="text-sm text-gray-600 leading-relaxed">Department users added to system</p>
                </div>

                {/* Step 4 */}
                <div className="text-center">
                  <div className="relative mx-auto mb-4" style={{ width: '70px', height: '70px' }}>
                    <div className="absolute inset-0 bg-[#0f5e59] rounded-full opacity-10 animate-pulse" style={{ animationDelay: '0.9s' }}></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-[#0f5e59] to-[#0d5a4d] rounded-full flex items-center justify-center shadow-md" style={{ borderWidth: '3px' }}>
                      <span className="text-3xl font-bold text-white">4</span>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-[#0f5e59] mb-2">Access Granted</p>
                  <p className="text-sm text-gray-600 leading-relaxed">Full system access enabled</p>
                </div>
              </div>
            </div>

            {/* Centered CTA Buttons with Micro-copy */}
            <div className="flex flex-col items-center">
              <div className="grid grid-cols-2 gap-4 mb-3" style={{ maxWidth: '500px', width: '100%' }}>
                <button 
                  onClick={() => navigate("/login")}
                  className="bg-[#0f5e59] text-white py-4 px-6 rounded-lg font-semibold text-base hover:bg-[#0d5a4d] transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Login
                </button>
                <button 
                  onClick={() => navigate("/department-registration")}
                  className="bg-white text-[#0f5e59] py-4 px-6 rounded-lg font-semibold text-base border-2 border-[#0f5e59] hover:bg-[#0f5e59]/5 transition-all duration-300"
                >
                  Register Department
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center" style={{ lineHeight: '1.6' }}>
                Department registration requires approval by State Administrator
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;
