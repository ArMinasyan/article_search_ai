require('dotenv').config();

const express = require('express');
const app = express();

const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { createAgent, HumanMessage } = require('langchain');
const jobSchema = require('./schemas/job.schema');
const { TavilySearch } = require('@langchain/tavily');
const MODEL_NAME = 'gemini-3.5-flash';

const model = new ChatGoogleGenerativeAI({
  model: MODEL_NAME,
  temperature: 0,
});

const { z } = require('zod');

const jobListSchema = z.object({
  jobs: z.array(jobSchema).describe('List of job listings matching the search query'),
});

const agent = createAgent({
  model,
  tools: [TavilySearch],
  name: 'search',
  description: `Used model: ${MODEL_NAME}`,
  responseFormat: jobListSchema,
});


app.use(express.json());

app.post('/find-job', async (req, res) => {
  const { message } = req.body;
  const result = await agent.invoke({
    messages: [new HumanMessage(message)],
  });

  res.json({
    response: result.structuredResponse?.jobs ?? result.structuredResponse,
  });
});

const port = Number(process.env.PORT) || 8080;
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Set a different PORT value and retry.`);
    process.exit(1);
  }

  throw error;
});