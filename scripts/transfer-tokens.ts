import {deployments, ethers, getNamedAccounts} from "hardhat";
import {Erc20, ListenForEvents, VerifySignature} from "../typechain-types";

const transferTokens = async () => {
    const {deployer, signer} = await getNamedAccounts()
    const erc20: Erc20 = await ethers.getContract("Erc20", deployer)

    console.log(`BEFORE: Balance Deployer - ${await erc20.balanceOf(deployer)}`)
    console.log(`BEFORE: Balance Signer - ${await erc20.balanceOf(signer)}`)

    await erc20.transfer(signer, ethers.utils.parseEther("0.5"))

    console.log(`AFTER: Balance Deployer - ${await erc20.balanceOf(deployer)}`)
    console.log(`AFTER: Balance Signer - ${await erc20.balanceOf(signer)}`)}

transferTokens()
    .then(() => console.log("DONE"))
    .catch((e) => {
        console.log(e)
        process.exit(-1)
    })