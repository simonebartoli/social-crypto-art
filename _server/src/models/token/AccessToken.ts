import * as jose from "jose"
import {KeyLike} from "jose"
import {DateTime} from "luxon";

import Token from "./Token";
import {
    AccessTokenType,
    LoadAccessTokenConstructor,
    NewAccessTokenConstructor,
    TokenBody,
    TokenHeader
} from "./TokenInterfaces";
import {prisma} from "../../globals";
import {AUTH_ERROR} from "../../schema/errors";
import ErrorCode from "../../enums/ErrorCode";

type CreateNewToken = {
    header: Omit<NewAccessTokenConstructor["header"], "tokenId" | "type">,
    body: NewAccessTokenConstructor["body"]
}
type ConstructorType = "NEW_TOKEN" | "LOAD_TOKEN"
type AccessTokenHeader = {
    timeout: Date
}

export default class AccessToken extends Token{
    private static readonly EXP_DEFAULT: number = 60*60*24*5
    private static readonly TIMEOUT_DEFAULT: number = 60*60*6

    private accessTokenHeader: AccessTokenHeader

    private constructor(data: NewAccessTokenConstructor | LoadAccessTokenConstructor, type: ConstructorType) {
        if(type === "NEW_TOKEN"){
            const castedData = data as NewAccessTokenConstructor
            super({
                header: {
                    ...castedData.header,
                    exp: DateTime.now().plus({second: AccessToken.EXP_DEFAULT}).toJSDate(),
                },
                body: castedData.body
            });
            this.accessTokenHeader = {
                timeout: DateTime.now().plus({second: AccessToken.TIMEOUT_DEFAULT}).toJSDate()
            }
        }else{
            const castedData = data as LoadAccessTokenConstructor
            super({
                header: castedData.header,
                body: data.body
            })
            this.accessTokenHeader = {
                timeout: castedData.header.timeout
            }
        }
    }
    public static async createNewAccessToken(data: CreateNewToken){
        const result = await prisma.tokens.create({
            data: {
                enabled: true,
                nickname: data.body.nickname
            }
        })
        return new AccessToken({
            header: {
                ...data.header,
                type: "ACCESS",
                tokenId: String(result.token_id)
            },
            body: data.body
        }, "NEW_TOKEN")
    }
    public static async verifyAndLoadJwt(token: string, ip: string, ua: string): Promise<AccessToken> {
        const encryptionKey = await this.getEncryptionKey()
        const {header, body} = await AccessToken.verifySignature(token, encryptionKey)
        AccessToken.checkProperties(header, ip, ua)

        const castedHeader = header as AccessTokenHeader & TokenHeader
        const castedBody = body as TokenBody
        await AccessToken.checkDatabaseProperties(castedHeader.tokenId, castedBody.nickname)
        const accessToken = new AccessToken({header: {...castedHeader}, body: {...castedBody}}, "LOAD_TOKEN")
        accessToken.accessTokenHeader.timeout = DateTime.now().plus({second: AccessToken.TIMEOUT_DEFAULT}).toJSDate()
        return accessToken
    }
    private static async verifySignature(token: string, encryptionKey: KeyLike | Uint8Array): Promise<{header: any, body: any}>{
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
    private static checkProperties(header: any, ip: string, ua: string) {
        const now = DateTime.now()
        if(header["securityPatch"] !== undefined && header["securityPatch"] === Token.SECURITY_PATCH){
            const castedHeader = header as AccessTokenType["header"]
            const type = castedHeader.type
            const timeout = DateTime.fromISO(castedHeader.timeout.toString())
            const exp = DateTime.fromISO(castedHeader.exp.toString())

            const ipToken = castedHeader.ip
            const uaToken = castedHeader.ua

            if(type !== "ACCESS"){
                throw new AUTH_ERROR("Access Token Required. Other type provided", ErrorCode.ERR_401_009)
            }
            if(timeout < now){
                throw new AUTH_ERROR("Timeout has been passed", ErrorCode.ERR_401_003)
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
    private static async checkDatabaseProperties(tokenId: string, nickname: string) {
        const tokenFound = await prisma.tokens.findUnique({
            where: {
                token_id: Number(tokenId)
            }
        })
        const nicknameFound = await prisma.users.findUnique({
            where: {
                nickname: nickname
            }
        })

        if(tokenFound === null)
            throw new AUTH_ERROR("Token Identifier Not Valid", ErrorCode.ERR_401_006)
        if(nicknameFound === null)
            throw new AUTH_ERROR("User does not exist", ErrorCode.ERR_401_010)
    }

    override async createJwt(): Promise<string> {
        const exp = DateTime.fromJSDate(this.tokenHeader.exp).toSeconds()
        const encryptionKey = await Token.getEncryptionKey()
        return await new jose.SignJWT({...this.tokenBody})
            .setProtectedHeader({alg: Token.ALG, ...this.tokenHeader, ...this.accessTokenHeader})
            .setExpirationTime(exp)
            .sign(encryptionKey)
    }

    public getProperties() {
        return {
            tokenId: this.tokenHeader.tokenId,
            ip: this.tokenHeader.ip,
            ua: this.tokenHeader.ua,
            type: this.tokenHeader.type,
            exp: this.tokenHeader.exp,
            timeout: this.accessTokenHeader.timeout,
            nickname: this.tokenBody.nickname
        }
    }
}