import {Field, InputType, Int} from "type-graphql";
import {Visibility} from "../../enums/Visibility";
import {MediaType} from "../../enums/MediaType";
import {ArrayMinSize, Min} from "class-validator";
import {ArrayOneOrMore} from "../../../types";
import {Interaction} from "../../enums/Interaction";

@InputType()
export class Input_AddNewPost {
    @Field(() => Visibility)
    visibility: Visibility

    @Field(() => [Input_Content])
    @ArrayMinSize(1)
    content: ArrayOneOrMore<Input_Content>

    @Field(() => [String], {nullable: true})
    allowed?: string[]
}

@InputType()
export class Input_GetPosts {
    @Field(() => [String], {nullable: true})
    exclude?: string[]

    @Field(() => Int, {defaultValue: 10})
    maxPosts: number

    @Field(() => Date, {defaultValue: new Date()})
    dateMax: Date

    @Field(() => Date, {nullable: true})
    dateMin?: Date
}

@InputType()
class Input_Content {
    @Field(() => MediaType)
    type: MediaType

    @Field(() => String)
    text: string

    @Field(() => Int)
    position: number

    @Field(() => String, {nullable: true})
    nft_id: string | null
}

@InputType()
export class Input_AddNewInteraction {
    @Field(() => Int)
    @Min(0)
    post_id: number

    @Field(() => Interaction)
    type: Interaction
}

@InputType()
export class Input_AddNewComment {
    @Field(() => Int)
    @Min(0)
    post_id: number

    @Field(() => MediaType)
    type: MediaType

    @Field(() => String)
    text: string
}