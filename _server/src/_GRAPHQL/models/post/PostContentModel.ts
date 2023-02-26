import ContentModel from "./ContentModel";
import {MediaType} from "../../enums/MediaType";
import {PostContentType} from "../../schema/types";
import {DATA_ERROR} from "../../errors";
import ErrorCode from "../../enums/ErrorCode";

type NewPostContent = {
    type: MediaType,
    text: string,
    position: number,
    post_id: number
}

class PostContentModel extends ContentModel{
    private readonly position: number
    private readonly nft_id: string | null
    private readonly is_nft: boolean

    constructor(data: NewPostContent & {content_id: number, nickname: string, nft_id: string | null, is_nft: boolean}) {
        super({
            type: data.type,
            text: data.text,
            content_id: data.content_id,
            nickname: data.nickname
        });
        this.position = data.position
        this.nft_id = data.nft_id
        this.is_nft = data.is_nft
    }

    public getPostContent(): PostContentType {
        let path = this.text

        if(this.type === MediaType.PHOTO){
            path = `${ContentModel.PATH_IMAGES_NETWORK}${this.text}`
        }
        else if(this.type === MediaType.VIDEO){
            path = `${ContentModel.PATH_VIDEOS_NETWORK}${this.text}`
        }
        else if(this.type === MediaType.GIF){
            path = `${ContentModel.PATH_GIF_LOCAL}${this.text}`
        }

        return {
            text: path,
            type: this.type,
            position: this.position,
            nft_id: this.nft_id
        }
    }
    public isNft(): boolean {
        return this.is_nft
    }
    public static checkPositions(data: Omit<NewPostContent, "post_id">[]){
        const sortedArray = data.sort((a, b) => {
            if(a.position > b.position){
                return 1
            }
            return -1
        })
        for(let i=0; i<sortedArray.length; i++){
            if(sortedArray[i].position !== i + 1){
                throw new DATA_ERROR("The positions provided are invalid", ErrorCode.ERR_404_005)
            }
        }
    }
}

export default PostContentModel