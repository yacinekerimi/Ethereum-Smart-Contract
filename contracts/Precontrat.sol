pragma solidity ^0.4.24;



contract Precontrat {
  
  //string public addrHomme;
  //string public addrFemme;
  
  string public addrHomme;
  string public addrFemme;
  bool public divUnilateral;
  bool public valSignature;
  //bool public sendMoney;

  // a function with the same name as the contract are is a constructor function
  // initalizes with 'initialMessage' in the inbox

  function Precontrat(string _addrHomme,string _addrFemme, bool _divUnilateral, bool _valSignature) public {
    addrHomme = _addrHomme;
    addrFemme = _addrFemme;
    divUnilateral = _divUnilateral;
    valSignature = _valSignature;
  }

}


