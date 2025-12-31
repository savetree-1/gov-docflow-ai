import React from 'react';

const Departments = () => {
  const departmentCategories = [
    {
      category: 'Administrative',
      departments: [
        {
          name: 'General Administration Department',
          description: 'Oversees overall administrative functions, policy implementation, and coordination across government departments.'
        },
        {
          name: 'Home Department',
          description: 'Manages internal security, law and order, police administration, and disaster management services.'
        },
        {
          name: 'Personnel Department',
          description: 'Handles recruitment, transfers, promotions, and service matters of government employees.'
        }
      ]
    },
    {
      category: 'Finance & Planning',
      departments: [
        {
          name: 'Finance Department',
          description: 'Manages state budget, financial planning, treasury operations, and fiscal policy implementation.'
        },
        {
          name: 'Planning Department',
          description: 'Coordinates development planning, monitors scheme implementation, and evaluates program effectiveness.'
        },
        {
          name: 'Revenue Department',
          description: 'Administers land records, revenue collection, land reforms, and settlement operations.'
        }
      ]
    },
    {
      category: 'Development & Welfare',
      departments: [
        {
          name: 'Rural Development Department',
          description: 'Implements rural development schemes, Panchayati Raj institutions, and rural infrastructure projects.'
        },
        {
          name: 'Urban Development Department',
          description: 'Manages urban planning, municipal administration, housing, and town planning activities.'
        },
        {
          name: 'Social Welfare Department',
          description: 'Provides welfare services, social security, disability support, and elderly care programs.'
        }
      ]
    },
    {
      category: 'Infrastructure',
      departments: [
        {
          name: 'Public Works Department',
          description: 'Constructs and maintains roads, bridges, government buildings, and public infrastructure.'
        },
        {
          name: 'Irrigation Department',
          description: 'Manages irrigation projects, water resource development, and flood control measures.'
        },
        {
          name: 'Power Department',
          description: 'Oversees electricity generation, transmission, distribution, and energy policy implementation.'
        }
      ]
    },
    {
      category: 'Education & Health',
      departments: [
        {
          name: 'Education Department',
          description: 'Administers primary, secondary, and higher education institutions and educational policies.'
        },
        {
          name: 'Health Department',
          description: 'Manages healthcare facilities, public health programs, disease control, and medical services.'
        },
        {
          name: 'Women Empowerment Department',
          description: 'Implements programs for women development, safety, empowerment, and gender equality.'
        }
      ]
    },
    {
      category: 'Agriculture & Environment',
      departments: [
        {
          name: 'Agriculture Department',
          description: 'Promotes agricultural development, provides farmer support, and implements agricultural schemes.'
        },
        {
          name: 'Forest Department',
          description: 'Conserves forests, manages wildlife, implements environmental protection programs.'
        },
        {
          name: 'Animal Husbandry Department',
          description: 'Develops livestock sector, veterinary services, dairy development, and animal welfare.'
        }
      ]
    }
  ];

  const benefits = [
    {
      title: 'Streamlined Communication',
      description: 'Instant document sharing and routing between departments eliminates delays and improves coordination.'
    },
    {
      title: 'Centralized Repository',
      description: 'All departmental documents stored securely in one place with easy search and retrieval capabilities.'
    },
    {
      title: 'Role-Based Access',
      description: 'Secure access controls ensure only authorized personnel can view or modify sensitive documents.'
    },
    {
      title: 'Real-Time Tracking',
      description: 'Monitor document status and location across departments with complete visibility and transparency.'
    },
    {
      title: 'Performance Analytics',
      description: 'Data-driven insights help departments optimize processes and improve service delivery.'
    },
    {
      title: 'Compliance Assurance',
      description: 'Automated compliance checks and audit trails ensure adherence to regulations and policies.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div style={{ background: 'linear-gradient(135deg, #0f5e59 0%, #1a8a7f 100%)' }} className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-bold text-6xl text-white mb-6 tracking-tight">
            Government Departments
          </h1>
          <p className="text-white text-xl opacity-95 font-light leading-relaxed max-w-4xl">
            Connecting departments across Uttarakhand for seamless collaboration and efficient governance
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Overview Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-6 tracking-tight" style={{ color: '#0f5e59' }}>
            Integrated Department Network
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            Pravaah connects all major government departments in Uttarakhand, creating a unified ecosystem for document 
            management and interdepartmental collaboration. Our platform enables seamless information flow while maintaining 
            the highest standards of security and compliance.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed">
            Each department operates within its designated domain while benefiting from integrated workflows, shared resources, 
            and collaborative tools that enhance overall government efficiency.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold mb-10 tracking-tight text-center" style={{ color: '#0f5e59' }}>
            Benefits for Departments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-8 border-t-4"
                style={{ borderTopColor: '#0f5e59' }}
              >
                <h3 className="text-2xl font-bold mb-4 tracking-tight" style={{ color: '#0f5e59' }}>
                  {benefit.title}
                </h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Department Categories */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold mb-10 tracking-tight text-center" style={{ color: '#0f5e59' }}>
            Connected Departments
          </h2>
          <div className="space-y-12">
            {departmentCategories.map((category, catIndex) => (
              <div key={catIndex}>
                <h3 className="text-3xl font-bold mb-6 tracking-tight" style={{ color: '#0f5e59' }}>
                  {category.category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.departments.map((dept, deptIndex) => (
                    <div
                      key={deptIndex}
                      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-l-4"
                      style={{ borderLeftColor: '#68AC5D' }}
                    >
                      <h4 className="text-xl font-bold mb-3 tracking-tight" style={{ color: '#0f5e59' }}>
                        {dept.name}
                      </h4>
                      <p className="text-gray-700 leading-relaxed">
                        {dept.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Registration CTA */}
        <div 
          className="rounded-xl p-10 border-2"
          style={{ 
            backgroundColor: 'rgba(15, 94, 89, 0.05)',
            borderColor: 'rgba(15, 94, 89, 0.2)'
          }}
        >
          <h2 className="text-3xl font-bold mb-6 tracking-tight text-center" style={{ color: '#0f5e59' }}>
            Register Your Department
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed text-center mb-8 max-w-3xl mx-auto">
            Is your department not yet connected to Pravaah? Department nodal officers can submit a registration 
            request to join the integrated document management platform.
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

        {/* Support Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 text-lg font-light">
            For departmental queries or technical support, please contact our help center
          </p>
        </div>
      </div>
    </div>
  );
};

export default Departments;
