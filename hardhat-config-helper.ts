import {ethers} from "hardhat";

type NetworkConfig = {
    [id: number]: {
        name: string,
        blockConfirmation: number
    }
}

export const networkConfig: NetworkConfig = {
    5: {
        name: "goerli",
        blockConfirmation: 6,
    },
    31337: {
        name: "hardhat",
        blockConfirmation: 1,
    },
    11155111: {
        name: "sepolia",
        blockConfirmation: 6,
    }
}
export const developmentChain = ["hardhat", "localhost"]
