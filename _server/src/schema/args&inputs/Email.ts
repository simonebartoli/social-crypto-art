import {Field, InputType} from "type-graphql";
import {IsEmail, Length} from "class-validator";

@InputType()
export class Email {
    @Field(() => String)
    @IsEmail()
    @Length(10, 255)
    email: string
}