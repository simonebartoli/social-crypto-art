import {Field, InputType} from "type-graphql";
import {IsUUID} from "class-validator";

@InputType()
export class Input_RequestToken{
    @Field(() => String)
    @IsUUID(4)
    token: string

    @Field(() => Boolean, {defaultValue: false})
    isNewAccount: boolean
}