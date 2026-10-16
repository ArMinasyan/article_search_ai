const { ChatGroq } = require("@langchain/groq");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { WikiSearch, DuckSearch } = require("./tools");
const { createToolCallingAgent, AgentExecutor } = require("@langchain/classic/agents");

async function initChat() {
  const model = new ChatGroq({
    model: 'qwen/qwen3.8-27b',
    temperature: 0.3
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', `You are a research assistant that extracts information from articles.
                Extract the following information from the article: topic, summary, source.
                Notes:
                - Article must have more then 5 paragraphs.
                - It should used for esse purpose.
                - After research, I should use it for write in pdf document.
                - The summary should be separated in new line for every paragraph
                {format_instructions}`],
    ['human', 'Here is the article: {article}'],
    ['placeholder', '{agent_scratchpad}']
  ]);

  const tools = [WikiSearch, DuckSearch];

  const agent = await createToolCallingAgent({
    llm: model,
    tools,
    prompt
  });

  return new AgentExecutor({
    agent,
    tools,
    verbose: false,
  });
}

module.exports = initChat