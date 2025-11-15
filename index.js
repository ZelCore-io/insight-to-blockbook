const http = require('http');
const config = require('config');
const app = require('./src/lib/server');
const log = require('./src/lib/log');

// Global error handlers to prevent app crashes
process.on('uncaughtException', (error) => {
  log.error('Uncaught Exception:', error);
  // Don't exit the process - keep the app running
});

process.on('unhandledRejection', (reason, promise) => {
  log.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process - keep the app running
});

const server = http.createServer(app);

log.info('Initiating database');

setTimeout(() => {
  log.info('Starting ItB');
  server.listen(config.server.port, () => {
    log.info(`App listening on port ${config.server.port}`);
  });
}, 1000);
