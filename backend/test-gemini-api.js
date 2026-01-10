const axios = require('axios');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

async function testGemini() {
  try {
    console.log('\n🧪 Testing Gemini API...\n');
    
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: 'Test: Respond with just the word SUCCESS if you can read this'
          }]
        }]
      },
      { 
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      }
    );
    
    const result = response.data.candidates[0].content.parts[0].text;
    console.log('✅ Gemini API is working!');
    console.log('Response:', result);
    console.log('\n✅ You can now upload documents and get AI processing!\n');
    
  } catch (error) {
    if (error.response?.data?.error) {
      const err = error.response.data.error;
      console.log('❌ Gemini API Error:', err.code, err.status);
      console.log('Message:', err.message);
      
      if (err.code === 429) {
        console.log('\n⏳ Quota exceeded. Please wait or use a different API key.\n');
      }
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

testGemini();
