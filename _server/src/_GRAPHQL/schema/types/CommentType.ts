import {Field, Int, ObjectType} from "type-graphql";
import {MediaType} from "../../enums/MediaType";
import {PostType} from "./PostType";

@ObjectType()
export class CommentType{
    @Field(() => Int)
    comment_id: string

    @Field(() => MediaType)
    type: MediaType

    @Field(() => String)
    content: string

    @Field(() => PostType)
    post?: PostType
}