// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Erc20Payments.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

// TODO
// FINISH SELLING FIXED PRICE
//  - KEEP TRACK OF TX 
//  - KEEP TRACK OF ROYALTIES
//  - TRANSACTION ON ERC20

contract SocialNFT is ERC721URIStorage {

    error ERR_TOKEN_NOT_ACCEPTED();

    error ERR_NFT_ALREADY_OWNED();
    error ERR_NFT_NOT_OWNED();
    error ERR_NFT_NOT_EXISTING();
    error ERR_NFT_SELLING_ALREADY_SET();

    error ERR_NFT_BUYING_WRONG_MODE();
    error ERR_NFT_BUYING_WRONG_AMOUNT();
    error ERR_NFT_BUYING_ERC20_NEEDS_TO_BE_ALLOWED();

    error ERR_ROYALTIES_NOT_APPLICABLE();
    error ERR_ROYALTIES_PERCENTAGE_NOT_IN_RANGE();
    error ERR_ROYALTIES_ALREADY_SET();

    error ERR_AUCTION_DEADLINE_NOT_IN_RANGE();


    enum SellingType {
        NO_SELLING,
        SELLING_AUCTION,
        SELLING_FIXED_PRICE,
        SELLING_OTHER_NFT
    }
    enum CurrecyAddress {
        ETH,
        WETH,
        DAI,
        USDC,
        USDT
    }

    struct NftStatus {
        bool exist;
        SellingType sellingType;
        uint256 ownedSince;
    }
    struct PastNftOwner {
        uint256 start_date;
        uint256 end_date;
        address owner;
    }
    struct Royalties {
        address owner;
        uint8 percentage;
    }
    struct Selling_FixedPrice {
        uint256 amount;
        address currency;
    }
    struct Selling_Auction {
        uint256 index;
        uint256 initialPrice;
        address currency;
        uint256 deadline;
    }
    struct Selling_AuctionOffers {
        uint256 amount;
        address owner;
        bool refunded;
    }


    // STORAGE VARIABLES - STATUS NFT
    // ----------------------------------------------------------------------------------------
    mapping(address => uint256[]) public s_ownerToNftId;
    mapping(uint256 => NftStatus) public s_nftIdStatus;
    mapping(uint256 => PastNftOwner[]) public s_nftIdToPastOwners;
    // ----------------------------------------------------------------------------------------


    // STORAGE VARIABLES - SELLING STATUS NFT
    // ----------------------------------------------------------------------------------------
    mapping(uint256 => Royalties) public s_nftIdToRoyalties;
    mapping(uint256 => Selling_FixedPrice) public s_nftIdToSellingFixedPrice;
    mapping(uint256 => Selling_Auction) public s_nftIdToSellingAuction;
    mapping(uint256 => Selling_AuctionOffers[]) public s_nftIdToSellingAuctionOffers;
    // ----------------------------------------------------------------------------------------


    // STORAGE VARIABLES - NFT ATTRIBUTES
    // ----------------------------------------------------------------------------------------
    uint256 private s_nftUniqueId = 1;
    // ----------------------------------------------------------------------------------------


    uint256 private s_auctionId = 1;


    // CONSTANT VARIABLES
    // ----------------------------------------------------------------------------------------
    string public constant NAME = "SocialNFT";
    string public constant SYMBOL = "SFT";
    address public constant ZERO_ADDRESS = 0x0000000000000000000000000000000000000000;
    // ----------------------------------------------------------------------------------------


    // CONSTANT VARIABLES
    // ----------------------------------------------------------------------------------------
    address public immutable i_contractOwner;
    Erc20Payments public immutable i_erc20Payments;

    // address public immutable WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    // address public immutable DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    // address public immutable USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    // address public immutable USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7;

    address public immutable i_weth;
    address public immutable i_dai;
    address public immutable i_usdc;
    address public immutable i_usdt;
    // ----------------------------------------------------------------------------------------


    // MODIFIERS
    // ----------------------------------------------------------------------------------------
    modifier onlyNftOwner(uint256 nftId){
        if(ownerOf(nftId) != msg.sender){
            revert ERR_NFT_NOT_OWNED();
        }
        _;
    }
    modifier onlyNotNftOwner(uint256 nftId){
        if(ownerOf(nftId) == msg.sender){
            revert ERR_NFT_ALREADY_OWNED();
        }
        _;
    }
    modifier onlyExistingNft(uint256 nftId){
        if(_exists(nftId)){
            revert ERR_NFT_BUYING_WRONG_MODE();
        }
        _;
    }
    modifier onlySpecificSellingType(uint256 nftId, SellingType sellingType){
        if(s_nftIdStatus[nftId].sellingType != sellingType){
            if(sellingType == SellingType.NO_SELLING){
                revert ERR_NFT_SELLING_ALREADY_SET();
            }else{
                revert ERR_NFT_BUYING_WRONG_MODE();
            }
        }
        _;
    }
    // ----------------------------------------------------------------------------------------


    constructor(
        address wethAddress,
        address daiAddress,
        address usdcAddress,
        address usdtAddress
    ) ERC721(NAME, SYMBOL) {
        i_contractOwner = msg.sender;
        i_erc20Payments = new Erc20Payments(address(this));
        // SET ERC20 TOKEN - THEY CHANGE DEPENDING THE BLOCKCHAIN THEY ARE
        // REMEMBER THEY ARE ADDRESSES

        i_weth = wethAddress;
        i_dai = daiAddress;
        i_usdc = usdcAddress;
        i_usdt = usdtAddress;
    }

    
    function createNft(string memory uri) public {
        _safeMint(msg.sender, s_nftUniqueId);
        _setTokenURI(s_nftUniqueId, uri);

        s_ownerToNftId[msg.sender].push(s_nftUniqueId);
        s_nftIdStatus[s_nftUniqueId] = NftStatus({
            exist: true,
            sellingType: SellingType.NO_SELLING,
            ownedSince: block.timestamp
        });

        incrementNftUniqueId();
    }

    function setRoyalties(uint256 nftId, uint8 percentage) public onlyNftOwner(nftId){
        PastNftOwner[] memory pastOwners = s_nftIdToPastOwners[nftId];

        if(pastOwners.length > 0){
            revert ERR_ROYALTIES_NOT_APPLICABLE();
        }
        if(s_nftIdToRoyalties[nftId].owner != ZERO_ADDRESS){
            revert ERR_ROYALTIES_ALREADY_SET();
        }
        if(percentage <= 0 || percentage > 25){
            revert ERR_ROYALTIES_PERCENTAGE_NOT_IN_RANGE();
        }

        s_nftIdToRoyalties[nftId] = Royalties({
            owner: msg.sender,
            percentage: percentage
        });

    }

    /*
    function removeFromSelling(uint256 nftId) public onlyNftOwner(nftId){
        s_nftIdStatus[nftId].sellingType = SellingType.NO_SELLING;
        delete s_nftIdToSellingFixedPrice[nftId];
    }
    */

    function setSellingFixedPrice(uint256 nftId, uint256 amount, CurrecyAddress currency) public onlyExistingNft(nftId) onlyNftOwner(nftId) onlySpecificSellingType(nftId, SellingType.NO_SELLING){
        address currencyAddress = getTokenAddress(currency);
        s_nftIdStatus[nftId].sellingType = SellingType.SELLING_FIXED_PRICE;
        s_nftIdToSellingFixedPrice[nftId] = Selling_FixedPrice({
            amount: amount,
            currency: currencyAddress
        });
    }

    function setSellingAuction(uint256 nftId, uint256 initialPrice, CurrecyAddress currency, uint256 deadline) public onlyExistingNft(nftId) onlyNftOwner(nftId) onlySpecificSellingType(nftId, SellingType.NO_SELLING){
        uint256 currentTimestamp = block.timestamp;
        uint256 minTime = 60*60*24*5;
        uint256 maxTime = 60*60*24*30;
        
        if(deadline < currentTimestamp + minTime || deadline > currentTimestamp + maxTime){
            revert ERR_AUCTION_DEADLINE_NOT_IN_RANGE();
        }
        address currencyAddress = getTokenAddress(currency);
        s_nftIdStatus[nftId].sellingType = SellingType.SELLING_AUCTION;
        s_nftIdToSellingAuction[nftId] = Selling_Auction({
            index: s_auctionId,
            initialPrice: initialPrice,
            currency: currencyAddress,
            deadline: deadline
        });
        s_auctionId += 1;
    }

    function makeOfferAuction(uint256 nftId, uint256 amount) public payable onlyExistingNft(nftId) onlyNotNftOwner(nftId) onlySpecificSellingType(nftId, SellingType.SELLING_AUCTION){
        uint256 lastOffer = getLastOffer(nftId);
        Selling_Auction memory auction = s_nftIdToSellingAuction[nftId];
        uint256 currentTimestamp = block.timestamp;
        if(currentTimestamp > auction.deadline){
            revert ERR_AUCTION_DEADLINE_NOT_IN_RANGE();
        }
        if(amount <= lastOffer){
            revert ERR_NFT_BUYING_WRONG_AMOUNT();
        }
        if(auction.currency == ZERO_ADDRESS){
            if(msg.value != amount){
                revert ERR_NFT_BUYING_WRONG_AMOUNT();
            }

        }else{

        }
    }

    function buyNftSellingFixedPrice(uint256 nftId) public payable onlyExistingNft(nftId) onlyNotNftOwner(nftId) onlySpecificSellingType(nftId, SellingType.SELLING_FIXED_PRICE){
        NftStatus memory nftStatus = s_nftIdStatus[nftId];
        Selling_FixedPrice memory nftOptions = s_nftIdToSellingFixedPrice[nftId];
        address oldOwner = ownerOf(nftId);
        uint256 ownedSince = nftStatus.ownedSince;
        uint256 amountRoyalties = (getRoyalties(nftId) / 100) * nftOptions.amount;
        uint256 amountSeller = nftOptions.amount - amountRoyalties;

        if(nftOptions.currency == ZERO_ADDRESS){
            if(msg.value == nftOptions.amount){
                (bool sentToSeller,) = payable(oldOwner).call{value: amountSeller}("");
                if(amountRoyalties > 0 && s_nftIdToPastOwners[nftId].length > 0){
                    (bool sentToOriginalCreator,) = payable(s_nftIdToPastOwners[nftId][0].owner).call{value: amountRoyalties}("");
                    require(sentToOriginalCreator, "Payment Failed to Original Creator");
                }
                require(sentToSeller, "Payment Failed to Seller");
            }else{
                revert ERR_NFT_BUYING_WRONG_AMOUNT();
            }
        }else{
            if(i_erc20Payments.getAllowance(nftOptions.currency, msg.sender) >= nftOptions.amount){
                i_erc20Payments.transferTokens(nftOptions.currency, oldOwner, msg.sender, amountSeller);
                if(amountRoyalties > 0 && s_nftIdToPastOwners[nftId].length > 0){
                    i_erc20Payments.transferTokens(nftOptions.currency, s_nftIdToPastOwners[nftId][0].owner, msg.sender, amountRoyalties);
                }
            }else{
                revert ERR_NFT_BUYING_ERC20_NEEDS_TO_BE_ALLOWED();
            }
        }
        
        transferNft(nftId);
        postTransferNft(nftId, oldOwner, ownedSince);
    }


    function transferNft(uint256 nftId) private {
        _transfer(ownerOf(nftId), msg.sender, nftId);
    }
    function postTransferNft(uint256 nftId, address oldOwner, uint256 ownedSince) private {
        s_nftIdToPastOwners[nftId].push(PastNftOwner({
            start_date: ownedSince,
            end_date: block.timestamp,
            owner: oldOwner
        }));
        s_nftIdStatus[nftId].sellingType = SellingType.NO_SELLING;
        s_nftIdStatus[nftId].ownedSince = block.timestamp;

        uint256[] memory ownerToNftId = s_ownerToNftId[oldOwner];
        bool found = false;
        for(uint256 i = 0; i < ownerToNftId.length && !found; i++){
            if(ownerToNftId[i] == nftId){
                delete s_ownerToNftId[oldOwner][i];
                found = true;
            }
        }
    }
    function incrementNftUniqueId() internal{
        s_nftUniqueId += 1;
    }


    function getLastOffer(uint256 nftId) internal view returns(uint256){
        Selling_AuctionOffers[] memory offers = s_nftIdToSellingAuctionOffers[nftId];
        if(offers.length == 0){
            return s_nftIdToSellingAuction[nftId].initialPrice;
        }else{
            uint256 maxOffer = 0;
            for(uint256 index = offers.length - 1; index >= 0; index--){
                if(!offers[index].refunded){
                    maxOffer = offers[index].amount;
                    break;
                }
            }
            if(maxOffer == 0){
                return s_nftIdToSellingAuction[nftId].initialPrice;
            }else{
                return maxOffer;
            }
        }
    }
    function getRoyalties(uint256 nftId) internal view returns(uint256){
        uint8 percentage = s_nftIdToRoyalties[nftId].percentage;
        if(percentage == 0){
            return 0;
        }else{
            if(s_nftIdToPastOwners[nftId].length == 0){
                return 0;
            }else{
                return percentage;
            }
        }
    }
    function getTokenAddress(CurrecyAddress currency) public view returns(address){
        if(currency == CurrecyAddress.ETH){
            return ZERO_ADDRESS;
        }else if(currency == CurrecyAddress.WETH){
            return i_weth;
        }else if(currency == CurrecyAddress.DAI){
            return i_dai;
        }else if(currency == CurrecyAddress.USDC){
            return i_usdc;
        }else if(currency == CurrecyAddress.USDT){
            return i_usdc;
        }else{
            revert ERR_TOKEN_NOT_ACCEPTED();
        }
    }
}