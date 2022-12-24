import {FieldResolver, Resolver, ResolverInterface, Root} from "type-graphql";
import {PostInteractionType, PostType, UserType} from "../../types";
import {prisma} from "../../../globals";

@Resolver(() => PostType)
export class PostFieldResolvers implements ResolverInterface<PostType>{

    @FieldResolver()
    async interactions(@Root() post: PostType): Promise<PostInteractionType>{
        const id = post.post_id
        const upvoteResult = await prisma.post_upvotes.findMany({
            where: {
                post_id: Number(id)
            },
            include: {
                users: true
            }
        })
        const downvoteResult = await prisma.post_upvotes.findMany({
            where: {
                post_id: Number(id)
            },
            include: {
                users: true
            }
        })

        const upvoteTotal = upvoteResult.length
        const downvoteTotal = downvoteResult.length

        const upvoteAccounts: UserType[] = upvoteResult.map((_) => _.users)
        const downvoteAccounts: UserType[] = downvoteResult.map((_) => _.users)

        return {
            downvote_total: downvoteTotal,
            upvote_total: upvoteTotal,
            downvote_users: downvoteAccounts.length > 0 ? downvoteAccounts : undefined,
            upvote_users: upvoteAccounts.length > 0 ? upvoteAccounts : undefined
        }
    }
}