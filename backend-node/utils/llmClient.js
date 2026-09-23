import Groq from 'groq-sdk';
import { config } from '../config/config.js';

class LLMClient {
  constructor() {
    this.client = new Groq({
      apiKey: config.groqApiKey
    });
    this.model = config.groqModel;
  }

  /**
   * Generate chat completion
   * @param {Array} messages - Chat messages
   * @param {number} maxTokens - Max tokens for response
   */
  async chat(messages, maxTokens = 4096) {
    try {
      console.log(`[LLM Client] Using model: ${this.model}`);
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages,
        max_tokens: maxTokens,
        temperature: 0.7
      });
      
      return completion.choices[0].message.content;
    } catch (error) {
      console.error('[LLM Client] Error:', error.message);
      
      // Try alternative models if current one fails
      if (error.message.includes('model_not_found') || 
          error.message.includes('does not exist') ||
          error.message.includes('decommissioned')) {
        
        // NEW GROQ MODELS (January 2025+)
        const fallbackModels = [
          'openai/gpt-oss-120b',      // Best quality, 120B params
          'qwen/qwen3.8-27b',          // Fast, supports images
          'openai/gpt-oss-20b',        // Lightweight
          'allam-2-7b'                 // Small, fast
        ];
        
        console.log('[LLM Client] Trying fallback models...');
        
        for (const fallbackModel of fallbackModels) {
          try {
            console.log(`[LLM Client] Attempting: ${fallbackModel}`);
            const completion = await this.client.chat.completions.create({
              model: fallbackModel,
              messages,
              max_tokens: Math.min(maxTokens, 16384),
              temperature: 0.7
            });
            
            console.log(`[LLM Client] ✓ Success with ${fallbackModel}! Update your .env to use this model.`);
            return completion.choices[0].message.content;
          } catch (retryError) {
            console.log(`[LLM Client] ${fallbackModel} failed, trying next...`);
            continue;
          }
        }
        
        console.error('[LLM Client] All fallback models failed');
      }
      
      throw new Error('Failed to generate response from LLM. Please check your Groq API key and model availability.');
    }
  }

  /**
   * Generate text from a single prompt (simple wrapper)
   * @param {string} prompt - The prompt text
   * @param {number} maxTokens - Max tokens for response
   */
  async generateText(prompt, maxTokens = 4096) {
    return await this.chat([{ role: 'user', content: prompt }], maxTokens);
  }

  /**
   * Format document context for prompt
   * @param {string[]} chunks - Document chunks
   */
  formatContext(chunks) {
    return chunks.slice(0, 10).join('\n\n---\n\n');
  }

  /**
   * Generate notes from chunks
   * @param {string[]} chunks - Document chunks
   * @param {string} mode - Note style (basic, detailed, bullet)
   */
  async generateNotes(chunks, mode = 'detailed') {
    const instructions = {
      basic: 'Write concise bullet-point notes covering only the key facts.',
      detailed: 'Write comprehensive structured notes with headings, subheadings, and clear explanations.',
      bullet: 'Write very short bullet points only. No prose. Maximum clarity.'
    };

    const prompt = `${instructions[mode] || instructions.detailed}\n\nContent:\n${this.formatContext(chunks)}\n\nReturn only the notes in Markdown format.`;

    return await this.chat([{ role: 'user', content: prompt }]);
  }

  /**
   * Generate MCQ questions
   * @param {string[]} chunks - Document chunks
   * @param {string} difficulty - Question difficulty (easy, medium, hard)
   * @param {number} count - Number of questions
   */
  async generateMCQ(chunks, difficulty = 'medium', count = 10) {
    const difficultyDesc = {
      easy: 'straightforward factual recall',
      medium: 'understanding and application',
      hard: 'analysis, inference, and critical thinking'
    };

    const prompt = `Generate exactly ${count} multiple-choice questions requiring ${difficultyDesc[difficulty] || difficultyDesc.medium} based on this content.\n\nContent:\n${this.formatContext(chunks)}\n\nReturn ONLY a valid JSON array, no markdown fences, no explanation:\n[{"id":"q1","question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"answer":"A","explanation":"..."}]`;

    const response = await this.chat([{ role: 'user', content: prompt }]);
    
    // Clean response and parse JSON
    const cleaned = response.trim().replace(/^```json|^```|```$/gm, '').trim();
    return JSON.parse(cleaned);
  }

  /**
   * Generate explanation
   * @param {string} text - Text to explain
   * @param {string} mode - Explanation mode (ELI5, Student, Expert)
   */
  async generateExplanation(text, mode = 'Student') {
    const prompts = {
      ELI5: 'Explain this like I am 5 years old. Use simple words, fun analogies, very short sentences.',
      Student: 'Explain this clearly for a university student. Use proper terminology with definitions.',
      Expert: 'Explain this at an expert/researcher level. Be precise, technical, and comprehensive.'
    };

    const prompt = `${prompts[mode] || prompts.Student}\n\nTopic/Text:\n${text}`;

    return await this.chat([{ role: 'user', content: prompt }], 2048);
  }

  /**
   * Generate Mermaid flowchart
   * @param {string} text - Text to create flowchart from
   */
  async generateFlowchart(text) {
    const prompt = `Extract the main process or sequence from this text and produce a Mermaid flowchart.\nReturn ONLY valid Mermaid code starting with 'flowchart TD'. No markdown fences.\n\nText:\n${text}`;

    const response = await this.chat([{ role: 'user', content: prompt }], 2048);
    return response.trim().replace(/^```mermaid|^```|```$/gm, '').trim();
  }

  /**
   * Chat with document context
   * @param {Array} messages - Chat history
   * @param {string[]} contextChunks - Relevant document chunks
   */
  async chatWithContext(messages, contextChunks) {
    const systemMessage = {
      role: 'system',
      content: `You are a helpful study assistant. Answer questions using the provided document context. If the answer is not in the context, say so honestly.\n\nDocument context:\n${this.formatContext(contextChunks)}`
    };

    const fullMessages = [systemMessage, ...messages];
    return await this.chat(fullMessages, 2048);
  }
}

// Export singleton instance
export default new LLMClient();
