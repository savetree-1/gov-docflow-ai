const fs = require("fs");
const pdf = require("pdf-parse");
const { GoogleGenAI } = require("@google/genai");
require('dotenv').config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function testPDF() {
  const filePath = "/Users/anks/Documents/GitHub/krishi-sadhan/backend/uploads/documents/DOC-1767026178245-419293806.pdf";

  console.log("Reading PDF:", filePath);

  /****** STEP 1. Extract text from PDF ******/
  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdf(dataBuffer);

  console.log("Pages:", pdfData.numpages);
  console.log("Characters:", pdfData.text.length);

  if (pdfData.text.length < 50) {
    throw new Error("PDF text too short – scanned PDF needs OCR");
  }

  /****** STEP 2. Send extracted text to Gemini ******/
  console.log("Sending text to Gemini...");

  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `
You are a government document analyst.

Analyze the following document and return:
- Summary (3 lines)
- Important dates
- Document type
- Suggested department
- Urgency (Low/Medium/High)

Document text:
${pdfData.text}
`
          }
        ]
      }
    ]
  });

  console.log("\nGEMINI OUTPUT:\n");
  console.log(response.text);
}

testPDF().catch(err => {
  console.error("ERROR:", err.message);
  console.error(err);
});
