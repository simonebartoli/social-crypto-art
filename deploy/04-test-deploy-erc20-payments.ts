import {HardhatRuntimeEnvironment} from "hardhat/types";
import {network} from "hardhat";
import {developmentChain, networkConfig} from "../hardhat-config-helper";
import mocks from "./00-deploy-mocks";
import {Erc20} from "../typechain-types";

const socialNft = async (hre: HardhatRuntimeEnvironment) => {
    const {getNamedAccounts, deployments, ethers, network} = hre
    const deployer = (await getNamedAccounts()).deployer
    const {log, deploy} = deployments

    const waitConfirmations = !developmentChain.includes(network.name) ?
        networkConfig[network.config.chainId!].blockConfirmation : 1

    const ZERO_ADDRESS = ethers.constants.AddressZero

    const args: any = [ZERO_ADDRESS]
    const tx = await deploy("Erc20Payments", {
        log: true,
        args: args,
        from: deployer,
        waitConfirmations: waitConfirmations
    })
}

export default socialNft
socialNft.tags = ["all", "erc20"]