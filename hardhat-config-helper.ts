import {ethers} from "hardhat";

type NetworkConfig = {
    [id: number]: {
        name: string,
        vrfCoordinatorAddress?: string
        entranceFee: string
        gasLane: string
        subscriptionId: string
        blockConfirmation: number
        callbackGasLimit: string
        interval: string
    }
}

export const networkConfig: NetworkConfig = {
    5: {
        name: "goerli",
        subscriptionId: "1561",
        entranceFee: ethers.utils.parseEther("0.01").toString(),
        vrfCoordinatorAddress: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        blockConfirmation: 6,
        callbackGasLimit: "500000",
        interval: "30"
    },
    31337: {
        name: "hardhat",
        subscriptionId: "1561",
        entranceFee: ethers.utils.parseEther("0.01").toString(),
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        blockConfirmation: 1,
        callbackGasLimit: "500000",
        interval: "30"
    }
}
export const developmentChain = ["hardhat", "localhost"]
