import {registerEnumType} from "type-graphql";

export enum PostTypeFilter {
    ALL = "ALL",
    POST_ONLY = "POST_ONLY",
    NFT_ONLY = "NFT_ONLY",
    NFT_CREATED = "NFT_CREATED",
    NFT_OWNED = "NFT_OWNED",
    AUCTION_OFFERS = "AUCTION_OFFERS"
}
registerEnumType(PostTypeFilter, {
    name: "PostTypeFilter"
});