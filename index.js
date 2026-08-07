require('dotenv').config();

const { ChatOpenAI } = require('@langchain/openai');
const { PromptTemplate } = require('@langchain/core/prompts');

const model = new ChatOpenAI({
  model: 'gpt-5.4-mini',
  temperature: 0,
});

const prompt = PromptTemplate.fromTemplate('Translate the following text to English: {text}');
const translationChain = prompt.pipe(model);

async function main() {
  const response = await translationChain.invoke({ text: 'Ինչպե՞ս ես' });
  console.log(response.content);
}

main().catch(console.error);