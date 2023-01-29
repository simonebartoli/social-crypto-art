import {Field, Int, ObjectType} from "type-graphql";
import {UserType} from "./UserType";
import {CommentType} from "./CommentType";

@ObjectType()
export class PostInteractionType {
    @Field(() => Int)
    upvote_total: number

    @Field(() => Int)
    downvote_total: number

    @Field(() => [UserType])
    upvote_users: UserType[]

    @Field(() => [UserType])
    downvote_users: UserType[]

    @Field(() => [CommentType])
    comments: CommentType[]
}