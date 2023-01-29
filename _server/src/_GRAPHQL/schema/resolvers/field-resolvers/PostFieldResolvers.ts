import {Ctx, FieldResolver, Resolver, ResolverInterface, Root} from "type-graphql";
import {PostInteractionType, PostType, UserType} from "../../types";
import {prisma} from "../../../../globals";
import {ContextCustom} from "../../../../types";
import PostModel from "../../../models/post/PostModel";
import {INTERNAL_ERROR} from "../../../errors";
import ErrorCode from "../../../enums/ErrorCode";

@Resolver(() => PostType)
export class PostFieldResolvers implements ResolverInterface<PostType>{

    @FieldResolver()
    async interactions(
        @Root() post: PostType,
        @Ctx() ctx: ContextCustom<Map<string, PostModel>>
    ): Promise<PostInteractionType>{
        const postRecovered = ctx["post"].get(post.post_id)
        if(postRecovered){
            const upvotes = await postRecovered.getUpvotes()
            const downvotes = await postRecovered.getDownvotes()
            const comments = await postRecovered.loadComments()
            return {
                downvote_total: downvotes.total,
                downvote_users: downvotes.users,
                upvote_total: upvotes.total,
                upvote_users: upvotes.users,
                comments: comments.map(_ => _.getComment())
            }
        }else{
            throw new INTERNAL_ERROR("A function triggered an error", ErrorCode.ERR_501_001)
        }

    }

    @FieldResolver()
    async user(
        @Root() post: PostType,
        @Ctx() ctx: ContextCustom<Map<string, PostModel>>
    ): Promise<UserType>{
        const postRecovered = ctx["post"].get(post.post_id)
        if(postRecovered){
            const nickname = postRecovered.owner
            return await prisma.users.findUnique({
                where: {
                    nickname: nickname
                }
            }) as UserType
        }else{
            throw new INTERNAL_ERROR("A function triggered an error", ErrorCode.ERR_501_001)
        }
    }

}