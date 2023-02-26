import {HardhatRuntimeEnvironment} from "hardhat/types";
import {deployments, ethers, getNamedAccounts} from "hardhat";
import {VerifySignature} from "../typechain-types";
import {Signer, Wallet} from "ethers";
import {DateTime} from "luxon";
import * as crypto from "crypto";
import {isBigInt} from "hardhat/internal/util/bigint";

const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
const secret = "THIS IS MY PASSWORD"

const checkSignature = async () => {
    await deployments.fixture()

    const verifySignature: VerifySignature = await ethers.getContract("VerifySignature")
    const verifySignatureAddress = verifySignature.address

    let date = DateTime.now().toISO()
    const ip = "::1"

    const wallet = new ethers.Wallet(privateKey)

    const publicKey = wallet.publicKey
    const mnemonic = wallet.mnemonic
    const address = wallet.address

    const data = {
        privateKey: privateKey,
        publicKey: publicKey,
        address: address,
        mnemonic: mnemonic
    }

    const salt = crypto.randomBytes(32)
    const iv = crypto.randomBytes(16)

    const hashedPassword = crypto.pbkdf2Sync(secret, salt, 10, 32, "sha256")
    const hashedPassword2 = crypto.pbkdf2Sync(secret, salt, 10, 32, "sha256")

    console.log(hashedPassword.toString("base64"))
    console.log(hashedPassword2.toString("base64"))

    const cipher = crypto.createCipheriv("aes-256-gcm", hashedPassword, iv)
    const encrypted = Buffer.concat([cipher.update(JSON.stringify(data)), cipher.final()])


    console.log(`IV: ${iv.toString("hex")}`)
    console.log(`PACKET: ${encrypted.toString("hex")}`)
    // console.log(`PACKET (BASE64): ${encrypted.toString("base64")}\n\n`)

    const finalPacket = Buffer.from(JSON.stringify({
        packet: encrypted.toString("base64"),
        iv: iv.toString("base64"),
        salt: salt.toString("base64")
    }), "utf-8").toString("base64")

    console.log(`\n\nFINAL PACKET: ${finalPacket}\n\n`)

    console.log(`PRIVATE KEY: ${privateKey}`)
    console.log(`PUBLIC KEY: ${publicKey}`)
    console.log(`ADDRESS: ${address}`)
    console.log(`MNEMONIC: ${mnemonic}`)



    const messageHashed = await verifySignature.getMessageHash(address, verifySignatureAddress, date, ip)

    console.log(messageHashed)

    console.log("Signer: " + address)
    console.log("Contract: " + verifySignatureAddress)
    console.log("------------------")

    console.log(DateTime.fromISO(date).toJSDate())
    const sig = await wallet.signMessage(ethers.utils.arrayify(messageHashed))
    console.log(sig)

    console.log(await verifySignature.getAddressFromSignature(address, verifySignatureAddress, date, ip, sig))
    console.log(await verifySignature.verifySignature(address, verifySignatureAddress, date, ip, sig))
}

checkSignature()
    .then(() => console.log("DONE"))
    .catch((e) => {
        console.log(e)
        process.exit(-1)
    })