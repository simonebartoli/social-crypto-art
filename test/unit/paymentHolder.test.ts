import {developmentChain} from "../../hardhat-config-helper";
import {deployments, ethers, network} from "hardhat";
import {Test} from "../../typechain-types";
import {Signer} from "ethers";
import {assert} from "chai";
import * as helpers from "@nomicfoundation/hardhat-network-helpers"

!developmentChain.includes(network.name) ? describe.skip :
    describe("Payment Holder Testing", () => {
        let test: Test
        let deployer: Signer, player1: Signer, player2: Signer, player3: Signer
        // const ZERO_ADDRESS = ethers.constants.AddressZero
        let currency: string

        enum CurrecyAddress {
            ETH,
            WETH,
            DAI,
            USDC,
            USDT
        }
        // enum SellingType {
        //     NO_SELLING,
        //     SELLING_AUCTION,
        //     SELLING_FIXED_PRICE,
        //     SELLING_OTHER_NFT
        // }

        const amount = ethers.utils.parseEther("10")

        beforeEach(async () => {
            await deployments.fixture(["mock", "main", "test"])
            deployer = (await ethers.getSigners())[0]
            player1 = (await ethers.getSigners())[1]
            player2 = (await ethers.getSigners())[2]
            player3 = (await ethers.getSigners())[3]

            test = await ethers.getContract("Test", deployer)
            currency = await test.getTokenAddress(CurrecyAddress.ETH)
        })
        describe("Check if Exist Testing", () => {
            const auctionId = 1
            it("Should Return False - Empty Array", async () => {
                assert.equal(await test.checkIfExist(await player1.getAddress(), auctionId), false)
            })
            it("Should Return False - Array has no sender", async () => {
                await test.test_addNewAddressToAuction(auctionId, await player2.getAddress())
                await test.test_addNewAddressToAuction(auctionId, await player3.getAddress())
                assert.equal(await test.checkIfExist(await player1.getAddress(), auctionId), false)
            })
            it("Should Return True - 1 element array with sender", async () => {
                await test.test_addNewAddressToAuction(auctionId, await player1.getAddress())
                assert.equal(await test.checkIfExist(await player1.getAddress(), auctionId), true)
            })
            it("Should Return True - more than 1 element array with sender", async () => {
                await test.test_addNewAddressToAuction(auctionId, await player2.getAddress())
                await test.test_addNewAddressToAuction(auctionId, await player3.getAddress())
                await test.test_addNewAddressToAuction(auctionId, await player1.getAddress())
                assert.equal(await test.checkIfExist(await player1.getAddress(), auctionId), true)
            })
        })
        describe("Add new payment hold Testing", () => {
            const auctionId = 1
            const currentTime = Math.floor(Date.now() / 1000)

            it("Should Add Correctly - First Offer from Sender", async () => {
                await test.addNewHoldPayment_Auction(auctionId, await player1.getAddress(), amount, currency)
                const auctionAddressesLength = await test.test_getAuctionToAddressesLength(auctionId)
                const payment = await test.s_address_to_payment_hold(await player1.getAddress(), auctionId)

                assert.equal(auctionAddressesLength.toString(), "1")
                assert.equal(payment.amount.toString(), amount.toString())
                assert.equal(payment.currency, currency)
                assert.equal(payment.created, true)
                assert(payment.date.toString() >= String(currentTime - 10) && payment.date.toString() <= String(currentTime + 10))
            })
            it("Should Add Correctly - Second Offer from Sender", async () => {
                await test.addNewHoldPayment_Auction(auctionId, await player1.getAddress(), amount, currency)
                await helpers.time.increase(100)

                const newCurrentTime = Math.floor(Date.now() / 1000) + 100
                await test.addNewHoldPayment_Auction(auctionId, await player1.getAddress(), amount.mul(2), currency)

                const auctionAddressesLength = await test.test_getAuctionToAddressesLength(auctionId)
                const payment = await test.s_address_to_payment_hold(await player1.getAddress(), auctionId)

                assert.equal(auctionAddressesLength.toString(), "1")
                assert.equal(payment.amount.toString(), amount.mul(2).toString())
                assert.equal(payment.currency, currency)
                assert.equal(payment.created, true)
                assert(payment.date.toString() >= String(newCurrentTime - 10) && payment.date.toString() <= String(newCurrentTime + 10),
                    `Date is ${payment.date.toString()} and should be between ${String(newCurrentTime - 10)} and ${String(newCurrentTime + 10)}`)
            })
        })
    })