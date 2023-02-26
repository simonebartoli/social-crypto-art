import {MediaType} from "../../enums/MediaType";
import * as Path from "path";
import {DOMAIN} from "../../../globals";
import fs from "fs";
import {DATA_ERROR, INTERNAL_ERROR} from "../../errors";
import ErrorCode from "../../enums/ErrorCode";
import {File} from "nft.storage";
import * as Buffer from "buffer";
import * as Crypto from "crypto";

export type NewContent = {
    type: MediaType,
    text: string,
    nickname: string
}

abstract class ContentModel {
    protected content_id: number
    protected nickname: string
    protected type: MediaType
    protected text: string

    public static readonly PATH_IMAGES_NETWORK: string = `${DOMAIN}/images`
    public static readonly PATH_VIDEOS_NETWORK: string = `${DOMAIN}/videos`
    public static readonly PATH_GIF_NETWORK: string = `${DOMAIN}/gif`

    public static readonly PATH_IMAGES_LOCAL: string = Path.join(process.cwd(), "/public/media/images")
    public static readonly PATH_VIDEOS_LOCAL: string = Path.join(process.cwd(), "/public/media/videos")
    public static readonly PATH_GIF_LOCAL: string = Path.join(process.cwd(), "/public/media/gif")

    protected constructor(data: NewContent & {content_id: number}) {
        this.content_id = data.content_id
        this.text = data.text
        this.type = data.type
        this.nickname = data.nickname
    }
    public static checkMediaContent(data: NewContent) {
        if(data.type === MediaType.PHOTO) {
            if(!fs.existsSync(Path.join(ContentModel.PATH_IMAGES_LOCAL, data.text))){
                throw new DATA_ERROR(`${data.text} does not exist on the server`, ErrorCode.ERR_404_005)
            }
        }
        else if(data.type === MediaType.VIDEO) {
            if(!fs.existsSync(Path.join(ContentModel.PATH_VIDEOS_LOCAL, data.text))){
                throw new DATA_ERROR(`${data.text} does not exist on the server`, ErrorCode.ERR_404_005)
            }
        }
        else if(data.type === MediaType.GIF) {
            if(!fs.existsSync(Path.join(ContentModel.PATH_GIF_LOCAL, data.text))){
                throw new DATA_ERROR(`${data.text} does not exist on the server`, ErrorCode.ERR_404_005)
            }
        }
    }

    public getContentId() : number {
        return this.content_id
    }
    public getFile() : File{
        let file: Buffer | undefined = undefined
        try{
            if(this.type === MediaType.PHOTO){
                file = fs.readFileSync(Path.join(ContentModel.PATH_IMAGES_LOCAL, this.text))
            }else if(this.type === MediaType.GIF){
                file = fs.readFileSync(Path.join(ContentModel.PATH_GIF_LOCAL, this.text))
            }else if(this.type === MediaType.VIDEO){
                file = fs.readFileSync(Path.join(ContentModel.PATH_VIDEOS_LOCAL, this.text))
            }
        }catch (e) {
            throw new INTERNAL_ERROR("File not found", ErrorCode.ERR_501_004)
        }
        if(file){
            return new File([file], Path.basename(this.text))
        }
        throw new INTERNAL_ERROR("Wrong Media Type", ErrorCode.ERR_501_004)
    }
}

export default ContentModel