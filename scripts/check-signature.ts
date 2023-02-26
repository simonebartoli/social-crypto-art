import {HardhatRuntimeEnvironment} from "hardhat/types";
import {deployments, ethers, getNamedAccounts} from "hardhat";
import {VerifySignature} from "../typechain-types";
import {Signer, Wallet} from "ethers";
import {DateTime} from "luxon";

const checkSignature = async () => {
    await deployments.fixture()
    const signer = (await ethers.getSigners())[1]
    const verifySignature: VerifySignature = await ethers.getContract("VerifySignature")
    const verifySignatureAddress = verifySignature.address
    let date = DateTime.now().toISO()
    const ip = "::1"

    const privateKey = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
    const wallet = new ethers.Wallet(privateKey)

    const publicKey = wallet.publicKey
    const mnemonic = wallet.mnemonic
    const address = wallet.address

    console.log(`PRIVATE KEY: ${privateKey}`)
    console.log(`PUBLIC KEY: ${publicKey}`)
    console.log(`ADDRESS: ${address}`)
    console.log(`MNEMONIC: ${mnemonic}`)

    

    const messageHashed = await verifySignature.getMessageHash(signer.address, verifySignatureAddress, date, ip)

    console.log(messageHashed)

    console.log("Signer: " + signer.address)
    console.log("Contract: " + verifySignatureAddress)
    console.log("------------------")

    console.log(DateTime.fromISO(date).toJSDate())
    const sig = await signer.signMessage(ethers.utils.arrayify(messageHashed))
    console.log(sig)

    console.log(await verifySignature.getAddressFromSignature(signer.address, verifySignatureAddress, date, ip, sig))
    console.log(await verifySignature.verifySignature(signer.address, verifySignatureAddress, date, ip, sig))
}

checkSignature()
    .then(() => console.log("DONE"))
    .catch((e) => {
        console.log(e)
        process.exit(-1)
    })