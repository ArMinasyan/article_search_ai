require('dotenv').config();

const { StructuredOutputParser } = require('@langchain/core/output_parsers');
const { z } = require('zod');

const { createWriteStream } = require('fs');
const { pipeline } = require('stream/promises');

const createReport = require('./create-report');
const initChat = require('./init-chat');


const schema = z.object({
  topic: z.string().describe('The topic of the article'),
  summary: z.string().describe('A brief summary of the article'),
  source: z.string().describe('The source of the article')
})

const parser = StructuredOutputParser.fromZodSchema(schema);

async function main() {
  const article = process.argv[2];
  if (!article) {
    console.error("Please provide an article as a command line argument.");
    process.exit(1);
  }

  const executor = await initChat();


  const response = await executor.invoke({
    article,
    format_instructions: parser.getFormatInstructions(),
  })

  const result = await parser.parse(response.output);

  const doc = createReport(result);
  const writing = pipeline(doc, createWriteStream(`${article.replaceAll(/[/\\?%*:|"<>]/g, '-')}.pdf`));
  doc.end();
  await writing;
  console.log('DONE! PDF generated successfully.');
}

main().catch((error) => {
  console.error('Article research failed:', error);
  process.exitCode = 1;
});
