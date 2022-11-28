import {HardhatRuntimeEnvironment} from "hardhat/types";
import {deployments, ethers, getNamedAccounts} from "hardhat";
import {ListenForEvents, VerifySignature} from "../typechain-types";
import {Signer, Wallet} from "ethers";

const eventListener = async () => {
    // await deployments.fixture("events")
    // const listenForEvents: ListenForEvents = await ethers.getContract("ListenForEvents")
    //
    // console.log("LISTENING...")
    // await new Promise(async (resolve, reject) => {
    //     await listenForEvents.on("NewNumber", async (number) => {
    //         console.log("\nNEW EVENT FIRED")
    //         console.log("Number: " + number)
    //     })
    // })
}

eventListener()
    .then(() => console.log("DONE"))
    .catch((e) => {
        console.log(e)
        process.exit(-1)
    })