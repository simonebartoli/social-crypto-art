import {PostContentTypeEnum} from "@/enums/global/post-enum";
import {Visibility} from "@/__generated__/graphql";

export type PostType = {
    post_id: string
    visibility: Visibility
    header: PostHeaderType
    body: PostContentType[]
    interaction: PostInteractionType
    warningSync: boolean
    nft?: {
        ipfs: string
        nft_id?: string
    }
}

export type PostHeaderType = {
    nickname: string
    type: "POST" | "NFT",
    allNft: boolean
    date: string
}

export type PostContentType = {
    content_id: string
    type: PostContentTypeEnum
    data: string
    nft: boolean
}

export type PostInteractionType = {
    nft: boolean
    selling: boolean
    upvoteTotal: number
    downvoteTotal: number
    commentTotal: number
    upvoteUsers: string[]
    downvoteUsers: string[]
}