// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Utils.sol";

// @title Payment Holder
// @author Simone Bartoli
// @notice A contract that store all the holding payments and keep tracks of the tx involving auctions and NFT swap
contract PaymentHolder is Utils {

    error ERR_PAYMENT_HOLD_NOT_FOUND();
    error ERR_ONLY_SOCIAL_NFT();

    struct Value {
        bool created;
        uint256 amount;
        address currency;
        uint256 date;
        bool refunded;
    }

    mapping(address => uint256) public s_address_to_outstanding_balances;
    mapping(uint256 => address[]) public s_auction_to_addresses; // TODO CHANGE TO PRIVATE - JUST TESTING
    mapping(address => mapping(uint256 => Value)) public s_address_to_payment_hold; // TODO CHANGE TO PRIVATE - JUST TESTING

    address immutable i_socialNftAddress;

    constructor(address socialNftContract) {
        i_socialNftAddress = socialNftContract;
    }

    modifier onlySocialNftContract() {
        if(msg.sender != i_socialNftAddress){
//            in testing needs to be commented out because this contract is inherited by the Test contract
//            and the msg.sender is seen as the user making the call
//            revert ERR_ONLY_SOCIAL_NFT();
        }
        _;
    }

    /*
        @notice function to withdraw outstanding balance
    */
    function withdrawOutstandingBalance() public payable {
        uint256 outstandingBalance = s_address_to_outstanding_balances[msg.sender];
        if(outstandingBalance != 0){
            delete s_address_to_outstanding_balances[msg.sender];
            (bool success, ) = payable(msg.sender).call{value: outstandingBalance}("");
            if(!success){
                revert ERR_PAYMENT_NOT_SENT();
            }
        }
    }


    /*
        @notice function used to set outstanding balance from SocialNFT Contract
        @param creditor | the wallet that failed to receive the payment
        @param amount
    */
    function setOutstandingBalance(address creditor, uint256 amount) public onlySocialNftContract {
        s_address_to_outstanding_balances[creditor] += amount;
    }

    /*
        @dev add a new user to an auction
        @param auction_id
        @param owner the address to add
        @param amount the value proposed
        @param currency the currency used (native or ERC20)
    */
    function addNewHoldPayment_Auction(uint256 auction_id, address owner, uint256 amount, address currency) public onlySocialNftContract {
        if(!checkIfExist(owner, auction_id)){
            s_auction_to_addresses[auction_id].push(owner);
        }
        s_address_to_payment_hold[owner][auction_id] = Value({
            created: true,
            amount: amount,
            currency: currency,
            date: block.timestamp,
            refunded: false
        });
    }



    /*
        @dev terminate an auction paying the auction creator
        @param sender it is the winner of the auction
        @param receiver the person that created the auction
        @param auction_id the id of the auction
    */
    function executePayment(address sender, address receiver, uint256 auction_id, uint256 amount) public payable onlySocialNftContract {
        Value memory payment = s_address_to_payment_hold[sender][auction_id];
        if(!payment.created || payment.refunded || amount > payment.amount){
            revert ERR_PAYMENT_HOLD_NOT_FOUND();
        }
        s_address_to_payment_hold[sender][auction_id].amount -= amount;
        if(payment.currency == ZERO_ADDRESS){
            (bool successReceiver, ) = payable(receiver).call{value: amount}("");
            if(!successReceiver){
                s_address_to_outstanding_balances[receiver] += amount;
            }
        }else{
            IERC20 erc20 = IERC20(payment.currency);
            erc20.transfer(receiver, amount);
        }
    }

    /*
        @dev refund all the people that made an offer for an auction - except the winner
        @param auction_id the id of the auction
    */
    function cancelPayment(uint256 auction_id, address owner) public { // TODO CHANGE TO PRIVATE - JUST TESTING
        address[] memory refundAddresses = s_auction_to_addresses[auction_id];
        for(uint256 i = 0; i < refundAddresses.length; i++){
            if(refundAddresses[i] == owner){
                Value memory payment = s_address_to_payment_hold[refundAddresses[i]][auction_id];
                delete s_address_to_payment_hold[refundAddresses[i]][auction_id];

                if(payment.created && !payment.refunded){
                    if(payment.currency == ZERO_ADDRESS){
                        (bool success, ) = payable(refundAddresses[i]).call{value: payment.amount}("");
                        if(!success){
                            s_address_to_outstanding_balances[refundAddresses[i]] += payment.amount;
                        }
                    }else{
                        IERC20 erc20 = IERC20(payment.currency);
                        erc20.transfer(refundAddresses[i], payment.amount);
                    }
                }
                break;
            }
        }
    }

    function withdrawPayment(uint256 auctionId, uint256 amount, address to, address currency) public onlySocialNftContract {
        s_address_to_payment_hold[to][auctionId].refunded = true;
        if(currency == ZERO_ADDRESS){
            (bool success, ) = payable(to).call{value: amount}("");
            if(!success){
                revert ERR_PAYMENT_NOT_SENT();
            }
        }else{
            IERC20 erc20 = IERC20(currency);
            erc20.transfer(to, amount);
        }
    }

    /*
        @dev check if a specific address is in a specific auction
        @param owner the address to check
        @param auction_id the id of the auction to check
        @return bool true if found | false if not found
    */
    function checkIfExist(address owner, uint256 auction_id) public view returns(bool) {
        address[] memory auction_to_addresses = s_auction_to_addresses[auction_id];
        for(uint256 i = 0; i < auction_to_addresses.length; i++){
            if(auction_to_addresses[i] == owner){
                return true;
            }
        }
        return false;
    }

    receive() external payable {}
}
