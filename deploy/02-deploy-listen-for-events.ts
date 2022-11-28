import {HardhatRuntimeEnvironment} from "hardhat/types";

const listenForEvents = async (hre: HardhatRuntimeEnvironment) => {
    // const {ethers, getNamedAccounts, deployments} = hre
    // const {log, deploy} = deployments
    //
    // const deployer = (await getNamedAccounts()).deployer
    //
    // const tx = await deploy("ListenForEvents", {
    //     log: true,
    //     from: deployer,
    //     waitConfirmations: 1
    // })
}

export default listenForEvents
listenForEvents.tags = ["events"]