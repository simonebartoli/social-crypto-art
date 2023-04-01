import {registerEnumType} from "type-graphql";

export enum PostTypeFilter {
    ALL = "ALL",
    POST_ONLY = "POST_ONLY",
    NFT_ONLY = "NFT_ONLY",
    NFT_CREATED = "NFT_CREATED",
    NFT_OWNED = "NFT_OWNED"
}
registerEnumType(PostTypeFilter, {
    name: "PostTypeFilter"
});