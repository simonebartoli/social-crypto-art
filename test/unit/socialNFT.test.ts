import {developmentChain} from "../../hardhat-config-helper";
import {deployments, ethers, network} from "hardhat";
import {Erc20, SocialNFT, Test, TestNftReceiver} from "../../typechain-types";
import {BigNumber, Signer} from "ethers";
import {assert, expect} from "chai";
import * as helpers from "@nomicfoundation/hardhat-network-helpers";
import {beforeEach} from "mocha";

!developmentChain.includes(network.name) ? describe.skip :
    describe("SocialNFT Testing", () => {
        let socialNFT: SocialNFT, erc20: Erc20, test: Test
        let deployer: Signer, player1: Signer, player2: Signer, player3: Signer
        const ZERO_ADDRESS = ethers.constants.AddressZero
        enum CurrecyAddress {
            ETH,
            WETH,
            DAI,
            USDC,
            USDT
        }
        enum SellingType {
            NO_SELLING,
            SELLING_AUCTION,
            SELLING_FIXED_PRICE,
            SELLING_OTHER_NFT
        }

        beforeEach(async () => {
            await deployments.fixture(["mock", "main", "test"])
            socialNFT = await ethers.getContract("SocialNFT")
            erc20 = await ethers.getContract("Erc20")
            test = await ethers.getContract("Test")
            const signers = await ethers.getSigners()
            deployer = signers[0]
            player1 = signers[1]
            player2 = signers[2]
            player3 = signers[3]
        })

        describe("Constructor Testing", () => {
            it("Should set Payment Holder Contract Correctly", async () => {
                const addressPaymentHolder = await socialNFT.i_paymentHolder()
                assert.notEqual(addressPaymentHolder, ZERO_ADDRESS)
            })
        })
        describe("Create NFT Testing", () => {
            const initialNftUniqueId = 1
            const currentTimestamp = Math.floor(Date.now() / 1000)
            const uri = "THIS_IS_A_TEST"
            let socialNftDeployer: SocialNFT
            beforeEach(async () => {
                socialNftDeployer = socialNFT.connect(deployer)
                await socialNftDeployer.createNft(uri)
            })
            it("Should create the NFT for msg.sender", async () => {
                const owner = await socialNFT.ownerOf(initialNftUniqueId)
                assert.equal(owner.toString(), await deployer.getAddress())
            })
            it("'s_ownerToNftId' should add a new entry", async () => {
                const nftId = await socialNFT.s_ownerToNftId(await deployer.getAddress(), 0)
                assert.equal(nftId.toString(), initialNftUniqueId.toString())
            })
            it("Should set the status of the NFT correctly", async () => {
                const nftStatus = await socialNFT.s_nftIdStatus(initialNftUniqueId)
                const ownedSince = Number(nftStatus.ownedSince.toString())
                assert.equal(nftStatus.exist, true)
                assert.equal(nftStatus.sellingType, 0)
                assert(ownedSince > currentTimestamp - 30 && ownedSince < currentTimestamp + 30)
            })
            it("Should increment the unique NFT id", async () => {
                const nftUniqueId = await socialNFT.s_nftUniqueId()
                assert.equal(nftUniqueId.toString(), (initialNftUniqueId + 1).toString())
            })
            it("Should revert if same URI exists", async () => {
                const socialNftPlayer1 = socialNFT.connect(player1)
                await expect(socialNftPlayer1.createNft(uri)).to.be.revertedWithCustomError(socialNFT, "ERR_URI_ALREADY_SET")
            })
        })
        describe("Modifier Testing", () => {
            const uri = "THIS_IS_A_TEST"
            const returnMessage = "FUNCTION_REACHED"
            const nftUniqueId = 1
            let testDeployer: Test, testPlayer: Test
            beforeEach(async () => {
                testDeployer = test.connect(deployer)
                testPlayer = test.connect(player1)

                await testDeployer.createNft(uri)
            })
            it("Should allow only the NFT Owner", async () => {
                await expect(testPlayer.test_modifier_onlyNftOwner(nftUniqueId)).to.be.revertedWithCustomError(socialNFT, "ERR_NFT_NOT_OWNED")
                assert.equal((await testDeployer.test_modifier_onlyNftOwner(nftUniqueId)).toString(), returnMessage)
            })
            it("Should allow everyone except the NFT Owner", async () => {
                await expect(testDeployer.test_modifier_onlyNotNftOwner(nftUniqueId)).to.be.revertedWithCustomError(socialNFT, "ERR_NFT_ALREADY_OWNED")
                assert.equal((await testPlayer.test_modifier_onlyNotNftOwner(nftUniqueId)).toString(), returnMessage)
            })
            it("Should allow only valid NFT id", async () => {
                const notExistingUniqueNftId = 99
                await expect(testDeployer.test_modifier_onlyExistingNft(notExistingUniqueNftId)).to.be.revertedWithCustomError(socialNFT, "ERR_NFT_NOT_EXISTING")
                assert.equal((await testDeployer.test_modifier_onlyExistingNft(nftUniqueId)).toString(), returnMessage)
            })
            it("Should allow only Specific Selling Type", async () => {
                const SELLING_FIXED_PRICE = 2
                const SELLING_AUCTION = 1
                const NO_SELLING = 0

                await testDeployer.test_modifyNftSellingTypeStatus(nftUniqueId, SELLING_FIXED_PRICE)
                await expect(testDeployer.test_modifier_onlySpecificSellingType(nftUniqueId, SELLING_AUCTION)).to.be.revertedWithCustomError(socialNFT, "ERR_NFT_BUYING_WRONG_MODE")
                await expect(testDeployer.test_modifier_onlySpecificSellingType(nftUniqueId, NO_SELLING)).to.be.revertedWithCustomError(socialNFT, "ERR_NFT_SELLING_ALREADY_SET")
                assert.equal((await testDeployer.test_modifier_onlySpecificSellingType(nftUniqueId, SELLING_FIXED_PRICE)).toString(), returnMessage)
            })
        })
        describe("Set Royalties Testing", () => {
            const uri = "THIS_IS_A_TEST"
            const nftUniqueId = 1
            let testDeployer: Test, testPlayer: Test
            beforeEach(async () => {
                testDeployer = test.connect(deployer)
                testPlayer = test.connect(player1)

                await testDeployer.createNft(uri)
            })
            it("Should revert if caller is not the owner", async () => {
                await expect(
                    testPlayer.setRoyalties(nftUniqueId, "20")
                ).to.be.revertedWithCustomError(socialNFT, "ERR_NFT_NOT_OWNED")
            })
            it("Should revert if previous owners exist", async () => {
                await testDeployer.test_setPastOwners(nftUniqueId, await deployer.getAddress())
                await expect(testDeployer.setRoyalties(nftUniqueId, 5)).to.be
                    .revertedWithCustomError(socialNFT, "ERR_ROYALTIES_NOT_APPLICABLE")
            })
            it("Should revert if royalties are outside the range", async () => {
                const MIN_ALLOWED = 1
                const MAX_ALLOWED = 25

                await expect(testDeployer.setRoyalties(nftUniqueId, MIN_ALLOWED - 1)).to.be
                    .revertedWithCustomError(socialNFT, "ERR_ROYALTIES_PERCENTAGE_NOT_IN_RANGE")
                await expect(testDeployer.setRoyalties(nftUniqueId, MAX_ALLOWED + 1)).to.be
                    .revertedWithCustomError(socialNFT, "ERR_ROYALTIES_PERCENTAGE_NOT_IN_RANGE")
                await expect(testDeployer.setRoyalties(nftUniqueId, MAX_ALLOWED)).to.not.be.reverted
                await expect(testDeployer.setRoyalties(nftUniqueId, MIN_ALLOWED)).to.not.be.reverted
            })
            it("Should set 's_nftIdToRoyalties' correctly", async () => {
                const ALLOWED = 10
                await testDeployer.setRoyalties(nftUniqueId, ALLOWED)
                const tx = await testDeployer.s_nftIdToRoyalties(nftUniqueId)
                const owner = tx.owner
                const percentage = tx.percentage

                assert.equal(owner, await deployer.getAddress())
                assert.equal(percentage, ALLOWED)
            })
        })
        describe("Get Token Address Testing", () => {
            it("Should return the 0 Address for ETH", async () => {
                assert.equal(await test.getTokenAddress(0), ZERO_ADDRESS)
            })
            it("Should return the address different from 0 for ETH", async () => {
                assert.notEqual(await test.getTokenAddress(1), ZERO_ADDRESS)
                assert.notEqual(await test.getTokenAddress(2), ZERO_ADDRESS)
                assert.notEqual(await test.getTokenAddress(3), ZERO_ADDRESS)
                assert.notEqual(await test.getTokenAddress(4), ZERO_ADDRESS)
            })
            it("Should revert if currency not found", async () => {
                enum CurrecyAddress {
                    ETH,
                    WETH,
                    DAI,
                    USDC,
                    USDT,
                    FAKE
                }
                await expect(test.getTokenAddress(CurrecyAddress.FAKE)).to.be.reverted
            })
        })
        describe("Set Selling FIXED PRICE Testing", () => {
            const uri = "THIS_IS_A_TEST"
            const nftUniqueId = 1
            const amount = ethers.utils.parseEther("10")
            const currency = CurrecyAddress.ETH

            let testDeployer: Test
            beforeEach(async () => {
                testDeployer = test.connect(deployer)
                await testDeployer.createNft(uri)
                await testDeployer.setSellingFixedPrice(nftUniqueId, amount, currency)
            })
            it("Should change the selling type status", async () => {
                const status = await testDeployer.s_nftIdStatus(nftUniqueId)
                assert.equal(status.exist, true)
                assert.equal(status.sellingType, SellingType.SELLING_FIXED_PRICE)
            })
            it("Should change 's_nftIdToSellingFixedPrice' status correctly", async () => {
                const status = await testDeployer.s_nftIdToSellingFixedPrice(nftUniqueId)
                assert.equal((status.amount).toString(), amount.toString())
                assert.equal(status.currency, await testDeployer.getTokenAddress(currency))
            })
        })
        describe("Transfer NFT Testing", () => {
            const uri = "THIS_IS_A_TEST"
            const nftUniqueId = 1

            let testDeployer: Test, testPlayer: Test
            beforeEach(async () => {
                testDeployer = test.connect(deployer)
                testPlayer = test.connect(player1)
                await testDeployer.createNft(uri)
            })
            it("Should transfer correctly", async () => {
                assert.equal(await testDeployer.ownerOf(nftUniqueId), await deployer.getAddress())
                await testDeployer._transferNft(nftUniqueId, await player1.getAddress())
                assert.equal(await testDeployer.ownerOf(nftUniqueId), await player1.getAddress())
            })
            it("Should revert the transfer (CONTRACT MISSING IMPL)", async () => {
                await expect(testDeployer._transferNft(nftUniqueId, test.address)).to.be.reverted
            })
            it("Should not revert the transfer (CONTRACT IMPL OK)", async () => {
                const nftReceiver: TestNftReceiver = await ethers.getContract("TestNftReceiver")
                await expect(testDeployer._transferNft(nftUniqueId, nftReceiver.address)).to.not.be.reverted
            })
        })
        describe("Post Transfer NFT Testing", () => {
            const uri = "THIS_IS_A_TEST"
            const uri2 = "THIS_IS_A_TEST_2"
            const uri3 = "THIS_IS_A_TEST_3"

            const nftUniqueId = 1

            let testDeployer: Test, testPlayer: Test, ownedSince: string, lengthArrayBefore: number
            beforeEach(async () => {
                testDeployer = test.connect(deployer)
                testPlayer = test.connect(player1)
                await testDeployer.createNft(uri)
                await testDeployer.createNft(uri2)
                await testDeployer.createNft(uri3)

                lengthArrayBefore = 3
                ownedSince = (await testDeployer.s_nftIdStatus(nftUniqueId)).ownedSince.toString()
                await testDeployer._transferNft(nftUniqueId, await player1.getAddress())
                await testDeployer._postTransferNft(nftUniqueId, await deployer.getAddress(), ownedSince)
            })
            it("Should set 's_nftIdToPastOwners' correctly", async () => {
                const status = await testDeployer.s_nftIdToPastOwners(nftUniqueId, 0)
                const currentTimestamp = Math.floor(Date.now() / 1000)
                assert.equal(status.owner, await deployer.getAddress())
                assert.equal(status.start_date.toString(), ownedSince.toString())
                assert(Number(status.end_date) > currentTimestamp - 30 && Number(status.end_date) < currentTimestamp + 30)
            })
            it("Should set the status correctly", async () => {
                const status = await testDeployer.s_nftIdStatus(nftUniqueId)
                const currentTimestamp = Math.floor(Date.now() / 1000)
                assert.equal(status.sellingType, SellingType.NO_SELLING)
                assert(Number(status.ownedSince) > currentTimestamp - 30 && Number(status.ownedSince) < currentTimestamp + 30)
            })
            it("Should remove the NFT from the list of owned NFT", async () => {
                const lengthArrayAfter = Number(await testDeployer.test_getOwnerToNftIdLength(await deployer.getAddress())).toString()
                const newArray = await testDeployer.test_getOwnerToNftIdArray(await deployer.getAddress())
                let found = false
                for (const element of newArray){
                    if(element.toString() === nftUniqueId.toString()){
                        found = true
                        break
                    }
                }
                assert.equal(lengthArrayAfter, lengthArrayAfter)
                assert.equal(found, false)
            })
        })
        describe("Buy NFT FIXED PRICE Testing", () => {
            const uri = "THIS_IS_A_TEST"
            const nftUniqueId = 1
            const amount = ethers.utils.parseEther("10")

            let testDeployer: Test, testPlayer_1: Test, testPlayer_2: Test
            beforeEach(async () => {
                testDeployer = test.connect(deployer)
                testPlayer_1 = test.connect(player1)
                testPlayer_2 = test.connect(player2)

                await testDeployer.createNft(uri)
            })
            describe("Buy using Native Currency", () => {
                const currency = CurrecyAddress.ETH
                beforeEach(async () => {
                    await testDeployer.setSellingFixedPrice(nftUniqueId, amount, currency)
                })
                it("Should revert - amount superior to the requested one", async () => {
                    await expect(testPlayer_1.buyNftSellingFixedPrice(nftUniqueId, {value: amount.add(1)}))
                        .to.be.revertedWithCustomError(socialNFT, "ERR_NFT_BUYING_WRONG_AMOUNT")
                })
                it("Should revert - amount inferior to the requested one", async () => {
                    await expect(testPlayer_1.buyNftSellingFixedPrice(nftUniqueId, {value: amount.sub(1)}))
                        .to.be.revertedWithCustomError(socialNFT, "ERR_NFT_BUYING_WRONG_AMOUNT")
                })
                describe("ROYALTIES CHECK", () => {
                    it("Should changes balances - NO ROYALTIES", async () => {
                        const balanceDeployerBefore = await deployer.getBalance()
                        const balancePlayer1Before = await player1.getBalance()

                        const txResponse = await testPlayer_1.buyNftSellingFixedPrice(nftUniqueId, {value: amount})
                        const tx = await txResponse.wait(1)
                        const gas = tx.gasUsed.mul(tx.effectiveGasPrice)
                        const balanceDeployerAfter = await deployer.getBalance()
                        const balancePlayer1After = await player1.getBalance()

                        assert.equal(balanceDeployerAfter.toString(), balanceDeployerBefore.add(amount).toString())
                        assert.equal(balancePlayer1Before.toString(), balancePlayer1After.add(amount).add(gas).toString())
                    })
                    it("Should changes balances - FIRST SELL ROYALTIES", async () => {
                        await testDeployer.setRoyalties(nftUniqueId, BigNumber.from(25))
                        const balanceDeployerBefore = await deployer.getBalance()
                        const balancePlayer1Before = await player1.getBalance()

                        const txResponse = await testPlayer_1.buyNftSellingFixedPrice(nftUniqueId, {value: amount})
                        const tx = await txResponse.wait(1)
                        const gas = tx.gasUsed.mul(tx.effectiveGasPrice)
                        const balanceDeployerAfter = await deployer.getBalance()
                        const balancePlayer1After = await player1.getBalance()

                        assert.equal(balanceDeployerAfter.toString(), balanceDeployerBefore.add(amount).toString())
                        assert.equal(balancePlayer1After.toString(), balancePlayer1Before.sub(amount).sub(gas).toString())
                    })
                    it("Should changes balances - ROYALTIES", async () => {
                        await testDeployer.setRoyalties(nftUniqueId, BigNumber.from(25))
                        await testPlayer_1.buyNftSellingFixedPrice(nftUniqueId, {value: amount})
                        await testPlayer_1.setSellingFixedPrice(nftUniqueId, amount, ZERO_ADDRESS)

                        const balanceDeployerBefore = await deployer.getBalance()
                        const balancePlayer1Before = await player1.getBalance()
                        const balancePlayer2Before = await player2.getBalance()

                        const txResponse = await testPlayer_2.buyNftSellingFixedPrice(nftUniqueId, {value: amount})

                        const tx = await txResponse.wait(1)
                        const gas = tx.gasUsed.mul(tx.effectiveGasPrice)

                        const balanceDeployerAfter = await deployer.getBalance()
                        const balancePlayer1After = await player1.getBalance()
                        const balancePlayer2After = await player2.getBalance()

                        const royalties = (await testDeployer.s_nftIdToRoyalties(nftUniqueId)).percentage
                        const amountReceiver = amount.mul(100 - Number(royalties.toString())).div(100)

                        assert.equal(balancePlayer1After.toString(), balancePlayer1Before.add(amountReceiver).toString())
                        assert.equal(balancePlayer2After.toString(), balancePlayer2Before.sub(amount).sub(gas).toString())
                        assert.equal(balanceDeployerAfter.toString(), balanceDeployerBefore.add(amount.sub(amountReceiver)).toString())
                    })
                })
            })
            describe("Buy using ERC20 Currency", () => {
                const currency = CurrecyAddress.DAI
                let erc20Deployer: Erc20, erc20Player1: Erc20, erc20Player2: Erc20

                beforeEach(async () => {
                    erc20Deployer = erc20.connect(deployer)
                    erc20Player1 = erc20.connect(player1)
                    erc20Player2 = erc20.connect(player2)

                    await testDeployer.setSellingFixedPrice(nftUniqueId, amount, currency)
                    await erc20Deployer.mint(await deployer.getAddress(), ethers.utils.parseEther("50"))
                })
                it("Should revert - ERC20 not allowed", async () => {
                    await expect(testPlayer_1.buyNftSellingFixedPrice(nftUniqueId))
                        .to.be.revertedWithCustomError(socialNFT, "ERR_NFT_BUYING_ERC20_NEEDS_TO_BE_ALLOWED")
                })
                it("Should revert - not enough ERC20 allowed", async () => {
                    await erc20Deployer.transfer(await player1.getAddress(), ethers.utils.parseEther("20"))
                    await erc20Player1.approve(test.address, amount.sub(1).toString())
                    await expect(testPlayer_1.buyNftSellingFixedPrice(nftUniqueId))
                        .to.be.revertedWithCustomError(socialNFT, "ERR_NFT_BUYING_ERC20_NEEDS_TO_BE_ALLOWED")
                })
                describe("ROYALTIES CHECK", () => {
                    beforeEach(async () => {
                        await erc20Deployer.transfer(await player1.getAddress(), ethers.utils.parseEther("20"))
                        await erc20Deployer.transfer(await player2.getAddress(), ethers.utils.parseEther("15"))

                        await erc20Player1.approve(test.address, amount.toString())
                        await erc20Player2.approve(test.address, amount.toString())
                    })
                    it("Should changes balances ERC - NO ROYALTIES", async () => {
                        const balanceDeployerBeforeETH = await deployer.getBalance()
                        const balancePlayer1BeforeETH = await player1.getBalance()

                        const balanceDeployerBeforeERC = await erc20.balanceOf(await deployer.getAddress())
                        const balancePlayer1BeforeERC = await erc20.balanceOf(await player1.getAddress())

                        const txResponse = await testPlayer_1.buyNftSellingFixedPrice(nftUniqueId)
                        const tx = await txResponse.wait(1)
                        const gas = tx.gasUsed.mul(tx.effectiveGasPrice)

                        const balanceDeployerAfterETH = await deployer.getBalance()
                        const balancePlayer1AfterETH = await player1.getBalance()

                        const balanceDeployerAfterERC = await erc20.balanceOf(await deployer.getAddress())
                        const balancePlayer1AfterERC = await erc20.balanceOf(await player1.getAddress())

                        assert.equal(balanceDeployerAfterETH.toString(), balanceDeployerBeforeETH.toString())
                        assert.equal(balancePlayer1AfterETH.toString(), balancePlayer1BeforeETH.sub(gas).toString())
                        assert.equal(balanceDeployerAfterERC.toString(), balanceDeployerBeforeERC.add(amount).toString())
                        assert.equal(balancePlayer1AfterERC.toString(), balancePlayer1BeforeERC.sub(amount).toString())
                    })
                    it("Should changes balances ERC - FIRST SELL ROYALTIES", async () => {
                        await testDeployer.setRoyalties(nftUniqueId, "25")

                        const balanceDeployerBeforeETH = await deployer.getBalance()
                        const balancePlayer1BeforeETH = await player1.getBalance()

                        const balanceDeployerBeforeERC = await erc20.balanceOf(await deployer.getAddress())
                        const balancePlayer1BeforeERC = await erc20.balanceOf(await player1.getAddress())

                        const txResponse = await testPlayer_1.buyNftSellingFixedPrice(nftUniqueId)
                        const tx = await txResponse.wait(1)
                        const gas = tx.gasUsed.mul(tx.effectiveGasPrice)

                        const balanceDeployerAfterETH = await deployer.getBalance()
                        const balancePlayer1AfterETH = await player1.getBalance()

                        const balanceDeployerAfterERC = await erc20.balanceOf(await deployer.getAddress())
                        const balancePlayer1AfterERC = await erc20.balanceOf(await player1.getAddress())

                        assert.equal(balanceDeployerAfterETH.toString(), balanceDeployerBeforeETH.toString())
                        assert.equal(balancePlayer1AfterETH.toString(), balancePlayer1BeforeETH.sub(gas).toString())
                        assert.equal(balanceDeployerAfterERC.toString(), balanceDeployerBeforeERC.add(amount).toString())
                        assert.equal(balancePlayer1AfterERC.toString(), balancePlayer1BeforeERC.sub(amount).toString())
                    })
                    it("Should changes balances ERC - ROYALTIES", async () => {
                        await testDeployer.setRoyalties(nftUniqueId, "25")
                        await testPlayer_1.buyNftSellingFixedPrice(nftUniqueId)
                        await testPlayer_1.setSellingFixedPrice(nftUniqueId, amount, currency)

                        const balanceDeployerBeforeETH = await deployer.getBalance()
                        const balancePlayer1BeforeETH = await player1.getBalance()
                        const balancePlayer2BeforeETH = await player2.getBalance()

                        const balanceDeployerBeforeERC = await erc20.balanceOf(await deployer.getAddress())
                        const balancePlayer1BeforeERC = await erc20.balanceOf(await player1.getAddress())
                        const balancePlayer2BeforeERC = await erc20.balanceOf(await player2.getAddress())

                        const txResponse = await testPlayer_2.buyNftSellingFixedPrice(nftUniqueId)
                        const tx = await txResponse.wait(1)
                        const gas = tx.gasUsed.mul(tx.effectiveGasPrice)

                        const balanceDeployerAfterETH = await deployer.getBalance()
                        const balancePlayer1AfterETH = await player1.getBalance()
                        const balancePlayer2AfterETH = await player2.getBalance()

                        const balanceDeployerAfterERC = await erc20.balanceOf(await deployer.getAddress())
                        const balancePlayer1AfterERC = await erc20.balanceOf(await player1.getAddress())
                        const balancePlayer2AfterERC = await erc20.balanceOf(await player2.getAddress())

                        const royalties = (await test.s_nftIdToRoyalties(nftUniqueId)).percentage
                        const amountToCreator = amount.mul(royalties).div(100)
                        const amountToSeller = amount.mul(100 - royalties).div(100)

                        assert.equal(balanceDeployerAfterETH.toString(), balanceDeployerBeforeETH.toString())
                        assert.equal(balancePlayer1AfterETH.toString(), balancePlayer1BeforeETH.toString())
                        assert.equal(balancePlayer2AfterETH.toString(), balancePlayer2BeforeETH.sub(gas).toString())

                        // console.log(`BEFORE: ${ethers.utils.formatEther(balanceDeployerBeforeERC)}`)
                        // console.log(`AFTER:  ${ethers.utils.formatEther(balanceDeployerAfterERC)}`)
                        // console.log(`AMOUNT: ${ethers.utils.formatEther(amount)}`)
                        // console.log(`ROYALTIES: ${ethers.utils.formatEther(amountToCreator)}`)

                        assert.equal(balanceDeployerAfterERC.toString(), balanceDeployerBeforeERC.add(amountToCreator).toString())
                        assert.equal(balancePlayer1AfterERC.toString(), balancePlayer1BeforeERC.add(amountToSeller).toString())
                        assert.equal(balancePlayer2AfterERC.toString(), balancePlayer2BeforeERC.sub(amount).toString())
                    })
                })
            })
        })
        describe("Set Selling AUCTION Testing", () => {
            const uri = "THIS_IS_A_TEST"
            const nftUniqueId = 1
            const initialOffer = ethers.utils.parseEther("10")
            const minIncrement = "10"
            const DAYS_10 = 60 * 60 * 24 * 10
            const deadline = Math.floor(Date.now() / 1000) + DAYS_10
            const currency = CurrecyAddress.ETH
            const refundable = true

            let testDeployer: Test, testPlayer_1: Test
            beforeEach(async () => {
                testDeployer = test.connect(deployer)
                testPlayer_1 = test.connect(player1)
                await testDeployer.createNft(uri)
            })
            it("Should revert - DEADLINE TOO CLOSE", async () => {
                const DAYS_5 = 60 * 60 * 24 * 5
                const wrongDeadline = Math.floor(Date.now() / 1000) + DAYS_5 - 10
                await expect(testDeployer.setSellingAuction(nftUniqueId, initialOffer, refundable, minIncrement, currency, wrongDeadline))
                    .to.be.revertedWithCustomError(socialNFT, "ERR_AUCTION_DEADLINE_NOT_IN_RANGE")
            })
            it("Should revert - DEADLINE TOO FAR", async () => {
                // TIMESTAMP CAN CHANGE WHEN CONTRACT IS EXECUTED
                const DAYS_30 = 60 * 60 * 24 * 30
                const wrongDeadline = Math.ceil(Date.now() / 1000) + DAYS_30 + 30
                await expect(testDeployer.setSellingAuction(nftUniqueId, initialOffer, refundable, minIncrement, currency, wrongDeadline))
                    .to.be.revertedWithCustomError(socialNFT, "ERR_AUCTION_DEADLINE_NOT_IN_RANGE")
            })
            it("Should revert - INITIAL OFFER EQUAL TO 0", async () => {
                const wrongInitialOffer = 0
                await expect(testDeployer.setSellingAuction(nftUniqueId, wrongInitialOffer, refundable, minIncrement, currency, deadline))
                    .to.be.revertedWithCustomError(socialNFT, "ERR_AUCTION_INITIAL_PRICE_CANNOT_BE_ZERO")
            })
            it("Should revert - MIN INCREMENT LESS THAN 1", async () => {
                const wrongMinIncrement = 0
                await expect(testDeployer.setSellingAuction(nftUniqueId, initialOffer, refundable, wrongMinIncrement, currency, deadline))
                    .to.be.revertedWithCustomError(socialNFT, "ERR_AUCTION_INCREMENT_NOT_IN_RANGE")
            })
            it("Should revert - MIN INCREMENT MORE THAN 50", async () => {
                const wrongMinIncrement = 51
                await expect(testDeployer.setSellingAuction(nftUniqueId, initialOffer, refundable, wrongMinIncrement, currency, deadline))
                    .to.be.revertedWithCustomError(socialNFT, "ERR_AUCTION_INCREMENT_NOT_IN_RANGE")
            })
            it("Should set the variables correctly", async () => {
                await testDeployer.setSellingAuction(nftUniqueId, initialOffer, refundable, minIncrement, currency, deadline)
                const sellingType = (await testDeployer.s_nftIdStatus(nftUniqueId)).sellingType
                const auction = await testDeployer.s_nftIdToSellingAuction(nftUniqueId)
                const auctionId = (await testDeployer.s_auctionId()).toString()

                assert.equal(sellingType, SellingType.SELLING_AUCTION)
                assert.equal(auction.initialPrice.toString(), initialOffer.toString())
                assert.equal(auction.deadline.toString(), deadline.toString())
                assert.equal(auction.minIncrement.toString(), minIncrement)
                assert.equal(auction.refundable, refundable)
                assert.equal(auctionId.toString(), "2")
            })
        })
        describe("Get Last Offer Testing - INTERNAL", () => {
            const uri = "THIS_IS_A_TEST"
            const nftUniqueId = 1
            const initialOffer = ethers.utils.parseEther("10")
            const minIncrement = "10"
            const DAYS_10 = 60 * 60 * 24 * 10
            const deadline = Math.floor(Date.now() / 1000) + DAYS_10
            const currency = CurrecyAddress.ETH
            const refundable = true

            let testDeployer: Test, testPlayer_1: Test
            beforeEach(async () => {
                testDeployer = test.connect(deployer)
                testPlayer_1 = test.connect(player1)
                await testDeployer.createNft(uri)
                await testDeployer.setSellingAuction(nftUniqueId, initialOffer, refundable, minIncrement, currency, deadline)
            })
            it("Should return the initial offer and address 0 - NO OFFERS", async () => {
                const lastOffer = await testDeployer._getLastOffer(nftUniqueId)
                assert.equal(lastOffer[0].toString(), initialOffer.toString())
                assert.equal(lastOffer[1], ZERO_ADDRESS)
            })
            it("Should return the initial offer and address 0 - OFFERS ALL REFUNDED", async () => {
                await testDeployer.test_modifyNftIdToSellingAuctionOffers(nftUniqueId, ethers.utils.parseEther("1"), await player1.getAddress(), true)
                await testDeployer.test_modifyNftIdToSellingAuctionOffers(nftUniqueId, ethers.utils.parseEther("2"), await player2.getAddress(), true)
                await testDeployer.test_modifyNftIdToSellingAuctionOffers(nftUniqueId, ethers.utils.parseEther("2"), await player3.getAddress(), true)

                const lastOffer = await testDeployer._getLastOffer(nftUniqueId)
                assert.equal(lastOffer[0].toString(), initialOffer.toString())
                assert.equal(lastOffer[1], ZERO_ADDRESS)
            })
            it("Should return the highest offer - NO REFUND", async () => {
                const highestOffer = ethers.utils.parseEther("3")
                const highestBidder = player3

                await testDeployer.test_modifyNftIdToSellingAuctionOffers(nftUniqueId, highestOffer.sub(2), await player1.getAddress(), false)
                await testDeployer.test_modifyNftIdToSellingAuctionOffers(nftUniqueId, highestOffer.sub(1), await player2.getAddress(), false)
                await testDeployer.test_modifyNftIdToSellingAuctionOffers(nftUniqueId, highestOffer, await highestBidder.getAddress(), false)

                const lastOffer = await testDeployer._getLastOffer(nftUniqueId)
                assert.equal(lastOffer[0].toString(), highestOffer.toString())
                assert.equal(lastOffer[1], await highestBidder.getAddress())
            })
            it("Should return the highest offer - HIGHEST OVERALL REFUNDED", async () => {
                const highestOffer = ethers.utils.parseEther("3")
                const highestBidder = player3

                await testDeployer.test_modifyNftIdToSellingAuctionOffers(nftUniqueId, highestOffer.sub(2), await player1.getAddress(), false)
                await testDeployer.test_modifyNftIdToSellingAuctionOffers(nftUniqueId, highestOffer, await highestBidder.getAddress(), false)
                await testDeployer.test_modifyNftIdToSellingAuctionOffers(nftUniqueId, highestOffer.add(2), await player2.getAddress(), true)

                const lastOffer = await testDeployer._getLastOffer(nftUniqueId)
                assert.equal(lastOffer[0].toString(), highestOffer.toString())
                assert.equal(lastOffer[1], await highestBidder.getAddress())
            })
            it("Should return the highest offer - SOME HOLES", async () => {
                const highestOffer = ethers.utils.parseEther("3")
                const highestBidder = player3

                await testDeployer.test_modifyNftIdToSellingAuctionOffers(nftUniqueId, highestOffer.sub(2), await player1.getAddress(), false)
                await testDeployer.test_modifyNftIdToSellingAuctionOffers(nftUniqueId, highestOffer, await highestBidder.getAddress(), false)
                await testDeployer.test_modifyNftIdToSellingAuctionOffers(nftUniqueId, highestOffer.add(2), await player3.getAddress(), true)

                await testDeployer.test_modifyNftIdToSellingAuctionOffersWithEmptySpace(nftUniqueId, 2)
                await testDeployer.test_modifyNftIdToSellingAuctionOffersWithEmptySpace(nftUniqueId, 0)

                const lastOffer = await testDeployer._getLastOffer(nftUniqueId)
                assert.equal(lastOffer[0].toString(), highestOffer.toString())
                assert.equal(lastOffer[1], await highestBidder.getAddress())
            })
            it("Should return the initial offer - ALL HOLES", async () => {
                const highestOffer = ethers.utils.parseEther("3")
                const highestBidder = player3

                await testDeployer.test_modifyNftIdToSellingAuctionOffers(nftUniqueId, highestOffer.sub(2), await player1.getAddress(), false)
                await testDeployer.test_modifyNftIdToSellingAuctionOffers(nftUniqueId, highestOffer, await highestBidder.getAddress(), false)
                await testDeployer.test_modifyNftIdToSellingAuctionOffers(nftUniqueId, highestOffer.add(2), await player3.getAddress(), true)

                await testDeployer.test_modifyNftIdToSellingAuctionOffersWithEmptySpace(nftUniqueId, 2)
                await testDeployer.test_modifyNftIdToSellingAuctionOffersWithEmptySpace(nftUniqueId, 1)
                await testDeployer.test_modifyNftIdToSellingAuctionOffersWithEmptySpace(nftUniqueId, 0)

                const lastOffer = await testDeployer._getLastOffer(nftUniqueId)
                assert.equal(lastOffer[0].toString(), initialOffer.toString())
                assert.equal(lastOffer[1], ZERO_ADDRESS)
            })
        })
        describe("Get Last Offer From Sender Testing", () => {
            const uri = "THIS_IS_A_TEST"
            const nftUniqueId = 1
            const initialOffer = ethers.utils.parseEther("10")
            const minIncrement = "10"
            const DAYS_10 = 60 * 60 * 24 * 10
            const deadline = Math.floor(Date.now() / 1000) + DAYS_10
            const currency = CurrecyAddress.ETH
            const refundable = true

            let testDeployer: Test, testPlayer_1: Test
            let amount = ethers.utils.parseEther("5")
            beforeEach(async () => {
                testDeployer = test.connect(deployer)
                testPlayer_1 = test.connect(player1)
                await testDeployer.createNft(uri)
                await testDeployer.setSellingAuction(nftUniqueId, initialOffer, refundable, minIncrement, currency, deadline)
            })
            it("Should return 0 - NO OFFERS", async () => {
                const lastOffer = await testDeployer.getLastOfferFromSender(nftUniqueId, await player1.getAddress())
                assert.equal(lastOffer[0].toString(), "0")
                assert.equal(lastOffer[1].toString(), "0")
            })
            it("Should return 0 - NFT NOT EXISTING", async () => {
                const lastOffer = await testDeployer.getLastOfferFromSender(nftUniqueId + 1, await player1.getAddress())
                assert.equal(lastOffer[0].toString(), "0")
                assert.equal(lastOffer[1].toString(), "0")
            })
            it("Should return 0 - SENDER HAS NO OFFER", async () => {
                await testDeployer.test_modifyNftIdToSellingAuctionOffers(nftUniqueId, amount, await player2.getAddress(), false)
                await testDeployer.test_modifyNftIdToSellingAuctionOffers(nftUniqueId, amount.add(1), await player3.getAddress(), false)

                const lastOffer = await testDeployer.getLastOfferFromSender(nftUniqueId, await player1.getAddress())
                assert.equal(lastOffer[0].toString(), "0")
                assert.equal(lastOffer[1].toString(), "0")
            })
            it("Should return the last offer", async () => {
                await testDeployer.test_modifyNftIdToSellingAuctionOffers(nftUniqueId, amount.sub(1), await player2.getAddress(), false)
                await testDeployer.test_modifyNftIdToSellingAuctionOffers(nftUniqueId, amount.add(1), await player3.getAddress(), false)
                await testDeployer.test_modifyNftIdToSellingAuctionOffers(nftUniqueId, amount, await player1.getAddress(), false)

                const lastOffer = await testDeployer.getLastOfferFromSender(nftUniqueId, await player1.getAddress())
                assert.equal(lastOffer[0].toString(), amount.toString())
                assert.equal(lastOffer[1].toString(), "2")
            })
            it("Should return the 0 - OFFERS REFUNDED", async () => {
                await testDeployer.test_modifyNftIdToSellingAuctionOffers(nftUniqueId, amount.sub(1), await player2.getAddress(), false)
                await testDeployer.test_modifyNftIdToSellingAuctionOffers(nftUniqueId, amount.add(1), await player3.getAddress(), false)
                await testDeployer.test_modifyNftIdToSellingAuctionOffers(nftUniqueId, amount, await player1.getAddress(), true)

                const lastOffer = await testDeployer.getLastOfferFromSender(nftUniqueId, await player1.getAddress())
                assert.equal(lastOffer[0].toString(), "0")
                assert.equal(lastOffer[1].toString(), "0")
            })
        })
        describe("Make Offer Auction Testing", () => {
            const uri = "THIS_IS_A_TEST"
            const nftUniqueId = 1
            const initialOffer = ethers.utils.parseEther("10")
            const minIncrement = "10"
            const DAYS_10 = 60 * 60 * 24 * 10
            const deadline = Math.floor(Date.now() / 1000) + DAYS_10
            const refundable = true

            let testDeployer: Test, testPlayer_1: Test, testPlayer_2: Test, testPlayer_3: Test, paymentHolder: Test, erc20Deployer: Erc20
            beforeEach(async () => {
                paymentHolder = await ethers.getContractAt("PaymentHolder", await test.i_paymentHolder())
                testDeployer = test.connect(deployer)
                testPlayer_1 = test.connect(player1)
                testPlayer_2 = test.connect(player2)
                testPlayer_3 = test.connect(player3)
                erc20Deployer = erc20.connect(deployer)

                await erc20Deployer.mint(await deployer.getAddress(), ethers.utils.parseEther("100"))
                await erc20Deployer.transfer(await player1.getAddress(), ethers.utils.parseEther("30"))
                await testDeployer.createNft(uri)
            })
            it("Should Revert - DEADLINE PASSED", async () => {
                const currency = CurrecyAddress.ETH
                const offer = initialOffer.mul(2)
                await testDeployer.setSellingAuction(nftUniqueId, initialOffer, refundable, minIncrement, currency, deadline)

                await helpers.time.increase(DAYS_10 + 1)
                await expect(testPlayer_1.makeOfferAuction(nftUniqueId, offer, {value: offer}))
                    .to.be.revertedWithCustomError(socialNFT, "ERR_AUCTION_DEADLINE_PASSED")
            })
            it("Should revert - Min Increment Not Respected - NO OTHER OFFERS", async () => {
                const currency = CurrecyAddress.ETH
                await testDeployer.setSellingAuction(nftUniqueId, initialOffer, refundable, minIncrement, currency, deadline)

                let amountTest1 = initialOffer
                let amountTest2 = initialOffer.mul((await testDeployer.s_nftIdToSellingAuction(nftUniqueId)).minIncrement.add(100)).div(100).sub(1)
                let amountTest3 = initialOffer.mul((await testDeployer.s_nftIdToSellingAuction(nftUniqueId)).minIncrement.add(100)).div(100)

                await expect(testPlayer_1.makeOfferAuction(nftUniqueId, amountTest1, {value: amountTest1}))
                    .to.be.revertedWithCustomError(socialNFT, "ERR_AUCTION_OFFER_TOO_LOW")
                await expect(testPlayer_1.makeOfferAuction(nftUniqueId, amountTest2, {value: amountTest2}))
                    .to.be.revertedWithCustomError(socialNFT, "ERR_AUCTION_OFFER_TOO_LOW")
                await expect(testPlayer_1.makeOfferAuction(nftUniqueId, amountTest3, {value: amountTest3}))
                    .to.not.be.reverted
            })
            it("Should revert - Min Increment Not Respected - OTHER OFFERS", async () => {
                const currency = CurrecyAddress.ETH
                await testDeployer.setSellingAuction(nftUniqueId, initialOffer, refundable, minIncrement, currency, deadline)
                let amountTest1 = initialOffer.mul((await testDeployer.s_nftIdToSellingAuction(nftUniqueId)).minIncrement.add(100)).div(100)

                await expect(testPlayer_1.makeOfferAuction(nftUniqueId, amountTest1, {value: amountTest1}))
                    .to.not.be.reverted

                let amountTest2 = (await testDeployer._getLastOffer(nftUniqueId))[0].mul((await testDeployer.s_nftIdToSellingAuction(nftUniqueId)).minIncrement.add(100)).div(100)
                await expect(testPlayer_2.makeOfferAuction(nftUniqueId, amountTest1, {value: amountTest1}))
                    .to.be.revertedWithCustomError(socialNFT, "ERR_AUCTION_OFFER_TOO_LOW")
                await expect(testPlayer_2.makeOfferAuction(nftUniqueId, amountTest2, {value: amountTest2}))
                    .to.not.be.reverted

            })
            it("Should not revert - Min Increment Not Respected - OTHER OFFERS - HIGHEST FROM SENDER", async () => {
                const currency = CurrecyAddress.ETH
                await testDeployer.setSellingAuction(nftUniqueId, initialOffer, refundable, minIncrement, currency, deadline)
                let amountTest = initialOffer.mul((await testDeployer.s_nftIdToSellingAuction(nftUniqueId)).minIncrement.add(100)).div(100)
                await testPlayer_1.makeOfferAuction(nftUniqueId, amountTest, {value: amountTest})

                await expect(testPlayer_1.makeOfferAuction(nftUniqueId, 1, {value: 1}))
                    .to.not.be.reverted
            })

            describe("Offer Using Native Currency", () => {
                const currency = CurrecyAddress.ETH
                beforeEach(async () => {
                    await testDeployer.setSellingAuction(nftUniqueId, initialOffer, refundable, minIncrement, currency, deadline)
                })
                it("Should Revert - Amount different from value sent", async () => {
                    const amountSent = initialOffer.mul(2)
                    const amountDeclared = initialOffer.mul(3)
                    await expect(testPlayer_1.makeOfferAuction(nftUniqueId, amountDeclared, {value: amountSent}))
                        .to.be.revertedWithCustomError(socialNFT, "ERR_NFT_BUYING_WRONG_AMOUNT")
                })
                it("Should succeed", async () => {
                    let amount = initialOffer.mul(2)
                    const paymentHolderBalanceBefore = await ethers.provider.getBalance(paymentHolder.address)
                    const deployerBalanceBefore = await deployer.getBalance()
                    const player1BalanceBefore = await player1.getBalance()

                    const txResponse = await testPlayer_1.makeOfferAuction(nftUniqueId, amount, {value: amount})
                    const txReceipt = await txResponse.wait(1)
                    const gasUsed = txReceipt.gasUsed
                    const gasCost = gasUsed.mul(txReceipt.effectiveGasPrice)
                    const auction = await testDeployer.s_nftIdToSellingAuctionOffers(nftUniqueId, 0)

                    const paymentHolderBalanceAfter = await ethers.provider.getBalance(paymentHolder.address)
                    const deployerBalanceAfter = await deployer.getBalance()
                    const player1BalanceAfter = await player1.getBalance()

                    assert.equal(deployerBalanceAfter.toString(), deployerBalanceBefore.toString())
                    assert.equal(player1BalanceAfter.toString(), player1BalanceBefore.sub(amount).sub(gasCost).toString())
                    assert.equal(paymentHolderBalanceAfter.toString(), paymentHolderBalanceBefore.add(amount).toString())

                    assert.equal(auction.amount.toString(), amount.toString())
                    assert.equal(auction.owner, await player1.getAddress())
                    assert.equal(auction.refunded, false)
                })
                it("Should succeed - ALREADY OFFERED", async () => {
                    const amountPlayer1Initial = initialOffer.mul(2)
                    await testPlayer_1.makeOfferAuction(nftUniqueId, amountPlayer1Initial, {value: amountPlayer1Initial})
                    const amountPlayer2 = amountPlayer1Initial.mul(120).div(100)
                    await testPlayer_2.makeOfferAuction(nftUniqueId, amountPlayer2, {value: amountPlayer2})
                    const amountPlayer1After = amountPlayer2.mul((await testDeployer.s_nftIdToSellingAuction(nftUniqueId)).minIncrement.add(100)).div(100).sub(amountPlayer1Initial)

                    const paymentHolderBalanceBefore = await ethers.provider.getBalance(paymentHolder.address)
                    const deployerBalanceBefore = await deployer.getBalance()
                    const player1BalanceBefore = await player1.getBalance()

                    const txResponse = await testPlayer_1.makeOfferAuction(nftUniqueId, amountPlayer1After, {value: amountPlayer1After})
                    const txReceipt = await txResponse.wait(1)
                    const gasUsed = txReceipt.gasUsed
                    const gasCost = gasUsed.mul(txReceipt.effectiveGasPrice)
                    const auctionDestroyed = await testDeployer.s_nftIdToSellingAuctionOffers(nftUniqueId, 0)
                    const auctionPlayer1 = await testDeployer.s_nftIdToSellingAuctionOffers(nftUniqueId, 2)

                    const paymentHolderBalanceAfter = await ethers.provider.getBalance(paymentHolder.address)
                    const deployerBalanceAfter = await deployer.getBalance()
                    const player1BalanceAfter = await player1.getBalance()

                    assert.equal(deployerBalanceAfter.toString(), deployerBalanceBefore.toString())
                    assert.equal(player1BalanceAfter.toString(), player1BalanceBefore.sub(amountPlayer1After).sub(gasCost).toString())
                    assert.equal(paymentHolderBalanceAfter.toString(), paymentHolderBalanceBefore.add(amountPlayer1After).toString())

                    assert.equal(auctionPlayer1.amount.toString(), (amountPlayer1Initial.add(amountPlayer1After)).toString())
                    assert.equal(auctionPlayer1.owner, await player1.getAddress())
                    assert.equal(auctionPlayer1.refunded, false)

                    assert.equal(auctionDestroyed.amount.toString(), "0")
                    assert.equal(auctionDestroyed.owner, ZERO_ADDRESS)
                    assert.equal(auctionDestroyed.refunded, false)
                })

            })
            describe("Offer Using ERC20", () => {
                const currency = CurrecyAddress.DAI
                beforeEach(async () => {
                    await testDeployer.setSellingAuction(nftUniqueId, initialOffer, refundable, minIncrement, currency, deadline)
                })
                it("Should Revert - ERC20 Not allowed", async () => {
                    const amount = initialOffer.mul(2)
                    await expect(testPlayer_1.makeOfferAuction(nftUniqueId, amount))
                        .to.be.revertedWithCustomError(socialNFT, "ERR_NFT_BUYING_ERC20_NEEDS_TO_BE_ALLOWED")
                })
                it("Should succeed - ERC20", async () => {
                    const erc20Player1 = erc20.connect(player1)
                    let amount = initialOffer.mul(2)
                    await erc20Player1.approve(test.address, amount)

                    const paymentHolderBalanceBeforeNative = await ethers.provider.getBalance(paymentHolder.address)
                    const deployerBalanceBeforeNative = await deployer.getBalance()
                    const player1BalanceBeforeNative = await player1.getBalance()

                    const paymentHolderBalanceBeforeERC20 = await erc20.balanceOf(paymentHolder.address)
                    const deployerBalanceBeforeERC20 = await erc20.balanceOf(await deployer.getAddress())
                    const player1BalanceBeforeERC20 = await erc20.balanceOf(await player1.getAddress())

                    const txResponse = await testPlayer_1.makeOfferAuction(nftUniqueId, amount)
                    const txReceipt = await txResponse.wait(1)
                    const gasUsed = txReceipt.gasUsed
                    const gasCost = gasUsed.mul(txReceipt.effectiveGasPrice)
                    const auction = await testDeployer.s_nftIdToSellingAuctionOffers(nftUniqueId, 0)

                    const paymentHolderBalanceAfterNative = await ethers.provider.getBalance(paymentHolder.address)
                    const deployerBalanceAfterNative = await deployer.getBalance()
                    const player1BalanceAfterNative = await player1.getBalance()

                    const paymentHolderBalanceAfterERC20 = await erc20.balanceOf(paymentHolder.address)
                    const deployerBalanceAfterERC20 = await erc20.balanceOf(await deployer.getAddress())
                    const player1BalanceAfterERC20 = await erc20.balanceOf(await player1.getAddress())

                    assert.equal(deployerBalanceAfterNative.toString(), deployerBalanceBeforeNative.toString())
                    assert.equal(player1BalanceAfterNative.toString(), player1BalanceBeforeNative.sub(gasCost).toString())
                    assert.equal(paymentHolderBalanceAfterNative.toString(), paymentHolderBalanceBeforeNative.toString())

                    assert.equal(deployerBalanceAfterERC20.toString(), deployerBalanceBeforeERC20.toString())
                    assert.equal(player1BalanceAfterERC20.toString(), player1BalanceBeforeERC20.sub(amount).toString())
                    assert.equal(paymentHolderBalanceAfterERC20.toString(), paymentHolderBalanceBeforeERC20.add(amount).toString())

                    assert.equal(auction.amount.toString(), amount.toString())
                    assert.equal(auction.owner, await player1.getAddress())
                    assert.equal(auction.refunded, false)
                })

            })

        })
        describe("Withdraw Offer Testing", () => {
            const uri = "THIS_IS_A_TEST"
            const nftUniqueId = 1
            const initialOffer = ethers.utils.parseEther("10")
            const minIncrement = "10"
            const DAYS_10 = 60 * 60 * 24 * 10
            const deadline = Math.floor(Date.now() / 1000) + DAYS_10

            let testDeployer: Test, testPlayer_1: Test, testPlayer_2: Test, testPlayer_3: Test, paymentHolder: Test, erc20Deployer: Erc20
            beforeEach(async () => {
                paymentHolder = await ethers.getContractAt("PaymentHolder", await test.i_paymentHolder())
                testDeployer = test.connect(deployer)
                testPlayer_1 = test.connect(player1)
                testPlayer_2 = test.connect(player2)
                testPlayer_3 = test.connect(player3)
                erc20Deployer = erc20.connect(deployer)

                await erc20Deployer.mint(await deployer.getAddress(), ethers.utils.parseEther("100"))
                await erc20Deployer.transfer(await player1.getAddress(), ethers.utils.parseEther("30"))
                await testDeployer.createNft(uri)
            })
            it("Should Revert - Deadline Passed", async () => {
                const refundable = true
                await testDeployer.setSellingAuction(nftUniqueId, initialOffer, refundable, minIncrement, CurrecyAddress.ETH, deadline)
                await testPlayer_1.makeOfferAuction(nftUniqueId, initialOffer.mul(2), { value: initialOffer.mul(2)})

                await helpers.time.increase(DAYS_10 + 1)
                await expect(testPlayer_1.withdrawOffer(nftUniqueId))
                    .to.be.revertedWithCustomError(socialNFT, "ERR_AUCTION_DEADLINE_PASSED")
            })
            it("Should Revert - Auction Not Refundable", async () => {
                const refundable = false
                await testDeployer.setSellingAuction(nftUniqueId, initialOffer, refundable, minIncrement, CurrecyAddress.ETH, deadline)
                await testPlayer_1.makeOfferAuction(nftUniqueId, initialOffer.mul(2), { value: initialOffer.mul(2)})

                await expect(testPlayer_1.withdrawOffer(nftUniqueId))
                    .to.be.revertedWithCustomError(socialNFT, "ERR_AUCTION_NOT_REFUNDABLE")
            })
            it("Should succeed - ONLY 1 OFFER | NATIVE", async () => {
                const amount = initialOffer.mul(2)
                const refundable = true
                await testDeployer.setSellingAuction(nftUniqueId, initialOffer, refundable, minIncrement, CurrecyAddress.ETH, deadline)
                await testPlayer_1.makeOfferAuction(nftUniqueId, amount, { value: amount})

                const player1BalanceBefore = await player1.getBalance()
                const paymentHolderBalanceBefore = await ethers.provider.getBalance(paymentHolder.address)

                // console.log(ethers.utils.formatEther(paymentHolderBalanceBefore.toString()))

                const txResponse = await testPlayer_1.withdrawOffer(nftUniqueId)
                const tx = await txResponse.wait(1)
                const gasUsed = tx.gasUsed
                const gasCost = gasUsed.mul(tx.effectiveGasPrice)

                const offer = await testPlayer_1.s_nftIdToSellingAuctionOffers(nftUniqueId, 0)
                const player1BalanceAfter = await player1.getBalance()
                const paymentHolderBalanceAfter = await ethers.provider.getBalance(paymentHolder.address)

                assert.equal(offer.refunded, true)
                assert.equal(player1BalanceAfter.toString(), player1BalanceBefore.add(amount).sub(gasCost).toString())
                assert.equal(paymentHolderBalanceAfter.toString(), paymentHolderBalanceBefore.sub(amount).toString())
            })
            it("Should succeed - ONLY 1 OFFER - ALREADY REFUNDED | NATIVE", async () => {
                const amount = initialOffer.mul(2)
                const refundable = true
                await testDeployer.setSellingAuction(nftUniqueId, initialOffer, refundable, minIncrement, CurrecyAddress.ETH, deadline)
                await testPlayer_1.makeOfferAuction(nftUniqueId, amount, { value: amount})
                await testPlayer_1.withdrawOffer(nftUniqueId)

                const player1BalanceBefore = await player1.getBalance()
                const paymentHolderBalanceBefore = await ethers.provider.getBalance(paymentHolder.address)

                const txResponse = await testPlayer_1.withdrawOffer(nftUniqueId)
                const tx = await txResponse.wait(1)
                const gasUsed = tx.gasUsed
                const gasCost = gasUsed.mul(tx.effectiveGasPrice)

                const player1BalanceAfter = await player1.getBalance()
                const paymentHolderBalanceAfter = await ethers.provider.getBalance(paymentHolder.address)

                assert.equal(player1BalanceAfter.toString(), player1BalanceBefore.sub(gasCost).toString())
                assert.equal(paymentHolderBalanceAfter.toString(), paymentHolderBalanceBefore.toString())
            })
            it("Should succeed - MORE OFFERS | NATIVE", async () => {
                const amountPlayer2 = initialOffer.mul(2)
                const amountPlayer1First = amountPlayer2.mul(2)
                const amountPlayer1Second = amountPlayer1First.mul(2)

                const refundable = true
                await testDeployer.setSellingAuction(nftUniqueId, initialOffer, refundable, minIncrement, CurrecyAddress.ETH, deadline)

                await testPlayer_2.makeOfferAuction(nftUniqueId, amountPlayer2, { value: amountPlayer2})
                await testPlayer_1.makeOfferAuction(nftUniqueId, amountPlayer1First, { value: amountPlayer1First})
                await testPlayer_1.makeOfferAuction(nftUniqueId, amountPlayer1Second, { value: amountPlayer1Second})

                const player1BalanceBefore = await player1.getBalance()
                const paymentHolderBalanceBefore = await ethers.provider.getBalance(paymentHolder.address)

                const txResponse = await testPlayer_1.withdrawOffer(nftUniqueId)
                const tx = await txResponse.wait(1)
                const gasUsed = tx.gasUsed
                const gasCost = gasUsed.mul(tx.effectiveGasPrice)

                const player1BalanceAfter = await player1.getBalance()
                const paymentHolderBalanceAfter = await ethers.provider.getBalance(paymentHolder.address)

                assert.equal(player1BalanceAfter.toString(), player1BalanceBefore.add(amountPlayer1First.add(amountPlayer1Second)).sub(gasCost).toString())
                assert.equal(paymentHolderBalanceAfter.toString(), paymentHolderBalanceBefore.sub(amountPlayer1First.add(amountPlayer1Second)).toString())
            })
        })
        describe("Terminate Auction Testing", () => {
            const uri = "THIS_IS_A_TEST"
            const nftUniqueId = 1
            const initialOffer = ethers.utils.parseEther("10")
            const minIncrement = "10"
            const DAYS_10 = 60 * 60 * 24 * 10
            const deadline = Math.floor(Date.now() / 1000) + DAYS_10
            const refundable = true
            const currency = CurrecyAddress.ETH
            const royalties = "25"

            let player4: Signer
            let testDeployer: Test, testPlayer_1: Test, testPlayer_2: Test,
                testPlayer_3: Test, testPlayer_4: Test,
                paymentHolder: Test, erc20Deployer: Erc20
            beforeEach(async () => {
                player4 = (await ethers.getSigners())[4]

                paymentHolder = await ethers.getContractAt("PaymentHolder", await test.i_paymentHolder())
                testDeployer = test.connect(deployer)
                testPlayer_1 = test.connect(player1)
                testPlayer_2 = test.connect(player2)
                testPlayer_3 = test.connect(player3)
                testPlayer_4 = test.connect(player4)
                erc20Deployer = erc20.connect(deployer)

                await erc20Deployer.mint(await deployer.getAddress(), ethers.utils.parseEther("100"))
                await erc20Deployer.transfer(await player1.getAddress(), ethers.utils.parseEther("30"))
                await testDeployer.createNft(uri)
                await testDeployer.setRoyalties(nftUniqueId, royalties)
                await testDeployer.transferFrom(await deployer.getAddress(), await player4.getAddress(), nftUniqueId)
                await testPlayer_4.setSellingAuction(nftUniqueId, initialOffer, refundable, minIncrement, currency, deadline)
            })
            it("Should Revert - DEADLINE NOT PASSED", async () => {
                await expect(testDeployer.terminateAuction(nftUniqueId))
                    .to.be.revertedWithCustomError(socialNFT, "ERR_AUCTION_DEADLINE_NOT_PASSED")
            })
            it("Should Succeed - NO OFFERS", async () => {
                await helpers.time.increase(DAYS_10 + 1)
                await testDeployer.terminateAuction(nftUniqueId)
                const nftStatus = await testDeployer.s_nftIdStatus(nftUniqueId)
                const auction = await testDeployer.s_nftIdToSellingAuction(nftUniqueId)
                assert.equal(nftStatus.sellingType, SellingType.NO_SELLING)
                assert.equal(auction.id.toString(), "0")
            })
            it("Should Succeed - ALL OFFERS REFUNDED", async () => {
                const testAmount1 = initialOffer.mul(Number(minIncrement) + 100).div(100)
                const testAmount2 = testAmount1.mul(Number(minIncrement) + 100).div(100)
                const testAmount3 = testAmount2.mul(Number(minIncrement) + 100).div(100)

                await testPlayer_1.makeOfferAuction(nftUniqueId, testAmount1, {value: testAmount1})
                await testPlayer_2.makeOfferAuction(nftUniqueId, testAmount2, {value: testAmount2})
                await testPlayer_1.withdrawOffer(nftUniqueId)
                await testPlayer_1.makeOfferAuction(nftUniqueId, testAmount3, {value: testAmount3})

                await testPlayer_1.withdrawOffer(nftUniqueId)
                await testPlayer_2.withdrawOffer(nftUniqueId)

                await helpers.time.increase(DAYS_10 + 1)
                await testDeployer.terminateAuction(nftUniqueId)

                const paymentHolderBalanceBefore = await ethers.provider.getBalance(paymentHolder.address)
                const paymentHolderBalanceAfter = await ethers.provider.getBalance(paymentHolder.address)

                const nftStatus = await testDeployer.s_nftIdStatus(nftUniqueId)
                const auction = await testDeployer.s_nftIdToSellingAuction(nftUniqueId)


                assert.equal(nftStatus.sellingType, SellingType.NO_SELLING) // TODO DOUBLE CHECK
                assert.equal(auction.id.toString(), "0")

                assert.equal(paymentHolderBalanceAfter.toString(), paymentHolderBalanceBefore.toString())
            })
            it("Should Calculate Gas Correctly - SENDER IS THE CREATOR", async () => {
                await helpers.time.increase(DAYS_10 + 1)
                await testPlayer_4.terminateAuction(nftUniqueId)
                const gasUsed = await testPlayer_4.s_auctionIdToGasAuction(1)
                assert.equal(gasUsed.gasInitial.toString(), "0")
                assert.equal(gasUsed.gasEnd.toString(), "0")
                assert.equal(gasUsed.payer, ZERO_ADDRESS)
                assert.equal(gasUsed.debtor, ZERO_ADDRESS)
            })
            it("Should Calculate Gas Correctly - SENDER IS NOT THE CREATOR", async () => {
                await helpers.time.increase(DAYS_10 + 1)
                await testPlayer_1.terminateAuction(nftUniqueId)
                const gasUsed = await testDeployer.s_auctionIdToGasAuction(1)
                assert(Number(gasUsed.gasInitial.toString()) > 0, "Gas Initial should be greater than 0")
                assert(Number(gasUsed.gasEnd.toString()) > 0, "Gas End should be greater than 0")
                assert.equal(gasUsed.payer, await player1.getAddress())
                assert.equal(gasUsed.debtor, await player4.getAddress())
            })
            it("Should Succeed - WINNER AND LOSERS", async () => {
                const winner = player2
                const owner = player4
                const creator = deployer

                const loser1 = player1
                const loser2Refunded = player3

                const loserAmount1 = initialOffer.mul(100 + Number(minIncrement)).div(100)
                const winnerAmount = loserAmount1.mul(100 + Number(minIncrement)).div(100)
                const loserAmount2Refunded = winnerAmount.mul(100 + Number(minIncrement)).div(100)

                await testPlayer_1.makeOfferAuction(nftUniqueId, loserAmount1, {value: loserAmount1})
                await testPlayer_2.makeOfferAuction(nftUniqueId, winnerAmount, {value: winnerAmount})
                await testPlayer_3.makeOfferAuction(nftUniqueId, loserAmount2Refunded, {value: loserAmount2Refunded})
                await testPlayer_3.withdrawOffer(nftUniqueId)

                const paymentHolderBalanceBefore = await ethers.provider.getBalance(paymentHolder.address)
                const winnerBalanceBefore = await winner.getBalance()
                const loser1BalanceBefore = await loser1.getBalance()
                const loser2RefundedBalanceBefore = await loser2Refunded.getBalance()
                const creatorBalanceBefore = await creator.getBalance()
                const ownerBalanceBefore = await owner.getBalance()

                await helpers.time.increase(DAYS_10 + 1)
                const txResponse = await testDeployer.terminateAuction(nftUniqueId)
                const txReceipt = await txResponse.wait(1)
                const gasUsed = txReceipt.gasUsed
                const gasCost = gasUsed.mul(txReceipt.effectiveGasPrice)

                const paymentHolderBalanceAfter = await ethers.provider.getBalance(paymentHolder.address)
                const winnerBalanceAfter = await winner.getBalance()
                const loser1BalanceAfter = await loser1.getBalance()
                const loser2RefundedBalanceAfter = await loser2Refunded.getBalance()
                const creatorBalanceAfter = await creator.getBalance()
                const ownerBalanceAfter = await owner.getBalance()

                const amountToOwner = winnerAmount.mul(100 - Number(royalties)).div(100)
                const amountToCreator = winnerAmount.mul(royalties).div(100)

                assert.equal(paymentHolderBalanceAfter.toString(), paymentHolderBalanceBefore.sub(winnerAmount).sub(loserAmount1).toString())
                assert.equal(winnerBalanceAfter.toString(), winnerBalanceBefore.toString())
                assert.equal(loser1BalanceAfter.toString(), loser1BalanceBefore.add(loserAmount1).toString())
                assert.equal(loser2RefundedBalanceAfter.toString(), loser2RefundedBalanceBefore.toString())
                assert.equal(creatorBalanceAfter.toString(), creatorBalanceBefore.add(amountToCreator).sub(gasCost).toString())
                assert.equal(ownerBalanceAfter.toString(), ownerBalanceBefore.add(amountToOwner).toString())
            })
        })
        describe("Reset Selling Status Testing", () => {
            let socialNftDeployer: SocialNFT
            const nftUniqueId = 1
            const uri = "TEST"
            beforeEach(async() => {
                socialNftDeployer = socialNFT.connect(deployer)
                await socialNftDeployer.createNft(uri)
            })
            it("Should Reset the Selling Option", async () => {
                const amount = ethers.utils.parseEther("1")
                const currency = 0

                await socialNftDeployer.setSellingFixedPrice(nftUniqueId, amount, currency)
                await socialNftDeployer.resetSellingStatus(nftUniqueId)

                const resultFixedPrice = await socialNftDeployer.s_nftIdToSellingFixedPrice(nftUniqueId)
                const nftStatus = await socialNftDeployer.s_nftIdStatus(nftUniqueId)

                assert.equal(resultFixedPrice.amount.toString(), "0")
                assert.equal(resultFixedPrice.currency.toString(), ZERO_ADDRESS)

                assert.equal(nftStatus.exist, true)
                assert.equal(nftStatus.sellingType.toString(), "0")
            })
            it("Should Revert is selling is auction", async () => {
                const initialPrice = ethers.utils.parseEther("1")
                const currency = 0
                const refundable = false
                const minIncrement = "10"
                const deadline = Math.floor(new Date().getTime() / 1000) + 3600 * 24 * 10

                await socialNftDeployer.setSellingAuction(nftUniqueId, initialPrice, refundable, minIncrement, currency, deadline)
                await expect(
                    socialNftDeployer.resetSellingStatus(nftUniqueId)
                ).to.be.revertedWithCustomError(socialNFT, "ERR_NFT_RESET_NOT_POSSIBLE_IN_AUCTION_MODE")
            })
        })
        describe("Get NFT id from IPFS", () => {
            let testDeployer: Test
            const nftUniqueId = 1
            const uri = "TEST"
            const wrongUri = "TEST_WRONG"

            beforeEach(async () => {
                testDeployer = test.connect(deployer)
                await testDeployer.createNft(uri)
            })

            it("Should return NFT id", async () => {
                const result = await testDeployer.getNftId(uri)
                assert.equal(result.toString(), nftUniqueId.toString())
            })
            it("Should revert - NFT not existing", async () => {
                await expect(testDeployer.getNftId(wrongUri)).to.be.revertedWithCustomError(socialNFT, "ERR_NFT_NOT_EXISTING")
            })
        })
        describe("Get NFT Creator", () => {
            let testDeployer: Test, testPlayer1: Test

            const amount = ethers.utils.parseEther("1")
            const currency = 0

            const nftUniqueId = 1
            const uri = "TEST"

            beforeEach(async () => {
                testDeployer = test.connect(deployer)
                testPlayer1 = test.connect(player1)

                await testDeployer.createNft(uri)
                await testDeployer.setSellingFixedPrice(nftUniqueId, amount, currency)
            })

            it("Should return the creator", async () => {
                await testPlayer1.buyNftSellingFixedPrice(nftUniqueId, {value: amount})
                const creator = await testDeployer.getOriginalOwner(nftUniqueId)
                assert.equal(creator.owner.toString(), await deployer.getAddress())
            })
            it("Should return the ZERO ADDRESS - No change of property yet", async () => {
                const creator = await testDeployer.getOriginalOwner(nftUniqueId)
                assert.equal(creator.owner.toString(), ZERO_ADDRESS)
            })
        })
        describe("safeTransferFrom Testing", () => {
            let testDeployer: Test, testPlayer: Test
            const nftUniqueId = 1
            const uri = "TEST"

            beforeEach(async () => {
                testDeployer = test.connect(deployer)
                testPlayer = test.connect(player1)
                await testDeployer.createNft(uri)
            })
            it("Should Transfer the Token", async () => {
                await testDeployer["safeTransferFrom(address,address,uint256)"](await deployer.getAddress(), await player1.getAddress(), nftUniqueId)
                const result = await testDeployer.ownerOf(nftUniqueId)
                assert.equal(result.toString(), await player1.getAddress())
            })
            it("Should Revert - NFT NOT EXISTING", async () => {
                await expect(
                    testDeployer["safeTransferFrom(address,address,uint256)"](await deployer.getAddress(), await player1.getAddress(), nftUniqueId + 1)
                ).to.be.reverted
            })
            it("Should Revert - NOT OWNER", async () => {
                await expect(
                    testPlayer["safeTransferFrom(address,address,uint256)"](await deployer.getAddress(), await player1.getAddress(), nftUniqueId)
                ).to.be.reverted
            })
        })
    })


