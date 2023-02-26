// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PaymentHolder.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./Utils.sol";

// TODO
// SWAP NFT
// TEST GAS USED

contract SocialNFT is ERC721URIStorage, Utils {

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
    error ERR_AUCTION_INCREMENT_NOT_IN_RANGE();
    error ERR_AUCTION_INITIAL_PRICE_CANNOT_BE_ZERO();
    error ERR_AUCTION_DEADLINE_NOT_PASSED();
    error ERR_AUCTION_DEADLINE_PASSED();
    error ERR_AUCTION_NOT_REFUNDABLE();
    error ERR_AUCTION_OFFER_TOO_LOW();

    event NewNftCreated(uint256 indexed _nft_id, address indexed _owner);
    event RoyaltiesSet();

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
    enum GasStage {
        INITIAL,
        END
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
        uint256 minIncrement;
        bool refundable;
        address currency;
        uint256 deadline;
    }
    struct Selling_AuctionOffers {
        uint256 amount;
        address owner;
        bool refunded;
    }

    struct GasAuction {
        address payer;
        address debtor;
        uint256 gasInitial;
        uint256 gasEnd;
        uint256 cost;
    }


    // STORAGE VARIABLES - STATUS NFT
    // ----------------------------------------------------------------------------------------
    mapping(address => uint256[]) public s_ownerToNftId;
    mapping(uint256 => NftStatus) public s_nftIdStatus;
    mapping(uint256 => PastNftOwner[]) public s_nftIdToPastOwners;
    mapping(uint256 => GasAuction) public s_auctionIdToGasAuction;
    // ----------------------------------------------------------------------------------------


    // STORAGE VARIABLES - SELLING STATUS NFT
    // ----------------------------------------------------------------------------------------
    mapping(uint256 => Royalty) public s_nftIdToRoyalties;
    mapping(uint256 => Selling_FixedPrice) public s_nftIdToSellingFixedPrice;
    mapping(uint256 => Selling_Auction) public s_nftIdToSellingAuction;
    mapping(uint256 => Selling_AuctionOffers[]) public s_nftIdToSellingAuctionOffers;
    uint256 public s_auctionId = 1; // TODO CHANGE TO PRIVATE - JUST TESTING
    // ----------------------------------------------------------------------------------------


    // STORAGE VARIABLES - NFT ATTRIBUTES
    // ----------------------------------------------------------------------------------------
    uint256 public s_nftUniqueId = 1; // TODO CHANGE TO PRIVATE - JUST TESTING
    // ----------------------------------------------------------------------------------------


    // CONSTANT VARIABLES
    // ----------------------------------------------------------------------------------------
    string public constant NAME = "SocialNFT";
    string public constant SYMBOL = "SFT";
    // ----------------------------------------------------------------------------------------


    // IMMUTABLE VARIABLES
    // ----------------------------------------------------------------------------------------
    address public immutable i_contractOwner;
    PaymentHolder public immutable i_paymentHolder;

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
        if(!_exists(nftId)){
            revert ERR_NFT_NOT_EXISTING();
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
        i_paymentHolder = new PaymentHolder(address(this));

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
    function createNft(string calldata uri) public {
        _safeMint(msg.sender, s_nftUniqueId);
        _setTokenURI(s_nftUniqueId, uri);

        s_ownerToNftId[msg.sender].push(s_nftUniqueId);
        s_nftIdStatus[s_nftUniqueId] = NftStatus({
            exist: true,
            sellingType: SellingType.NO_SELLING,
            ownedSince: block.timestamp
        });
        emit NewNftCreated(s_nftUniqueId, msg.sender);
        _incrementNftUniqueId();
    }

    /*
        @notice set royalties to the creator of the NFT | ONLY BETWEEN 1 AND 25, ONLY CREATOR, ONLY BEFORE THE FIRST PURCHASE
        @dev FILTER WHEN USER TRANSFER WITHOUT SELLING IT
        @param nftId
        @param percentage integer from 1 to 25 (included)
    */
    function setRoyalties(uint256 nftId, uint8 percentage) public onlyNftOwner(nftId){
        PastNftOwner[] memory pastOwners = s_nftIdToPastOwners[nftId];

        if(pastOwners.length > 0){
            revert ERR_ROYALTIES_NOT_APPLICABLE();
        }
        if(percentage < 1 || percentage > 25){
            revert ERR_ROYALTIES_PERCENTAGE_NOT_IN_RANGE();
        }

        s_nftIdToRoyalties[nftId] = Royalty({
            owner: msg.sender,
            percentage: percentage
        });
        emit RoyaltiesSet();
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
        @param refundable TRUE if the bid can be withdraw or FALSE if not possible
        @param minIncrement percentage of increase related to last higher bid
        @param currency native currency or ERC20
        @param deadline timestamp when the auction will be terminated | MINIMUM 5 DAYS, MAXIMUM 30 DAYS (included)
    */
    function setSellingAuction(uint256 nftId, uint256 initialPrice, bool refundable, uint256 minIncrement, CurrecyAddress currency, uint256 deadline) public onlyExistingNft(nftId) onlyNftOwner(nftId) onlySpecificSellingType(nftId, SellingType.NO_SELLING){

        uint256 minTime = 60*60*24*5;
        uint256 maxTime = 60*60*24*30;
        
        if(deadline < block.timestamp + minTime || deadline > block.timestamp + maxTime){
            revert ERR_AUCTION_DEADLINE_NOT_IN_RANGE();
        }
        if(initialPrice == 0){
            revert ERR_AUCTION_INITIAL_PRICE_CANNOT_BE_ZERO();
        }
        if(minIncrement < 1 || minIncrement > 50){
            revert ERR_AUCTION_INCREMENT_NOT_IN_RANGE();
        }

        address currencyAddress = getTokenAddress(currency);
        s_nftIdStatus[nftId].sellingType = SellingType.SELLING_AUCTION;
        s_nftIdToSellingAuction[nftId] = Selling_Auction({
            id: s_auctionId,
            initialPrice: initialPrice,
            minIncrement: minIncrement,
            refundable: refundable,
            currency: currencyAddress,
            deadline: deadline
        });
        _incrementAuctionId();
    }

    /*
        @notice make an offer for an auction | ONLY IF HIGHEST OFFER, ENOUGH FUNDS, NOT NFT OWNER AND NFT SOLD IN AN AUCTION
        @dev amount is the value sent in this specific tx | CAN BE ADDED TO PREVIOUS OFFERS IF ANY
        @param nftId
        @param amount the amount proposed | IF ZERO ADDRESS CURRENCY msg.value = amount ELSE ERC20 ALLOWANCE >= amount
    */
    function makeOfferAuction(uint256 nftId, uint256 amount) public payable onlyExistingNft(nftId) onlyNotNftOwner(nftId) onlySpecificSellingType(nftId, SellingType.SELLING_AUCTION){
        (uint256 lastOffer, address bidder) = _getLastOffer(nftId);
        Selling_Auction memory auction = s_nftIdToSellingAuction[nftId];

        if(block.timestamp > auction.deadline){
            revert ERR_AUCTION_DEADLINE_PASSED();
        }

        (uint256 amountAlreadyOffered, uint256 index) = getLastOfferFromSender(nftId, msg.sender);
        uint256 finalAmount = amount + amountAlreadyOffered;

        if(bidder != msg.sender && finalAmount < (lastOffer * (100 + auction.minIncrement)) / 100){
            revert ERR_AUCTION_OFFER_TOO_LOW();
        }

        if(amountAlreadyOffered > 0){
            delete s_nftIdToSellingAuctionOffers[nftId][index];
        }
        _transferOfferAuction(nftId, auction, amount, finalAmount);
    }
    function _transferOfferAuction(uint256 nftId, Selling_Auction memory auction, uint256 amount, uint256 finalAmount) private {
        if(auction.currency == ZERO_ADDRESS){
            if(msg.value != amount){
                revert ERR_NFT_BUYING_WRONG_AMOUNT();
            }
            s_nftIdToSellingAuctionOffers[nftId].push(Selling_AuctionOffers({
                amount: finalAmount,
                owner: msg.sender,
                refunded: false
            }));
            i_paymentHolder.addNewHoldPayment_Auction(auction.id, msg.sender, finalAmount, auction.currency);
            (bool success, ) = payable(i_paymentHolder).call{value: msg.value}("");
            if(!success){
                revert ERR_PAYMENT_NOT_SENT();
            }
        }else{
            IERC20 erc20 = IERC20(auction.currency);
            uint256 allowance = erc20.allowance(msg.sender, address(this));
            if(allowance < amount){
                revert ERR_NFT_BUYING_ERC20_NEEDS_TO_BE_ALLOWED();
            }
            s_nftIdToSellingAuctionOffers[nftId].push(Selling_AuctionOffers({
                amount: finalAmount,
                owner: msg.sender,
                refunded: false
            }));
            i_paymentHolder.addNewHoldPayment_Auction(auction.id, msg.sender, finalAmount, auction.currency);
            erc20.transferFrom(msg.sender, address(i_paymentHolder), amount);
        }
    }

    /*
        @notice withdraw a previous offer made | ONLY IF AUCTION IS REFUNDABLE
        @param nftId
    */
    function withdrawOffer(uint256 nftId) public payable onlyExistingNft(nftId) onlyNotNftOwner(nftId) onlySpecificSellingType(nftId, SellingType.SELLING_AUCTION) {
        Selling_Auction memory auction = s_nftIdToSellingAuction[nftId];
        if(block.timestamp > auction.deadline){
            revert ERR_AUCTION_DEADLINE_PASSED();
        }
        if(!auction.refundable){
            revert ERR_AUCTION_NOT_REFUNDABLE();
        }
        Selling_AuctionOffers[] memory offers = s_nftIdToSellingAuctionOffers[nftId];
        for(uint256 i = 0; i < offers.length; i++){
            if(offers[i].owner == msg.sender && !offers[i].refunded){
                s_nftIdToSellingAuctionOffers[nftId][i].refunded = true;
                i_paymentHolder.withdrawPayment(auction.id, offers[i].amount, offers[i].owner, auction.currency);
                break;
            }
        }
    }

    /*
        @notice terminate a current auction | ONLY IF DEADLINE IS PASSED, CALLABLE BY ANYONE
        @param nftId
    */
    function terminateAuction(uint256 nftId) public payable onlyExistingNft(nftId) onlySpecificSellingType(nftId, SellingType.SELLING_AUCTION) {
        Selling_Auction memory auction = s_nftIdToSellingAuction[nftId];
        if(msg.sender != ownerOf(nftId)){
            calcGasUsed(auction.id, ownerOf(nftId), GasStage.INITIAL);
        }
        NftStatus memory nftInfo = s_nftIdStatus[nftId];
        Selling_AuctionOffers[] memory offers = s_nftIdToSellingAuctionOffers[nftId];
        if(block.timestamp < auction.deadline){
            revert ERR_AUCTION_DEADLINE_NOT_PASSED();
        }

        if(offers.length > 0){
            bool offerFound = false;
            for(uint256 index = offers.length - 1 ; index >= 0 && !offerFound; index--){
                if(offers[index].owner != ZERO_ADDRESS && !offers[index].refunded){
                    offerFound = true;
                }
                if(index == 0){
                    break;
                }
            }
            if(offerFound){
                Royalty memory royalty = s_nftIdToRoyalties[nftId];
                (, address winner) = _getLastOffer(nftId);
                address oldOwner = ownerOf(nftId);
                _transferNft(nftId, winner);
                _postTransferNft(nftId, oldOwner, nftInfo.ownedSince);
                i_paymentHolder.executePayment(winner, oldOwner, auction.id, royalty.owner, royalty.percentage);
            }
        }

        delete s_nftIdToSellingAuction[nftId];
        delete s_nftIdToSellingAuctionOffers[nftId];

        s_nftIdStatus[nftId].sellingType = SellingType.NO_SELLING;
        if(msg.sender != ownerOf(nftId)){
            calcGasUsed(auction.id, ownerOf(nftId), GasStage.END);
        }
    }
    function calcGasUsed(uint256 auctionId, address debtor, GasStage stage) private {
        if(stage == GasStage.INITIAL){
            s_auctionIdToGasAuction[auctionId] = GasAuction({
                payer: msg.sender,
                debtor: debtor,
                gasInitial: gasleft(),
                gasEnd: 0,
                cost: tx.gasprice
            });
        }else{
            s_auctionIdToGasAuction[auctionId].gasEnd = gasleft();
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
        uint256 amountRoyalties = (s_nftIdToRoyalties[nftId].percentage * nftOptions.amount) / 100;
        IERC20 erc20 = IERC20(nftOptions.currency);

        if(nftOptions.currency == ZERO_ADDRESS){
            if(msg.value == nftOptions.amount){
                bool sentToSeller = false;
                if(amountRoyalties > 0 && s_nftIdToPastOwners[nftId].length > 0){
                    uint256 amountSeller = nftOptions.amount - amountRoyalties;
                    (sentToSeller, ) = payable(oldOwner).call{value: amountSeller}("");
                    (bool sentToOriginalCreator,) = payable(s_nftIdToPastOwners[nftId][0].owner).call{value: amountRoyalties}("");
                    require(sentToOriginalCreator, "Payment Failed to Original Creator");
                }else{
                    (sentToSeller, ) = payable(oldOwner).call{value: nftOptions.amount}("");
                }
                require(sentToSeller, "Payment Failed to Seller");
            }else{
                revert ERR_NFT_BUYING_WRONG_AMOUNT();
            }
        }else{
            if(erc20.allowance(msg.sender, address(this)) >= nftOptions.amount){
                if(amountRoyalties > 0 && s_nftIdToPastOwners[nftId].length > 0){
                    uint256 amountSeller = nftOptions.amount - amountRoyalties;
                    address creator = s_nftIdToPastOwners[nftId][0].owner;

                    erc20.transferFrom(msg.sender, oldOwner, amountSeller);
                    erc20.transferFrom(msg.sender, creator, amountRoyalties);
                }else{
                    erc20.transferFrom(msg.sender, oldOwner, nftOptions.amount);
                }
            }else{
                revert ERR_NFT_BUYING_ERC20_NEEDS_TO_BE_ALLOWED();
            }
        }
        delete s_nftIdToSellingFixedPrice[nftId];
        _transferNft(nftId, msg.sender);
        _postTransferNft(nftId, oldOwner, ownedSince);
    }


    function transferFrom(address from, address to, uint256 tokenId) public override {
        safeTransferFrom(from, to, tokenId, "");
    }
    function safeTransferFrom(address from, address to, uint256 tokenId) public override {
        safeTransferFrom(from, to, tokenId, "");
    }
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public override {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: caller is not token owner or approved");
        address oldOwner = ownerOf(tokenId);
        uint256 ownedSince = s_nftIdStatus[tokenId].ownedSince;
        _safeTransfer(from, to, tokenId, data);
        _postTransferNft(tokenId, oldOwner, ownedSince);
    }

    /*
        @dev CHANGE THE FUNCTION | REQUIRE APPROVAL FIRST
    */
    function _transferNft(uint256 nftId, address receiver) public { // TODO CHANGE TO PRIVATE - JUST TESTING
        _safeTransfer(ownerOf(nftId), receiver, nftId, "");
    }

    /*
        @dev update the owner status of an NFT
        @param nftId
        @param oldOwner address of the previous owner
        @param ownedSince timestamp of the previous owner when it created/acquired the NFT
    */
    function _postTransferNft(uint256 nftId, address oldOwner, uint256 ownedSince) public { // TODO CHANGE TO PRIVATE - JUST TESTING
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
    function _incrementNftUniqueId() internal{
        s_nftUniqueId += 1;
    }
    function _incrementAuctionId() internal{
        s_auctionId += 1;
    }


    /*
        @notice get the highest - not refunded - offer for an auction
        @param nftId
        @return (uint256, address) the amount offered and the bidder
    */
    function _getLastOffer(uint256 nftId) public view returns(uint256, address){ // TODO CHANGE TO INTERNAL OR PRIVATE - JUST TESTING
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
                if(index == 0) break;
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
    function getLastOfferFromSender(uint256 nftId, address owner) public view returns(uint256, uint256){
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

/*
    @dev UNNECESSARY - REMOVE
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
*/
    function getNftId(address owner, string memory ipfs) public view returns(uint256){
        uint256[] memory listNft = s_ownerToNftId[owner];
        for(uint256 index = 0; index < listNft.length; index++){
            if(keccak256(bytes(tokenURI(listNft[index]))) == keccak256(bytes(ipfs))){
                return listNft[index];
            }
        }
        revert ERR_NFT_NOT_EXISTING();
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
        }
        revert();
    }
}