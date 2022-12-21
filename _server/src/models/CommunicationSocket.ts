import {DateTime} from "luxon";
import {Socket} from "socket.io";
import {AUTH_ERROR} from "../schema/errors";
import ErrorCode from "../enums/ErrorCode";

class CommunicationSocket {
    private static socketMap: Map<string, CommunicationSocket> = new Map()
    private static listSocketId: string[] = []

    public readonly socketId: string
    private socket: Socket
    public readonly exp: Date = DateTime.now().plus({second: 60*30}).toJSDate()

    constructor(socket: Socket) {
        this.socketId = socket.id
        this.socket = socket
        this.addSocket()
    }

    public addSocket() {
        CommunicationSocket.socketMap.set(this.socketId, this)
        CommunicationSocket.listSocketId.push(this.socketId)
    }
    public disconnectSocket() {
        this.socket.disconnect(true)
    }
    public removeSocket(){
        CommunicationSocket.socketMap.delete(this.socketId)
        CommunicationSocket.listSocketId = CommunicationSocket.listSocketId.filter((_) => this.socketId !== _)
    }


    public static getListSocketId() {
        return CommunicationSocket.listSocketId
    }
    public static socketExists(id: string) {
        return this.socketMap.has(id);
    }
    public static getSocketById(id: string): CommunicationSocket{
        if(CommunicationSocket.socketExists(id)){
            return this.socketMap.get(id)!
        }
        throw new AUTH_ERROR("The socket provided does not exist", ErrorCode.ERR_401_011)
    }

    public syncWithClient() {
        this.socket.emit("sync", "OK")
    }
}

export default CommunicationSocket