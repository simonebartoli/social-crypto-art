import {Field, InputType, Int} from "type-graphql";
import {Visibility} from "../../enums/Visibility";
import {MediaType} from "../../enums/MediaType";
import {ArrayMinSize} from "class-validator";
import {ArrayOneOrMore} from "../../types";

@InputType()
export class Input_AddNewPost {
    @Field(() => Visibility)
    visibility: Visibility

    @Field(() => [Input_Content])
    @ArrayMinSize(1)
    content: ArrayOneOrMore<Input_Content>
}

@InputType()
class Input_Content {
    @Field(() => MediaType)
    type: MediaType

    @Field(() => String)
    text: string

    @Field(() => Int)
    position: number
}