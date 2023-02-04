import {io} from "socket.io-client";

export const API_URL = process.env["NEXT_PUBLIC_API_URL"]!
export const API_SOCKET = process.env["NEXT_PUBLIC_API_SOCKET"]!
export const socket = io(API_SOCKET)

if(API_URL === undefined){
    throw new Error("DEFINE ENV VARIABLES")
}