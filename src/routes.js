const blockbookApi = require('./apiServices/blockbookApi');

module.exports = (app) => {
  app.get('/api/status', (req, res) => {
    blockbookApi.getStatus(req, res);
  });
  app.get('/api/addr/:address?/utxo', (req, res) => {
    blockbookApi.getUtxos(req, res);
  });
};
