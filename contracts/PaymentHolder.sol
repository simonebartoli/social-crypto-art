// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// @title Payment Holder
// @author Simone Bartoli
// @notice A contract that store all the holding payments and keep tracks of the tx involving auctions and NFT swap
contract PaymentHolder {

    error ERR_PAYMENT_HOLD_NOT_FOUND();
    error ERR_PAYMENT_NOT_SENT();

    address public constant ZERO_ADDRESS = 0x0000000000000000000000000000000000000000;

    struct Value {
        bool created;
        uint256 amount;
        address currency;
        uint256 date;
    }
    mapping(uint256 => address[]) private s_auction_to_addresses;
    mapping(address => mapping(uint256 => Value)) private s_address_to_payment_hold;

    /*
        @dev add a new user to an auction
        @param auction_id
        @param owner the address to add
        @param amount the value proposed
        @param currency the currency used (native or ERC20)
    */
    function addNewHoldPayment_Auction(uint256 auction_id, address owner, uint256 amount, address currency) internal {
        if(!checkIfExist(owner, auction_id)){
            s_auction_to_addresses[auction_id].push(owner);
        }
        s_address_to_payment_hold[owner][auction_id] = Value({
            created: true,
            amount: amount,
            currency: currency,
            date: block.timestamp
        });
    }

    /*
        @dev terminate an auction paying the receiver and refunding all the other offers
        @param sender it is the winner of the auction
        @param receiver the person that created the auction
        @param auction_id the id of the auction
    */
    function executePayment(address sender, address receiver, uint256 auction_id, address creator, uint8 royaltyPercentage) internal {
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

    /*
        @dev refund all the people that made an offer for an auction - except the winner
        @param auction_id the id of the auction
    */
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

    /*
        @dev check if a specific address is in a specific auction
        @param owner the address to check
        @param auction_id the id of the auction to check
        @return bool true if found | false if not found
    */
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
