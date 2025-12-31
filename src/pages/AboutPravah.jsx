import React from 'react';

const AboutPravaah = () => {
  const features = [
    {
      title: 'Unified Platform',
      description: 'Centralized document management system connecting all government departments across Uttarakhand for seamless information flow and collaboration.'
    },
    {
      title: 'Intelligent Routing',
      description: 'AI-powered document routing ensures files reach the right department and personnel automatically, reducing processing time significantly.'
    },
    {
      title: 'Complete Transparency',
      description: 'Real-time tracking and comprehensive audit trails provide full visibility into document lifecycle and decision-making processes.'
    },
    {
      title: 'Enhanced Security',
      description: 'Multi-layer security with role-based access control, encryption, and authentication ensures sensitive government data remains protected.'
    },
    {
      title: 'Digital First',
      description: 'Paperless workflow reduces environmental impact while improving efficiency, storage, and retrieval of government documents.'
    },
    {
      title: 'Compliance Ready',
      description: 'Built-in compliance with government regulations, RTI requirements, and data protection standards for all document operations.'
    }
  ];

  const objectives = [
    'Streamline inter-departmental communication and document exchange',
    'Reduce processing time for government files and citizen requests',
    'Ensure accountability through complete audit trails and tracking',
    'Enable data-driven decision making with analytics and insights',
    'Improve citizen services through faster document processing',
    'Promote digital governance and reduce paper consumption'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div style={{ background: 'linear-gradient(135deg, #0f5e59 0%, #1a8a7f 100%)' }} className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-bold text-6xl text-white mb-6 tracking-tight">
            About Pravaah
          </h1>
          <p className="text-white text-xl opacity-95 font-light leading-relaxed max-w-4xl">
            A revolutionary government document management system designed to transform how departments collaborate, communicate, and serve citizens
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Vision Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-6 tracking-tight" style={{ color: '#0f5e59' }}>
            Our Vision
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            Pravaah envisions a digitally empowered Uttarakhand where government departments operate with unprecedented efficiency, 
            transparency, and accountability. By eliminating bureaucratic delays and streamlining document workflows, we aim to 
            create a citizen-centric administration that delivers faster, better services.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed">
            Our platform bridges the gap between traditional governance and modern technology, enabling seamless collaboration 
            across departments while maintaining the highest standards of security and compliance.
          </p>
        </div>

        {/* Mission Section */}
        <div 
          className="mb-16 rounded-xl p-10 border-2"
          style={{ 
            backgroundColor: 'rgba(15, 94, 89, 0.05)',
            borderColor: 'rgba(15, 94, 89, 0.2)'
          }}
        >
          <h2 className="text-3xl font-bold mb-6 tracking-tight" style={{ color: '#0f5e59' }}>
            Our Mission
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            To provide a robust, secure, and intelligent document management platform that enables government departments 
            to work collaboratively, efficiently, and transparently while serving citizens better.
          </p>
          <h3 className="text-2xl font-semibold mb-4 tracking-tight" style={{ color: '#0f5e59' }}>
            Key Objectives
          </h3>
          <ul className="space-y-3">
            {objectives.map((objective, index) => (
              <li key={index} className="flex items-start gap-3 text-gray-700 text-lg leading-relaxed">
                <span className="font-bold mt-1" style={{ color: '#68AC5D' }}>▸</span>
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-10 tracking-tight text-center" style={{ color: '#0f5e59' }}>
            Core Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-8 border-t-4"
                style={{ borderTopColor: '#0f5e59' }}
              >
                <h3 className="text-2xl font-bold mb-4 tracking-tight" style={{ color: '#0f5e59' }}>
                  {feature.title}
                </h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Impact Section */}
        <div className="bg-white rounded-xl shadow-md p-10 border-l-4" style={{ borderLeftColor: '#0f5e59' }}>
          <h2 className="text-3xl font-bold mb-6 tracking-tight" style={{ color: '#0f5e59' }}>
            Making an Impact
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            Since its implementation, Pravaah has transformed government operations in Uttarakhand. Departments report 
            significant reductions in processing time, improved interdepartmental coordination, and enhanced citizen satisfaction.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed">
            By digitizing workflows and automating routine tasks, government officials can now focus on strategic decision-making 
            and policy implementation, ultimately serving the people of Uttarakhand more effectively.
          </p>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 text-lg mb-6 font-light">
            Join us in building a more efficient, transparent government
          </p>
          <div className="flex gap-4 justify-center">
            <button
              className="px-10 py-4 rounded-lg text-white text-lg font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl tracking-wide"
              style={{ backgroundColor: '#0f5e59' }}
              onClick={() => window.location.href = '/department-registration'}
            >
              Register Department
            </button>
            <button
              className="px-10 py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl tracking-wide border-2"
              style={{ backgroundColor: 'white', color: '#0f5e59', borderColor: '#0f5e59' }}
              onClick={() => window.location.href = '/help'}
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPravaah;
