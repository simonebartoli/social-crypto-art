import ContentModel from "./ContentModel";
import {MediaType} from "../../enums/MediaType";
import {PostContentType} from "../../schema/types";

type NewPostContent = {
    type: MediaType,
    text: string,
    position: number,
    post_id: number
}

class PostContentModel extends ContentModel{
    private readonly position: number

    constructor(data: NewPostContent & {content_id: number}) {
        super({
            type: data.type,
            text: data.text,
            content_id: data.content_id
        });
        this.position = data.position
    }

    public getPostContent(): PostContentType {
        return {
            text: this.text,
            type: this.type,
            position: this.position
        }
    }
}

export default PostContentModel