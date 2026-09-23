import pdf from 'pdf-parse';
import path from 'path';

/**
 * Extract text from PDF buffer
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<string>} Extracted text
 */
export const extractPDFText = async (buffer) => {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('[PDF Extractor] Error:', error.message);
    throw new Error('Failed to extract text from PDF');
  }
};

/**
 * Extract text from TXT/MD buffer
 * @param {Buffer} buffer - Text file buffer
 * @returns {string} Extracted text
 */
export const extractTextFile = (buffer) => {
  try {
    return buffer.toString('utf-8');
  } catch (error) {
    console.error('[Text Extractor] Error:', error.message);
    throw new Error('Failed to extract text from file');
  }
};

/**
 * Extract text from file based on extension
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - Original filename
 * @returns {Promise<string>} Extracted text
 */
export const extractText = async (buffer, filename) => {
  const ext = path.extname(filename).toLowerCase();
  
  if (ext === '.pdf') {
    return await extractPDFText(buffer);
  } else if (ext === '.txt' || ext === '.md') {
    return extractTextFile(buffer);
  } else {
    throw new Error(`Unsupported file type: ${ext}`);
  }
};

/**
 * Validate extracted text
 * @param {string} text - Extracted text
 * @param {number} minLength - Minimum text length
 * @returns {boolean} True if valid
 */
export const validateExtractedText = (text, minLength = 100) => {
  if (!text || typeof text !== 'string') {
    return false;
  }
  
  const trimmed = text.trim();
  return trimmed.length >= minLength;
};

export default {
  extractPDFText,
  extractTextFile,
  extractText,
  validateExtractedText
};
