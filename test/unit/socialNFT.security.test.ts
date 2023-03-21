import {developmentChain} from "../../hardhat-config-helper";
import {deployments, ethers, network} from "hardhat";
import {Erc20, MaliciousUser_Revert, SocialNFT, Test} from "../../typechain-types";
import {Signer} from "ethers";
import {beforeEach} from "mocha";

!developmentChain.includes(network.name) ? describe.skip :
    describe("SocialNFT Testing", () => {
        let socialNFT: SocialNFT, erc20: Erc20, test: Test
        let maliciousUser_Revert: MaliciousUser_Revert
        let deployer: Signer, player1: Signer, player2: Signer, player3: Signer
        // const ZERO_ADDRESS = ethers.constants.AddressZero

        // enum CurrecyAddress {
        //     ETH,
        //     WETH,
        //     DAI,
        //     USDC,
        //     USDT
        // }
        //
        // enum SellingType {
        //     NO_SELLING,
        //     SELLING_AUCTION,
        //     SELLING_FIXED_PRICE,
        //     SELLING_OTHER_NFT
        // }

        beforeEach(async () => {
            await deployments.fixture(["mock", "main", "test"])

            socialNFT = await ethers.getContract("SocialNFT")
            erc20 = await ethers.getContract("Erc20")
            test = await ethers.getContract("Test")

            maliciousUser_Revert = await ethers.getContract("MaliciousUser_Revert")

            const signers = await ethers.getSigners()
            deployer = signers[0]
            player1 = signers[1]
            player2 = signers[2]
            player3 = signers[3]
        })
        describe("Re-entrancy Attack", () => {
            it("SocialNFT - withdrawOffer")
            it("SocialNFT - terminateAuction")
            it("SocialNFT - buyNftSellingFixedPrice")
        })
    })