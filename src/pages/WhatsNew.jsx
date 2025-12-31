import React from 'react';

const WhatsNew = () => {
  const updates = [
    {
      date: 'December 2025',
      title: 'AI-Powered Document Processing',
      description: 'Automated document summarization and intelligent routing using advanced AI technology for faster processing.',
      category: 'Feature Launch'
    },
    {
      date: 'December 2025',
      title: 'Enhanced Security & Authentication',
      description: 'Implemented multi-layer security with role-based access control for all government departments.',
      category: 'Security'
    },
    {
      date: 'November 2025',
      title: 'Real-Time Notifications',
      description: 'Get instant updates on document status, routing changes, and important system notifications.',
      category: 'Feature'
    },
    {
      date: 'November 2025',
      title: 'Audit Trail System',
      description: 'Complete tracking of all document activities with comprehensive audit logs for transparency.',
      category: 'Compliance'
    },
    {
      date: 'October 2025',
      title: 'Department Registration Portal',
      description: 'Streamlined registration process for new departments with approval workflow.',
      category: 'Feature'
    },
    {
      date: 'October 2025',
      title: 'Advanced Search & Filters',
      description: 'Enhanced search capabilities with multiple filters for quick document retrieval.',
      category: 'Enhancement'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div style={{ background: 'linear-gradient(135deg, #0f5e59 0%, #1a8a7f 100%)' }} className="py-20 px-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-bold text-6xl text-white mb-6 tracking-tight">
            What's New
          </h1>
          <p className="text-white text-xl opacity-95 font-light leading-relaxed max-w-3xl">
            Stay informed about the latest updates, features, and improvements in the Government Document Management System
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="space-y-8">
          {updates.map((update, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-8 border-l-4"
              style={{ borderLeftColor: '#0f5e59' }}
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <span
                      className="px-4 py-1.5 rounded-full text-sm font-semibold text-white tracking-wide"
                      style={{ backgroundColor: '#0f5e59' }}
                    >
                      {update.category}
                    </span>
                    <span className="text-sm font-medium text-gray-500 tracking-wide">{update.date}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 tracking-tight" style={{ color: '#0f5e59' }}>
                    {update.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {update.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div 
          className="mt-16 rounded-xl p-10 border-2"
          style={{ 
            backgroundColor: 'rgba(15, 94, 89, 0.05)',
            borderColor: 'rgba(15, 94, 89, 0.2)'
          }}
        >
          <h2 className="text-3xl font-bold mb-6 tracking-tight" style={{ color: '#0f5e59' }}>
            Coming Soon
          </h2>
          <ul className="space-y-4 text-gray-700">
            <li className="flex items-start gap-3 text-lg leading-relaxed">
              <span className="font-bold mt-1" style={{ color: '#68AC5D' }}>▸</span>
              <span>Mobile application for on-the-go document management</span>
            </li>
            <li className="flex items-start gap-3 text-lg leading-relaxed">
              <span className="font-bold mt-1" style={{ color: '#68AC5D' }}>▸</span>
              <span>Advanced analytics dashboard for department performance</span>
            </li>
            <li className="flex items-start gap-3 text-lg leading-relaxed">
              <span className="font-bold mt-1" style={{ color: '#68AC5D' }}>▸</span>
              <span>Integration with e-Office suite for seamless workflow</span>
            </li>
            <li className="flex items-start gap-3 text-lg leading-relaxed">
              <span className="font-bold mt-1" style={{ color: '#68AC5D' }}>▸</span>
              <span>Multi-language support for regional accessibility</span>
            </li>
          </ul>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 text-lg mb-6 font-light">
            Have suggestions for new features? We'd love to hear from you.
          </p>
          <button
            className="px-10 py-4 rounded-lg text-white text-lg font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl tracking-wide"
            style={{ backgroundColor: '#0f5e59' }}
            onClick={() => window.location.href = '/help'}
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsNew;
