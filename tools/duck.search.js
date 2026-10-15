const { DuckDuckGoSearch } = require('@langchain/community/tools/duckduckgo_search');

const duckDuckGoTool = new DuckDuckGoSearch({
  maxResults: 2,
});

module.exports = duckDuckGoTool;