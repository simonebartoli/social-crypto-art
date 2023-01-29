import {Field, ID, ObjectType} from "type-graphql";
import {Visibility} from "../../enums/Visibility";
import {PostInteractionType} from "./PostInteractionType";
import {PostContentType} from "./PostContentType";
import {ArrayOneOrMore} from "../../../types";
import {UserType} from "./UserType";

@ObjectType()
export class PostType {
    @Field(() => ID)
    post_id: string

    @Field(() => Visibility)
    visibility: Visibility

    @Field(() => Date)
    created_at: Date

    @Field(() => [PostContentType])
    content: ArrayOneOrMore<PostContentType>

    @Field(() => PostInteractionType)
    interactions?: PostInteractionType

    @Field(() => UserType)
    user?: UserType
}