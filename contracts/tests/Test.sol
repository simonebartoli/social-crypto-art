// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../SocialNFT.sol";

contract Test is SocialNFT{

    constructor() SocialNFT(address(1), address(2), address(3), address(4)){}

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
    function test_setPastOwners(uint256 nftId, address pastOwner) public {
        s_nftIdToPastOwners[nftId].push(PastNftOwner({
            start_date: block.timestamp,
            end_date: block.timestamp,
            owner: pastOwner
        }));
    }
}
