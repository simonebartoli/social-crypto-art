import {io} from "socket.io-client";
import * as process from "process";

export const API_URL = process.env["NEXT_PUBLIC_API_URL"]!
export const API_URL_REST = process.env["NEXT_PUBLIC_API_URL_REST"]!
export const API_SOCKET = process.env["NEXT_PUBLIC_API_SOCKET"]!
export const socket = io(API_SOCKET)

export const JSON_RPC = process.env["NEXT_PUBLIC_JSON_RPC"]!
export const CHAIN = process.env["NEXT_PUBLIC_CHAIN"]! as "LOCAL" | "SEPOLIA"
export const MULTICALL_ADDRESS = process.env["NEXT_PUBLIC_MULTICALL_ADDRESS"]!
export const SOCIAL_NFT_ADDRESS = process.env["NEXT_PUBLIC_SOCIAL_NFT_ADDRESS"]!
export const VERIFY_SIGNATURE_ADDRESS = process.env["NEXT_PUBLIC_VERIFY_SIGNATURE_ADDRESS"]!

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"