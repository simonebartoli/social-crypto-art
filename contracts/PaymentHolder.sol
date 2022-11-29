// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PaymentHolder {

    error ERR_PAYMENT_HOLD_NOT_FOUND();
    error ERR_PAYMENT_NOT_SENT();

    address public constant ZERO_ADDRESS = 0x0000000000000000000000000000000000000000;

    struct Value {
        bool created;
        uint256 amount;
        address currency;
        uint256 date;
        bool refunded;
        uint256 penalty;
    }
    mapping(uint256 => address[]) s_auction_to_addresses;
    mapping(address => mapping(uint256 => Value)) internal s_address_to_payment_hold;


    function addNewHoldPayment_Auction(uint256 auction_id, address owner, uint256 amount, address currency) internal {
        if(!checkIfExist(owner, auction_id)){
            s_auction_to_addresses[auction_id].push(owner);
        }
        s_address_to_payment_hold[owner][auction_id] = Value({
            created: true,
            amount: amount,
            currency: currency,
            date: block.timestamp,
            refunded: false,
            penalty: 0
        });
    }

    function executePayment(address sender, address receiver, uint256 auction_id) internal {
        Value memory payment = s_address_to_payment_hold[sender][auction_id];
        if(!payment.created){
            revert ERR_PAYMENT_HOLD_NOT_FOUND();
        }
        delete s_address_to_payment_hold[sender][auction_id];

        if(payment.currency == ZERO_ADDRESS){
            (bool success, ) = payable(receiver).call{value: payment.amount}("");
            if(!success){
                revert ERR_PAYMENT_NOT_SENT();
            }
        }else{
            IERC20 erc20 = IERC20(payment.currency);
            erc20.transfer(receiver, payment.amount);
        }
        cancelPayments(auction_id);
    }

    function cancelPayments(uint256 auction_id) private {
        address[] memory refundAddresses = s_auction_to_addresses[auction_id];
        for(uint256 i = 0; i < refundAddresses.length; i++){
            address refundAddress = refundAddresses[i];
            Value memory payment = s_address_to_payment_hold[refundAddress][auction_id];
            if(payment.created){
                delete s_address_to_payment_hold[refundAddress][auction_id];
                if(payment.currency == ZERO_ADDRESS){
                    (bool success, ) = payable(refundAddress).call{value: payment.amount}("");
                    if(!success){
                        revert ERR_PAYMENT_NOT_SENT();
                    }
                }else{
                    IERC20 erc20 = IERC20(payment.currency);
                    erc20.transfer(refundAddress, payment.amount);
                }
            }
        }
    }

    function checkIfExist(address owner, uint256 auction_id) private view returns(bool) {
        address[] memory auction_to_addresses = s_auction_to_addresses[auction_id];
        for(uint256 i = 0; i < auction_to_addresses.length; i++){
            if(auction_to_addresses[i] == owner){
                return true;
            }
        }
        return false;
    }
}
