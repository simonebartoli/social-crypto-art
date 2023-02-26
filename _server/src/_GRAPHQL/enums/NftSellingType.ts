import {registerEnumType} from "type-graphql";

export enum NftSellingType {
    NO_SELLING = "NO_SELLING",
    SELLING_FIXED_PRICE = "SELLING_FIXED_PRICE",
    SELLING_AUCTION = "SELLING_AUCTION"
}

registerEnumType(NftSellingType, {
    name: "NftSellingType"
});