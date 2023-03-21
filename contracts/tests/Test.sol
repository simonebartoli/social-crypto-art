// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../SocialNFT.sol";
import "../PaymentHolder.sol";

contract Test is SocialNFT, PaymentHolder{

    constructor(address mockERC20Address) SocialNFT(mockERC20Address, mockERC20Address, mockERC20Address, mockERC20Address) PaymentHolder(address(this)){}

    // SOCIAL NFT CONTRACT

    function test_modifier_onlyNftOwner(uint256 nftId) public onlyNftOwner(nftId) view returns(string memory) {
        return "FUNCTION_REACHED";
    }
    function test_modifier_onlyNotNftOwner(uint256 nftId) public onlyNotNftOwner(nftId) view returns(string memory) {
        return "FUNCTION_REACHED";
    }
    function test_modifier_onlyExistingNft(uint256 nftId) public onlyExistingNft(nftId) view returns(string memory) {
        return "FUNCTION_REACHED";
    }
    function test_modifier_onlySpecificSellingType(uint256 nftId, SellingType sellingType) public onlySpecificSellingType(nftId, sellingType) view returns(string memory) {
        return "FUNCTION_REACHED";
    }

    function test_modifyNftSellingTypeStatus(uint256 nftId, SellingType sellingType) public {
        s_nftIdStatus[nftId].sellingType = sellingType;
    }
    function test_modifyNftIdToSellingAuctionOffers(uint256 nftId, uint256 amount, address owner, bool refunded) public {
        s_nftIdToSellingAuctionOffers[nftId].push(Selling_AuctionOffers({
            amount: amount,
            owner: owner,
            date: block.timestamp,
            refunded: refunded
        }));
    }
    function test_modifyNftIdToSellingAuctionOffersWithEmptySpace(uint256 nftId, uint256 index) public {
        delete s_nftIdToSellingAuctionOffers[nftId][index];
    }

    function test_setPastOwners(uint256 nftId, address pastOwner) public {
        s_nftIdToPastOwners[nftId].push(PastNftOwner({
            start_date: block.timestamp,
            end_date: block.timestamp,
            owner: pastOwner
        }));
    }

    function test_getOwnerToNftIdLength(address owner) public view returns(uint256){
        return s_ownerToNftId[owner].length;
    }
    function test_getOwnerToNftIdArray(address owner) public view returns(uint256[] memory){
        return s_ownerToNftId[owner];
    }

    // PAYMENT HOLDER CONTRACT

    function test_addNewAddressToAuction(uint256 auctionId, address owner) public {
        s_auction_to_addresses[auctionId].push(owner);
    }

    function test_getAuctionToAddressesLength(uint256 auctionId) public view returns(uint256){
        return s_auction_to_addresses[auctionId].length;
    }

    function test_modifier_onlySocialNftContract() public onlySocialNftContract view returns(string memory) {
        return "FUNCTION_REACHED";
    }
}
