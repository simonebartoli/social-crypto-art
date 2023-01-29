import {Visibility} from "../../enums/Visibility";
import {DateTime} from "luxon";
import {MediaType} from "../../enums/MediaType";
import PostContentModel from "./PostContentModel";
import {prisma} from "../../../globals";
import {AUTH_ERROR, DATA_ERROR} from "../../errors";
import ErrorCode from "../../enums/ErrorCode";
import {PostContentType, PostType} from "../../schema/types";
import {ArrayOneOrMore} from "../../../types";
import Interaction from "./interaction/Interaction";
import {NewContent} from "./ContentModel";
import CommentModel from "./interaction/CommentModel";


type CreateNewPost = {
    visibility: Visibility
    nickname: string
    allowed?: string[] | null
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
    nft_id: string | null
}
type PostFilters = {
    exclude?: string[]
    maxPosts: number
    dateMax: Date
    dateMin?: Date
}

class PostModel {

    public readonly post_id: number
    private readonly visibility: Visibility
    private readonly created_at: Date
    public readonly owner: string

    private interaction: Interaction
    public contents: PostContentModel[] = []

    private constructor(data: CreateNewPostConstructor) {
        this.post_id = data.post_id
        this.visibility = data.visibility
        this.owner = data.nickname
        this.created_at = data.created_at
        this.interaction = new Interaction(this)
    }

    // PUBLIC METHODS

        // INSTANCE TYPE - GETTERS
    public getPost(): PostType {
        return {
            post_id: String(this.post_id),
            created_at: this.created_at,
            visibility: this.visibility,
            content: this.contents.map((_) => _.getPostContent()) as ArrayOneOrMore<PostContentType>
        }
    }
    public async getUpvotes(){
        return await this.interaction.getTotalUpvotes()
    }
    public async getDownvotes(){
        return await this.interaction.getTotalDownvotes()
    }
    public async loadComments(): Promise<CommentModel[]> {
        return this.interaction.getComments()
    }

        // INSTANCE TYPE - INTERACTION ADDER
    public async addNewComment(data: Omit<NewContent, "nickname">) {
        await this.interaction.addNewComment({
            text: data.text,
            type: data.type,
            nickname: this.owner,
            post_id: this.post_id
        })
    }
    public async addUpvote(nickname: string) {
        await this.interaction.addUpvote(nickname)
    }
    public async addDownvote(nickname: string) {
        await this.interaction.addDownvote(nickname)
    }

        // INSTANCE TYPE - INTERACTION REMOVER
    public async removeComments(content_id: number, nickname: string) {
        await this.interaction.removeComment(content_id, nickname)
    }
    public async removeUpvote(nickname: string) {
        await this.interaction.removeUpvote(nickname)
    }
    public async removeDownvote(nickname: string) {
        await this.interaction.removeDownvote(nickname)
    }

        // CLASS TYPE - INSTANCE LOADER
    public static async loadPosts(filter?: PostFilters, auth?: string): Promise<PostModel[]>{
        const {dateMin, dateMax, maxPosts, exclude} = filter || {}
        const result = await prisma.posts.findMany({
            where: {
                created_at: {
                    lte: dateMax ? dateMax : new Date(),
                    gte: dateMin
                },
                nickname: {
                    notIn: exclude
                }
            },
            take: maxPosts ? maxPosts : 10,
            include: {
                post_contents: true,
                restricted_posts: true,
                post_downvotes: true,
                post_upvotes: true
            }
        })
        const authFilteredPosts = []
        const postModels = []

        if(auth){
            for(const post of result){
                if(post.visibility === Visibility.PRIVATE){
                    if(auth === post.nickname){
                        authFilteredPosts.push(post)
                    }
                }else if(post.visibility === Visibility.RESTRICTED){
                    if(post.nickname === auth){
                        authFilteredPosts.push(post)
                    }else{
                        const authorized = post.restricted_posts.map(_ => _.nickname)
                        if(authorized.includes(auth)){
                            authFilteredPosts.push(post)
                        }
                    }
                }else{
                    authFilteredPosts.push(post)
                }
            }
        }else{
            for(const post of result){
                if(post.visibility !== Visibility.RESTRICTED && post.visibility !== Visibility.PRIVATE){
                    authFilteredPosts.push(post)
                }
            }
        }
        for(const post of authFilteredPosts){
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
                    post_id: newPost.post_id,
                    nickname: newPost.owner,
                    nft_id: media.nft_id
                }))
            }
            postModels.push(newPost)
        }

        return postModels
    }
    public static async loadPostById(id: number, auth?: string) : Promise<PostModel>{
        const result = await prisma.posts.findUnique({
            where: {
                post_id: id
            },
            include: {
                post_contents: true,
                restricted_posts: true
            }
        })
        if(result === null){
            throw new DATA_ERROR("The post does not exist", ErrorCode.ERR_404_004)
        }
        if(auth){
            if(result.visibility === Visibility.PRIVATE){
                if(result.nickname !== auth){
                    throw new AUTH_ERROR("This post is private", ErrorCode.ERR_403_008)
                }
            }else if(result.visibility === Visibility.RESTRICTED){
                if(result.nickname !== auth && (result.restricted_posts.find(_ => _.nickname === auth) === undefined)){
                    throw new AUTH_ERROR("This post is private", ErrorCode.ERR_403_008)
                }
            }
        }else{
            if(result.visibility === Visibility.PRIVATE || result.visibility === Visibility.RESTRICTED){
                throw new AUTH_ERROR("This post is private", ErrorCode.ERR_403_008)
            }
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
                post_id: result.post_id,
                nickname: post.owner,
                nft_id: media.nft_id
            }))
        }
        return post
    }
    public static async loadPostByNickname(nickname: string, auth?: string) : Promise<PostModel[]> {
        let result = await prisma.posts.findMany({
            where: {
                nickname: nickname
            },
            include: {
                post_contents: true,
                restricted_posts: true
            }
        })
        if(auth !== undefined){
            result = result.filter(_ => {
                if(_.visibility === Visibility.PRIVATE){
                    if(auth === _.nickname){
                        return true
                    }
                }else if (_.visibility === Visibility.RESTRICTED){
                    if(auth === _.nickname){
                        return true
                    }else if(_.restricted_posts.find(_ => _.nickname === auth) !== undefined){
                        return true
                    }
                }else{
                    return true
                }
                return false
            })
        }
        else{
            result = result.filter(_ => _.visibility !== Visibility.PRIVATE && _.visibility !== Visibility.RESTRICTED)
        }
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
                    post_id: post.post_id,
                    nickname: post.nickname,
                    nft_id: media.nft_id
                }))
            }
            posts.push(newPost)
        }
        return posts
    }

        // CLASS TYPE - POST ADDER
    public static async addNewPost(data: CreateNewPost) : Promise<PostModel>{
        await PostModel.checkRestrictedVisibility(data)
        data.content.forEach(_ => PostContentModel.checkMediaContent({..._, nickname: data.nickname}))
        await PostContentModel.checkPositions(data.content)

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
        if(data.visibility === Visibility.RESTRICTED){
            for(const _ of data.allowed!){
                await prisma.restricted_posts.create({
                    data: {
                        post_id: post.post_id,
                        nickname: _
                    }
                })
            }
        }
        for(const media of data.content){
            post.contents.push(
                await post.addNewPostContent({
                    type: media.type,
                    text: media.text,
                    position: media.position,
                    post_id: post.post_id,
                    nft_id: media.nft_id
                }, data.nickname)
            )
        }
        return post
    }


    // PRIVATE METHODS

        // INSTANCE TYPE - POST CONTENT ADDER
    private async addNewPostContent(data: Content & {post_id: number}, nickname: string): Promise<PostContentModel> {
        const result = await prisma.post_contents.create({
            data: {
                type: data.type,
                content: data.text,
                position: data.position,
                post_id: data.post_id,
                nft_id: data.nft_id
            }
        })
        return new PostContentModel({
            post_id: data.post_id,
            position: data.position,
            text: data.text,
            type: data.type,
            content_id: result.content_id,
            nickname: nickname,
            nft_id: data.nft_id
        })
    }

        // CLASS TYPE - FILTERS
    private static async checkRestrictedVisibility(data: CreateNewPost) {
        if(data.visibility === Visibility.RESTRICTED){
            if(!data.allowed){
                throw new DATA_ERROR("Nickname for post restricted not specified", ErrorCode.ERR_404_005)
            }
            if(data.allowed.includes(data.nickname)){
                throw new DATA_ERROR("You cannot be included in the restricted access", ErrorCode.ERR_404_005)
            }
            const result = await prisma.users.findMany({
                where: {
                    nickname: {
                        in: data.allowed
                    }
                }
            })
            if(result.length !== data.allowed.length){
                throw new DATA_ERROR("Nickname for post restricted not correct", ErrorCode.ERR_404_005)
            }
        }
    }
}

export default PostModel