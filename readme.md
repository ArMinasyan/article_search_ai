# Article Search AI

A Node.js command-line research assistant built with LangChain and Groq. Provide article text or a research topic, and the agent can consult Wikipedia and DuckDuckGo before producing its response.

The agent researches the input and returns a topic, summary, and source. The program validates these fields against a Zod schema and exports them as a styled PDF report.

## PDF Reports

Reports are designed for reading and essay preparation, with:

- An A4 layout with generous margins and navy and teal accents.
- A prominent topic title, report label, and generation date.
- A summary section with readable typography and spaced paragraphs.
- A separate sources section and numbered page footers.

The prompt requests more than five paragraphs, separated by newlines. This is a model instruction, not a programmatically enforced paragraph count.

## Requirements

- Node.js 20 or newer and npm.
- A [Groq API key](https://console.groq.com/keys).
- Internet access for Groq and search requests.

## Setup

From the project directory, install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```dotenv
GROQ_API_KEY=your_groq_api_key
```

The application loads this file through `dotenv`. `.env` is excluded from Git; never commit your API key.

If npm reports the existing optional `@browserbasehq/stagehand` peer-dependency conflict, install with:

```bash
npm install --legacy-peer-deps
```

## Usage

Pass the complete input as one quoted argument:

```bash
npm start -- "Research Node.js, its history, and its main uses."
```

Or run the entry point directly:

```bash
node main.js "Node.js is an open-source JavaScript runtime built on the V8 engine."
```

Without an argument, the program prints an error and exits. Input is treated as text, not as a file path; there is no automatic file-reading or URL-ingestion step.

The PDF is saved in the current directory using the input argument as its filename, with `/`, `\`, `?`, `%`, `*`, `:`, `|`, `"`, `<`, and `>` replaced by hyphens. For example, `node main.js "Node.js"` writes `Node.js.pdf`. Use a short input to avoid filesystem filename-length limits. Running the same input again overwrites its existing report.

After the file has finished writing, the terminal prints:

```text
DONE! PDF generated successfully.
```

## How It Works

1. `main.js` loads the environment and configures `ChatGroq`.
2. A chat prompt combines the input with an `agent_scratchpad` placeholder for intermediate tool calls and results.
3. `createToolCallingAgent` and `AgentExecutor` let the model choose whether to use the search tools.
4. `StructuredOutputParser` validates the final `response.output` against the `topic`, `summary`, and `source` schema.
5. `create-report.js` builds the PDF with PDFKit, and `main.js` waits for the output stream to finish before reporting success.

| Tool | Implementation | Configuration |
| --- | --- | --- |
| Wikipedia | `WikipediaQueryRun` | Up to 2 pages; combined output limited to 2,000 characters |
| DuckDuckGo | `DuckDuckGoSearch` with `duck-duck-scrape` | Up to 2 search results |

Neither search tool requires a separate API key. Tool use is model-directed, so not every request will invoke both tools.

## Configuration

The model is configured in `main.js` as `qwen/qwen3.8-27b` with a temperature of `0.3`. If that identifier is unavailable to your Groq account, replace it with an available model that supports tool calling.

Adjust the prompt and Zod schema in `main.js` to change the requested content. Customize colors, fonts, margins, section spacing, and footers in `create-report.js`. Search result limits are configured in the individual tool modules.

## Limitations and Troubleshooting

Input is sent to Groq, and generated search queries may be sent to Wikipedia or DuckDuckGo. Avoid confidential input and verify important claims against their sources. Each run is independent; chat history is not persisted.

| Issue | Action |
| --- | --- |
| Missing or invalid API key | Set a valid `GROQ_API_KEY` in the project-root `.env` file. |
| Model unavailable | Update the model identifier in `main.js` to a supported tool-calling model. |
| DuckDuckGo anomaly or rate limit | Wait before retrying; automated requests may be blocked. |
| Invalid structured output | The response must contain string values for `topic`, `summary`, and `source`. Parsing errors are reported rather than saved as a report. |
| `PDFDocument is not defined` | The current `create-report.js` needs its own `const PDFDocument = require('pdfkit');` import. An import in `main.js` is not shared with other CommonJS modules. |
| PDF cannot be written | Check directory permissions and filename length. |

Failures are logged with the `Article research failed:` prefix and set a nonzero exit status.

## Project Structure

```text
main.js               CLI entry point, prompt, model, and agent
create-report.js      PDF layout, typography, sections, and page footers
tools/
  wiki.search.js      Configured Wikipedia tool instance
  duck.search.js      Configured DuckDuckGo tool instance
package.json          Dependencies and npm start command
readme.md             Setup and usage documentation
```

## License

The package declares the ISC license.