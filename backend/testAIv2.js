/**
 * AI Service V2 - Comprehensive Test
 * Tests Gemini + HuggingFace fallback + Hard Rules
 */

require('dotenv').config();
const { analyzeDocument, DEPARTMENTS } = require('./services/aiServiceV2');

// Test documents with different scenarios
const testCases = [
  {
    name: 'DISASTER - Flood Alert',
    text: `URGENT: Flash Flood Warning - Uttarakhand State Disaster Management Authority
    
    Immediate evacuation orders issued for low-lying areas in Dehradun district due to heavy rainfall.
    All district magistrates must coordinate with local authorities within 24 hours.
    Relief camps to be established at designated safe zones.
    `,
    metadata: { title: 'Flash Flood Emergency', uploaded_by_department: 'State Secretariat' }
  },
  {
    name: 'FINANCE - Tender Notice',
    text: `Tender Notice No. 2025/FIN/456
    
    The Finance Department invites sealed tenders for procurement of office equipment worth Rs. 50 lakhs.
    Last date for submission: 15th January 2025.
    Pre-bid meeting scheduled on 5th January.
    Technical and financial bids to be submitted separately.
    `,
    metadata: { title: 'Office Equipment Procurement Tender', uploaded_by_department: 'Finance' }
  },
  {
    name: 'HR - Recruitment Notice',
    text: `Recruitment Notification - Uttarakhand Public Service Commission
    
    Applications invited for 50 posts of Assistant Engineers in various departments.
    Eligibility: B.Tech/BE with minimum 60% marks.
    Application deadline: 31st January 2025.
    Selection through written exam and interview.
    `,
    metadata: { title: 'Engineer Recruitment 2025', uploaded_by_department: 'HR' }
  },
  {
    name: 'LEGAL - Audit Report',
    text: `Audit Report FY 2024-25 - Compliance Department
    
    This report identifies irregularities in fund utilization by three district offices.
    Legal action recommended for violation of financial regulations.
    Immediate inquiry to be conducted by authorized officers.
    Response required within 15 days.
    `,
    metadata: { title: 'Annual Audit Findings', uploaded_by_department: 'Audit' }
  },
  {
    name: 'GENERAL - Policy Circular',
    text: `All Department Heads are requested to ensure timely submission of monthly reports.
    New reporting format attached herewith.
    Implementation from 1st February 2025.
    Contact IT department for any technical assistance.
    `,
    metadata: { title: 'Monthly Reporting Guidelines', uploaded_by_department: 'Admin' }
  }
];

async function runTests() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║    AI-ASSISTED DOCUMENT INTELLIGENCE - COMPREHENSIVE TEST        ║');
  console.log('║    (Government-Compliant System with Fallback Mechanism)         ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');
  
  console.log('📋 GOVERNMENT SAFETY STATEMENT:');
  console.log('"AI is used only to assist document understanding and routing suggestions.');
  console.log('All final decisions and accountability remain with authorized government officials."\n');
  
  console.log('🧪 Running', testCases.length, 'test cases...\n');
  console.log('═'.repeat(70) + '\n');
  
  for (let i = 0; i < testCases.length; i++) {
    const test = testCases[i];
    
    console.log(`\n📄 TEST ${i + 1}: ${test.name}`);
    console.log('─'.repeat(70));
    console.log('Document Preview:', test.text.substring(0, 100) + '...\n');
    
    try {
      const result = await analyzeDocument(test.text, test.metadata);
      
      console.log('✅ ANALYSIS RESULT:\n');
      
      console.log('🤖 AI Provider:', result.ai_provider);
      console.log('⚡ Processing Time:', result.processing_time_ms, 'ms');
      console.log('🎯 Hard Rule Applied:', result.hard_rule_applied ? 'YES' : 'NO');
      console.log('👤 Requires Human Approval:', result.requires_human_approval ? 'YES (MANDATORY)' : 'NO');
      
      console.log('\n📝 SUMMARY:');
      result.summary.forEach((point, idx) => {
        console.log(`   ${idx + 1}. ${point}`);
      });
      
      console.log('\n📊 KEY DETAILS:');
      console.log('   Subject:', result.key_details.subject);
      console.log('   Urgency:', result.key_details.urgency);
      console.log('   Deadline:', result.key_details.deadline || 'None specified');
      
      console.log('\n🏷️  CLASSIFICATION:');
      console.log('   Category:', result.classification.category);
      console.log('   Confidence:', (result.classification.confidence * 100).toFixed(1) + '%');
      console.log('   Note:', result.ai_confidence_note);
      
      console.log('\n🎯 ROUTING SUGGESTION (Subject to Human Approval):');
      console.log('   Primary Department:', result.routing_suggestion.primary_department);
      console.log('   CC Departments:', result.routing_suggestion.cc_departments.length > 0 
        ? result.routing_suggestion.cc_departments.join(', ') 
        : 'None');
      console.log('   Reason:', result.routing_suggestion.reason);
      
      console.log('\n💡 NEXT STEP: Department Admin must review and approve/modify this suggestion');
      
    } catch (error) {
      console.log('❌ Test Failed:', error.message);
    }
    
    console.log('\n' + '═'.repeat(70));
    
    // Add delay to avoid rate limits
    if (i < testCases.length - 1) {
      console.log('\n⏳ Waiting 3 seconds before next test to avoid API rate limits...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log('\n\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║                      TEST SUMMARY                                 ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');
  
  console.log('✅ All tests completed!');
  console.log('\n📌 KEY FEATURES DEMONSTRATED:');
  console.log('   1. Hard routing rules for critical documents (Disaster, Finance, HR, Legal)');
  console.log('   2. AI-assisted analysis with structured JSON output');
  console.log('   3. Fallback mechanism (Gemini → HuggingFace)');
  console.log('   4. Confidence scoring and human approval requirement');
  console.log('   5. Government-compliant audit trail');
  console.log('\n🔐 COMPLIANCE:');
  console.log('   - All routing suggestions require human approval');
  console.log('   - AI provider and confidence scores logged');
  console.log('   - Hard rules override AI for critical documents');
  console.log('   - Full audit trail maintained\n');
}

// Run tests
runTests().catch(console.error);
