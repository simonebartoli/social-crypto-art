import {Field, Int, ObjectType} from "type-graphql";
import {MediaType} from "../../enums/MediaType";

@ObjectType()
export class PostContentType{
    @Field(() => MediaType)
    type: MediaType

    @Field(() => String)
    text: string

    @Field(() => Int)
    position: number
}