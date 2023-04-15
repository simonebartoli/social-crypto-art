import {ethers} from "hardhat";

const sendEth = async () => {
    const signer = (await ethers.getSigners())[0]
    await signer.sendTransaction({
        to: "0xfd58034d56c86d7dce6f04c0c57efc704f793c76",
        value: ethers.utils.parseEther("10")
    })
}

sendEth()
    .then(() => console.log("DONE"))
    .catch((e) => {
        console.log(e)
        process.exit(-1)
    })