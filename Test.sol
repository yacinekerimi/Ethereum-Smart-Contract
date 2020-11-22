pragma solidity ^0.7.4;

contract Test {
    string private name;
    uint private age;

    function setName(string newName) {
        name = newName;
    }
    function getName() returns(string){
        return name;
    }
}