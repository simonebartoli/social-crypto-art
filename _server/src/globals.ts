import {PrismaClient} from "@prisma/client";
import * as fs from "fs";
import * as Path from "path";
import * as dotenv from 'dotenv'
import {ethers} from "ethers";
dotenv.config()

export const KEY_PATH = "./src/keys/encrypted-key.json"
export const prisma = new PrismaClient()
export const VERIFY_SIGNATURE_ADDRESS = process.env["VERIFY_SIGNATURE_ADDRESS"] || ""
export const JSON_RPC_PROVIDER = process.env["JSON_RPC_PROVIDER"]
export const PROVIDER = new ethers.providers.JsonRpcProvider(JSON_RPC_PROVIDER)

export const DOMAIN = process.env["DOMAIN"]!

export const VerifySignatureAbi = () => {
    const PATH = "../artifacts/contracts/VerifySignature.sol/VerifySignature.json"
    const file = fs.readFileSync(Path.join(process.cwd(), PATH), "utf-8")

    const parsedFile = JSON.parse(file)
    return parsedFile.abi
}