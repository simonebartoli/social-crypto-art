import {ethers, getNamedAccounts} from "hardhat";
import {Erc20} from "../typechain-types";

export const createErc20Supply = async (amount: string) => {
    const {deployer} = await getNamedAccounts()
    const erc20: Erc20 = await ethers.getContract("Erc20", deployer)
    // console.log(`BEFORE: Total Supply - ${await erc20.totalSupply()}`)
    await erc20.mint(deployer, ethers.utils.parseEther(amount))
    // console.log(`AFTER: Total Supply - ${await erc20.totalSupply()}`)
}