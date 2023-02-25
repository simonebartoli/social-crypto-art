import {PostContentTypeEnum} from "@/enums/global/post-enum";

export type PostInfoType = {
    id: number
    type: PostContentTypeEnum
    data?: string
    file?: File
    nft: boolean
}