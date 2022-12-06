import {HardhatRuntimeEnvironment} from "hardhat/types";
import {network} from "hardhat";
import {developmentChain, networkConfig} from "../hardhat-config-helper";
import exp from "constants";

const tests = async (hre: HardhatRuntimeEnvironment) => {
    const {getNamedAccounts, deployments, ethers, network} = hre
    const deployer = (await getNamedAccounts()).deployer
    const {log, deploy} = deployments

    if(developmentChain.includes(network.name)){
        await deploy("Test", {
            log: true,
            args: [],
            from: deployer,
            waitConfirmations: 1
        })
        await deploy("TestNftReceiver", {
            log: true,
            args: [],
            from: deployer,
            waitConfirmations: 1
        })
    }
}

export default tests
tests.tags = ["test", "all"]