import { config } from '../config/config.js';

/**
 * Chunk text into overlapping segments
 * @param {string} text - Input text
 * @param {number} chunkSize - Size of each chunk
 * @param {number} overlap - Overlap between chunks
 * @returns {string[]} Array of text chunks
 */
export const chunkText = (text, chunkSize = config.chunkSize, overlap = config.chunkOverlap) => {
  const chunks = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.substring(start, end).trim();
    
    if (chunk.length > 50) { // Only add meaningful chunks
      chunks.push(chunk);
    }
    
    start += chunkSize - overlap;
  }
  
  return chunks;
};

/**
 * Validate file type
 * @param {string} filename - File name
 * @returns {boolean} True if valid
 */
export const isValidFileType = (filename) => {
  if (!filename) return false;
  
  const ext = '.' + filename.split('.').pop().toLowerCase();
  return config.allowedExtensions.includes(ext);
};

/**
 * Get file extension
 * @param {string} filename - File name
 * @returns {string} File extension
 */
export const getFileExtension = (filename) => {
  if (!filename || !filename.includes('.')) return '';
  return '.' + filename.split('.').pop().toLowerCase();
};

/**
 * Clean and normalize text
 * @param {string} text - Input text
 * @returns {string} Cleaned text
 */
export const cleanText = (text) => {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

export default {
  chunkText,
  isValidFileType,
  getFileExtension,
  cleanText
};
