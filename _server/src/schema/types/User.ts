import {Field, ObjectType} from "type-graphql";
import {Account} from "./Account";

@ObjectType()
export class User {
    @Field(() => String)
    nickname: string

    @Field(() => String)
    email: string

    @Field(() => Date)
    createdAt: Date

    @Field(() => [Account])
    accounts: Account[]
}