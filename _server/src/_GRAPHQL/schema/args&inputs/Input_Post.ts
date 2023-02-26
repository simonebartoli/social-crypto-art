import {Field, Float, InputType, Int} from "type-graphql";
import {Visibility} from "../../enums/Visibility";
import {MediaType} from "../../enums/MediaType";
import {ArrayMinSize, IsEthereumAddress, Min} from "class-validator";
import {ArrayOneOrMore} from "../../../types";
import {Interaction} from "../../enums/Interaction";
import {NftSellingType} from "../../enums/NftSellingType";

// -------------------- NOT EXPORTED --------------------
@InputType()
class Input_Content {
    @Field(() => MediaType)
    type: MediaType

    @Field(() => String)
    text: string

    @Field(() => Int)
    position: number

    @Field(() => Boolean, {nullable: true})
    is_nft: boolean
}

@InputType()
class Input_NftSellingParams {
    @Field(() => Date, {nullable: true})
    deadline?: Date

    @Field(() => Int, {nullable: true})
    min_increment?: number

    @Field(() => String)
    currency: string

    @Field(() => String)
    offer: string

    @Field(() => Int, {nullable: true})
    royalties?: number

    @Field(() => Boolean, {defaultValue: true})
    refundable: boolean
}

@InputType()
class Input_NftInfo {
    @Field(() => NftSellingType)
    selling_type: NftSellingType

    @Field(() => Input_NftSellingParams, {nullable: true})
    options?: Input_NftSellingParams
}

// -------------------- EXPORTED --------------------

@InputType()
export class Input_AddNewPost {
    @Field(() => Visibility)
    visibility: Visibility

    @Field(() => [Input_Content])
    @ArrayMinSize(1)
    content: ArrayOneOrMore<Input_Content>

    @Field(() => [String], {nullable: true})
    allowed?: string[]

    @Field(() => Input_NftInfo, {nullable: true})
    nft_info?: Input_NftInfo
}

@InputType()
export class Input_GetPosts {
    @Field(() => [String], {nullable: true})
    exclude?: string[]

    @Field(() => Int, {defaultValue: 10})
    maxPosts: number

    @Field(() => Date, {defaultValue: new Date()})
    dateMax: Date

    @Field(() => Date, {nullable: true})
    dateMin?: Date
}

@InputType()
export class Input_AddNewInteraction {
    @Field(() => Int)
    @Min(0)
    post_id: number

    @Field(() => Interaction)
    type: Interaction
}

@InputType()
export class Input_AddNewComment {
    @Field(() => Int)
    @Min(0)
    post_id: number

    @Field(() => MediaType)
    type: MediaType

    @Field(() => String)
    text: string
}

@InputType()
export class Input_VerifyNft {
    @Field(() => String)
    ipfs: string

    @Field(() => String)
    @IsEthereumAddress()
    address: string
}


