require('dotenv').config();

const { ChatGroq } = require('@langchain/groq');
const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { StructuredOutputParser } = require('@langchain/core/output_parsers');
const { z } = require('zod');
const { createToolCallingAgent, AgentExecutor } = require("@langchain/classic/agents");

const WikiSearch = require('./tools/wiki.search'),
  DuckSearch = require('./tools/duck.search');
const schema =z.object({
  topic: z.string().describe('The topic of the article'),
  summary: z.string().describe('A brief summary of the article'),
  source: z.string().describe('The source of the article'),
  toolsUsed: z.array(z.string()).describe('The tools used in the article'),
})


const parser = StructuredOutputParser.fromZodSchema(schema);

const model = new ChatGroq({
    model: 'qwen/qwen3.8-27b',
  }),
  prompt = ChatPromptTemplate.fromMessages([
    ['system', `You are a research assistant that extracts information from articles.
                Extract the following information from the article: topic, summary, source, and tools used.
                {format_instructions}` ],
    ['human', 'Here is the article: {article}'],
    ['placeholder', '{agent_scratchpad}']
  ])

const tools = [WikiSearch, DuckSearch];


async function main(){
  const article = process.argv[2];
  if(!article){
    console.error("Please provide an article as a command line argument.");
    process.exit(1);
  }

  const agent = await createToolCallingAgent({
    llm: model,
    tools,
    prompt
  });

  const executor = new AgentExecutor({
    agent,
    tools,
    verbose: false,
  })

 const response = await executor.invoke({
    article,
    format_instructions: parser.getFormatInstructions(),
  })

  const result = await parser.parse(response.output);

  console.log(result);
}

main().catch((error) => {
  console.error('Article research failed:', error);
  process.exitCode = 1;
});
