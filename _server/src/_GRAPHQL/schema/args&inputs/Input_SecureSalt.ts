import {Field, InputType} from "type-graphql";
import {IsBase64, IsByteLength} from "class-validator";

@InputType()
export class Input_SecureSalt {
    @Field(() => String)
    @IsBase64()
    id: string
}