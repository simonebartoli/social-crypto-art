import {Arg, Ctx, Mutation, Query, Resolver} from "type-graphql";
import {Context} from "../../types";
import {Email} from "../args&inputs/Email";
import {prisma} from "../../globals";
import {DATA_ERROR} from "../errors/DataError";
import ErrorCode from "../enums/ErrorCode";
import RecoveryToken from "../../models/token/RecoveryToken";

@Resolver()
export class Access {
    @Query(() => String)
    getTest(@Arg("test") test: string): string {return "true"}

    @Mutation(() => Boolean)
    async createNewLoginInstance_Email(@Ctx() ctx: Context, @Arg("data") {email} : Email): Promise<Boolean> {
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
        // CHANGE SOCKET
        const socket = ""

        const recoveryToken = await RecoveryToken.createNewRecoveryToken({
            header: {
                ip: ip,
                ua: ua
            },
            body: {
                nickname: nickname
            },
            socketId: socket
        })
        const jwt = await recoveryToken.createJwt()
        console.log(`TOKEN: ${(await recoveryToken.getRequestToken()).token}`)
        ctx.response.cookie("recovery_token", jwt)
        return true
    }


}