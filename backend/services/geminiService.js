/**
 * Gemini AI Service
 * Handles document summarization and intelligent routing
 * Optimized for robustness and code reuse.
 */

const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Using the stable 1.5 Flash model for better JSON reliability and speed
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * HELPER: Centralized function to call Gemini API
 * Reduces code duplication and handles JSON parsing safely.
 */
const callGemini = async (prompt) => {
  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: "application/json" // Force JSON mode (Official API feature)
        }
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const textResponse = response.data.candidates[0].content.parts[0].text;
    
    // Improved JSON cleaning (removes markdown code blocks if they slip through)
    const jsonString = textResponse.replace(/```json|```/g, '').trim();
    
    return JSON.parse(jsonString);

  } catch (error) {
    console.error('Gemini Internal Error:', error.response?.data || error.message);
    return null; // Return null to trigger fallbacks in main functions
  }
};

/**
 * Generate document summary using Gemini
 */
const generateSummary = async (documentText, metadata = {}) => {
  const prompt = `
    You are a government document analyst. Analyze this official document.
    
    Context:
    - Title: ${metadata.title || 'Untitled'}
    - Category: ${metadata.category || 'General'}
    
    Input Text: 
    "${documentText.substring(0, 5000)}"

    Return a valid JSON object (NO Markdown) with these fields:
    1. "summary": Concise 2-3 sentence summary.
    2. "keyPoints": Array of 3-5 bullet points.
    3. "urgency": "Low", "Medium", or "High" (If Disaster/Flood mentioned -> High).
    4. "deadline": Date string (YYYY-MM-DD) or "Not specified".
  `;

  const data = await callGemini(prompt);

  if (data) {
    return {
      success: true,
      data: {
        summary: data.summary,
        keyPoints: data.keyPoints || [],
        aiUrgency: data.urgency || 'Medium',
        aiDeadline: (data.deadline && data.deadline !== 'Not specified') ? data.deadline : null
      }
    };
  }

  // Fallback
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
};

/**
 * Suggest routing departments based on document content
 */
const suggestRouting = async (documentText, metadata = {}) => {
  const prompt = `
    You are a government routing AI. Route this document to the correct department.

    Departments:
    - Finance (FIN)
    - Land & Revenue (LAND)
    - Agriculture (AGRI)
    - Human Resources (HR)
    - Infrastructure (INFRA)
    - Legal (LEGAL)
    - Disaster Management (DISASTER)

    Input Text: 
    "${documentText.substring(0, 5000)}"

    Return a valid JSON object (NO Markdown):
    {
      "primaryDepartment": "CODE",
      "secondaryDepartments": ["CODE"],
      "reasoning": "Brief explanation"
    }
  `;

  const data = await callGemini(prompt);

  if (data) {
    return {
      success: true,
      data: {
        suggestedDepartment: data.primaryDepartment || 'FIN',
        secondaryDepartments: data.secondaryDepartments || [],
        routingReason: data.reasoning || 'AI-based routing'
      }
    };
  }

  // Fallback
  return {
    success: false,
    data: {
      suggestedDepartment: null,
      secondaryDepartments: [],
      routingReason: 'Unable to determine routing'
    }
  };
};

module.exports = {
  generateSummary,
  suggestRouting
};