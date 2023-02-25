import {PostContentTypeEnum} from "@/enums/global/post-enum";

export type PostHeaderType = {
    nickname: string
    type: "POST" | "NFT"
    date: Date
}

export type PostContentType = {
    content_id: string
    type: PostContentTypeEnum
    data: string | undefined
    file: File | undefined
    nft: boolean
}