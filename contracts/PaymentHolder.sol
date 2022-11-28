// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PaymentHolder {
    struct Value {
        uint256 amount;
        address currency;
    }

    mapping(address => Value) internal s_payment_hold;
}
