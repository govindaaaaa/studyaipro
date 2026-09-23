import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

console.log('Checking available Groq models...\n');

async function testModels() {
  // Updated list of currently available models (January 2025)
  const modelsToTry = [
    'llama-3.3-70b-versatile',
    'llama-3.3-70b-specdec',
    'llama-3.2-90b-text-preview',
    'llama-3.2-11b-text-preview',
    'llama-3.1-8b-instant',
    'llama3-groq-70b-8192-tool-use-preview',
    'llama3-70b-8192',
    'llama3-8b-8192',
    'mixtral-8x7b-32768',
    'gemma2-9b-it',
    'gemma-7b-it'
  ];

  console.log('Testing models with a simple query...\n');

  for (const model of modelsToTry) {
    try {
      const completion = await groq.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: 'Say "hi"' }],
        max_tokens: 10
      });
      
      console.log(`✅ ${model} - WORKS`);
    } catch (error) {
      console.log(`❌ ${model} - ${error.message.includes('model_not_found') ? 'NOT AVAILABLE' : 'ERROR'}`);
    }
  }

  console.log('\n✓ Test complete!');
  console.log('\n📝 Recommended models to use in .env:');
  console.log('GROQ_MODEL=llama-3.3-70b-versatile  (Latest, best quality)');
  console.log('GROQ_MODEL=llama-3.1-8b-instant      (Fast)');
  console.log('GROQ_MODEL=mixtral-8x7b-32768       (Long context)');
}

if (!process.env.GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY not found in .env file');
  process.exit(1);
}

testModels();
