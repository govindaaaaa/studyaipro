import axios from 'axios';
import { config } from '../config/config.js';

/**
 * Client for communicating with Python RAG microservice
 */
class RAGClient {
  constructor() {
    this.baseURL = config.ragServiceUrl;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Add chunks to FAISS index for a session
   * @param {string} sessionId - Unique session ID
   * @param {string[]} chunks - Text chunks to index
   */
  async addChunks(sessionId, chunks) {
    try {
      const response = await this.client.post('/add-chunks', {
        session_id: sessionId,
        chunks
      });
      return response.data;
    } catch (error) {
      console.error('[RAG Client] Error adding chunks:', error.message);
      throw new Error('Failed to add chunks to vector store');
    }
  }

  /**
   * Retrieve relevant chunks for a query
   * @param {string} sessionId - Session ID
   * @param {string} query - Search query
   * @param {number} k - Number of chunks to retrieve
   */
  async retrieve(sessionId, query, k = 5) {
    try {
      const response = await this.client.post('/retrieve', {
        session_id: sessionId,
        query,
        k
      });
      return response.data.chunks || [];
    } catch (error) {
      console.error('[RAG Client] Error retrieving chunks:', error.message);
      throw new Error('Failed to retrieve chunks from vector store');
    }
  }

  /**
   * Get all chunks for a session
   * @param {string} sessionId - Session ID
   */
  async getAllChunks(sessionId) {
    try {
      const response = await this.client.get(`/chunks/${sessionId}`);
      return response.data.chunks || [];
    } catch (error) {
      console.error('[RAG Client] Error getting all chunks:', error.message);
      throw new Error('Failed to get chunks from vector store');
    }
  }

  /**
   * Health check for RAG service
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      console.error('[RAG Client] Health check failed:', error.message);
      return { status: 'unhealthy' };
    }
  }
}

// Export singleton instance
export default new RAGClient();
