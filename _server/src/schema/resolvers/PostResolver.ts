import {Arg, Ctx, Int, Mutation, Query, Resolver} from "type-graphql";
import {PostType} from "../types";
import PostModel from "../../models/post/PostModel"
import {Input_AddNewPost} from "../args&inputs";
import {RequireAccessToken} from "../decorators/RequireAccessToken";
import {ContextAuth} from "../../types";

@Resolver()
export class PostResolver {
    @Query(() => PostType, {nullable: true})
    async getPostById(@Arg("id", () => Int) id: number): Promise<PostType | null> {
        const post = await PostModel.loadPostById(id)
        return post.getPost()
    }

    @Mutation(() => PostType)
    @RequireAccessToken()
    async addPost(@Ctx() ctx: ContextAuth, @Arg("data", () => Input_AddNewPost) data: Input_AddNewPost) : Promise<PostType>{
        const nickname = ctx.nickname
        const post = await PostModel.addNewPost({
            nickname: nickname,
            visibility: data.visibility,
            content: data.content
        })
        return post.getPost()
    }
}