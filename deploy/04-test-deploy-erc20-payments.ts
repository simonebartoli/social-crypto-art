import {HardhatRuntimeEnvironment} from "hardhat/types";
import {network} from "hardhat";
import {developmentChain, networkConfig} from "../hardhat-config-helper";

const erc20Payments = async (hre: HardhatRuntimeEnvironment) => {
    // const {getNamedAccounts, deployments, ethers, network} = hre
    // const deployer = (await getNamedAccounts()).deployer
    // const {log, deploy} = deployments
    //
    // const waitConfirmations = !developmentChain.includes(network.name) ?
    //     networkConfig[network.config.chainId!].blockConfirmation : 1
    //
    // const args: any = [ethers.constants.AddressZero]
    // const tx = await deploy("Erc20Payments", {
    //     log: true,
    //     args: args,
    //     from: deployer,
    //     waitConfirmations: waitConfirmations
    // })
}

export default erc20Payments
erc20Payments.tags = ["all", "erc20"]