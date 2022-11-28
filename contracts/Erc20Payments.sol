// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Erc20Payments {
    address immutable socialNftAddress;

    constructor(address _socialNftAddress){
        socialNftAddress = _socialNftAddress;
    }

    function transferTokens(address erc20Address, address oldOwner, address newOwner, uint256 amount) public {
        IERC20 erc20 = IERC20(erc20Address);
        erc20.transferFrom(newOwner, oldOwner, amount);
    }

    function getTokens(address erc20Address) public view returns(uint256) {
        IERC20 erc20 = IERC20(erc20Address);
        return erc20.balanceOf(msg.sender);
    }

    function getAllowance(address erc20Address, address owner) public view returns(uint256) {
        IERC20 erc20 = IERC20(erc20Address);
        return erc20.allowance(owner, address(this));
    }
}