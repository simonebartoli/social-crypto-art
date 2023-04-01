import {developmentChain} from "../../hardhat-config-helper";
import {deployments, ethers, network} from "hardhat";
import {Erc20, PaymentHolder, Test} from "../../typechain-types";
import {BigNumber, Signer} from "ethers";
import {assert} from "chai";
import * as helpers from "@nomicfoundation/hardhat-network-helpers"

!developmentChain.includes(network.name) ? describe.skip :
    describe("Payment Holder Testing", () => {
        let test: Test, erc20: Erc20
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
            erc20 = await ethers.getContract("Erc20")
            currency = await test.getTokenAddress(CurrecyAddress.ETH)
        })
        describe("Modifier Testing", () => {
            let testDeployer: Test
            beforeEach(async () => {
                testDeployer = test.connect(deployer)
            })
            // it("Should allow only the Social NFT", async () => {
            //     await expect(testDeployer.test_modifier_onlySocialNftContract())
            //         .to.be.revertedWithCustomError(test, "ERR_ONLY_SOCIAL_NFT")
            // })
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
                assert(payment.date.toString() >= String(currentTime - 30) && payment.date.toString() <= String(currentTime + 30), `Payment Date is ${payment.date} and current time is ${currentTime}`)
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
                assert(payment.date.toString() >= String(newCurrentTime - 30) && payment.date.toString() <= String(newCurrentTime + 30),
                    `Date is ${payment.date.toString()} and should be between ${String(newCurrentTime - 30)} and ${String(newCurrentTime + 30)}`)
            })
        })
        describe("Withdraw Payment Testing", () => {
            let erc20Deployer: Erc20, paymentHolder: PaymentHolder, paymentHolderDeployer: PaymentHolder, paymentHolderPlayer1: PaymentHolder
            const auctionId = 1
            beforeEach(async () => {
                erc20Deployer = await ethers.getContract("Erc20", deployer)
                paymentHolder = await ethers.getContractAt("PaymentHolder", await test.i_paymentHolder())

                paymentHolderDeployer = paymentHolder.connect(deployer)
                paymentHolderPlayer1 = paymentHolder.connect(player1)

                await erc20Deployer.mint(await deployer.getAddress(), ethers.utils.parseEther("100"))
                await erc20Deployer.transfer(await player1.getAddress(), ethers.utils.parseEther("30"))
            })
            it("Should Withdraw Correctly - Native Currency", async () => {
                currency = await test.getTokenAddress(CurrecyAddress.ETH)

                const sendMoney = {
                    to: paymentHolder.address,
                    value: amount
                }
                await player1.sendTransaction(sendMoney)
                await paymentHolderPlayer1.addNewHoldPayment_Auction(auctionId, await player1.getAddress(), amount, currency)


                const paymentHolderBalanceBefore = await ethers.provider.getBalance(paymentHolder.address)
                const player1BalanceBefore = await player1.getBalance()

                const txResponse = await paymentHolderPlayer1.withdrawPayment(auctionId, amount, await player1.getAddress(), currency)
                const tx = await txResponse.wait(1)
                const gasUsed = tx.gasUsed
                const gasCost = gasUsed.mul(tx.effectiveGasPrice)

                const offer = await paymentHolder.s_address_to_payment_hold(await player1.getAddress(), auctionId)
                const paymentHolderBalanceAfter = await ethers.provider.getBalance(paymentHolder.address)
                const player1BalanceAfter = await player1.getBalance()

                assert.equal(paymentHolderBalanceAfter.toString(), paymentHolderBalanceBefore.sub(amount).toString())
                assert.equal(player1BalanceAfter.toString(), player1BalanceBefore.add(amount).sub(gasCost).toString())
                assert.equal(offer.refunded, true)
            })
            it("Should Withdraw Correctly - ERC20", async () => {
                currency = await test.getTokenAddress(CurrecyAddress.DAI)
                await erc20Deployer.transfer(paymentHolder.address, amount)

                await paymentHolderPlayer1.addNewHoldPayment_Auction(auctionId, await player1.getAddress(), amount, currency)

                const paymentHolderBalanceBefore = await erc20Deployer.balanceOf(paymentHolder.address)
                const player1BalanceBefore = await erc20Deployer.balanceOf(await player1.getAddress())
                const player1BalanceBeforeNative = await player1.getBalance()

                const txResponse = await paymentHolderPlayer1.withdrawPayment(auctionId, amount, await player1.getAddress(), currency)
                const tx = await txResponse.wait(1)
                const gasUsed = tx.gasUsed
                const gasCost = gasUsed.mul(tx.effectiveGasPrice)

                const offer = await paymentHolder.s_address_to_payment_hold(await player1.getAddress(), auctionId)
                const paymentHolderBalanceAfter = await erc20Deployer.balanceOf(paymentHolder.address)
                const player1BalanceAfter = await erc20Deployer.balanceOf(await player1.getAddress())
                const player1BalanceAfterNative = await player1.getBalance()

                assert.equal(paymentHolderBalanceAfter.toString(), paymentHolderBalanceBefore.sub(amount).toString())
                assert.equal(player1BalanceAfter.toString(), player1BalanceBefore.add(amount).toString())
                assert.equal(player1BalanceAfterNative.toString(), player1BalanceBeforeNative.sub(gasCost).toString())
                assert.equal(offer.refunded, true)
            })
        })
        describe("Cancel Payments Testing", () => {
            let erc20Deployer: Erc20, erc20Player1: Erc20, erc20Player2: Erc20,
                paymentHolder: PaymentHolder,
                paymentHolderDeployer: PaymentHolder, paymentHolderPlayer1: PaymentHolder, paymentHolderPlayer2: PaymentHolder
            const auctionId = 1
            beforeEach(async () => {
                erc20Deployer = erc20.connect(deployer)
                erc20Player1 = erc20.connect(player1)
                erc20Player2 = erc20.connect(player2)

                paymentHolder = await ethers.getContractAt("PaymentHolder", await test.i_paymentHolder())

                paymentHolderDeployer = paymentHolder.connect(deployer)
                paymentHolderPlayer1 = paymentHolder.connect(player1)
                paymentHolderPlayer2 = paymentHolder.connect(player2)

                await erc20Deployer.mint(await deployer.getAddress(), ethers.utils.parseEther("1000"))
            })
            describe("Refund using Native Currency", () => {
                let currency: string
                const initialOffer = ethers.utils.parseEther("1")

                let amountTest1: BigNumber, amountTest2: BigNumber, amountTest3: BigNumber

                beforeEach(async () => {
                    currency = await test.getTokenAddress(CurrecyAddress.ETH)

                    amountTest1 = initialOffer.mul(Math.ceil(Math.random()*100) + 100).div(100)
                    amountTest2 = initialOffer.mul(Math.ceil(Math.random()*100) + 100).div(100)
                    amountTest3 = initialOffer.mul(Math.ceil(Math.random()*100) + 100).div(100)

                    const sendMoneyDeployer = {
                        to: paymentHolder.address,
                        value: amountTest1
                    }
                    const sendMoneyPlayer1 = {
                        to: paymentHolder.address,
                        value: amountTest2
                    }
                    const sendMoneyPlayer2 = {
                        to: paymentHolder.address,
                        value: amountTest3
                    }
                    await deployer.sendTransaction(sendMoneyDeployer)
                    await player1.sendTransaction(sendMoneyPlayer1)
                    await player2.sendTransaction(sendMoneyPlayer2)

                    await paymentHolder.addNewHoldPayment_Auction(
                        auctionId,
                        await deployer.getAddress(),
                        amountTest1,
                        currency
                    )
                    await paymentHolderPlayer1.addNewHoldPayment_Auction(
                        auctionId,
                        await player1.getAddress(),
                        amountTest2,
                        currency
                    )
                    await paymentHolderPlayer2.addNewHoldPayment_Auction(
                        auctionId,
                        await player2.getAddress(),
                        amountTest3,
                        currency
                    )
                })
                it("Should Refund Everyone NATIVE", async () => {
                    const deployerBalanceBefore = await deployer.getBalance()
                    const player1BalanceBefore = await player1.getBalance()
                    const player2BalanceBefore = await player2.getBalance()
                    const paymentHolderBalanceBefore = await ethers.provider.getBalance(paymentHolder.address)

                    const txResponse_deployer = await paymentHolderDeployer.cancelPayment(auctionId, await deployer.getAddress())
                    const txResponse_player1 = await paymentHolderPlayer1.cancelPayment(auctionId, await player1.getAddress())
                    const txResponse_player2 = await paymentHolderPlayer2.cancelPayment(auctionId, await player2.getAddress())

                    const tx_deployer = await txResponse_deployer.wait(1)
                    const tx_player1 = await txResponse_player1.wait(1)
                    const tx_player2 = await txResponse_player2.wait(1)

                    const gasUsed_deployer = tx_deployer.gasUsed
                    const gasCost_deployer = gasUsed_deployer.mul(tx_deployer.effectiveGasPrice)

                    const gasUsed_player1 = tx_player1.gasUsed
                    const gasCost_player1 = gasUsed_player1.mul(tx_player1.effectiveGasPrice)

                    const gasUsed_player2 = tx_player2.gasUsed
                    const gasCost_player2 = gasUsed_player2.mul(tx_player2.effectiveGasPrice)

                    const deployerBalanceAfter = await deployer.getBalance()
                    const player1BalanceAfter = await player1.getBalance()
                    const player2BalanceAfter = await player2.getBalance()
                    const paymentHolderBalanceAfter = await ethers.provider.getBalance(paymentHolder.address)

                    // console.log("balanceBefore: ", ethers.utils.formatEther(player1BalanceBefore))
                    // console.log("balanceAfter : ", ethers.utils.formatEther(player1BalanceAfter))
                    // console.log("Result       : ", ethers.utils.formatEther(player1BalanceAfter.add(gasCost_player1).sub(amountTest2).sub(player1BalanceBefore)))
                    //
                    // console.log("amount       : ", ethers.utils.formatEther(amountTest2))
                    // console.log("gasCost      : ", ethers.utils.formatEther(gasCost_player1))


                    assert.equal(deployerBalanceAfter.toString(), deployerBalanceBefore.add(amountTest1).sub(gasCost_deployer).toString())
                    assert.equal(player1BalanceAfter.toString(), player1BalanceBefore.add(amountTest2).sub(gasCost_player1).toString())
                    assert.equal(player2BalanceAfter.toString(), player2BalanceBefore.add(amountTest3).sub(gasCost_player2).toString())
                    assert.equal(paymentHolderBalanceAfter.toString(), paymentHolderBalanceBefore.sub(amountTest1).sub(amountTest2).sub(amountTest3).toString())
                })
            })
            describe("Refund using ERC20 Currency", () => {
                let currency: string
                const initialOffer = ethers.utils.parseEther("1")
                let amountTest1: BigNumber, amountTest2: BigNumber, amountTest3: BigNumber

                beforeEach(async () => {
                    await erc20Deployer.transfer(await player1.getAddress(), ethers.utils.parseEther("100"))
                    await erc20Deployer.transfer(await player2.getAddress(), ethers.utils.parseEther("100"))

                    currency = await test.getTokenAddress(CurrecyAddress.DAI)

                    amountTest1 = initialOffer.mul(Math.ceil(Math.random()*100) + 100).div(100)
                    amountTest2 = initialOffer.mul(Math.ceil(Math.random()*100) + 100).div(100)
                    amountTest3 = initialOffer.mul(Math.ceil(Math.random()*100) + 100).div(100)

                    await erc20Deployer.transfer(paymentHolder.address, amountTest1)
                    await erc20Player1.transfer(paymentHolder.address, amountTest2)
                    await erc20Player2.transfer(paymentHolder.address, amountTest3)

                    await paymentHolder.addNewHoldPayment_Auction(
                        auctionId,
                        await deployer.getAddress(),
                        amountTest1,
                        currency
                    )
                    await paymentHolderPlayer1.addNewHoldPayment_Auction(
                        auctionId,
                        await player1.getAddress(),
                        amountTest2,
                        currency
                    )
                    await paymentHolderPlayer2.addNewHoldPayment_Auction(
                        auctionId,
                        await player2.getAddress(),
                        amountTest3,
                        currency
                    )
                })
                it("Should Refund Everyone ERC20", async () => {
                    const deployerBalanceBefore = await erc20.balanceOf(await deployer.getAddress())
                    const player1BalanceBefore = await erc20.balanceOf(await player1.getAddress())
                    const player2BalanceBefore = await erc20.balanceOf(await player2.getAddress())
                    const paymentHolderBalanceBefore = await erc20.balanceOf(paymentHolder.address)

                    await paymentHolderDeployer.cancelPayment(auctionId, await deployer.getAddress())
                    await paymentHolderPlayer1.cancelPayment(auctionId, await player1.getAddress())
                    await paymentHolderPlayer2.cancelPayment(auctionId, await player2.getAddress())

                    const deployerBalanceAfter = await erc20.balanceOf(await deployer.getAddress())
                    const player1BalanceAfter =  await erc20.balanceOf(await player1.getAddress())
                    const player2BalanceAfter = await erc20.balanceOf(await player2.getAddress())
                    const paymentHolderBalanceAfter = await erc20.balanceOf(paymentHolder.address)

                    assert.equal(deployerBalanceAfter.toString(), deployerBalanceBefore.add(amountTest1).toString())
                    assert.equal(player1BalanceAfter.toString(), player1BalanceBefore.add(amountTest2).toString())
                    assert.equal(player2BalanceAfter.toString(), player2BalanceBefore.add(amountTest3).toString())
                    assert.equal(paymentHolderBalanceAfter.toString(), paymentHolderBalanceBefore.sub(amountTest1).sub(amountTest2).sub(amountTest3).toString())
                })
            })
        })
        describe("Execute Payment Testing", () => {
            let erc20Deployer: Erc20, erc20Player1: Erc20, erc20Player2: Erc20,
                paymentHolder: PaymentHolder, creator: Signer,
                paymentHolderDeployer: PaymentHolder, paymentHolderPlayer1: PaymentHolder, paymentHolderPlayer2: PaymentHolder, paymentHolderPlayer3: PaymentHolder
            const auctionId = 1
            beforeEach(async () => {
                creator = player3
                erc20Deployer = erc20.connect(deployer)
                erc20Player1 = erc20.connect(player1)
                erc20Player2 = erc20.connect(player2)

                paymentHolder = await ethers.getContractAt("PaymentHolder", await test.i_paymentHolder())

                paymentHolderDeployer = paymentHolder.connect(deployer)
                paymentHolderPlayer1 = paymentHolder.connect(player1)
                paymentHolderPlayer2 = paymentHolder.connect(player2)
                paymentHolderPlayer3 = paymentHolder.connect(player3)

                await erc20Deployer.mint(await deployer.getAddress(), ethers.utils.parseEther("1000"))
            })
            describe("Payment using Native Currency", () => {
                let currency: string
                const initialOffer = ethers.utils.parseEther("1")
                let amountTest1: BigNumber
                beforeEach(async () => {
                    currency = await test.getTokenAddress(CurrecyAddress.ETH)
                    amountTest1 = initialOffer.mul(Math.ceil(Math.random()*100) + 100).div(100)
                    const sendMoneyPlayer1 = {
                        to: paymentHolder.address,
                        value: amountTest1
                    }
                    await player1.sendTransaction(sendMoneyPlayer1)
                    await paymentHolderPlayer1.addNewHoldPayment_Auction(
                        auctionId,
                        await player1.getAddress(),
                        amountTest1,
                        currency
                    )
                })
                it("Should Pay the address passed with the correct amount", async () => {
                    const deployerBalanceBefore = await deployer.getBalance()
                    const player1BalanceBefore = await player1.getBalance()
                    const paymentHolderBalanceBefore = await ethers.provider.getBalance(paymentHolder.address)

                    const txResponse = await paymentHolderDeployer.executePayment(await player1.getAddress(), await deployer.getAddress(), auctionId, amountTest1)
                    const txReceipt = await txResponse.wait(1)
                    const gasUsed = txReceipt.gasUsed
                    const gasCost = gasUsed.mul(txReceipt.effectiveGasPrice)

                    const deployerBalanceAfter = await deployer.getBalance()
                    const player1BalanceAfter =  await player1.getBalance()
                    const paymentHolderBalanceAfter = await ethers.provider.getBalance(paymentHolder.address)

                    const s_address_to_payment_hold = await paymentHolder.s_address_to_payment_hold(await player1.getAddress(), auctionId)

                    assert.equal(s_address_to_payment_hold.amount.toString(), "0", "s_address_to_payment_hold Balance is not correct")
                    assert.equal(deployerBalanceAfter.toString(), deployerBalanceBefore.add(amountTest1).sub(gasCost).toString(), "Deployer Balance is not correct")
                    assert.equal(player1BalanceAfter.toString(), player1BalanceBefore.toString(), "Winner Balance is not correct")
                    assert.equal(paymentHolderBalanceAfter.toString(), paymentHolderBalanceBefore.sub(amountTest1).toString(), "Payment Holder Balance is not correct")
                })
            })
            describe("Payment using ERC20", () => {
                let currency: string
                const initialOffer = ethers.utils.parseEther("1")

                let amountTest1: BigNumber
                beforeEach(async () => {
                    currency = await test.getTokenAddress(CurrecyAddress.DAI)
                    amountTest1 = initialOffer.mul(Math.ceil(Math.random()*100) + 100).div(100)
                    await erc20Deployer.mint(await player1.getAddress(), amountTest1)
                    await erc20Player1.transfer(paymentHolder.address, amountTest1)
                    await paymentHolderPlayer1.addNewHoldPayment_Auction(
                        auctionId,
                        await player1.getAddress(),
                        amountTest1,
                        currency
                    )
                })
                it("Should Pay the creator, the owner and refunds the others - ERC20", async () => {
                    const deployerBalanceBefore = await erc20.balanceOf(await deployer.getAddress())
                    const player1BalanceBefore = await erc20.balanceOf(await player1.getAddress())
                    const paymentHolderBalanceBefore = await erc20.balanceOf(paymentHolder.address)

                    await paymentHolderDeployer.executePayment(await player1.getAddress(), await deployer.getAddress(), auctionId, amountTest1)

                    const deployerBalanceAfter = await erc20.balanceOf(await deployer.getAddress())
                    const player1BalanceAfter =  await erc20.balanceOf(await player1.getAddress())
                    const paymentHolderBalanceAfter = await erc20.balanceOf(paymentHolder.address)
                    const s_address_to_payment_hold = await paymentHolder.s_address_to_payment_hold(await player1.getAddress(), auctionId)

                    assert.equal(s_address_to_payment_hold.amount.toString(), "0", "s_address_to_payment_hold Balance is not correct")
                    assert.equal(deployerBalanceAfter.toString(), deployerBalanceBefore.add(amountTest1).toString(), "Deployer Balance is not correct")
                    assert.equal(player1BalanceAfter.toString(), player1BalanceBefore.toString(), "Player1 Balance is not correct")
                    assert.equal(paymentHolderBalanceAfter.toString(), paymentHolderBalanceBefore.sub(amountTest1).toString(), "Payment Holder Balance is not correct")
                })
            })
        })
    })