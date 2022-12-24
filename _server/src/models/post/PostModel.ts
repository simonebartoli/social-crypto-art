import {Visibility} from "../../enums/Visibility";
import {DateTime} from "luxon";
import {MediaType} from "../../enums/MediaType";
import PostContentModel from "./PostContentModel";
import {prisma} from "../../globals";
import {DATA_ERROR} from "../../schema/errors";
import ErrorCode from "../../enums/ErrorCode";
import {PostContentType, PostType} from "../../schema/types";
import {ArrayOneOrMore} from "../../types";


type CreateNewPost = {
    visibility: Visibility
    nickname: string
    content: ArrayOneOrMore<Content>
}
type CreateNewPostConstructor = {
    post_id: number
    visibility: Visibility
    nickname: string
    created_at: Date
}

type Content = {
    text: string
    type: MediaType
    position: number
}


class PostModel {

    private readonly post_id: number
    private readonly visibility: Visibility
    private readonly created_at: Date
    private readonly nickname: string

    public contents: PostContentModel[] = []

    constructor(data: CreateNewPostConstructor) {
        this.post_id = data.post_id
        this.visibility = data.visibility
        this.nickname = data.nickname
        this.created_at = data.created_at
    }
    public static async addNewPost(data: CreateNewPost) : Promise<PostModel>{
        const result = await prisma.posts.create({
            data: {
                visibility: data.visibility,
                nickname: data.nickname
            }
        })
        const post = new PostModel({
            visibility: data.visibility,
            nickname: data.nickname,
            post_id: result.post_id,
            created_at: DateTime.now().toJSDate()
        })
        for(const media of data.content){
            post.contents.push(
                await post.addNewPostContent({
                    type: media.type,
                    text: media.text,
                    position: media.position,
                    post_id: post.post_id
                })
            )
        }
        return post
    }
    private async addNewPostContent(data: Content & {post_id: number}): Promise<PostContentModel> {
        const result = await prisma.post_contents.create({
            data: {
                type: data.type,
                content: data.text,
                position: data.position,
                post_id: data.post_id
            }
        })
        return new PostContentModel({
            post_id: data.post_id,
            position: data.position,
            text: data.text,
            type: data.type,
            content_id: result.content_id
        })
    }

    public static async loadPostById(id: number) : Promise<PostModel>{
        const result = await prisma.posts.findUnique({
            where: {
                post_id: id
            },
            include: {
                post_contents: true
            }
        })
        if(result === null){
            throw new DATA_ERROR("The post does not exist", ErrorCode.ERR_404_004)
        }
        const post = new PostModel({
            post_id: result.post_id,
            nickname: result.nickname,
            visibility: result.visibility as Visibility,
            created_at: result.created_at
        })
        for(const media of result.post_contents){
            post.contents.push(new PostContentModel({
                content_id: media.content_id,
                type: media.type as MediaType,
                text: media.content,
                position: media.position,
                post_id: result.post_id
            }))
        }
        return post
    }
    public static async loadPostByNickname(nickname: string) : Promise<PostModel[]> {
        const result = await prisma.posts.findMany({
            where: {
                nickname: nickname
            },
            include: {
                post_contents: true
            }
        })
        const posts: PostModel[] = []
        for(const post of result){
            const newPost = new PostModel({
                post_id: post.post_id,
                nickname: post.nickname,
                visibility: post.visibility as Visibility,
                created_at: post.created_at
            })
            for(const media of post.post_contents){
                newPost.contents.push(new PostContentModel({
                    content_id: media.content_id,
                    type: media.type as MediaType,
                    text: media.content,
                    position: media.position,
                    post_id: post.post_id
                }))
            }
            posts.push(newPost)
        }
        return posts
    }

    public getPost(): PostType {
        return {
            post_id: String(this.post_id),
            created_at: this.created_at,
            visibility: this.visibility,
            content: this.contents.map((_) => _.getPostContent()) as ArrayOneOrMore<PostContentType>
        }
    }
}

export default PostModel