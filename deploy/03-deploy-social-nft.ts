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
    const erc20: Erc20 = await ethers.getContract("Erc20")


    const args: any = [erc20.address, erc20.address, erc20.address, erc20.address]
    const tx = await deploy("SocialNFT", {
        log: true,
        args: args,
        from: deployer,
        waitConfirmations: waitConfirmations
    })
}

export default socialNft
socialNft.tags = ["all", "main"]