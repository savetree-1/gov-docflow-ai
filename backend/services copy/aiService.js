/**
 * Gemini AI Service - Clean Implementation
 * Uses @google/genai for reliable PDF text analysis
 */

const { GoogleGenAI } = require('@google/genai');

// Initialize Gemini client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not found in environment variables');
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Analyze document text with Gemini
 * Works with extracted text from PDFs/DOCX
 */
async function analyzeDocumentText(documentText, documentMetadata = {}) {
  try {
    const ai = getGeminiClient();
    
    console.log('🤖 Sending text to Gemini for analysis...');
    console.log(`📊 Text length: ${documentText.length} characters`);

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
You are an AI analyst for 'Pravaah', the Uttarakhand Government Document Management System.

Analyze the following government document and provide analysis in valid JSON format ONLY (no markdown, no code blocks).

Document Title: ${documentMetadata.title || 'Untitled'}
Document Category: ${documentMetadata.category || 'General'}

Document Text:
${documentText}

Return ONLY this JSON structure:
{
  "summary": "2-3 sentence concise summary of the document",
  "keyPoints": ["key point 1", "key point 2", "key point 3"],
  "documentType": "Type of document (e.g., Circular, Order, Application, Notice)",
  "priority": "High/Medium/Low based on content urgency",
  "deadlines": ["any dates or deadlines mentioned"],
  "actionItems": ["required actions from this document"],
  "suggestedDepartment": "Which department should handle this"
}
`
            }
          ]
        }
      ]
    });

    console.log('✅ Gemini analysis received');
    
    // Get response text
    let text = response.text || '';
    
    // Clean response (remove markdown code blocks if present)
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Parse JSON
    const analysis = JSON.parse(text);
    
    return {
      summary: analysis.summary || 'Document analyzed successfully',
      keyPoints: analysis.keyPoints || [],
      documentType: analysis.documentType || 'General',
      priority: analysis.priority || 'Medium',
      deadlines: analysis.deadlines || [],
      actionItems: analysis.actionItems || [],
      suggestedDepartment: analysis.suggestedDepartment || 'General Administration'
    };

  } catch (error) {
    console.error('Gemini Analysis Error:', error.message);
    
    // Fallback response
    return {
      summary: documentText.substring(0, 300) + '...',
      keyPoints: ['Document uploaded and awaiting manual review'],
      documentType: 'General',
      priority: 'Medium',
      deadlines: [],
      actionItems: ['Review document content'],
      suggestedDepartment: 'General Administration'
    };
  }
}

/**
 * Get department routing suggestions
 */
async function suggestRouting(documentText, documentMetadata = {}) {
  try {
    const ai = getGeminiClient();
    
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
You are an AI routing assistant for Uttarakhand Government.

Available Departments:
- Finance (budget, payments, audit)
- Land & Revenue (land records, property, revenue)
- Agriculture (farming, irrigation, crops)
- Human Resources (employees, recruitment, training)
- Infrastructure (construction, maintenance, public works)
- Legal & Compliance (legal matters, contracts)
- Disaster Management (emergencies, disasters, relief)

Document: ${documentMetadata.title || 'Untitled'}
Category: ${documentMetadata.category || 'General'}
Content (first 500 chars): ${documentText.substring(0, 500)}

Return ONLY JSON:
{
  "primaryDepartment": "department name",
  "secondaryDepartments": ["dept1", "dept2"],
  "reasoning": "why this routing",
  "urgency": "High/Medium/Low"
}
`
            }
          ]
        }
      ]
    });

    let text = response.text || '';
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const routing = JSON.parse(text);
    
    return {
      primaryDepartment: routing.primaryDepartment || 'General Administration',
      secondaryDepartments: routing.secondaryDepartments || [],
      reasoning: routing.reasoning || 'Default routing',
      urgency: routing.urgency || 'Medium'
    };

  } catch (error) {
    console.error('Routing suggestion error:', error.message);
    return {
      primaryDepartment: 'General Administration',
      secondaryDepartments: [],
      reasoning: 'Automatic routing - manual review recommended',
      urgency: 'Medium'
    };
  }
}

// Backward compatibility aliases
const generateSummary = analyzeDocumentText;

module.exports = {
  analyzeDocumentText,
  suggestRouting,
  // Deprecated - for backward compatibility
  generateSummary
};
