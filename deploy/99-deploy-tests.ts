import {HardhatRuntimeEnvironment} from "hardhat/types";
import {network} from "hardhat";
import {developmentChain} from "../hardhat-config-helper";

const tests = async (hre: HardhatRuntimeEnvironment) => {
    const {getNamedAccounts, deployments, ethers, network} = hre
    const deployer = (await getNamedAccounts()).deployer
    const {deploy} = deployments
    const erc20 = await ethers.getContract("Erc20")

    if(developmentChain.includes(network.name)){
        await deploy("Test", {
            log: true,
            args: [erc20.address],
            from: deployer,
            waitConfirmations: 1,
            gasLimit: "30000000"
        })
        await deploy("TestNftReceiver", {
            log: true,
            args: [],
            from: deployer,
            waitConfirmations: 1
        })
        await deploy("MaliciousUser_Revert", {
            log: true,
            args: [],
            from: deployer,
            waitConfirmations: 1
        })
    }
}

export default tests
tests.tags = ["test", "all"]