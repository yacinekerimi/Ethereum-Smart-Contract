const Contrat = artifacts.require("./contracts/Contrat.sol");

const husbandAddress = require("../config.js").husbandAddress;
const wifeAddress = require("../config.js").wifeAddress;

module.exports = function(deployer) {
  deployer.deploy(Contrat, husbandAddress, wifeAddress);
};
