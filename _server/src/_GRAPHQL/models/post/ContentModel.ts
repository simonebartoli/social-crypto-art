import {MediaType} from "../../enums/MediaType";
import * as Path from "path";
import {DOMAIN} from "../../../globals";
import fs from "fs";
import {DATA_ERROR} from "../../errors";
import ErrorCode from "../../enums/ErrorCode";

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
            if(!fs.existsSync(Path.join(ContentModel.PATH_IMAGES_LOCAL, data.nickname, data.text))){
                throw new DATA_ERROR(`${data.text} does not exist on the server`, ErrorCode.ERR_404_005)
            }
        }
        else if(data.type === MediaType.VIDEO) {
            if(!fs.existsSync(Path.join(ContentModel.PATH_VIDEOS_LOCAL, data.nickname, data.text))){
                throw new DATA_ERROR(`${data.text} does not exist on the server`, ErrorCode.ERR_404_005)
            }
        }
        else if(data.type === MediaType.GIF) {
            if(!fs.existsSync(Path.join(ContentModel.PATH_GIF_LOCAL, data.nickname, data.text))){
                throw new DATA_ERROR(`${data.text} does not exist on the server`, ErrorCode.ERR_404_005)
            }
        }
    }

}

export default ContentModel