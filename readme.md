# Article Search AI

A Node.js command-line research assistant built with LangChain and Groq. Provide article text or a research topic, and the agent can consult Wikipedia and DuckDuckGo before producing its response.

The prompt asks for the article's topic, summary, source, and tools used. The program prints the agent's final answer to the terminal.

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
node main.js "Node.js is an open-source JavaScript runtime built on the V8 engine."
```

Without an argument, the program prints an error and exits. Input is treated as text, not as a file path; there is no automatic file-reading or URL-ingestion step.

## How It Works

1. `main.js` loads the environment and configures `ChatGroq`.
2. A chat prompt combines the input with an `agent_scratchpad` placeholder for intermediate tool calls and results.
3. `createToolCallingAgent` and `AgentExecutor` let the model choose whether to use the search tools.
4. The final `response.output` is printed to standard output.

| Tool | Implementation | Configuration |
| --- | --- | --- |
| Wikipedia | `WikipediaQueryRun` | Up to 2 pages; combined output limited to 2,000 characters |
| DuckDuckGo | `DuckDuckGoSearch` with `duck-duck-scrape` | Up to 2 search results |

Neither search tool requires a separate API key. Tool use is model-directed, so not every request will invoke both tools.

## Project Structure

```text
main.js               CLI entry point, prompt, model, and agent
tools/
  wiki.search.js      Configured Wikipedia tool instance
  duck.search.js      Configured DuckDuckGo tool instance
package.json          Dependencies and npm start command
readme.md             Setup and usage documentation
```

## Configuration and Limitations

- **Model:** `main.js` currently selects `qwen/qwen3.8-27b`. If Groq rejects this identifier or it is unavailable to your account, replace it with an available Groq model that supports tool calling.
- **Output:** A Zod schema and `structuredModel` are defined, but the agent uses the base `model`. The final answer is therefore not guaranteed to be schema-validated JSON.
- **History:** Each invocation creates a new agent execution; conversations are not persisted between runs.
- **Privacy:** Input is sent to Groq, and model-generated search queries may be sent to Wikipedia or DuckDuckGo. Avoid submitting confidential information.
- **Accuracy:** Search results and model responses can be incomplete or incorrect. Verify important claims against their sources.

## License

The package declares the ISC license.