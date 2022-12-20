import { v4 as uuidv4 } from 'uuid';
import {DateTime} from "luxon";

import SyncToken from "./SyncToken";
import {
    LoadSyncTokenConstructor,
    NewAccessTokenConstructor,
    NewSyncTokenConstructor, SyncTokenType, TokenBody, TokenHeader
} from "./TokenInterfaces";
import {prisma} from "../../globals";
import Token from "./Token";
import {AUTH_ERROR} from "../../schema/errors/AuthError";
import ErrorCode from "../../schema/enums/ErrorCode";

type ConstructorType = "NEW_TOKEN" | "LOAD_TOKEN"
type CreateNewToken = {
    header: Omit<NewSyncTokenConstructor["header"], "tokenId" | "type">,
    body: NewAccessTokenConstructor["body"]
    socketId: string
}

export default class SpecialToken extends SyncToken{
    private static readonly EXP_DEFAULT_SPECIAL = 60*10

    constructor(data: NewSyncTokenConstructor | LoadSyncTokenConstructor, type: ConstructorType) {
        if(type === "NEW_TOKEN"){
            const castedData = data as NewSyncTokenConstructor
            super({
                header: {
                    ...castedData.header,
                    exp: DateTime.now().plus({second: SpecialToken.EXP_DEFAULT_SPECIAL}).toJSDate()
                },
                body: castedData.body,
                socketId: data.socketId
            })
        }else{
            const castedData = data as LoadSyncTokenConstructor
            super({
                header: castedData.header,
                body: castedData.body,
                socketId: data.socketId
            })
        }
    }
    public static async createNewSpecialToken(data: CreateNewToken){
        const result = await prisma.tokens.create({
            data: {
                enabled: true
            }
        })
        await prisma.access_requests.create({
            data: {
                token: uuidv4(),
                socket: data.socketId,
                jwt_id: result.token_id,
                expire_at: DateTime.now().plus({second: SpecialToken.EXP_DEFAULT_SPECIAL}).toString()
            }
        })
        return new SpecialToken({
            header: {
                ...data.header,
                tokenId: String(result.token_id),
                type: "SPECIAL"
            },
            body: data.body,
            socketId: data.socketId
        }, "NEW_TOKEN")
    }

    public static async verifyAndLoadJwt(token: string, ip: string, ua: string): Promise<SpecialToken> {
        const encryptionKey = await this.getEncryptionKey()
        const {header, body} = await SyncToken.verifySignature(token, encryptionKey)
        SpecialToken.checkProperties(header, ip, ua)

        const castedHeader = header as TokenHeader
        const castedBody = body as TokenBody
        const socket = await SyncToken.checkDatabaseProperties(castedHeader.tokenId, castedBody.nickname)
        return new SpecialToken({header: {...castedHeader}, body: {...castedBody}, socketId: socket}, "LOAD_TOKEN")
    }
    private static checkProperties(header: any, ip: string, ua: string) {
        const now = DateTime.now()
        if(header["securityPatch"] !== undefined && header["securityPatch"] === Token.SECURITY_PATCH){
            const castedHeader = header as SyncTokenType["header"]
            const type = castedHeader.type
            const exp = DateTime.fromSeconds(Number(castedHeader.exp))
            const ipToken = castedHeader.ip
            const uaToken = castedHeader.ua

            if(type !== "SPECIAL"){
                throw new AUTH_ERROR("Special Token Required. Other type provided", ErrorCode.ERR_401_009)
            }
            if(exp < now){
                throw new AUTH_ERROR("Token is expired", ErrorCode.ERR_401_002)
            }
            if(ip !== ipToken){
                throw new AUTH_ERROR("IP is not matching", ErrorCode.ERR_401_004)
            }
            if(ua !== uaToken){
                throw new AUTH_ERROR("UA is not matching", ErrorCode.ERR_401_005)
            }
        }else{
            throw new AUTH_ERROR("Token is not compatible", ErrorCode.ERR_401_008)
        }
    }
}