import {deployments, ethers, getNamedAccounts} from "hardhat";
import {Erc20, ListenForEvents, SocialNFT, VerifySignature} from "../../typechain-types";
import {createErc20Supply} from "../../utils/create-erc20-supply";
import CurrencyEnum from "../../utils/CurrencyEnum";

// This emulation does the following:
//  - Sell 2nd Time the NFT
//  - Royalties


const emulation01 = async () => {
    await deployments.fixture()

    const socialNft: SocialNFT = await ethers.getContract("SocialNFT")
    const erc20: Erc20 = await ethers.getContract("Erc20")

    const deployer = await ethers.getNamedSigner("deployer")
    const signer = await ethers.getNamedSigner("signer")

    await createErc20Supply("1")

    const socialNft_deployer = await socialNft.connect(deployer)
    const socialNft_signer = await socialNft.connect(signer)
    const erc20_deployer = await erc20.connect(deployer)
    const erc20_signer = await erc20.connect(signer)

    await erc20_deployer.transfer(signer.address, ethers.utils.parseEther("0.25").toString())


    console.log("Creating NFT...")
    await socialNft_deployer.createNft("ipfs://this-is-a-test")
    console.log(`NFT CREATED by ${deployer.address}`)

    console.log("Selling NFT...")
    await socialNft_deployer.setSellingFixedPrice(1, ethers.utils.parseEther("0.2"), CurrencyEnum.DAI)

    console.log("Buying NFT...")
    try{
        await socialNft_signer.buyNftSellingFixedPrice(1)
    }catch (e) {
        console.log((e as Error).message)
        await erc20_signer.approve(await socialNft.i_erc20Payments(), ethers.utils.parseEther("0.2"))
        await socialNft_signer.buyNftSellingFixedPrice(1)
    }
    console.log(`NFT Purchased by ${signer.address}`)
}

emulation01()
    .then(() => console.log("DONE"))
    .catch((e) => {
        console.log(e)
        process.exit(-1)
    })