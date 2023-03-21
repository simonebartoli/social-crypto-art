import {HardhatRuntimeEnvironment} from "hardhat/types";

const deployVerifySignature = async (hre: HardhatRuntimeEnvironment) => {
    const {getNamedAccounts, deployments} = hre
    const {deploy} = deployments

    const deployer = (await getNamedAccounts()).deployer

    await deploy("Multicall3", {
        log: true,
        from: deployer,
        waitConfirmations: 1
    })
}

export default deployVerifySignature