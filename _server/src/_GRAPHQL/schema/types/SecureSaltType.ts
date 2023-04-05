import {Field, ObjectType} from "type-graphql";

@ObjectType()
export class SecureSaltType {
    @Field(() => String)
    id: string

    @Field(() => String)
    salt: string
}