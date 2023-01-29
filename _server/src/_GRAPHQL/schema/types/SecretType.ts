import {Field, ObjectType} from "type-graphql";

@ObjectType()
export class SecretType {
    @Field(() => String)
    key: string

    @Field(() => Date)
    exp: Date

    @Field(() => String)
    id: string
}