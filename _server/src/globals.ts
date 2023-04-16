import {PrismaClient} from "@prisma/client";
import * as fs from "fs";
import * as Path from "path";
import * as dotenv from 'dotenv'
import {ethers} from "ethers";
import {SocialNFT} from "./external-types/contracts/SocialNFT";
dotenv.config()

export const VerifySignatureAbi = () => {
    const PATH = "../artifacts/contracts/VerifySignature.sol/VerifySignature.json"
    const file = fs.readFileSync(Path.join(process.cwd(), PATH), "utf-8")

    const parsedFile = JSON.parse(file)
    return parsedFile.abi
}

export const SocialNFTAbi = () => {
    const PATH = "../artifacts/contracts/SocialNFT.sol/SocialNFT.json"
    const file = fs.readFileSync(Path.join(process.cwd(), PATH), "utf-8")

    const parsedFile = JSON.parse(file)
    return parsedFile.abi
}


export const KEY_PATH = "./src/keys/encrypted-key.json"
export const prisma = new PrismaClient()

export const BUILD_TYPE = process.env["NODE_ENV"] as "development" | "production"

export const DOMAIN = process.env["DOMAIN"]!
export const FRONT_END_DOMAIN = process.env["FRONT_END_DOMAIN"]!
export const PORT = process.env["PORT"]!


// NFT CONFIGURATION -- GLOBAL VARIABLES --
export const VERIFY_SIGNATURE_ADDRESS = process.env["VERIFY_SIGNATURE_ADDRESS"] || ""
export const SOCIAL_NFT_ADDRESS = process.env["SOCIAL_NFT_ADDRESS"] || ""
export const JSON_RPC_PROVIDER = process.env["JSON_RPC_PROVIDER"]
export const PROVIDER = new ethers.providers.JsonRpcProvider(JSON_RPC_PROVIDER)
export const SOCIAL_NFT_CONTRACT = new ethers.Contract(SOCIAL_NFT_ADDRESS, SocialNFTAbi(), PROVIDER) as SocialNFT
export const NFT_STORAGE_API_KEY = process.env["NFT_STORAGE_API_KEY"]!

// EMAIL CONFIGURATION -- GLOBAL VARIABLES --
export const EMAIL_FROM = process.env["EMAIL_FROM"] as string
export const EMAIL_HOST = process.env["EMAIL_HOST"] as string
export const EMAIL_PORT = process.env["EMAIL_PORT"] as string
export const EMAIL_SECURE = process.env["EMAIL_SECURE"] !== "false"
export const EMAIL_USERNAME = process.env["EMAIL_USERNAME"] as string
export const EMAIL_PASSWORD = process.env["EMAIL_PASSWORD"] as string
