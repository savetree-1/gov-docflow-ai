/******
    AI Service V2 - Government Document Intelligence
 
 1. GOVERNMENT SAFETY STATEMENT:
     "AI is used only to assist document understanding and routing suggestions.
      All final decisions and accountability remain with authorized government officials."
 
 2. Features:
    1. Primary: Google Gemini API (with quota management)
    2. Fallback: HuggingFace Inference API
    3. Structured JSON output
    4. Hard routing rules for critical documents
    5. Confidence scoring
    6. Full audit trail
 ******/

const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

/****** Lazy initialization for getting the API instance when needed ******/
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not found in environment variables');
  }
  return new GoogleGenerativeAI(apiKey);
}

const HF_TOKEN = process.env.HF_TOKEN;
const HF_API_URL = 'https://api-inference.huggingface.co/models/';

/****** Government document categories ******/
const DOCUMENT_CATEGORIES = [
  'Disaster Management',
  'Finance & Procurement',
  'HR & Administration',
  'Legal / Compliance',
  'Land & Revenue',
  'Agriculture',
  'Infrastructure',
  'Inter-department Communication'
];

/****** Uttarakhand Government Departments ******/
const DEPARTMENTS = {
  DISASTER: 'Disaster Management',
  FINANCE: 'Finance & Procurement',
  HR: 'HR & Administration',
  LEGAL: 'Legal & Compliance',
  LAND: 'Land & Revenue',
  AGRICULTURE: 'Agriculture',
  INFRASTRUCTURE: 'Infrastructure & Public Works',
  ADMIN: 'General Administration'
};

/****** HARD ROUTING RULES (Always Applied First) these override AI suggestions for critical documents ******/
function applyHardRoutingRules(documentText) {
  const text = documentText.toLowerCase();
  
  /****** Disaster Management having Highest Priority ******/
  if (text.match(/\b(flood|landslide|earthquake|evacuation|disaster|emergency|rainfall|cloudburst)\b/i)) {
    return {
      matched: true,
      category: 'Disaster Management',
      primaryDepartment: DEPARTMENTS.DISASTER,
      urgency: 'High',
      reason: 'Document contains disaster/emergency keywords - Hard Rule Applied'
    };
  }
  
  /****** Finance & Procurement ******/
  if (text.match(/\b(tender|procurement|budget|financial|payment|invoice|purchase|contract award)\b/i)) {
    return {
      matched: true,
      category: 'Finance & Procurement',
      primaryDepartment: DEPARTMENTS.FINANCE,
      urgency: 'Medium',
      reason: 'Document contains finance/procurement keywords - Hard Rule Applied'
    };
  }
  
  /****** HR & Administration ******/
  if (text.match(/\b(recruitment|leave|service rules|appointment|promotion|transfer|employee)\b/i)) {
    return {
      matched: true,
      category: 'HR & Administration',
      primaryDepartment: DEPARTMENTS.HR,
      urgency: 'Medium',
      reason: 'Document contains HR keywords - Hard Rule Applied'
    };
  }
  
  /****** Legal & Compliance ******/
  if (text.match(/\b(audit|compliance|court|legal notice|inquiry|investigation|RTI)\b/i)) {
    return {
      matched: true,
      category: 'Legal / Compliance',
      primaryDepartment: DEPARTMENTS.LEGAL,
      urgency: 'High',
      reason: 'Document contains legal/compliance keywords - Hard Rule Applied'
    };
  }
  
  /****** Land & Revenue ******/
  if (text.match(/\b(land record|property|revenue|mutation|registry|cadastral)\b/i)) {
    return {
      matched: true,
      category: 'Land & Revenue',
      primaryDepartment: DEPARTMENTS.LAND,
      urgency: 'Medium',
      reason: 'Document contains land/revenue keywords - Hard Rule Applied'
    };
  }
  
  return { matched: false };
}

/****** Detect urgency from document text ******/
function detectUrgency(documentText) {
  const text = documentText.toLowerCase();
  
  if (text.match(/\b(immediate|urgent|asap|emergency|within 24 hours|critical)\b/i)) {
    return 'High';
  }
  
  if (text.match(/\b(within \d+ days?|deadline|due date|time-bound)\b/i)) {
    return 'Medium';
  }
  
  return 'Low';
}

/****** PRIMARY: Gemini AI Analysis ******/
async function analyzeWithGemini(documentText, metadata) {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `You are assisting a government document management system for Uttarakhand Government.

Task:
1. Summarize the document into short, clear bullet points (3-5 points max).
2. Extract urgency, subject, and any deadline.
3. Classify the document into one of these categories ONLY:
   - Disaster Management
   - Finance & Procurement
   - HR & Administration
   - Legal / Compliance
   - Land & Revenue
   - Agriculture
   - Infrastructure
   - Inter-department Communication

4. Suggest which Uttarakhand government department should primarily handle this document and which departments should be kept in CC.

Available Departments:
- Disaster Management
- Finance & Procurement  
- HR & Administration
- Legal & Compliance
- Land & Revenue
- Agriculture
- Infrastructure & Public Works
- General Administration

Rules:
- Do not make decisions or approve anything.
- Only suggest and explain briefly.
- Keep output factual and neutral.
- Respond ONLY in valid JSON format.

Document Metadata:
- Title: ${metadata.title || 'Untitled'}
- Uploaded by: ${metadata.uploaded_by_department || 'Unknown'}

Document Text:
${documentText.substring(0, 3000)}

Respond in EXACTLY this JSON format:
{
  "summary": ["bullet point 1", "bullet point 2", "bullet point 3"],
  "key_details": {
    "subject": "Main topic",
    "urgency": "High/Medium/Low",
    "deadline": "Date or null"
  },
  "classification": {
    "category": "One of the 8 categories above",
    "confidence": 0.85
  },
  "routing_suggestion": {
    "primary_department": "Department Name",
    "cc_departments": ["Dept A", "Dept B"],
    "reason": "One sentence justification"
  }
}`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const parsed = JSON.parse(jsonMatch[0]);
    parsed.ai_provider = 'Gemini';
    return parsed;
  }
  
  throw new Error('Failed to parse Gemini response');
}

/****** FALLBACK: HuggingFace Summarization ******/
async function analyzeWithHuggingFace(documentText, metadata) {
  try {
    /****** Use BART for summarization ******/
    const summaryResponse = await axios.post(
      HF_API_URL + 'facebook/bart-large-cnn',
      {
        inputs: documentText.substring(0, 1024),
        parameters: { max_length: 150, min_length: 30 }
      },
      {
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    
    const summaryText = summaryResponse.data[0]?.summary_text || documentText.substring(0, 200);
    
    /****** Extract key sentences as bullet points ******/
    const sentences = summaryText.match(/[^.!?]+[.!?]+/g) || [summaryText];
    const summary = sentences.slice(0, 3).map(s => s.trim());
    
    /****** Basic classification based on keywords ******/
    let category = 'Inter-department Communication';
    if (documentText.match(/disaster|flood|emergency/i)) category = 'Disaster Management';
    else if (documentText.match(/tender|finance|budget/i)) category = 'Finance & Procurement';
    else if (documentText.match(/recruitment|hr|employee/i)) category = 'HR & Administration';
    
    return {
      summary,
      key_details: {
        subject: metadata.title || 'Document Analysis',
        urgency: detectUrgency(documentText),
        deadline: null
      },
      classification: {
        category,
        confidence: 0.65 /****** Setting up lower confidence for fallback ******/
      },
      routing_suggestion: {
        primary_department: DEPARTMENTS.ADMIN,
        cc_departments: [],
        reason: 'Analyzed using fallback AI (HuggingFace) - manual review recommended'
      },
      ai_provider: 'HuggingFace'
    };
    
  } catch (error) {
    console.error('HuggingFace API Error:', error.message);
    throw error;
  }
}

/******
 * MAIN FUNCTION: Analyze Document with Fallback Logic
 * 
 * @returns {Object} Structured analysis result in government-compliant format
 ******/
async function analyzeDocument(raw_text, document_metadata = {}) {
  const startTime = Date.now();
  
  try {
    console.log('Starting AI document analysis...');
    
    // Step 1: Apply Hard Routing Rules First
    const hardRule = applyHardRoutingRules(raw_text);
    
    let aiResult;
    let usedHardRule = false;
    
    if (hardRule.matched) {
      console.log('Hard routing rule matched:', hardRule.category);
      usedHardRule = true;
      
      /****** Still try to get AI summary, but use hard rule for routing ******/
      try {
        aiResult = await analyzeWithGemini(raw_text, document_metadata);
        /****** Override routing with hard rule ******/
        aiResult.classification.category = hardRule.category;
        aiResult.routing_suggestion.primary_department = hardRule.primaryDepartment;
        aiResult.key_details.urgency = hardRule.urgency;
        aiResult.routing_suggestion.reason = hardRule.reason;
        aiResult.hard_rule_applied = true;
      } catch (geminiError) {
        /****** If Gemini fails, using hard rule + fallback ******/
        console.log('Gemini failed, using HuggingFace + Hard Rule');
        aiResult = await analyzeWithHuggingFace(raw_text, document_metadata);
        aiResult.classification.category = hardRule.category;
        aiResult.routing_suggestion.primary_department = hardRule.primaryDepartment;
        aiResult.key_details.urgency = hardRule.urgency;
        aiResult.routing_suggestion.reason = hardRule.reason;
        aiResult.hard_rule_applied = true;
      }
    } else {
      /****** If no hard rule matched, try Gemini first ******/
      try {
        console.log('Analyzing with Gemini AI...');
        aiResult = await analyzeWithGemini(raw_text, document_metadata);
        aiResult.hard_rule_applied = false;
      } catch (geminiError) {
        console.log('Gemini API failed, falling back to HuggingFace');
        console.log('Error:', geminiError.message);
        
        /****** Fallback to HuggingFace ******/
        try {
          aiResult = await analyzeWithHuggingFace(raw_text, document_metadata);
          aiResult.hard_rule_applied = false;
        } catch (hfError) {
          console.error('Both AI providers failed:', hfError.message);
          
          /****** Last resort: Basic extraction ******/
          aiResult = {
            summary: [raw_text.substring(0, 150) + '...'],
            key_details: {
              subject: document_metadata.title || 'Document',
              urgency: detectUrgency(raw_text),
              deadline: null
            },
            classification: {
              category: 'Inter-department Communication',
              confidence: 0.3
            },
            routing_suggestion: {
              primary_department: DEPARTMENTS.ADMIN,
              cc_departments: [],
              reason: 'AI analysis unavailable - requires manual review'
            },
            ai_provider: 'None (Fallback)',
            hard_rule_applied: false
          };
        }
      }
    }
    
    /****** Adding metadata ******/
    aiResult.processing_time_ms = Date.now() - startTime;
    aiResult.requires_human_approval = true; // ALWAYS require human approval
    aiResult.ai_confidence_note = aiResult.classification.confidence >= 0.75 
      ? 'High confidence' 
      : 'Low confidence - manual review strongly recommended';
    
    console.log(`Analysis complete (${aiResult.processing_time_ms}ms) using ${aiResult.ai_provider}`);
    
    return aiResult;
    
  } catch (error) {
    console.error('Critical error in AI analysis:', error);
    
    /****** Emergency fallback ******/
    return {
      summary: ['Error in AI analysis - manual processing required'],
      key_details: {
        subject: document_metadata.title || 'Unknown',
        urgency: 'Medium',
        deadline: null
      },
      classification: {
        category: 'Inter-department Communication',
        confidence: 0.0
      },
      routing_suggestion: {
        primary_department: DEPARTMENTS.ADMIN,
        cc_departments: [],
        reason: 'AI system error - manual routing required'
      },
      ai_provider: 'Error',
      hard_rule_applied: false,
      processing_time_ms: Date.now() - startTime,
      requires_human_approval: true,
      error_occurred: true,
      error_message: error.message
    };
  }
}

module.exports = {
  analyzeDocument,
  applyHardRoutingRules,
  DOCUMENT_CATEGORIES,
  DEPARTMENTS
};
