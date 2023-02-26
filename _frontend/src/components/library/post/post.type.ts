import {PostContentTypeEnum} from "@/enums/global/post-enum";

export type PostType = {
    header: PostHeaderType
    body: PostContentType[]
    interaction: PostInteractionType
    warningSync: boolean
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
    upvoteTotal: number
    downvoteTotal: number
    commentTotal: number
}