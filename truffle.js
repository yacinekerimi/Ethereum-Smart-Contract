const HDWalletProvider = require("@truffle/hdwallet-provider");

const infuraApiKey = require("./secrets.js").infuraApiKey;

module.exports = {
  networks: {
    development: {
      provider: function() {
        const privateKeys = require("./secrets.js").privateKeysPrivateTestnet;
        return new HDWalletProvider(privateKeys, "http://127.0.0.1:7545")
      },
      network_id: "*",
      gas: 5000000,
      gasPrice: 10000000000
    }
  },
  compilers: {
    solc: {
      version: "0.6.0"
    }
  }
};