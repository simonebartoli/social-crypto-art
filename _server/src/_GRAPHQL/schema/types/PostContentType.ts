import {Field, ID, Int, ObjectType} from "type-graphql";
import {MediaType} from "../../enums/MediaType";

@ObjectType()
export class PostContentType{
    @Field(() => ID)
    post_content_id: string

    @Field(() => MediaType)
    type: MediaType

    @Field(() => String)
    text: string

    @Field(() => Int)
    position: number

    @Field(() => String, {nullable: true})
    nft_id: string | null
}