import React from 'react';

const HowItWorks = () => {
  const steps = [
    {
      step: '01',
      title: 'Document Upload',
      description: 'Officers upload documents through our secure interface with intelligent metadata tagging. The system automatically categorizes and indexes files for easy retrieval.',
      details: [
        'Drag-and-drop or browse to upload files',
        'Automatic file type detection and validation',
        'Metadata extraction and tagging',
        'Document classification and indexing'
      ]
    },
    {
      step: '02',
      title: 'AI-Powered Routing',
      description: 'Advanced AI algorithms analyze document content and automatically route to appropriate departments and personnel based on subject matter and priority.',
      details: [
        'Content analysis and categorization',
        'Smart department assignment',
        'Priority-based queue management',
        'Notification to relevant stakeholders'
      ]
    },
    {
      step: '03',
      title: 'Review & Processing',
      description: 'Assigned officers review documents in their dashboard. They can add comments, request clarifications, or forward to other departments as needed.',
      details: [
        'Centralized document review interface',
        'Collaboration tools for team input',
        'Version control and change tracking',
        'Digital signatures and approvals'
      ]
    },
    {
      step: '04',
      title: 'Tracking & Audit',
      description: 'Complete lifecycle tracking with real-time status updates. Comprehensive audit trails record every action for accountability and transparency.',
      details: [
        'Real-time document status tracking',
        'Complete audit log of all activities',
        'Performance analytics and reports',
        'Compliance and RTI ready documentation'
      ]
    }
  ];

  const userRoles = [
    {
      role: 'Super Admin',
      responsibilities: [
        'Manage system-wide settings and configurations',
        'Approve new department registrations',
        'Monitor overall system performance',
        'Generate comprehensive analytics reports',
        'Manage user roles and permissions'
      ]
    },
    {
      role: 'Department Admin',
      responsibilities: [
        'Manage department user accounts',
        'Configure department routing rules',
        'Monitor department document flow',
        'Generate department performance reports',
        'Handle department-level settings'
      ]
    },
    {
      role: 'Officer',
      responsibilities: [
        'Upload and submit documents',
        'Review assigned documents',
        'Process and route documents',
        'Add comments and annotations',
        'Track document status'
      ]
    },
    {
      role: 'Auditor',
      responsibilities: [
        'Access comprehensive audit trails',
        'Search and review documents',
        'Generate compliance reports',
        'Monitor document processing times',
        'Verify regulatory compliance'
      ]
    }
  ];

  const workflow = [
    {
      phase: 'Initiation',
      description: 'Document is created and uploaded by the originating department with relevant metadata and classification.'
    },
    {
      phase: 'Routing',
      description: 'System analyzes content and routes to appropriate department(s) based on subject matter and predefined rules.'
    },
    {
      phase: 'Processing',
      description: 'Assigned officers review, process, and take necessary actions on the document within their authority.'
    },
    {
      phase: 'Collaboration',
      description: 'Multiple departments can collaborate on the same document with comments, suggestions, and approvals.'
    },
    {
      phase: 'Resolution',
      description: 'Final decision or action is recorded, document is marked complete, and all stakeholders are notified.'
    },
    {
      phase: 'Archival',
      description: 'Completed documents are archived with full history, searchable and accessible for future reference.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div style={{ background: 'linear-gradient(135deg, #0f5e59 0%, #1a8a7f 100%)' }} className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-bold text-6xl text-white mb-6 tracking-tight">
            How It Works
          </h1>
          <p className="text-white text-xl opacity-95 font-light leading-relaxed max-w-4xl">
            Understanding the document lifecycle and workflow in the Pravaah platform
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Main Process Steps */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold mb-12 tracking-tight text-center" style={{ color: '#0f5e59' }}>
            Document Processing Journey
          </h2>
          <div className="space-y-12">
            {steps.map((item, index) => (
              <div key={index} className="flex gap-8 items-start">
                <div 
                  className="flex-shrink-0 w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg"
                  style={{ backgroundColor: '#0f5e59' }}
                >
                  {item.step}
                </div>
                <div className="flex-1 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-8 border-l-4" style={{ borderLeftColor: '#68AC5D' }}>
                  <h3 className="text-2xl font-bold mb-3 tracking-tight" style={{ color: '#0f5e59' }}>
                    {item.title}
                  </h3>
                  <p className="text-gray-700 text-lg leading-relaxed mb-4">
                    {item.description}
                  </p>
                  <ul className="space-y-2">
                    {item.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-600">
                        <span className="font-bold mt-1" style={{ color: '#68AC5D' }}>▸</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow Phases */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold mb-10 tracking-tight text-center" style={{ color: '#0f5e59' }}>
            Workflow Phases
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflow.map((phase, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-t-4"
                style={{ borderTopColor: index % 2 === 0 ? '#0f5e59' : '#68AC5D' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: '#0f5e59' }}
                  >
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-bold tracking-tight" style={{ color: '#0f5e59' }}>
                    {phase.phase}
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {phase.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* User Roles */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-10 tracking-tight text-center" style={{ color: '#0f5e59' }}>
            User Roles & Responsibilities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {userRoles.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-8 border-l-4"
                style={{ borderLeftColor: '#0f5e59' }}
              >
                <h3 className="text-2xl font-bold mb-4 tracking-tight" style={{ color: '#0f5e59' }}>
                  {item.role}
                </h3>
                <ul className="space-y-3">
                  {item.responsibilities.map((responsibility, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <span className="font-bold mt-1" style={{ color: '#68AC5D' }}>▸</span>
                      <span>{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Getting Started */}
        <div 
          className="rounded-xl p-10 border-2"
          style={{ 
            backgroundColor: 'rgba(15, 94, 89, 0.05)',
            borderColor: 'rgba(15, 94, 89, 0.2)'
          }}
        >
          <h2 className="text-3xl font-bold mb-6 tracking-tight text-center" style={{ color: '#0f5e59' }}>
            Getting Started
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed text-center mb-8 max-w-3xl mx-auto">
            Ready to streamline your department's document management? Follow these simple steps to get started with Pravaah.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              className="px-10 py-4 rounded-lg text-white text-lg font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl tracking-wide"
              style={{ backgroundColor: '#0f5e59' }}
              onClick={() => window.location.href = '/login'}
            >
              Login Now
            </button>
            <button
              className="px-10 py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl tracking-wide border-2"
              style={{ backgroundColor: 'white', color: '#0f5e59', borderColor: '#0f5e59' }}
              onClick={() => window.location.href = '/help'}
            >
              View Help Center
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
