import {Field, Int, ObjectType} from "type-graphql";
import {UserType} from "./UserType";

@ObjectType()
export class PostInteractionType {
    @Field(() => Int)
    upvote_total: number

    @Field(() => Int)
    downvote_total: number

    @Field(() => [UserType], {nullable: true})
    upvote_users?: UserType[]

    @Field(() => [UserType], {nullable: true})
    downvote_users?: UserType[]
}