/****** Gemini AI Service Module which Handles document summarization and intelligent routing ******/

const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

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
    
    /****** Extracting JSON from response (handle markdown code blocks) ******/
    let jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    
    // Try to extract JSON from markdown code blocks
    if (!jsonMatch) {
      const codeBlockMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (codeBlockMatch) {
        jsonMatch = [codeBlockMatch[1]];
      }
    }
    
    if (jsonMatch) {
      try {
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
      } catch (parseError) {
        console.error('JSON parsing failed:', parseError.message);
      }
    }

    /****** Fallback if JSON parsing fails ******/
    console.warn('Failed to parse JSON from Gemini response, using full text as summary');
    
    // Extract summary from text (remove markdown code blocks if present)
    let cleanResponse = aiResponse
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    return {
      success: true,
      data: {
        summary: cleanResponse, // Use full response instead of truncating
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
    const prompt = `You are an AI assistant for Uttarakhand Government document routing.
Analyze this document and provide:
1. Suggested department (name only)
2. Confidence level (0-1)
3. Routing reasoning
4. 3-point summary

Document: ${documentText.substring(0, 2000)}
Available Departments: Disaster Management, Finance & Procurement, HR & Administration, Legal & Compliance

Respond with JSON format:
{
  "suggestedDepartment": "Department Name",
  "confidence": 0.95,
  "reasoning": "Brief explanation why this department should handle it",
  "summary": ["Point 1", "Point 2", "Point 3"]
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
    
    // Try to extract JSON from markdown code blocks
    let jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      const codeBlockMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (codeBlockMatch) {
        jsonMatch = [codeBlockMatch[1]];
      }
    }
    
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          data: {
            primaryDepartment: parsed.suggestedDepartment,
            confidence: parsed.confidence || 0.8,
            reasoning: parsed.reasoning || 'AI-based routing',
            summary: parsed.summary || []
          }
        };
      } catch (parseError) {
        console.error('JSON parsing failed:', parseError.message);
      }
    }

    // Fallback parsing for non-JSON responses
    return {
      success: false,
      data: {
        primaryDepartment: 'Disaster Management',
        confidence: 0.5,
        reasoning: 'Default routing - manual review required',
        summary: ['Document requires manual review', 'Unable to auto-route', 'Please assign manually']
      }
    };
  } catch (error) {
    console.error('Routing AI Error:', error.message);
    return {
      success: false,
      data: {
        primaryDepartment: 'Disaster Management',
        confidence: 0.3,
        reasoning: 'AI routing unavailable - network error',
        summary: ['Document routing failed', 'Network connectivity issue', 'Manual assignment required']
      }
    };
  }
};

module.exports = {
  generateSummary,
  suggestRouting
};
