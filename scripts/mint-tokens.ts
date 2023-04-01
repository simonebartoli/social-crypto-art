import {ethers, getNamedAccounts} from "hardhat";
import {Erc20} from "../typechain-types";

const mintTokens = async () => {
    const {deployer} = await getNamedAccounts()
    const erc20: Erc20 = await ethers.getContract("Erc20", deployer)

    console.log(`BEFORE: Balance 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 - ${await erc20.balanceOf(deployer)}`)
    await erc20.mint("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", ethers.utils.parseEther("25"))
    console.log(`AFTER: Balance 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 - ${await erc20.balanceOf(deployer)}`)
}

mintTokens()
    .then(() => console.log("DONE"))
    .catch((e) => {
        console.log(e)
        process.exit(-1)
    })