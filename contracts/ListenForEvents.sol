// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ListenForEvents {
    event NewNumber (
        uint256 indexed number
    );

    function createNewEvent(uint256 number) public {
        emit NewNumber(number);
    }



}