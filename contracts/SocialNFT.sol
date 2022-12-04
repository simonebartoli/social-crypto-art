// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Erc20Payments.sol";
import "./PaymentHolder.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

// TODO
// FINISH SELLING FIXED PRICE
//  - KEEP TRACK OF TX 
//  - KEEP TRACK OF ROYALTIES
//  - TRANSACTION ON ERC20

contract SocialNFT is ERC721URIStorage, PaymentHolder {

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
    error ERR_AUCTION_DEADLINE_NOT_PASSED();


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
    struct Royalty {
        address owner;
        uint8 percentage;
    }
    struct Selling_FixedPrice {
        uint256 amount;
        address currency;
    }
    struct Selling_Auction {
        uint256 id;
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
    mapping(uint256 => Royalty) public s_nftIdToRoyalties;
    mapping(uint256 => Selling_FixedPrice) public s_nftIdToSellingFixedPrice;
    mapping(uint256 => Selling_Auction) public s_nftIdToSellingAuction;
    mapping(uint256 => Selling_AuctionOffers[]) public s_nftIdToSellingAuctionOffers;
    uint256 private s_auctionId = 1;
    // ----------------------------------------------------------------------------------------


    // STORAGE VARIABLES - NFT ATTRIBUTES
    // ----------------------------------------------------------------------------------------
    uint256 private s_nftUniqueId = 1;
    // ----------------------------------------------------------------------------------------


    // CONSTANT VARIABLES
    // ----------------------------------------------------------------------------------------
    string public constant NAME = "SocialNFT";
    string public constant SYMBOL = "SFT";
    // ----------------------------------------------------------------------------------------


    // CONSTANT VARIABLES
    // ----------------------------------------------------------------------------------------
    address public immutable i_contractOwner;
    Erc20Payments public immutable i_erc20Payments;
    address public immutable i_paymentHolder;

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
        PaymentHolder paymentHolder = new PaymentHolder();
        i_paymentHolder = address(paymentHolder);

        // SET ERC20 TOKEN - THEY CHANGE DEPENDING THE BLOCKCHAIN THEY ARE
        // REMEMBER THEY ARE ADDRESSES

        i_weth = wethAddress;
        i_dai = daiAddress;
        i_usdc = usdcAddress;
        i_usdt = usdtAddress;
    }

    /*
        @notice create an NFT with a resource linked
        @param uri the link of the resource
    */
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

    /*
        @notice set royalties to the creator of the NFT | ONLY BETWEEN 1 AND 25, ONLY CREATOR, ONLY BEFORE THE FIRST PURCHASE
        @param nftId
        @param percentage integer from 1 to 25 (included)
    */
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

        s_nftIdToRoyalties[nftId] = Royalty({
            owner: msg.sender,
            percentage: percentage
        });

    }

    /*
        @notice set a NFT in an fixed price selling | ONLY NFT OWNER, ONLY IF NOT ALREADY IN ANOTHER SELLING METHOD
        @param nftId
        @param amount the amount requested
        @param currency native currency or ERC20
    */
    function setSellingFixedPrice(uint256 nftId, uint256 amount, CurrecyAddress currency) public onlyExistingNft(nftId) onlyNftOwner(nftId) onlySpecificSellingType(nftId, SellingType.NO_SELLING){
        address currencyAddress = getTokenAddress(currency);
        s_nftIdStatus[nftId].sellingType = SellingType.SELLING_FIXED_PRICE;
        s_nftIdToSellingFixedPrice[nftId] = Selling_FixedPrice({
            amount: amount,
            currency: currencyAddress
        });
    }

    /*
        @notice set a NFT in an auction | ONLY NFT OWNER, ONLY IF NOT ALREADY IN ANOTHER SELLING METHOD
        @param nftId
        @param initialPrice the initial price of the auction
        @param currency native currency or ERC20
        @param deadline timestamp when the auction will be terminated | MINIMUM 5 DAYS, MAXIMUM 30 DAYS (included)
    */
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
            id: s_auctionId,
            initialPrice: initialPrice,
            currency: currencyAddress,
            deadline: deadline
        });
        s_auctionId += 1;
    }

    /*
        @notice make an offer for an auction | ONLY IF HIGHEST OFFER, ENOUGH FUNDS, NOT NFT OWNER AND NFT SOLD IN AN AUCTION
        @dev amount is the value sent in this specific tx | CAN BE ADDED TO PREVIOUS OFFERS IF ANY
        @param nftId
        @param amount the amount proposed | IF ZERO ADDRESS CURRENCY msg.value = amount ELSE ERC20 ALLOWANCE >= amount
    */
    function makeOfferAuction(uint256 nftId, uint256 amount) public payable onlyExistingNft(nftId) onlyNotNftOwner(nftId) onlySpecificSellingType(nftId, SellingType.SELLING_AUCTION){
        (uint256 lastOffer, ) = getLastOffer(nftId);
        Selling_Auction memory auction = s_nftIdToSellingAuction[nftId];

        if(block.timestamp > auction.deadline){
            revert ERR_AUCTION_DEADLINE_NOT_IN_RANGE();
        }

        (uint256 amountAlreadyOffered, ) = getLastOfferSender(nftId, msg.sender);
        uint256 finalAmount = amount + amountAlreadyOffered;

        if(finalAmount <= lastOffer){
            revert ERR_NFT_BUYING_WRONG_AMOUNT();
        }
        if(auction.currency == ZERO_ADDRESS){
            if(msg.value != amount){
                revert ERR_NFT_BUYING_WRONG_AMOUNT();
            }
            s_nftIdToSellingAuctionOffers[nftId].push(Selling_AuctionOffers({
                amount: finalAmount,
                owner: msg.sender,
                refunded: false
            }));
            addNewHoldPayment_Auction(auction.id, msg.sender, finalAmount, auction.currency);
            (bool success, ) = payable(i_paymentHolder).call{value: msg.value}("");
            if(!success){
                revert ERR_PAYMENT_NOT_SENT();
            }
        }else{
            uint256 allowance = i_erc20Payments.getAllowance(auction.currency, msg.sender);
            if(allowance < amount){
                revert ERR_NFT_BUYING_ERC20_NEEDS_TO_BE_ALLOWED();
            }
            s_nftIdToSellingAuctionOffers[nftId].push(Selling_AuctionOffers({
                amount: finalAmount,
                owner: msg.sender,
                refunded: false
            }));
            addNewHoldPayment_Auction(auction.id, msg.sender, finalAmount, auction.currency);
            i_erc20Payments.transferTokens(auction.currency, msg.sender, i_paymentHolder, amount);
        }
    }

    /*
        @notice terminate a current auction | ONLY IF DEADLINE IS PASSED, CALLABLE BY ANYONE
        @param nftId
    */
    function terminateAuction(uint256 nftId) public payable onlyExistingNft(nftId) onlySpecificSellingType(nftId, SellingType.SELLING_AUCTION) {
        NftStatus memory nftInfo = s_nftIdStatus[nftId];
        Selling_Auction memory auction = s_nftIdToSellingAuction[nftId];
        Selling_AuctionOffers[] memory offers = s_nftIdToSellingAuctionOffers[nftId];
        if(block.timestamp < auction.deadline){
            revert ERR_AUCTION_DEADLINE_NOT_PASSED();
        }
        delete s_nftIdToSellingAuction[nftId];
        delete s_nftIdToSellingAuctionOffers[nftId];
        if(offers.length == 0){
            s_nftIdStatus[nftId].sellingType = SellingType.NO_SELLING;
        }else{
            bool offerFound = false;
            for(uint256 index = 0; index < offers.length && !offerFound; index++){
                if(offers[index].owner != ZERO_ADDRESS && !offers[index].refunded){
                    offerFound = true;
                }
            }
            if(offerFound){
                Royalty memory royalty = s_nftIdToRoyalties[nftId];
                (, address winner) = getLastOffer(nftId);
                address oldOwner = ownerOf(nftId);
                transferNft(nftId, winner);
                postTransferNft(nftId, oldOwner, nftInfo.ownedSince);
                executePayment(winner, oldOwner, auction.id, royalty.owner, royalty.percentage);
            }else{
                s_nftIdStatus[nftId].sellingType = SellingType.NO_SELLING;
            }
        }
    }

    /*
        @notice buy process for an NFT | CALLABLE ONLY BY NOT NFT OWNER, NFT SELLING TYPE SHOULD BE FIXED
        @param nftId
    */
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
        delete s_nftIdToSellingFixedPrice[nftId];
        transferNft(nftId, msg.sender);
        postTransferNft(nftId, oldOwner, ownedSince);
    }


    /*
        @dev CHANGE THE FUNCTION | REQUIRE APPROVAL FIRST
    */
    function transferNft(uint256 nftId, address receiver) private {
        _safeTransfer(ownerOf(nftId), receiver, nftId, "");
    }

    /*
        @dev update the owner status of an NFT
        @param nftId
        @param oldOwner address of the previous owner
        @param ownedSince timestamp of the previous owner when it created/acquired the NFT
    */
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


    /*
        @notice get the highest - not refunded - offer for an auction
        @param nftId
        @return (uint256, address) the amount offered and the bidder
    */
    function getLastOffer(uint256 nftId) public view returns(uint256, address){
        Selling_AuctionOffers[] memory offers = s_nftIdToSellingAuctionOffers[nftId];
        if(offers.length == 0){
            return (s_nftIdToSellingAuction[nftId].initialPrice, ZERO_ADDRESS);
        }else{
            uint256 maxOffer = 0;
            address bidder = ZERO_ADDRESS;
            for(uint256 index = offers.length - 1; index >= 0; index--){
                if(!offers[index].refunded && offers[index].owner != ZERO_ADDRESS){
                    maxOffer = offers[index].amount;
                    bidder = offers[index].owner;
                    break;
                }
            }
            if(maxOffer == 0){
                return (s_nftIdToSellingAuction[nftId].initialPrice, ZERO_ADDRESS);
            }else{
                return (maxOffer, bidder);
            }
        }
    }

    /*
        @notice get the offer of a specific sender for a specific auction
        @param nftId
        @param owner sender to check
        @return (uint256, uint256) amount offered and index where to found
    */
    function getLastOfferSender(uint256 nftId, address owner) public view returns(uint256, uint256){
        Selling_AuctionOffers[] memory offers = s_nftIdToSellingAuctionOffers[nftId];
        if(offers.length == 0){
            return (0, 0);
        }else{
            for(uint256 index = 0; index < offers.length; index++){
                if(offers[index].owner == owner && !offers[index].refunded){
                    return (offers[index].amount, index);
                }
            }
            return (0, 0);
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