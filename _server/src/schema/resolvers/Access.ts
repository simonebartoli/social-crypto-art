import {Arg, Ctx, Mutation, Query, Resolver} from "type-graphql";
import {Context, ContextAuth} from "../../types";
import {prisma} from "../../globals";
import ErrorCode from "../../enums/ErrorCode";
import RecoveryToken from "../../models/token/RecoveryToken";
import {DateTime} from "luxon";
import AccessToken from "../../models/token/AccessToken";
import {RequireAccessToken} from "../decorators/RequireAccessToken";
import CommunicationSocket from "../../models/CommunicationSocket";
import {Input_EmailSocket, Input_RequestToken} from "../args&inputs";
import {AUTH_ERROR, DATA_ERROR} from "../errors";

@Resolver()
export class Access {
    @Query(() => String)
    @RequireAccessToken()
    getTest(@Ctx() ctx: ContextAuth): string {return ctx.nickname}

    @Mutation(() => Boolean)
    async createNewLoginInstance_Email(@Ctx() ctx: Context, @Arg("data") {email, socket} : Input_EmailSocket): Promise<Boolean> {
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
        console.log(`TOKEN: ${(await recoveryToken.getRequestToken()).token}`)
        ctx.response.cookie("recovery_token", jwt)
        return true
    }

    @Mutation(() => Boolean)
    async enableToken(@Arg("data") {token, isNewAccount} : Input_RequestToken): Promise<Boolean>{
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

    @Mutation(() => Boolean)
    async getAccessToken_RecoveryToken(@Ctx() ctx: Context): Promise<Boolean>{
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
            expires: accessToken.getProperties().exp
        })

        return true
    }
}