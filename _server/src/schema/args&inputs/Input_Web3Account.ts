import {Field, InputType} from "type-graphql";
import {IsEthereumAddress} from "class-validator";

@InputType()
export class Input_Web3Account {
    @Field(() => String)
    @IsEthereumAddress()
    address: string

    @Field(() => String)
    signature: string

    @Field(() => Date)
    date: Date
}