import {HardhatRuntimeEnvironment} from "hardhat/types";
import {network, run} from "hardhat";
import {developmentChain, networkConfig} from "../hardhat-config-helper";
import {Erc20} from "../typechain-types";

const WETH_SEPOLIA = "0xD0dF82dE051244f04BfF3A8bB1f62E1cD39eED92"
const DAI_SEPOLIA = "0x68194a729C2450ad26072b3D33ADaCbcef39D574"
const USDC_SEPOLIA = "0xda9d4f9b69ac6C22e444eD9aF0CfC043b7a7f53f"
const USDT_SEPOLIA = "0x0Bd5F04B456ab34a2aB3e9d556Fe5b3A41A0BC8D"


const socialNft = async (hre: HardhatRuntimeEnvironment) => {
    const {getNamedAccounts, deployments, ethers, network} = hre
    const deployer = (await getNamedAccounts()).deployer
    const {log, deploy} = deployments

    const waitConfirmations = !developmentChain.includes(network.name) ?
        networkConfig[network.config.chainId!].blockConfirmation : 1

    let args: any
    if(developmentChain.includes(network.name)){
        const erc20: Erc20 = await ethers.getContract("Erc20")
        args = [erc20.address, erc20.address, erc20.address, erc20.address]
    }else{
        args = [WETH_SEPOLIA, DAI_SEPOLIA, USDC_SEPOLIA, USDT_SEPOLIA]
    }

    const tx = await deploy("SocialNFT", {
        log: true,
        args: args,
        from: deployer,
        waitConfirmations: waitConfirmations
    })
    if(!developmentChain.includes(network.name)){
        const address = tx.address
        await run(`verify:verify`, {
            address: address,
            constructorArguments: args,
        });
    }
}

export default socialNft
socialNft.tags = ["all", "main"]