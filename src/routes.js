const blockbookApi = require('./apiServices/blockbookApi');

module.exports = (app) => {
  app.get('/api/status', (req, res) => {
    blockbookApi.getStatus(req, res);
  });
  app.get('/api/addr/:address?/utxo', (req, res) => {
    blockbookApi.getUtxos(req, res);
  });
  app.get('/api/addr/:address?/:noTxList?', (req, res) => {
    blockbookApi.getAddr(req, res);
  });
  app.get('/api/addrs/:address?/txs/:from?/:to?', (req, res) => {
    blockbookApi.getTxs(req, res);
  });
  app.post('/api/tx/send', (req, res) => {
    blockbookApi.sendTx(req, res);
  });
};
