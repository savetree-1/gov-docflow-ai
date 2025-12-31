import React from "react";

//Components
import ExpandDropdown from "../components/expandText";

const Help = () => {
  const document_help = [
    {
      heading: "Q: How do I upload a document to the system?",
      content:
        "A: Navigate to the 'Upload Document' page, select your PDF file, fill in the required metadata (title, category, urgency), and submit. The AI will automatically process and route your document.",
    },
    {
      heading: "Q: What happens if I submit a document without proper metadata?",
      content:
        "A: All required fields (title, category) must be filled. The system will prompt you to complete any missing information before submission.",
    },
    {
      heading: "Q: How do I track my document status?",
      content:
        "A: You can track all your documents by visiting the 'My Documents' page, which shows current status, routing history, and any actions taken.",
    },
  ];
  const system_help = [
    {
      heading: "Q: How do I access documents routed to my department?",
      content: "A: Go to the Dashboard where you'll see all documents assigned to your department. You can filter by status, urgency, or category.",
    },
    {
      heading: "Q: How do I search for a specific document?",
      content:
        "A: Use the search functionality on the Dashboard to find documents by title, reference number, category, or department. You can also apply multiple filters.",
    },
    {
      heading: "Q: What types of documents can I upload to the system?",
      content:
        "A: The system accepts PDF files for all government document categories including Disaster Management, Finance & Budget, HR & Administration, Legal & Compliance, Public Works, and Revenue.",
    },
  ];

  return (
    <div className="min-h-screen bg-government-lightBg">
      <div style={{ background: 'linear-gradient(135deg, #0f5e59 0%, #1a8a7f 100%)' }} className="py-16 px-8">
        <h1 className="font-bold text-5xl text-center text-white mb-4">
          Help & Support
        </h1>
        <p className="text-center text-white text-lg opacity-90">Government Document Management System</p>
      </div>
      <div className="bg-white rounded-xl mx-auto max-w-6xl p-10 -mt-8 mb-8 shadow-xl border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="text-left">
            <h1 className="text-2xl font-semibold mb-6 pb-3 border-b-2" style={{ color: '#0f5e59', borderColor: '#0f5e59' }}>Document Management Help</h1>
            {document_help.map((item, i) => {
              return (
                <ExpandDropdown
                  key={i}
                  heading={item.heading}
                  content={item.content}
                />
              );
            })}
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-semibold mb-6 pb-3 border-b-2" style={{ color: '#0f5e59', borderColor: '#0f5e59' }}>System Help</h1>
            {system_help.map((item, i) => {
              return (
                <ExpandDropdown
                  key={i}
                  heading={item.heading}
                  content={item.content}
                />
              );
            })}
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto pb-12 px-4">
        <div className="p-8 flex flex-col md:flex-row items-center justify-between rounded-lg border" style={{ backgroundColor: 'rgba(15, 94, 89, 0.08)', borderColor: 'rgba(15, 94, 89, 0.2)' }}>
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-semibold mb-1" style={{ color: '#0f5e59' }}>Still need help?</h1>
            <p className="text-gray-600">Contact your department administrator or the State IT Cell</p>
          </div>
          <button className="px-8 py-3 rounded-lg text-white text-lg font-semibold hover:opacity-90 transition shadow-md" style={{ backgroundColor: '#0f5e59' }}>
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default Help;
