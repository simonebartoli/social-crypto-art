import {developmentChain} from "../../hardhat-config-helper";
import {deployments, ethers, network} from "hardhat";
import {VerifySignature} from "../../typechain-types";
import {Signer} from "ethers";
import {assert, expect} from "chai";

!developmentChain.includes(network.name) ? describe.skip :
    describe("Verify Signature Test", () => {
        let verifySignature: VerifySignature
        let signer: Signer
        let hashContract: string
        let from: string

        const to = "0x1000000000000000000000000000000000000001"
        const date = new Date().toISOString()
        const ip = "127.0.0.1"

        beforeEach(async () => {
            await deployments.fixture()
            verifySignature = await ethers.getContract("VerifySignature")
            signer = (await ethers.getSigners())[0]
            from = await signer.getAddress()
            hashContract = await verifySignature.getMessageHash(from, to, date, ip)
        })
        it("Should create the hash correctly", async () => {
            const hashCalculated = ethers.utils.solidityKeccak256(["address", "address", "string", "string"], [from, to, date, ip])
            assert.equal(hashCalculated, hashContract)
        })
        describe("Verify Signature", () => {
            it("Should Return Correct", async () => {
                const signedMessage = await signer.signMessage(ethers.utils.arrayify(hashContract))
                const resultVerification = await verifySignature.verifySignature(
                    from,
                    to,
                    date,
                    ip,
                    signedMessage
                )
                assert.equal(resultVerification, true)
            })
            it("Should Return Not Correct", async () => {
                const wrongSigner = (await ethers.getSigners())[1]

                const signedMessage = await wrongSigner.signMessage(ethers.utils.arrayify(hashContract))
                const resultVerification = await verifySignature.verifySignature(
                    from,
                    to,
                    date,
                    ip,
                    signedMessage
                )
                assert.equal(resultVerification, false)
            })
            it("Should Return Error", async () => {
                await expect(verifySignature.verifySignature(
                    from,
                    to,
                    date,
                    ip,
                    ethers.utils.arrayify(0)
                )).to.be.reverted
            })
        })
    })