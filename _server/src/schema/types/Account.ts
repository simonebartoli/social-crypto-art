import {Field, ObjectType} from "type-graphql";

@ObjectType()
export class Account {
    @Field(() => String)
    address: string

    @Field(() => String)
    name: string
}