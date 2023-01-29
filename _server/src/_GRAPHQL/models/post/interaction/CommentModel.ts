import ContentModel from "../ContentModel";
import {MediaType} from "../../../enums/MediaType";
import {DATA_ERROR, INTERNAL_ERROR} from "../../../errors";
import ErrorCode from "../../../enums/ErrorCode";
import {CommentType} from "../../../schema/types/CommentType";
import PostModel from "../PostModel";
import {prisma} from "../../../../globals";
import {Prisma} from "@prisma/client";

type NewCommentContent = {
    type: MediaType,
    text: string,
    content_id: number
    nickname: string
    post: PostModel
}

class CommentModel extends ContentModel{
    public post: PostModel

    public constructor(data: NewCommentContent) {
        super({
            type: data.type,
            text: data.text,
            content_id: data.content_id,
            nickname: data.nickname
        });
        this.post = data.post
    }

    public getComment(): CommentType {
        return {
            comment_id: String(this.content_id),
            type: this.type as MediaType,
            content: this.text,
            post: this.post.getPost()
        }
    }
    public static async verifyOwnerComment(comment_id: number, nickname: string) {
        let ERROR = false
        try{
            const result = await prisma.comments.findFirst({
                where: {
                    comment_id: comment_id,
                    nickname: nickname
                }
            })
            if(result === null){
                ERROR = true
            }
        }catch (e) {
            if(!(e instanceof Prisma.PrismaClientKnownRequestError)){
                throw new INTERNAL_ERROR("There is a problem with your request", ErrorCode.ERR_501_002)
            }
        }
        if(ERROR){
            throw new DATA_ERROR("The comment has not been found", ErrorCode.ERR_403_009)
        }
    }
}

export default CommentModel