import {Field, InputType} from "type-graphql";
import {IsEmail, IsString, Length} from "class-validator";

@InputType()
export class Input_SearchForUsers {
    @Field(() => String)
    @IsString()
    @Length(3, 20)
    query: string
}

@InputType()
export class Input_NewUser {
    @Field(() => String)
    @IsEmail()
    @Length(10, 255)
    email: string

    @Field(() => String)
    @Length(5, 127)
    nickname: string

    @Field(() => String)
    socket: string
}