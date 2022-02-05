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
        blocks: urlResponse.backend.blocks,
        version: urlResponse.backend.version,
        protocolversion: urlResponse.backend.protocolVersion,
        difficulty: urlResponse.backend.difficulty,
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

module.exports = {
  getStatus,
  getUtxos,
};
