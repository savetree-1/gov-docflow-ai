/**
 * OCR Service using Tesseract.js
 * Handles scanned PDFs and images
 */

const Tesseract = require('tesseract.js');
const { createWorker } = Tesseract;
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * Run Tesseract OCR on image or PDF
 * @param {string} filePath - Path to file
 * @param {string} fileType - 'pdf' or 'image'
 * @returns {Promise<string>} - Extracted text
 */
async function runTesseractOCR(filePath, fileType) {
  console.log(`Starting OCR for ${fileType}: ${path.basename(filePath)}`);
  
  try {
    let imagePath = filePath;

    // If PDF, convert first page to image
    if (fileType === 'pdf') {
      imagePath = await convertPDFToImage(filePath);
    }

    // Run Tesseract OCR
    const text = await performOCR(imagePath);

    // Clean up temporary image if we created one
    if (fileType === 'pdf' && imagePath !== filePath) {
      try {
        await fs.unlink(imagePath);
      } catch (err) {
        console.warn('Failed to delete temp image:', err.message);
      }
    }

    console.log(`OCR completed: ${text.length} characters extracted`);
    return text;

  } catch (error) {
    console.error('OCR failed:', error.message);
    throw new Error(`OCR processing failed: ${error.message}`);
  }
}

/**
 * Convert PDF first page to image using pdftoppm (from poppler)
 */
async function convertPDFToImage(pdfPath) {
  const outputDir = path.dirname(pdfPath);
  const baseName = path.basename(pdfPath, '.pdf');
  const outputPrefix = path.join(outputDir, `temp_${baseName}`);
  
  try {
    // Convert first page to PNG
    const command = `pdftoppm -png -f 1 -l 1 -singlefile "${pdfPath}" "${outputPrefix}"`;
    
    await execPromise(command);
    
    const imagePath = `${outputPrefix}.png`;
    
    // Verify image was created
    await fs.access(imagePath);
    
    console.log(`PDF converted to image: ${path.basename(imagePath)}`);
    return imagePath;

  } catch (error) {
    console.error('PDF to image conversion failed:', error.message);
    throw new Error('Failed to convert PDF to image. Ensure poppler is installed.');
  }
}

/**
 * Perform OCR using Tesseract.js
 */
async function performOCR(imagePath) {
  const worker = await createWorker('eng');
  
  try {
    console.log('Running Tesseract OCR...');
    
    const { data: { text } } = await worker.recognize(imagePath);
    
    await worker.terminate();
    
    return text || '';

  } catch (error) {
    await worker.terminate();
    throw error;
  }
}

/**
 * Check if system has required OCR dependencies
 */
async function checkOCRDependencies() {
  const dependencies = {
    tesseract: false,
    poppler: false
  };

  try {
    // Check poppler (pdftoppm)
    await execPromise('pdftoppm -h');
    dependencies.poppler = true;
  } catch (error) {
    console.warn('pdftoppm not found. Install poppler: brew install poppler');
  }

  // Tesseract.js doesn't need system tesseract
  dependencies.tesseract = true; // Tesseract.js includes it

  return dependencies;
}

module.exports = {
  runTesseractOCR,
  checkOCRDependencies
};
