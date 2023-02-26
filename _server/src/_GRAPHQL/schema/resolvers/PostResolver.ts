import {Arg, Ctx, Int, Mutation, Query, Resolver} from "type-graphql";
import {PostType} from "../types";
import PostModel from "../../models/post/PostModel"
import {RequireAccessToken} from "../decorators/RequireAccessToken";
import {ContextAuth, ContextAuthCustom, ContextCustom} from "../../../types";
import {OptionalAccessToken} from "../decorators/OptionalAccessToken";
import {Input_AddNewComment, Input_AddNewInteraction, Input_AddNewPost, Input_GetPosts} from "../args&inputs";
import {Interaction} from "../../enums/Interaction";
import {Input_VerifyNft} from "../args&inputs/Input_Post";
import Nft from "../../models/Nft";

@Resolver()
export class PostResolver {

    @Query(() => [PostType])
    @OptionalAccessToken()
    async getPosts(
        @Ctx() ctx: ContextAuthCustom<Map<string, PostModel>> | ContextCustom<Map<string, PostModel>>,
        @Arg("data", () => Input_GetPosts, {nullable: true}) data?: Input_GetPosts
    ): Promise<PostType[]> {
        const posts = await PostModel.loadPosts(data, ctx.nickname === null ? undefined: ctx.nickname)
        ctx["post"] = new Map()
        for(const post of posts){
            ctx["post"].set(post.getPost().post_id, post)
        }
        return posts.map(_ => _.getPost())
    }

    @Query(() => PostType, {nullable: true})
    @OptionalAccessToken()
    async getPostById(
        @Arg("id", () => Int) id: number,
        @Ctx() ctx: ContextAuthCustom<Map<string, PostModel>> | ContextCustom<Map<string, PostModel>>
    ): Promise<PostType | null> {
        const post = await PostModel.loadPostById(id)
        ctx["post"] = new Map()
        ctx["post"].set(post.getPost().post_id, post)
        return post.getPost()
    }

    @Mutation(() => PostType)
    @RequireAccessToken()
    async addPost(
        @Ctx() ctx: ContextAuthCustom<Map<string, PostModel>>,
        @Arg("data", () => Input_AddNewPost) data: Input_AddNewPost
    ) : Promise<PostType>{
        const nickname = ctx.nickname
        const isNft = PostModel.verifyNftBackup({
            content: data.content,
            nftInfo: data.nft_info
        })
        const post = await PostModel.addNewPost({
            nickname: nickname,
            visibility: data.visibility,
            content: data.content,
            allowed: data.allowed,
            is_nft: isNft,
            nftInfo: data.nft_info
        })
        ctx["post"] = new Map([[post.getPost().post_id, post]])
        return post.getPost()
    }

    @Mutation(() => Boolean)
    @RequireAccessToken()
    async validateNftCreation(
        @Arg("data", () => Input_VerifyNft) data: Input_VerifyNft
    ): Promise<boolean> {
        const nft = await Nft.getNftByIpfs(data.ipfs)
        if(nft.isVerified()){
            await nft.removeNftBackupFromDb()
        }else{
            await nft.checkIfNftVerified(data.address)
        }
        return true
    }

    @Mutation(() => PostType)
    @RequireAccessToken()
    async removeUpvoteDownvote(
        @Ctx() ctx: ContextAuthCustom<Map<string, PostModel>>,
        @Arg("data", () => Input_AddNewInteraction) data: Input_AddNewInteraction
    ): Promise<PostType>{
        const post = await PostModel.loadPostById(data.post_id, ctx.nickname)
        if(data.type === Interaction.UPVOTE){
            await post.removeUpvote(ctx.nickname)
        }else{
            await post.removeDownvote(ctx.nickname)
        }
        ctx["post"] = new Map([[post.getPost().post_id, post]])
        return post.getPost()
    }

    @Mutation(() => PostType)
    @RequireAccessToken()
    async addUpvoteDownvote(
        @Ctx() ctx: ContextAuthCustom<Map<string, PostModel>>,
        @Arg("data", () => Input_AddNewInteraction) data: Input_AddNewInteraction
    ): Promise<PostType>{
        const post = await PostModel.loadPostById(data.post_id, ctx.nickname)
        if(data.type === Interaction.UPVOTE){
            await post.addUpvote(ctx.nickname)
        }else{
            await post.addDownvote(ctx.nickname)
        }
        ctx["post"] = new Map([[post.getPost().post_id, post]])
        return post.getPost()
    }

    @Mutation(() => PostType)
    @RequireAccessToken()
    async addComment(
        @Ctx() ctx: ContextAuthCustom<Map<string, PostModel>>,
        @Arg("data", () => Input_AddNewComment) data: Input_AddNewComment
    ): Promise<PostType>{
        const post = await PostModel.loadPostById(data.post_id, ctx.nickname)
        await post.addNewComment(data)
        ctx["post"] = new Map([[post.getPost().post_id, post]])
        return post.getPost()
    }

    @Mutation(() => PostType)
    @RequireAccessToken()
    async removeComment(
        @Ctx() ctx: ContextAuthCustom<Map<string, PostModel>>,
        @Arg("post_id", () => Int) post_id: number,
        @Arg("comment_id", () => Int) comment_id: number
    ): Promise<PostType>{
        const post = await PostModel.loadPostById(post_id, ctx.nickname)
        await post.removeComments(comment_id, ctx.nickname)
        ctx["post"] = new Map([[post.getPost().post_id, post]])
        return post.getPost()
    }
}