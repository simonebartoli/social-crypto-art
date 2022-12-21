import {Server} from "socket.io";
import CommunicationSocket from "../models/CommunicationSocket";

export const initSocket = (io: Server) => {
    io.on("connection", (socket) => {
        setTimeout(() => socket.disconnect(true), 60*30*1000)

        const newSocket = new CommunicationSocket(socket)
        socket.emit("message", `Hi ${newSocket.socketId}`)
        socket.on("disconnect", () => {
            newSocket.removeSocket()
        })
    })
}