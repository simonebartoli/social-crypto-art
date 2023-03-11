import {io} from "socket.io-client";

export const API_MEDIA_LOCATION = "/media/images"
export const API_URL = process.env["NEXT_PUBLIC_API_URL"]!
export const API_URL_REST = process.env["NEXT_PUBLIC_API_URL_REST"]!
export const API_SOCKET = process.env["NEXT_PUBLIC_API_SOCKET"]!
export const socket = io(API_SOCKET)
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

if(API_URL === undefined){
    throw new Error("DEFINE ENV VARIABLES")
}