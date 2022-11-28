import {HardhatRuntimeEnvironment} from "hardhat/types";
import {deployments, ethers, getNamedAccounts} from "hardhat";
import {VerifySignature} from "../typechain-types";
import {Signer, Wallet} from "ethers";

const checkSignature = async () => {
    await deployments.fixture()
    const verifySignature: VerifySignature = await ethers.getContract("VerifySignature")
    const verifySignatureAddress = verifySignature.address
    let date = "21102022"

    const messageHashed = await verifySignature.getMessageHash(verifySignatureAddress, date)

    // console.log(messageHashed)

    const signer = (await ethers.getSigners())[0]
    console.log("Signer: " + signer.address)
    console.log("Contract: " + verifySignatureAddress)
    console.log("------------------")

    const sig = await signer.signMessage(ethers.utils.arrayify(messageHashed))

    // ---------------------------------------------------------------

    date = "21102022"
    const result = await verifySignature.verify(verifySignatureAddress, date, signer.address, sig)
    console.log(result)
}

checkSignature()
    .then(() => console.log("DONE"))
    .catch((e) => {
        console.log(e)
        process.exit(-1)
    })