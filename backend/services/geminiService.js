/****** Gemini AI Service Module which Handles document summarization and intelligent routing ******/

const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-exp:generateContent';

/****** Generating the document's summary using Gemini ******/
const generateSummary = async (documentText, metadata = {}) => {
  try {
    const prompt = `You are a government document analyst. Analyze this official document and provide:
1. A concise 2-3 sentence summary
2. Key points (3-5 bullet points)
3. Urgency level (Low/Medium/High)
4. Deadline if mentioned (or "Not specified")

Document Title: ${metadata.title || 'Untitled'}
Document Type: ${metadata.category || 'General'}
Content: ${documentText.substring(0, 3000)}

Respond in JSON format:
{
  "summary": "concise summary here",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "urgency": "Medium",
  "deadline": "2025-01-15 or Not specified"
}`;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const aiResponse = response.data.candidates[0].content.parts[0].text;
    
    /****** Extracting JSON from response ******/
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        data: {
          summary: parsed.summary,
          keyPoints: parsed.keyPoints || [],
          aiUrgency: parsed.urgency || 'Medium',
          aiDeadline: parsed.deadline !== 'Not specified' ? parsed.deadline : null
        }
      };
    }

    /****** Fallback if JSON parsing fails ******/
    return {
      success: true,
      data: {
        summary: aiResponse.substring(0, 500),
        keyPoints: [],
        aiUrgency: 'Medium',
        aiDeadline: null
      }
    };
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: 'Failed to generate AI summary',
      data: {
        summary: 'AI summarization unavailable',
        keyPoints: [],
        aiUrgency: 'Medium',
        aiDeadline: null
      }
    };
  }
};

/****** Suggesting routing departments based on document content ******/
const suggestRouting = async (documentText, metadata = {}) => {
  try {
    const prompt = `You are a government document routing AI. Based on this document, suggest which departments should handle it.

Available Departments:
- Finance Department (FIN): Budget, payments, financial matters
- Land & Revenue Department (LAND): Land records, property, revenue
- Agriculture Department (AGRI): Farming, crop insurance, subsidies
- Human Resources (HR): Employee matters, recruitment, training
- Infrastructure (INFRA): Buildings, roads, construction
- Legal & Compliance (LEGAL): Legal issues, regulations, compliance

Document: ${documentText.substring(0, 2000)}
Category: ${metadata.category || 'General'}

Respond with JSON:
{
  "primaryDepartment": "LAND",
  "secondaryDepartments": ["FIN"],
  "reasoning": "Brief explanation"
}`;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const aiResponse = response.data.candidates[0].content.parts[0].text;
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        data: {
          suggestedDepartment: parsed.primaryDepartment || 'FIN',
          secondaryDepartments: parsed.secondaryDepartments || [],
          routingReason: parsed.reasoning || 'AI-based routing'
        }
      };
    }

    return {
      success: false,
      data: {
        suggestedDepartment: null,
        secondaryDepartments: [],
        routingReason: 'Unable to determine routing'
      }
    };
  } catch (error) {
    console.error('Routing AI Error:', error.message);
    return {
      success: false,
      data: {
        suggestedDepartment: null,
        secondaryDepartments: [],
        routingReason: 'AI routing unavailable'
      }
    };
  }
};

module.exports = {
  generateSummary,
  suggestRouting
};
