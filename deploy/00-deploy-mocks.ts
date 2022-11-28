import {HardhatRuntimeEnvironment} from "hardhat/types";
import {network} from "hardhat";
import {developmentChain, networkConfig} from "../hardhat-config-helper";
import exp from "constants";

const mocks = async (hre: HardhatRuntimeEnvironment) => {
    const {getNamedAccounts, deployments, ethers, network} = hre
    const deployer = (await getNamedAccounts()).deployer
    const {log, deploy} = deployments

    if(developmentChain.includes(network.name)){
        const args: any = ["Dai", "DAI"]
        const tx = await deploy("Erc20", {
            log: true,
            args: args,
            from: deployer,
            waitConfirmations: 1
        })
    }
}

export default mocks
mocks.tags = ["mock", "all", "erc20"]