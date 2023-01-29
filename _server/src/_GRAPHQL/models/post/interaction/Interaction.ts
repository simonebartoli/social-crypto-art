import CommentModel from "./CommentModel";
import {NewContent} from "../ContentModel";
import {prisma} from "../../../../globals";
import {DATA_ERROR, INTERNAL_ERROR} from "../../../errors";
import ErrorCode from "../../../enums/ErrorCode";
import PostModel from "../PostModel";
import {MediaType} from "../../../enums/MediaType";
import {Prisma} from "@prisma/client";

class Interaction {
    protected post: PostModel
    public comments: CommentModel[] = [] // INITIALIZED ONLY IF CALLED

    constructor(post: PostModel) {
        this.post = post
    }

    public async getComments(): Promise<CommentModel[]> {
        const result = await prisma.comments.findMany({
            where: {
                post_id: this.post.post_id
            }
        })
        for(const _ of result){
            this.comments.push(
                new CommentModel({
                    type: _.type as MediaType,
                    text: _.content,
                    content_id: _.comment_id,
                    nickname: _.nickname,
                    post: this.post
                })
            )
        }
        return this.comments
    }

    public async getTotalUpvotes() {
        const result = await prisma.post_upvotes.findMany({
            where: {
                post_id: this.post.post_id
            },
            include: {
                users: true
            }
        })
        return {
            total: result.length,
            users: result.map(_ => _.users)
        }
    }
    public async getTotalDownvotes() {
        const result = await prisma.post_downvotes.findMany({
            where: {
                post_id: this.post.post_id
            },
            include: {
                users: true
            }
        })
        return {
            total: result.length,
            users: result.map(_ => _.users)
        }
    }

    public async addUpvote(nickname: string){
        try {
            await prisma.post_downvotes.delete({
                where: {
                    post_id_nickname: {
                        nickname: nickname,
                        post_id: this.post.post_id
                    }
                }
            })
        }catch (e) {
            if(!(e instanceof Prisma.PrismaClientKnownRequestError)){
                throw new INTERNAL_ERROR("There is a problem with your request", ErrorCode.ERR_501_002)
            }
        }

        try{
            await prisma.post_upvotes.create({
                data: {
                    post_id: this.post.post_id,
                    nickname: nickname
                }
            })
        }catch (e) {
            if(!(e instanceof Prisma.PrismaClientKnownRequestError)){
                throw new INTERNAL_ERROR("There is a problem with your request", ErrorCode.ERR_501_002)
            }
            throw new DATA_ERROR("Post already upvoted", ErrorCode.ERR_403_009)
        }
    }
    public async addDownvote(nickname: string){
        try {
            await prisma.post_upvotes.delete({
                where: {
                    post_id_nickname: {
                        nickname: nickname,
                        post_id: this.post.post_id
                    }
                }
            })
        }catch (e) {
            if(!(e instanceof Prisma.PrismaClientKnownRequestError)){
                throw new INTERNAL_ERROR("There is a problem with your request", ErrorCode.ERR_501_002)
            }
        }
        try{
            await prisma.post_downvotes.create({
                data: {
                    post_id: this.post.post_id,
                    nickname: nickname
                }
            })
        }catch (e) {
            if(!(e instanceof Prisma.PrismaClientKnownRequestError)){
                throw new INTERNAL_ERROR("There is a problem with your request", ErrorCode.ERR_501_002)
            }
            throw new DATA_ERROR("Post already downvoted", ErrorCode.ERR_403_009)
        }
    }

    public async removeUpvote(nickname: string){
        try {
            await prisma.post_upvotes.delete({
                where: {
                    post_id_nickname: {
                        nickname: nickname,
                        post_id: this.post.post_id
                    }
                }
            })
        }catch (e) {
            if(!(e instanceof Prisma.PrismaClientKnownRequestError)){
                throw new INTERNAL_ERROR("There is a problem with your request", ErrorCode.ERR_501_002)
            }
            throw new DATA_ERROR("The post has not been upvoted", ErrorCode.ERR_403_009)
        }
    }
    public async removeDownvote(nickname: string){
        try {
            await prisma.post_downvotes.delete({
                where: {
                    post_id_nickname: {
                        nickname: nickname,
                        post_id: this.post.post_id
                    }
                }
            })
        }catch (e) {
            if(!(e instanceof Prisma.PrismaClientKnownRequestError)){
                throw new INTERNAL_ERROR("There is a problem with your request", ErrorCode.ERR_501_002)
            }
            throw new DATA_ERROR("The post has not been downvoted", ErrorCode.ERR_403_009)
        }
    }

    public async addNewComment(data: NewContent & {post_id: number}){
        CommentModel.checkMediaContent({
            nickname: data.nickname,
            type: data.type,
            text: data.text
        })
        await prisma.comments.create({
            data: {
                nickname: data.nickname,
                type: data.type,
                content: data.text,
                post_id: data.post_id
            }
        })
    }
    public async removeComment(content_id: number, nickname: string){
        await CommentModel.verifyOwnerComment(content_id, nickname)
        try {
            await prisma.comments.delete({
                where: {
                    comment_id: content_id
                }
            })
        }catch (e) {
            if(!(e instanceof Prisma.PrismaClientKnownRequestError)){
                throw new INTERNAL_ERROR("There is a problem with your request", ErrorCode.ERR_501_002)
            }
            throw new DATA_ERROR("The comment has not been found", ErrorCode.ERR_403_009)
        }
    }
}

export default Interaction