import {Arg, Ctx, Mutation, Query, Resolver} from "type-graphql";
import {Context, ContextAuth} from "../../../types";
import {prisma} from "../../../globals";
import ErrorCode from "../../enums/ErrorCode";
import RecoveryToken from "../../models/token/access/RecoveryToken";
import {DateTime} from "luxon";
import AccessToken from "../../models/token/access/AccessToken";
import {RequireAccessToken} from "../decorators/RequireAccessToken";
import CommunicationSocket from "../../models/CommunicationSocket";
import {Input_EmailSocket, Input_RequestToken, Input_Web3Account} from "../args&inputs";
import {AUTH_ERROR, DATA_ERROR} from "../../errors";
import Web3Account from "../../models/Web3Account";
import {SecretType} from "../types";
import SecretModel from "../../models/token/encryption/Secret"
import Email from "../../models/email/Email";

@Resolver()
export class AccessResolver {
    @Mutation(() => Boolean)
    async createNewLoginInstance_Email(
        @Ctx() ctx: Context,
        @Arg("data") {email, socket} : Input_EmailSocket
    ): Promise<Boolean> {
        const result = await prisma.users.findFirst({
            where: {
                email: email
            }
        })
        if(result === null){
            throw new DATA_ERROR("The email does not exist", ErrorCode.ERR_404_001)
        }

        const nickname = result.nickname
        const ip = ctx.request.ip
        const ua = ctx.request.header("User-Agent") || "NOT_DEFINED"
        if(!CommunicationSocket.socketExists(socket)){
            throw new AUTH_ERROR("The socket provided does not exist", ErrorCode.ERR_401_011)
        }

        const recoveryToken = await RecoveryToken.createNewRecoveryToken({
            header: {
                ip: ip,
                ua: ua
            },
            body: {
                nickname: nickname
            },
            socketId: socket,
            newUser: false
        })
        const jwt = await recoveryToken.createJwt()
        const requestToken = (await recoveryToken.getRequestToken()).token
        const url = `http://localhost:3000/verify?token=${requestToken}&new_account=false`
        const date = DateTime.now()

        const newEmail = new Email()
        await newEmail.init()
        await newEmail.sendEmail({
            to: email,
            subject: `Authorize the Session - ${date.toLocaleString(DateTime.DATETIME_FULL)}`,
            info: {
                ACCESS: {
                    nickname: nickname,
                    date: date.toLocaleString(DateTime.DATETIME_FULL),
                    ua: ua,
                    ip: ip,
                    link: url
                }
            }
        })

        ctx.response.cookie("recovery_token", jwt)
        return true
    }

    @Mutation(() => Boolean)
    async enableToken(
        @Arg("data") {token, isNewAccount} : Input_RequestToken
    ): Promise<Boolean>{
        const result = await prisma.access_requests.findUnique({
            include: {
                tokens: true
            },
            where: {
                token: token
            }
        })
        if(result === null){
            throw new AUTH_ERROR("The token provided does note exists", ErrorCode.ERR_401_012)
        }
        else if(DateTime.now() > DateTime.fromJSDate(result.expire_at)){
            throw new AUTH_ERROR("The token provided is expired", ErrorCode.ERR_401_013)
        }else if(result.tokens.nickname === null && !isNewAccount){
            throw new AUTH_ERROR("The user does not exist", ErrorCode.ERR_403_002)
        }else if(result.tokens.nickname !== null && isNewAccount){
            throw new AUTH_ERROR("The user already exists", ErrorCode.ERR_403_001)
        }

        const socket = result.socket
        const communicationSocket = CommunicationSocket.getSocketById(socket)

        await prisma.$transaction(async prisma => {
            await prisma.tokens.update({
                where: {
                    token_id: result.jwt_id
                },
                data: {
                    enabled: true
                }
            })
            if(isNewAccount){
                const newUser = await prisma.temp_users.delete({
                    where: {
                        token: result.token
                    }
                })
                if(newUser === null){
                    throw new AUTH_ERROR("The new user has not been found", ErrorCode.ERR_404_002)
                }
                await prisma.users.create({
                    data: {
                        nickname: newUser.nickname,
                        email: newUser.email
                    }
                })
                await prisma.temp_users.deleteMany({
                    where: {
                        OR: [
                            {
                                nickname: newUser.nickname
                            },
                            {
                                email: newUser.email
                            }
                        ]
                    }
                })
            }
        })

        communicationSocket.syncWithClient()
        communicationSocket.disconnectSocket()
        return true
    }

    @Mutation(() => Date)
    async getAccessToken_RecoveryToken(
        @Ctx() ctx: Context
    ): Promise<Date>{
        const {request, response} = ctx
        const token: string | undefined = request.cookies["recovery_token"]
        if(token === undefined){
            throw new DATA_ERROR("The recovery token has not been provided", ErrorCode.ERR_404_002)
        }
        const ip = ctx.request.ip
        const ua = ctx.request.header("User-Agent") || "NOT_DEFINED"

        const recoveryToken = await RecoveryToken.verifyAndLoadJwt(token, ip, ua)
        const properties = recoveryToken.getProperties()

        const nickname = properties.nickname
        const accessToken = await AccessToken.createNewAccessToken({
            header: {
                ip: ip,
                ua: ua
            },
            body: {
                nickname: nickname
            }
        })

        await prisma.tokens.delete({
            where: {
                token_id: Number(properties.tokenId)
            }
        })

        const jwt = await accessToken.createJwt()
        response.clearCookie("recovery_token")
        response.cookie("access_token", jwt, {
            expires: accessToken.getProperties().exp,
            httpOnly: true
        })

        return accessToken.getProperties().exp
    }

    @Mutation(() => Date)
    async getAccessToken_Web3Account(
        @Ctx() ctx: Context,
        @Arg("data", () => Input_Web3Account) data: Input_Web3Account
    ): Promise<Date>{
        const {address, date, signature} = data

        const ip = ctx.request.ip
        const ua = ctx.request.header("User-Agent") || "NOT_DEFINED"

        const web3Account = await Web3Account.getWeb3Account(address)
        await Web3Account.verifyAddress({
            address: address,
            date: date,
            ip: ip,
            signature: signature
        })

        const nickname = web3Account.nickname
        const accessToken = await AccessToken.createNewAccessToken({
            header: {
                ip: ip,
                ua: ua
            },
            body: {
                nickname: nickname
            }
        })
        const jwt = await accessToken.createJwt()

        ctx.response.cookie("access_token", jwt, {
            expires: accessToken.getProperties().exp,
            httpOnly: true
        })
        return accessToken.getProperties().exp
    }

    @Mutation(() => SecretType)
    @RequireAccessToken()
    getNewSecret(@Ctx() ctx: ContextAuth): SecretType {
        const nickname = ctx.nickname
        const secret = new SecretModel(nickname)
        return secret.getToken()
    }

    @Mutation(() => Boolean)
    logout(@Ctx() ctx: Context): boolean {
        ctx.response.clearCookie("access_token")
        return true
    }

    @Query(() => SecretType)
    @RequireAccessToken()
    getExistingSecret(
        @Ctx() ctx: ContextAuth,
        @Arg("id", () => String) id: string
    ): SecretType {
        const nickname = ctx.nickname
        const secret = SecretModel.getSecret(nickname, id)
        return secret.getToken()
    }

    @Query(() => String)
    getIpAddress(@Ctx() ctx: ContextAuth): string {
        return ctx.request.ip
    }
}