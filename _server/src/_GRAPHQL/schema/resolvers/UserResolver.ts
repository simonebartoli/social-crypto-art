import {Arg, Ctx, Mutation, Query, Resolver} from "type-graphql";
import {prisma} from "../../../globals";
import ErrorCode from "../../enums/ErrorCode";
import RecoveryToken from "../../models/token/access/RecoveryToken";
import {Context, ContextAuth, ContextAuthCustom, ContextCustom} from "../../../types";
import CommunicationSocket from "../../models/CommunicationSocket";
import {AUTH_ERROR, DATA_ERROR, INTERNAL_ERROR} from "../../errors";
import {RequireAccessToken} from "../decorators/RequireAccessToken";
import {Input_NewUser, Input_NewWeb3Account} from "../args&inputs";
import Web3Account from "../../models/Web3Account";
import {AccountType, PostType, UserType} from "../types";
import PostModel from "../../models/post/PostModel";
import {OptionalAccessToken} from "../decorators/OptionalAccessToken";
import {Prisma} from "@prisma/client";
import {sendEmail} from "../../../common/SendEmail";

@Resolver()
export class UserResolver {
    @Mutation(() => Boolean)
    async createUser(
        @Ctx() ctx: Context,
        @Arg("data", () => Input_NewUser) {email, nickname, socket}: Input_NewUser
    ): Promise<boolean>{
        const resultNickname = await prisma.users.findFirst({
            where: {
                nickname: nickname
            }
        })
        const resultEmail = await prisma.users.findFirst({
            where: {
                email: email
            }
        })

        if(resultNickname !== null){
            throw new DATA_ERROR("Nickname already on use on another account", ErrorCode.ERR_403_001)
        }
        if(resultEmail !== null){
            throw new DATA_ERROR("Email already on use on another account", ErrorCode.ERR_403_001)
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

        const url = `http://localhost:3000/verify?token=${requestToken}&new_account=true`
        await sendEmail({
            from: "noreply@socialcryptoart.com",
            to: email,
            subject: "Verify your account now",
            text: `This is the url to click ${url}`
        })

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
    async addNewWeb3Account(
        @Ctx() ctx: ContextAuth,
        @Arg("data", () => Input_NewWeb3Account) {signature, date, name, address, packet}: Input_NewWeb3Account
    ): Promise<boolean> {
        const ip = ctx.request.ip
        await Web3Account.linkNewWeb3Account({
            name: name,
            nickname: ctx.nickname,
            date: date,
            signature: signature,
            address: address,
            ip: ip
        })
        if(packet !== undefined && packet !== null){
            await prisma.account_packets.create({
                data: {
                    packet: packet,
                    address: address
                }
            })
        }
        return true
    }

    @Query(() => [AccountType])
    @RequireAccessToken()
    async getWeb3Accounts(
        @Ctx() ctx: ContextAuth
    ): Promise<AccountType[]> {
        const nickname = ctx.nickname
        const accounts = await prisma.accounts.findMany({
            include: {
                account_packets: true
            },
            where: {
                nickname: nickname
            }
        })
        return accounts.map(_ => {
            return {
                address: _.address,
                name: _.name,
                packet: _.account_packets !== null ? _.account_packets.packet : null
            }
        })
    }

    @Query(() => [PostType], {nullable: true})
    @OptionalAccessToken()
    async getPostFromUser(
        @Ctx() ctx: ContextAuthCustom<Map<string, PostModel>> | ContextCustom<Map<string, PostModel>>,
        @Arg("nickname", () => String) nickname: string
    ): Promise<PostType[] | null> {
        const posts = await PostModel.loadPostByNickname(nickname, ctx.nickname === null ? undefined : ctx.nickname)
        if(posts.length === 0) return null
        ctx["post"] = new Map()
        return posts.map((_) => {
            ctx["post"].set(_.getPost().post_id, _)
            return _.getPost()
        })
    }

    @Mutation(() => Boolean)
    @RequireAccessToken()
    async addNewFriend(
        @Ctx() ctx: ContextAuth,
        @Arg("nickname", () => String) nickname: string
    ): Promise<boolean> {
        if(ctx.nickname === nickname){
            throw new DATA_ERROR("User is wrong", ErrorCode.ERR_404_007)
        }
        const result = await prisma.users.findUnique({
            where: {
                nickname: nickname
            }
        })
        if (result === null) {
            throw new DATA_ERROR("User not found", ErrorCode.ERR_404_007)
        }
        try {
            await prisma.follower.create({
                data: {
                    follower: ctx.nickname,
                    followed: nickname
                }
            })
        }catch (e) {
            if(!(e instanceof Prisma.PrismaClientKnownRequestError)){
                throw new INTERNAL_ERROR("There is a problem with your request", ErrorCode.ERR_501_002)
            }
            throw new DATA_ERROR("User already added", ErrorCode.ERR_403_001)
        }
        return true
    }

    @Query(() => UserType)
    @RequireAccessToken()
    async getUser(@Ctx() ctx: ContextAuth): Promise<UserType> {
        const result = await prisma.users.findUnique({
            where: {
                nickname: ctx.nickname
            }
        })
        if(result === null){
            throw new DATA_ERROR("The user does not exist.", ErrorCode.ERR_404_007)
        }
        return result
    }
}