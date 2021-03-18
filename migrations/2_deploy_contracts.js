const Contrat = artifacts.require("./contracts/Contrat.sol");
const PreContrat = artifacts.require("./contracts/Precontrat.sol");

fs = require('fs')
config = JSON.parse(fs.readFileSync('../config.json', 'utf8')); // Chargement config
console.log("VALUE " + config.valSignature)

module.exports = function(deployer) {
  // Premier contrat
  deployer.deploy(PreContrat, config.husbandAddress, config.wifeAddress, config.divUnilateral, config.valSignature);
  // Deuxiemme contrat
  deployer.deploy(Contrat, config.husbandAddress, config.wifeAddress);
};