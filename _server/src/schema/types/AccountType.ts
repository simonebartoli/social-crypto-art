import {Field, ObjectType} from "type-graphql";

@ObjectType()
export class AccountType {
    @Field(() => String)
    address: string

    @Field(() => String)
    name: string
}