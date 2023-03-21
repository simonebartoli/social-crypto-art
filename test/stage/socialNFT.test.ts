import {developmentChain} from "../../hardhat-config-helper";
import {network} from "hardhat";

!developmentChain.includes(network.name) ? describe.skip :
    describe("SocialNFT Stage Testing", () => {
        // let socialNFT: SocialNFT, erc20: Erc20
        // let signers: Signer[], signersWithNft: Signer[], nftSellingFixedPrice: string[] = [], nftSellingAuction: string[] = []
        //
        // const uri = "TEST"
        // const ZERO_ADDRESS = ethers.constants.AddressZero
        //
        // enum CurrecyAddress {
        //     ETH,
        //     WETH,
        //     DAI,
        //     USDC,
        //     USDT
        // }
        // enum SellingType {
        //     NO_SELLING,
        //     SELLING_AUCTION,
        //     SELLING_FIXED_PRICE,
        //     SELLING_OTHER_NFT
        // }

        // beforeEach(async () => {
        //     await deployments.fixture(["mock", "main"])
        //     socialNFT = await ethers.getContract("SocialNFT")
        //     erc20 = await ethers.getContract("Erc20")
        //
        //     let index = 0
        //     signers = await ethers.getSigners()
        //     signersWithNft = []
        //
        //     const createNft = async () => {
        //         for(const signer of signers){
        //             if(Math.random() < 0.5) {
        //                 index += 1
        //                 signersWithNft.push(signer)
        //                 await socialNFT.connect(signer).createNft(`${uri}_${index}`)
        //             }
        //         }
        //     }
        //     while(signersWithNft.length === 0){
        //         await createNft()
        //     }
        //
        //     const createSellingOptions = async () => {
        //         for(const signer of signersWithNft){
        //             const nftId = await socialNFT.s_ownerToNftId(await signer.getAddress(), 0)
        //             if(!nftSellingFixedPrice.includes(nftId.toString()) && !nftSellingAuction.includes(nftId.toString())){
        //                 if(Math.random() < 0.75) {
        //                     await socialNFT.connect(signer).setRoyalties(
        //                         nftId, Math.floor(Math.random() * 24 + 1)
        //                     )
        //                 }
        //                 if(Math.random() < 0.5){
        //                     nftSellingFixedPrice.push(nftId.toString())
        //                     await socialNFT.connect(signer).setSellingFixedPrice(
        //                         nftId, ethers.utils.parseEther(Math.random().toFixed(3)), Math.floor(Math.random() * 4)
        //                     )
        //                 }else{
        //                     nftSellingAuction.push(nftId.toString())
        //                     await socialNFT.connect(signer).setSellingAuction(
        //                         nftId,
        //                         ethers.utils.parseEther(Math.random().toFixed(3)),
        //                         Math.random() < 0.5 && true,
        //                         Math.floor(Math.random() * 49 + 1).toString(),
        //                         Math.floor(Math.random() * 4),
        //                         Math.floor(Date.now() / 1000) + 60 * 60 * 24 * Math.floor(Math.random() * 20 + 10)
        //                     )
        //                 }
        //             }
        //         }
        //     }
        //     while(nftSellingFixedPrice.length === 0 || nftSellingAuction.length === 0){
        //         await createSellingOptions()
        //     }
        // })
        // describe("Fixed Price Selling", () => {
        //     it("Should Sell the NFT", async () => {
        //         const nftId = nftSellingFixedPrice[Math.floor(Math.random() * (nftSellingFixedPrice.length - 1))]
        //         const ownerNft = await socialNFT.ownerOf(nftId)
        //     })
        // })
    })