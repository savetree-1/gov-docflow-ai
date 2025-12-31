const pdfParse = require('pdf-parse');
const { runTesseractOCR } = require('./ocrService');
const fs = require('fs').promises;
const path = require('path');

/**
 * Main text extraction service - handles both PDFs and images
 * Pipeline: PDF → pdf-parse → if text < 100 chars → OCR fallback
 *           Image → direct OCR
 */

async function extractText(filePath, fileType) {
  try {
    console.log(`📄 Extracting text from: ${path.basename(filePath)}`);
    console.log(`📋 File type: ${fileType}`);

    let text = '';

    // STEP 1: Determine extraction method based on file type
    if (fileType === 'application/pdf') {
      // Try PDF text extraction first
      text = await extractFromPDF(filePath);
      
      // If PDF has very little text, it might be scanned - use OCR
      if (text.length < 100) {
        console.log('⚠️  PDF has little text, trying OCR fallback...');
        text = await runTesseractOCR(filePath, 'pdf');
      }
    } else if (isImageFile(fileType)) {
      // Direct OCR for images
      console.log('🖼️  Image detected, using OCR...');
      text = await runTesseractOCR(filePath, 'image');
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }

    // STEP 2: Clean extracted text
    text = cleanText(text);

    console.log(`✅ Extracted ${text.length} characters`);
    return text;

  } catch (error) {
    console.error('❌ Text extraction failed:', error.message);
    throw new Error(`Text extraction failed: ${error.message}`);
  }
}

/**
 * Extract text from PDF using pdf-parse
 */
async function extractFromPDF(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    
    const text = data.text || '';
    console.log(`📖 PDF text extraction: ${text.length} characters`);
    
    return text;
  } catch (error) {
    console.error('PDF parse error:', error.message);
    return ''; // Return empty to trigger OCR fallback
  }
}

/**
 * Check if file is an image
 */
function isImageFile(mimeType) {
  const imageTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/tiff',
    'image/bmp'
  ];
  return imageTypes.includes(mimeType);
}

/**
 * Clean extracted text - remove excessive whitespace, fix encoding issues
 */
function cleanText(text) {
  if (!text) return '';
  
  return text
    .replace(/\r\n/g, '\n')           // Normalize line breaks
    .replace(/\n{3,}/g, '\n\n')       // Remove excessive newlines
    .replace(/[ \t]{2,}/g, ' ')       // Remove excessive spaces
    .replace(/^\s+|\s+$/g, '')        // Trim
    .replace(/[^\x20-\x7E\n]/g, '');  // Remove non-printable characters
}

/**
 * Get supported file formats
 */
function getSupportedFormats() {
  return {
    pdf: ['application/pdf'],
    images: [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/tiff',
      'image/bmp'
    ]
  };
}

module.exports = {
  extractText,
  getSupportedFormats,
  isImageFile
};
