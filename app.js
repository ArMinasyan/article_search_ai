require('dotenv').config();

const express = require('express');
const app = express();

const { ChatOllama } = require('@langchain/ollama');

const model = new ChatOllama({
  model: 'gemma3:270m',
  temperature: 0,
});


app.use(express.json());

app.post('/ask', async (req, res) => {
  const message = req.body?.message;
  if (typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'Request body must include a non-empty "message" string.' });
  }

  try {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    const response = await model.invoke(message);
    const content = typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content);

    res.end(content);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process request.' });
  }
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