import {Field, InputType} from "type-graphql";
import {IsEmail, Length} from "class-validator";

@InputType()
export class Input_EmailSocket {
    @Field(() => String)
    @IsEmail()
    @Length(10, 255)
    email: string

    @Field(() => String)
    socket: string
}