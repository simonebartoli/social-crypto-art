import {MediaType} from "../../enums/MediaType";

type NewContent = {
    type: MediaType,
    text: string
}

abstract class ContentModel {
    protected content_id: number
    protected type: MediaType
    protected text: string

    protected constructor(data: NewContent & {content_id: number}) {
        this.text = data.text
        this.type = data.type
    }
}

export default ContentModel