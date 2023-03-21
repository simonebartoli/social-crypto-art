import {ethers} from "hardhat";

const sendEth = async () => {
    const signer = (await ethers.getSigners())[0]
    await signer.sendTransaction({
        to: "0xB1DC64EE0133377ab6BE5b4917668d532bd8e35A",
        value: ethers.utils.parseEther("10")
    })
}

sendEth()
    .then(() => console.log("DONE"))
    .catch((e) => {
        console.log(e)
        process.exit(-1)
    })