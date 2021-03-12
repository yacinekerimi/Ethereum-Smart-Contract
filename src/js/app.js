App = {
  husbandAddress: "0x6f768E4a54E69Ba8c95B9bc457e27e37359B4F85",
  wifeAddress: "0x9446ac5D12235fB3C7E77B78A1031712ed6DA736",



  web3Provider: undefined,
  contracts: {},
  userAccount: undefined,
  events: [],

  init: () => {
    return App.initWeb3();
  },

  initWeb3: async () => {
    // Check if MetaMask is available
    if (typeof web3 === 'undefined') {
      ErrorModal(undefined, "Installez metamask svp -> metamask.io");
      return
    }
    // Web3
    if (ethereum !== undefined) {
      App.web3Provider = ethereum;
    } else {
      App.web3Provider = web3.currentProvider;
    }
    web3 = new Web3(App.web3Provider);


    //var bzz = new Bzz(Bzz.web3Provider)
    App.userAccount = await web3.eth.accounts[0];
    //web3.eth.getAccounts((err, accounts) => { console.log(err, accounts); });
    // const AllAccounts = await web3.eth.getAccounts();
    // console.log(web3.eth.accounts[1])
   
    
    if (App.userAccount === undefined && ethereum !== undefined) {
      await ethereum.enable();
      
    }

    // Changement wallets
    const walletUpdateInterval = setInterval(async () => {
      const wallet = await web3.eth.accounts[0];
      if (wallet !== App.userAccount) {
        App.userAccount = wallet;
        //console.log("Active wallet: " + App.userAccount);
        if (App.updateUi !== undefined) App.updateUi();
      }
    }, 100);

    return App.initContract();
  },


  initContract: () => {
    $.getJSON('./Contrat.json', (data) => {
      const Contrat = data;

      // truffle-contract
      App.contracts.Contract = TruffleContract(Contrat);
      App.contracts.Contract.setProvider(App.web3Provider);

      App.initListeners();
    });
  },

  initListeners: () => {
    return App.initPolling();
  },

  initPolling: () => {
    App.updateUi();

    const frontendUpdateInterval = setInterval(() => {
      if (App.updateUi !== undefined) {
        App.updateUi();
      }
    }, 3000);
  },

  updateUi: () => {
    if (App.userAccount === undefined) return;
    if (App.contracts.Contract === undefined) return;

    App.contracts.Contract.deployed().then((contract) => {
      // Mise a jour adresses et contrat
      web3.eth.getBalance(contract.address, (error, balanceWei) => {
        const balance = web3.fromWei(web3.toDecimal(balanceWei));
        $("#contract-address").text(contract.address);
        $("#contract-balance").text(Number(balance).toFixed(4));
      });
      
      // Mise a jour informations network
      //const networkId =await web3.eth.net.getId();
      //console.log(networkId)
      
    
     
    
      // Mise a jour adresses et contrat
      web3.eth.getBalance(App.userAccount, (error, balanceWei) => {
        const balance = web3.fromWei(web3.toDecimal(balanceWei));

        //$("#wallet-image").attr("src", addressToImageUrl(App.userAccount));
        $("#wallet-type").text(TypeAdresse(App.userAccount));
        $("#wallet-address").text(App.userAccount);
        $("#wallet-balance").text(Number(balance).toFixed(4));
      });

      // Mise a jour adresse 1
      contract.husbandAddress().then((husbandAddress) => {
        $("#contract-husbandAddress").val(husbandAddress);
      });
      // Mise a jour adresse 2
      contract.wifeAddress().then((wifeAddress) => {
        $("#contract-wifeAddress").val(wifeAddress);
      });

      contract.dateDep().then((dateDep) => {
        $("#dateDep").text(new Date(dateDep*1000));
      });
      contract.dateSig().then((dateSig) => {
        if(dateSig == 0){
          $("#dateSig").text('Contrat pas encore signée');
        }else{
          $("#dateSig").text(new Date(dateSig*1000));
        }
        });
     
      // Mise a jour signature
      contract.signed().then((signed) => {
        $("#contract-status-signed").prop('checked', signed);
        return signed;
      }).then((signed) => {
        // Mise a jour divorce
        contract.divorced().then((divorced) => {
          $("#contract-status-divorced").prop('checked', divorced);

          // Mise a jour Checkboxes
          if (divorced) {
            $(".signed-action-button").attr("disabled", true);
            $("#action-written-contract-upload").attr("disabled", true);
            $("#action-written-contract-download").attr("disabled", false);
            $("#action-sign-contract").attr("disabled", true);
          } else if (!signed) {
            $(".signed-action-button").attr("disabled", true);
            $("#action-sign-contract").attr("disabled", false);

          } else {
            $(".signed-action-button").attr("disabled", false);
            $("#action-written-contract-upload").attr("disabled", true);
            $("#action-written-contract-download").attr("disabled", false);
            $("#action-sign-contract").attr("disabled", true);
          }
        });
      });
      //console.log("Date Signature :"+contract.dateSig);
      contract.dateDep().then((dateSig) => {
        $("#date-dep").text(dateDep);
        return dateDep;
      });
      contract.dateSig().then((dateSig) => {
        $("#date-sig").text(dateSig);
        return dateSig;
      });

      const fromBlockNumber = 0;
      contract.allEvents({ fromBlock: fromBlockNumber, toBlock: "latest" }).get((error, result) => {
        const newEvents = [];
        _.each(result.reverse(), (eventObject) => {
          newEvents.push({ args: eventObject.args, event: eventObject.event, blockNumber: eventObject.blockNumber });
        });

        // Mise a jour events
        if (_.isEqual(newEvents, events) === false) {
          App.events = newEvents;
          $("#events").empty();
          _.each(App.events, async (event) => {
            let eventListItem = "<div class=\"alert alert-__TYPE__ text-truncate\" role=\"alert\">__TEXT__<span class=\"float-right time-ago\">__TIME__</span></div>";
            const address = event.args["wallet"];
            const amount = event.args["amount"];
            const value = web3.fromWei(web3.toBigNumber(amount).toNumber());
            const timestamp  = web3.toBigNumber(event.args["timestamp"]).toNumber() * 1000;

            //eventListItem = updateEventListItem(eventListItem, "", timestamp, TypeAdresse(address, false) + " a proposé un contrat" + ipfsHash);
            switch (event.event) {
              case "Signed":
              eventListItem = updateEventListItem(eventListItem, "warning", timestamp, TypeAdresse(address, false) + " a signé un contrat");
              break;
              case "ContractSigned":
              eventListItem = updateEventListItem(eventListItem, "success", timestamp, "Contrat à été signé par les deux mari!");
              break;
              case "DivorceApproved":
              eventListItem = updateEventListItem(eventListItem, "warning", timestamp, TypeAdresse(address, false) + " a demandé divorce");
              break;
              case "Divorced":
              eventListItem = updateEventListItem(eventListItem, "danger", timestamp, "Les deux mari ont accepté de divorcer! (dommage)");
              break;
              case "FundsSent":
              eventListItem = updateEventListItem(eventListItem, "danger", timestamp, value + " ETH ajoute " + TypeAdresse(address, true) + " envoyé!");
              break;
              case "FundsReceived":
              eventListItem = updateEventListItem(eventListItem, "success", timestamp, value + " ETH envoye par " + TypeAdresse(address, true) + " recu!");
              break;
            }
            $("#events").append(eventListItem);
          });
        }
      });
    });
  }
};

// Interface Smart contract 
function signContract() {
  App.contracts.Contract.deployed().then((contract) => {
    //console.log("Action: Sign Contract");
    return contract.signContract({ from: App.userAccount });
  }).then((result) => {
    //console.log(result);
    $('#signContractModal').modal('hide');
  }).catch((error) => {
    //console.log(error);
    $('#signContractModal').modal('hide');
    ErrorModal(error, "Signature echouée");
  });
}

function payIn() {
  const amount = $("#payInModal-amount").val();

  App.contracts.Contract.deployed().then((contract) => {
    console.log("Transfer -> " + amount + " ETH");
    // a revoir gas
    return web3.eth.sendTransaction({ from: App.userAccount, to: contract.address, value: web3.toWei(amount), gas: "50000" }, (error, hash) => {
      //console.log(hash);
      $('#payInModal').modal('hide');
      $("#payInModal-amount").val("");
      if (error) {
        console.log(error);
        ErrorModal(error, "Depöt echoué");
      }
    });
  });
}

function pay() {
  const address = $("#payModal-address").val();
  const amount = $("#payModal-amount").val();
  App.contracts.Contract.deployed().then((contract) => {
    console.log("Action: Pay -> " + address + ", " + amount + " ETH");
    return contract.pay(address, web3.toWei(amount), { from: App.userAccount });
  }).then((result) => {
    console.log(result);
    $('#payModal').modal('hide');
    $("#payModal-address").val("");
    $("#payModal-amount").val("");
  }).catch((error) => {
    console.log(error);
    $('#payModal').modal('hide');
    $("#payModal-address").val("");
    $("#payModal-amount").val("");
    ErrorModal(error, "Paiement echoué");
  });
}
// Divorce
function divorce() {
  App.contracts.Contract.deployed().then((contract) => {
    return contract.divorce({ from: App.userAccount });
  }).then((result) => {
    console.log(result);
    $('#divorceModal').modal('hide');
  }).catch((error) => {
    console.log(error);
    $('#divorceModal').modal('hide');
    ErrorModal(error, "Divorce echoué");
  });
}

// Main
$(document).ready(() => {
  App.init();
});


// Helpers
function ErrorModal(error, message) {
  // Verification confirmation Tx
  if (!_.isUndefined(error.message) && error.message.includes("Tx annulé")) return;

  $('#errorModalMessage').text(message);
  $('#errorModal').modal('show');
}

function updateEventListItem(htmlString, type, time, text) {
  return htmlString.replace("__TYPE__", type).replace("__TIME__", moment(time).fromNow()).replace("__TEXT__", text);
}

function TypeAdresse(address, useAddressIfUnknown) {
  if (_.isUndefined(address)) return "ERROR";
  let name = useAddressIfUnknown ? address: "Inconnu";

  switch (address.toLowerCase()) {
    case App.husbandAddress.toLowerCase():
    name = "Mari";
    break;
    case App.wifeAddress.toLowerCase():
    name = "Femme";
    break;
  }
  return name;
}