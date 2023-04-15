import Token from "./Token";
import {SyncTokenConstructor} from "./TokenInterfaces";
import * as jose from "jose";
import {DateTime} from "luxon";
import {KeyLike} from "jose";
import {prisma} from "../../../../globals";
import {AUTH_ERROR} from "../../../errors";
import ErrorCode from "../../../enums/ErrorCode";

export default abstract class SyncToken extends Token {

    protected socketId: string
    protected constructor(data: SyncTokenConstructor) {
        super({
            header: data.header,
            body: data.body
        })
        this.socketId = data.socketId
    }

    override async createJwt(): Promise<string> {
        const exp = DateTime.fromISO(this.tokenHeader.exp).toSeconds()
        const encryptionKey = await Token.getEncryptionKey()
        const header = {alg: Token.ALG, ...this.tokenHeader}
        return await new jose.SignJWT({...this.tokenBody})
            .setProtectedHeader(header)
            .setExpirationTime(exp)
            .sign(encryptionKey)
    }

    protected static async verifySignature(token: string, encryptionKey: KeyLike | Uint8Array): Promise<{header: any, body: any}>{
        try{
            const {payload: body, protectedHeader: header} = await jose.jwtVerify(token, encryptionKey)
            return {
                header: {...header},
                body: {...body}
            }
        }catch (e) {
            throw new AUTH_ERROR("Signature is invalid", ErrorCode.ERR_401_001)
        }
    }
    protected static async checkDatabaseProperties(tokenId: string, nickname: string): Promise<string> {
        const tokenFound = await prisma.tokens.findFirst({
            where: {
                token_id: Number(tokenId)
            }
        })
        const nicknameFound = await prisma.users.findUnique({
            where: {
                nickname: nickname
            }
        })
        const socket = await prisma.access_requests.findUnique({
            where: {
                jwt_id: Number(tokenId)
            }
        })

        if(tokenFound === null)
            throw new AUTH_ERROR("Token Identifier Not Valid", ErrorCode.ERR_401_006)
        else if(!tokenFound.enabled)
            throw new AUTH_ERROR("Token Not Enabled", ErrorCode.ERR_401_007)
        if(nicknameFound === null)
            throw new AUTH_ERROR("User does not exist", ErrorCode.ERR_401_010)

        if(socket === null){
            throw new AUTH_ERROR("Socket does not exist", ErrorCode.ERR_401_011)
        }else{
            return socket.socket
        }
    }

    public getProperties() {
        return {
            tokenId: this.tokenHeader.tokenId,
            ip: this.tokenHeader.ip,
            ua: this.tokenHeader.ua,
            type: this.tokenHeader.type,
            exp: this.tokenHeader.exp,
            socketId: this.socketId,
            nickname: this.tokenBody.nickname
        }
    }
    public async getRequestToken() {
        const result = await prisma.access_requests.findFirst({
            where: {
                jwt_id: Number(this.tokenHeader.tokenId)
            }
        })
        if(result !== null){
            return {
                token: result.token
            }
        }
        throw new AUTH_ERROR("Token Identifier Not Valid", ErrorCode.ERR_401_006)
    }
}