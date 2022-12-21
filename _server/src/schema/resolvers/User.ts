import {Arg, Ctx, Mutation, Resolver} from "type-graphql";
import {prisma, VERIFY_SIGNATURE_ADDRESS, VerifySignatureAbi} from "../../globals";
import ErrorCode from "../../enums/ErrorCode";
import RecoveryToken from "../../models/token/RecoveryToken";
import {Context, ContextAuth} from "../../types";
import CommunicationSocket from "../../models/CommunicationSocket";
import {AUTH_ERROR, DATA_ERROR} from "../errors";
import {RequireAccessToken} from "../decorators/RequireAccessToken";
import {Input_NewUser} from "../args&inputs";
import {ethers} from "ethers";

@Resolver()
export class User {
    @Mutation(() => Boolean)
    async createUser(@Ctx() ctx: Context, @Arg("data", () => Input_NewUser) {email, nickname, socket}: Input_NewUser): Promise<boolean>{
        const result = await prisma.users.findFirst({
            where: {
                OR: [
                    {
                        nickname: nickname
                    },
                    {
                        email: email
                    }
                ]
            }
        })
        if(result !== null){
            throw new DATA_ERROR("Nickname or email already on use on another account", ErrorCode.ERR_403_001)
        }
        if(!CommunicationSocket.socketExists(socket)){
            throw new AUTH_ERROR("The socket provided does not exist", ErrorCode.ERR_401_011)
        }

        const ip = ctx.request.ip
        const ua = ctx.request.header("User-Agent") || "NOT_DEFINED"
        const recoveryToken = await RecoveryToken.createNewRecoveryToken({
            header: {
                ip: ip,
                ua: ua
            },
            body: {
                nickname: nickname
            },
            socketId: socket,
            newUser: true
        })
        const jwt = await recoveryToken.createJwt()
        const requestToken = (await recoveryToken.getRequestToken()).token
        console.log(requestToken)
        await prisma.temp_users.create({
            data: {
                token: requestToken,
                nickname: nickname,
                email: email
            }
        })
        ctx.response.cookie("recovery_token", jwt)

        return true
    }

    @Mutation(() => Boolean)
    @RequireAccessToken()
    async addNewWeb3Account(@Ctx() ctx: ContextAuth, @Arg("signature", () => String) signature: string): Promise<boolean> {
        const ABI = VerifySignatureAbi()
        const verifySignature = new ethers.Contract(VERIFY_SIGNATURE_ADDRESS, ABI)
        return true
    }
}