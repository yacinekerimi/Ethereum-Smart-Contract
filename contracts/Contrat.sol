pragma solidity ^0.4.24;

//

contract Contrat {
  event Signed(uint timestamp, address wallet);
  event ContractSigned(uint timestamp);
  event DivorceApproved(uint timestamp, address wallet);
  event Divorced(uint timestamp);
  event DivorcedUni(uint timestamp);
  event FundsSent(uint timestamp, address wallet, uint amount);
  event FundsReceived(uint timestamp, address wallet, uint amount);

  uint256 public dateDep = block.timestamp ;
  uint256 public dateSig = 0 ;
  bool public signed = false;
  bool public signedByHusband = false;
  bool public signedByWife = false;
  bool public divorced = false;

  mapping (address => bool) private hasSigned;
  mapping (address => bool) private hasDivorced;

  address public husbandAddress;
  address public wifeAddress;

  // Helper
  modifier onlySpouse() {
    require(msg.sender == husbandAddress || msg.sender == wifeAddress, "");
    _;
  }

   // Modifier pour la multi-signature
  modifier isSigned() {
    require(signedByHusband == true || signedByWife == true, "");
    if (signedByHusband && signedByWife){
      signed = true;
    } 
    _;
  }

 // Modifier pour la verification divorce
  modifier isNotDivorced() {
    require(divorced == false, "Can not be called after spouses agreed to divorce!");
    _;
  }

  // Helper
  function isNotSameString(string memory string1, string memory string2) private pure returns (bool) {
    return keccak256(abi.encodePacked(string1)) != keccak256(abi.encodePacked(string2));
  }

  // Constructeur
  constructor(address _husbandAddress, address _wifeAddress) public {
    require(_husbandAddress != address(0), "Adresse ne doit pas etre nul");
    require(_wifeAddress != address(0), "Adresse ne doit pas etre nul");
    require(_husbandAddress != _wifeAddress, "Meme adresse");

    husbandAddress = _husbandAddress;
    wifeAddress = _wifeAddress;
  }

  // Payable
  function() isSigned isNotDivorced external payable{
    emit FundsReceived(block.timestamp, msg.sender, msg.value);
  }


/* function() external payable isSigned isNotDivorced {
    emit FundsReceived(now, msg.sender, msg.value);
  } */


  // Signature
  function signContract() external onlySpouse {
    require(hasSigned[msg.sender] == false, "Contrat deja signe");
    // Sender signed
    hasSigned[msg.sender] = true;

    emit Signed(block.timestamp, msg.sender);

    // Verification signature
    if (hasSigned[husbandAddress]) {
      signedByWife = true;
      dateSig = block.timestamp;
    }
    if (hasSigned[wifeAddress]) {
      signedByWife = true;
      dateSig = block.timestamp;
    }
    if (hasSigned[wifeAddress] && hasSigned[husbandAddress]){
      signed = true;
      emit ContractSigned(block.timestamp);
    }
  }

  // Envoie ETH
  function pay(address _to, uint _amount) external onlySpouse isSigned isNotDivorced {
    require(_to != address(0), "Faut mettre une adresse");
    require(_amount <= address(this).balance, "Solde insuffisant!");

    _to.transfer(_amount);
    emit FundsSent(block.timestamp, _to, _amount);
  }


  // Demande divorce, nécessite multi-sig
  function divorce() external onlySpouse isSigned isNotDivorced {
    require(hasDivorced[msg.sender] == false, "");

    hasDivorced[msg.sender] = true;

    emit DivorceApproved(block.timestamp, msg.sender);

    // Verification divorce
    if (hasDivorced[husbandAddress] && hasDivorced[wifeAddress]) {
   
   
      divorced = true;
   
      emit Divorced(block.timestamp);

      // Solde contrat
      uint balance = address(this).balance;

      // Solde/2 en cas de divorce
      if (balance != 0) {
        uint balancePerSpouse = balance / 2;

        husbandAddress.transfer(balancePerSpouse);
        emit FundsSent(now, husbandAddress, balancePerSpouse);
        wifeAddress.transfer(balancePerSpouse);
        emit FundsSent(now, wifeAddress, balancePerSpouse);
      }
    }
  }

  function UnilateralDivorce() external onlySpouse isSigned isNotDivorced {
    require(hasDivorced[msg.sender] == false, "");

    hasDivorced[msg.sender] = true;

    emit DivorceApproved(block.timestamp, msg.sender);
    // Verification divorce   
    divorced = true;

    // Event
    emit DivorcedUni(block.timestamp);
      // A changer selon modalité
      uint balance = address(this).balance;
      // Solde/2 en cas de divorce
      if (balance != 0) {
        uint balancePerSpouse = balance / 2;

        husbandAddress.transfer(balancePerSpouse);
        emit FundsSent(now, husbandAddress, balancePerSpouse);
        wifeAddress.transfer(balancePerSpouse);
        emit FundsSent(now, wifeAddress, balancePerSpouse);
      }
  }
}
