const axios = require('axios');
const config = require('config');
const log = require('../lib/log');

async function getStatus(req, res) {
  try {
    const url = `${config.blockbook}/api`;

    const response = await axios.get(url);
    const urlResponse = response.data;

    const infoData = {
      info: {
        blocks: +urlResponse.backend.blocks,
        version: +urlResponse.backend.version,
        protocolversion: +urlResponse.backend.protocolVersion,
        difficulty: +urlResponse.backend.difficulty,
        errors: urlResponse.backend.errors,
      },
    };
    res.json(infoData);
  } catch (error) {
    log.error(error);
    res.statusCode = 500;
    res.json({
      status: 'error',
      error,
    });
  }
}

async function getUtxos(req, res) {
  try {
    let { address } = req.params;
    address = address || req.query.address;
    const url = `${config.blockbook}/api/v2/utxo/${address}`;

    const response = await axios.get(url);
    const urlResponse = response.data;

    const utxos = [];

    urlResponse.forEach((utxo) => {
      const satoshis = Number((Number(utxo.value)).toFixed(8));
      const amount = Number((satoshis / 1e8).toFixed(8));
      const newUtxo = {
        address,
        txid: utxo.txid,
        vout: utxo.vout,
        amount,
        satoshis,
        height: utxo.height,
        confirmations: utxo.confirmations,
      };
      utxos.push(newUtxo);
    });

    res.json(utxos);
  } catch (error) {
    log.error(error);
    res.statusCode = 500;
    res.json({
      status: 'error',
      error,
    });
  }
}

async function getAddr(req, res) {
  try {
    let { address } = req.params;
    address = address || req.query.address;
    let { noTxList } = req.params;
    noTxList = noTxList || req.query.noTxList;
    console.log(noTxList);
    // ignore noTxList
    const url = `${config.blockbook}/api/v2/address/${address}?details=basic`;

    const response = await axios.get(url);
    const urlResponse = response.data;

    const decimals = 8;

    const myResponse = {
      addrStr: urlResponse.address,
      balance: Number((+urlResponse.balance / (10 ** decimals)).toFixed(8)),
      balanceSat: urlResponse.balance,
      totalReceived: Number((+urlResponse.totalReceived / (10 ** decimals)).toFixed(8)),
      totalReceivedSat: +urlResponse.totalReceived,
      totalSent: Number((+urlResponse.totalSent / (10 ** decimals)).toFixed(8)),
      totalSentSat: +urlResponse.totalSent,
      unconfirmedBalance: Number((+urlResponse.unconfirmedBalance / (10 ** decimals)).toFixed(8)),
      unconfirmedBalanceSat: +urlResponse.unconfirmedBalance,
      unconfirmedTxApperances: urlResponse.unconfirmedTxs,
      txApperances: urlResponse.txs,
    };
    res.json(myResponse);
  } catch (error) {
    log.error(error);
    res.statusCode = 500;
    res.json({
      status: 'error',
      error,
    });
  }
}

async function getTxs(req, res) {
  try {
    let { address } = req.params;
    address = address || req.query.address;
    let { from } = req.params;
    from = from || req.query.from;
    let { to } = req.params;
    to = to || req.query.to;
    let url = `${config.blockbook}/api/v2/address/${address}?pageSize=50&details=txs`;
    // eslint-disable-next-line eqeqeq
    if (from != 0) {
      url = `${config.blockbook}/api/v2/address/${address}?pageSize=1000&details=txs`;
    }

    const response = await axios.get(url);
    const urlResponse = response.data;

    const myResponse = {
      totalItems: urlResponse.txs,
      from: +from,
      to: +urlResponse.itemsOnPage > +to ? +urlResponse.itemsOnPage : +to,
      items: [],
    };

    const decimals = 8;

    if (urlResponse.transactions) {
      urlResponse.transactions.forEach((tx) => {
        // eslint-disable-next-line no-param-reassign
        tx.time = tx.blockTime;
        // eslint-disable-next-line no-param-reassign
        tx.fees = Number((+tx.fees / (10 ** decimals)).toFixed(8));
        tx.vin.forEach((vin) => {
          // eslint-disable-next-line no-param-reassign
          vin.value = Number((+vin.value / (10 ** decimals)).toFixed(8));
          // eslint-disable-next-line no-param-reassign
          vin.scriptPubKey = tx.vin;
          // eslint-disable-next-line no-param-reassign
          vin.scriptPubKey.asm = tx.vin.addresses;
        });
        tx.vout.forEach((vout) => {
          // eslint-disable-next-line no-param-reassign
          vout.value = Number((+vout.value / (10 ** decimals)).toFixed(8));
          // eslint-disable-next-line no-param-reassign
          vout.scriptPubKey = tx.vout;
          // eslint-disable-next-line no-param-reassign
          vout.scriptPubKey.asm = tx.vout.addresses;
        });
        myResponse.items.push(tx);
      });
    }

    const responseString = JSON.stringify(myResponse);
    const q = responseString.replaceAll('OP_RETURN (', 'OP_RETURN ');
    res.json(JSON.parse(q));
  } catch (error) {
    log.error(error);
    res.statusCode = 500;
    res.json({
      status: 'error',
      error,
    });
  }
}

async function sendTx(req, res) {
  let body = '';
  req.on('data', (data) => {
    body += data;
  });
  req.on('end', async () => {
    try {
      if (typeof body !== 'object') {
        body = JSON.parse(body);
      }
      const hex = body.rawtx;
      const url = `${config.blockbook}/api/v2/sendtx/`;

      const response = await axios.post(url, hex);
      const urlResponse = response.data;

      const txid = urlResponse.result;

      const myResponse = {
        txid,
      };
      res.json(myResponse);
    } catch (error) {
      log.error(error);
      res.statusCode = 500;
      res.json({
        status: 'error',
        error,
      });
    }
  });
}

module.exports = {
  getStatus,
  getUtxos,
  getAddr,
  getTxs,
  sendTx,
};
