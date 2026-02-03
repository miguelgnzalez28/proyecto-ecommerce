// Vercel serverless function wrapper for Express server
// This file is used by Vercel to handle API routes
const app = require('../server.js');

// Export the Express app as a serverless function
module.exports = app;
