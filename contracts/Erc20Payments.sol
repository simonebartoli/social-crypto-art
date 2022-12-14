// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/*
    @dev THIS CONTRACT IS NOT USED ANYMORE
*/
contract Erc20Payments {
    address immutable socialNftAddress;

    constructor(address _socialNftAddress){
        socialNftAddress = _socialNftAddress;
    }

    function transferTokens(address erc20Address, address from, address to, uint256 amount) public {
        IERC20 erc20 = IERC20(erc20Address);
        erc20.transferFrom(from, to, amount);
    }

    function getTokens(address erc20Address) public view returns(uint256) {
        IERC20 erc20 = IERC20(erc20Address);
        return erc20.balanceOf(msg.sender);
    }

    /*
        @notice get the allowance for this contract from a specific sender
        @param erc20Address the ERC20 address
        @param owner the person trying to do a tx
        @return uint256 the allowance granted
    */
    function getAllowance(address erc20Address, address owner) public view returns(uint256) {
        IERC20 erc20 = IERC20(erc20Address);
        return erc20.allowance(owner, address(this));
    }
}