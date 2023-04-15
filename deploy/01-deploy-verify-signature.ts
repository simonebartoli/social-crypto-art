import {HardhatRuntimeEnvironment} from "hardhat/types";
import {developmentChain, networkConfig} from "../hardhat-config-helper";
import {network, run} from "hardhat";

const deployVerifySignature = async (hre: HardhatRuntimeEnvironment) => {
    const {getNamedAccounts, deployments} = hre
    const {deploy} = deployments

    const deployer = (await getNamedAccounts()).deployer
    const waitConfirmations = !developmentChain.includes(network.name) ?
        networkConfig[network.config.chainId!].blockConfirmation : 1

    const tx = await deploy("VerifySignature", {
        log: true,
        from: deployer,
        waitConfirmations: waitConfirmations
    })
    if(!developmentChain.includes(network.name)){
        const address = tx.address
        await run(`verify:verify`, {
            address: address,
            constructorArguments: [],
        });
    }
}

export default deployVerifySignature
deployVerifySignature.tags = ["all", "main"]