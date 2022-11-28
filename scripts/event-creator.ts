import {HardhatRuntimeEnvironment} from "hardhat/types";
import {deployments, ethers, getNamedAccounts} from "hardhat";
import {ListenForEvents, VerifySignature} from "../typechain-types";
import {Signer, Wallet} from "ethers";

const eventCreator = async () => {
    const signer = (await getNamedAccounts()).signer
    const listenForEvents: ListenForEvents = await ethers.getContract("ListenForEvents", signer)

    await listenForEvents.createNewEvent("12345")
}

eventCreator()
    .then(() => console.log("DONE"))
    .catch((e) => {
        console.log(e)
        process.exit(-1)
    })