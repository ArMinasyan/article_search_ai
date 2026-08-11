const { z } = require("zod");
module.exports = z.object({
  title: z.string().describe('Job title, e.g. "Senior Node.js Developer"'),
  company: z.string().describe('Company name, e.g. "Toptal"'),
  responsibilities: z.array(z.string()).describe('List of responsibilities or job description bullet points'),
  url: z.string().optional().describe('URL to the job posting, if available'),
});