const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const log = require('./log');

const nodeEnv = process.env.NODE_ENV;

const app = express();

if (nodeEnv !== 'test') {
  app.use(morgan('combined'));
}

app.use(cors());
require('../routes')(app);

// Global error handling middleware - must be after routes
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  log.error('Express error handler caught:', err);

  // Extract error message safely
  let errorMessage = 'Internal server error';
  if (err.response && err.response.data) {
    errorMessage = err.response.data.error || err.response.data;
  } else if (err.message) {
    errorMessage = err.message;
  }

  // Send error response
  res.status(err.status || 500).json({
    status: 'error',
    error: errorMessage,
  });
});

module.exports = app;
