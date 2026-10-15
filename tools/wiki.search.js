const { WikipediaQueryRun } = require('@langchain/community/tools/wikipedia_query_run');

const wikipediaTool = new WikipediaQueryRun({
  topKResults: 2,
  maxDocContentLength: 2000,
});

module.exports = wikipediaTool;