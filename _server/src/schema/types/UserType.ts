import {Field, ObjectType} from "type-graphql";
import {AccountType} from "./AccountType";
import {PostType} from "./PostType";

@ObjectType()
export class UserType {
    @Field(() => String)
    nickname: string

    @Field(() => String)
    email: string

    @Field(() => Date)
    created_at: Date

    @Field(() => [AccountType], {nullable: true})
    accounts?: AccountType[]

    @Field(() => [PostType], {nullable: true})
    posts?: PostType[]
}