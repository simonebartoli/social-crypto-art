import {developmentChain} from "../../hardhat-config-helper";
import {deployments, ethers, network} from "hardhat";
import {Erc20, SocialNFT, Test, TestNftReceiver} from "../../typechain-types";
import {Signer} from "ethers";
import {assert, expect} from "chai";
import {before} from "mocha";

// The Contracts and ContractFactorys returned by these helpers are connected to the first signer returned by getSigners by default,
// if available. For Contracts if no signers are available it fallback to a read-only provider.


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
            it("Should set Erc20 Payments Contract Correctly", async () => {
                const erc20PaymentsAddress = await socialNFT.i_erc20Payments()
                assert.notEqual(erc20PaymentsAddress, ZERO_ADDRESS)
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
                assert(ownedSince > currentTimestamp - 10 && ownedSince < currentTimestamp + 10)
            })
            it("Should increment the unique NFT id", async () => {
                const nftUniqueId = await socialNFT.s_nftUniqueId()
                assert.equal(nftUniqueId.toString(), (initialNftUniqueId + 1).toString())
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
        describe("Get Selling FIXED PRICE Testing", () => {
            const uri = "THIS_IS_A_TEST"
            const nftUniqueId = 1
            const amount = ethers.utils.parseEther("10")
            const currency = CurrecyAddress.ETH

            let testDeployer: Test, testPlayer: Test
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
            const nftUniqueId = 1

            let testDeployer: Test, testPlayer: Test, ownedSince: string
            beforeEach(async () => {
                testDeployer = test.connect(deployer)
                testPlayer = test.connect(player1)
                await testDeployer.createNft(uri)

                ownedSince = (await testDeployer.s_nftIdStatus(nftUniqueId)).ownedSince.toString()
                await testDeployer._transferNft(nftUniqueId, await player1.getAddress())
                await testDeployer._postTransferNft(nftUniqueId, await deployer.getAddress(), ownedSince)
            })
            it("Should set 's_nftIdToPastOwners' correctly", async () => {
                const status = await testDeployer.s_nftIdToPastOwners(nftUniqueId, 0)
                const currentTimestamp = Math.floor(Date.now() / 1000)
                assert.equal(status.owner, await deployer.getAddress())
                assert.equal(status.start_date.toString(), ownedSince.toString())
                assert(Number(status.end_date) > currentTimestamp - 10 && Number(status.end_date) < currentTimestamp + 10)
            })
            it("Should set the status correctly", async () => {
                const status = await testDeployer.s_nftIdStatus(nftUniqueId)
                const currentTimestamp = Math.floor(Date.now() / 1000)
                assert.equal(status.sellingType, SellingType.NO_SELLING)
                assert(Number(status.ownedSince) > currentTimestamp - 10 && Number(status.ownedSince) < currentTimestamp + 10)
            })
            it("Should ", async () => {
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
                it("", async () => {

                })
            })
        })
    })