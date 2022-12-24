import {Field, InputType} from "type-graphql";
import {IsEthereumAddress, Length} from "class-validator";

@InputType()
export class Input_NewWeb3Account {
    @Field(() => String)
    @IsEthereumAddress()
    address: string

    @Field(() => String)
    signature: string

    @Field(() => String)
    @Length(3,63)
    name: string

    @Field(() => Date)
    date: Date

    @Field(() => String, {nullable: true})
    packet?: string
}