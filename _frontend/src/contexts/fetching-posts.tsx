import React, {createContext, ReactNode, useEffect, useRef, useState} from 'react';
import {NextPage} from "next";
import {LazyQueryExecFunction, useLazyQuery} from "@apollo/client";
import {
    Get_Post_From_UserQuery,
    Get_PostsQuery,
    Input_GetPosts,
    MediaType,
    PostTypeFilter
} from "@/__generated__/graphql";
import {useLogin} from "@/contexts/login";
import {PostInteractionType, PostType} from "@/components/library/post/post.type";
import {GET_POST_FROM_USER, GET_POSTS} from "@/graphql/post";
import {toast} from "react-toastify";
import {PostContentTypeEnum} from "@/enums/global/post-enum";
import {DateTime} from "luxon";
import {useWeb3Info} from "@/contexts/web3-info";

export type ContextType = {
    getPosts: LazyQueryExecFunction<Get_PostsQuery, any>
    refetch_getPosts: () => void
    loading_getPosts: boolean

    getPostFromUser: LazyQueryExecFunction<Get_Post_From_UserQuery, any>
    refetch_getPostFromUser: () => void
    loading_getPostFromUser: boolean

    posts: PostType[]
    modifyPost: {
        modifyInteraction: (post_id: string, interactions: PostInteractionType) => void
    }
    resetStatus: () => void

    variablesFetch: {
        value: Input_GetPosts & {nickname?: string}
        set: React.Dispatch<React.SetStateAction<Input_GetPosts & {nickname?: string}>>
    }
}
const fetchingPostsContext = createContext<undefined | ContextType>(undefined)

type Props = {
    children: ReactNode
}

export const FetchingPostsContext: NextPage<Props> = ({children}) => {
    const {personalInfo} = useLogin()
    const {account} = useWeb3Info()

    const responseRef = useRef<string>("")
    const filterTypeRef = useRef<PostTypeFilter | undefined>(PostTypeFilter.All)
    const threshold = useRef<HTMLDivElement>(null)

    const [ready, setReady] = useState(false)
    const [variablesFetch, setVariablesFetch] = useState<Input_GetPosts & {nickname?: string}>({
        nickname: undefined,
        address: account,
        type: PostTypeFilter.All,
        maxPosts: 5,
        dateMax: new Date()
    })

    const [posts, setPosts] = useState<PostType[]>([])
    const [stopFetching, setStopFetching] = useState(false)

    const [getPosts, {loading: loading_getPosts, refetch: refetch_getPosts}] = useLazyQuery(GET_POSTS, {
        fetchPolicy: "cache-and-network",
        variables: {
            data: {
                ...variablesFetch,
                nickname: undefined
            }
        },
        onError: () => {
            setReady(true)
            toast.error("An error occurred. Please reload the page")
        },
        onCompleted: (data) => {
            setReady(true)
            if(filterTypeRef.current !== variablesFetch.type){
                responseRef.current = ""
            }
            formatPosts({
                getPosts: data,
                getPostFromUser: undefined
            })
        }
    })
    const [getPostFromUser, {loading: loading_getPostFromUser, refetch: refetch_getPostFromUser}] = useLazyQuery(GET_POST_FROM_USER, {
        fetchPolicy: "cache-and-network",
        variables: {
            nickname: variablesFetch.nickname ?? personalInfo?.nickname ?? "",
            data: {
                ...variablesFetch,
                nickname: undefined
            }
        },
        onError: () => {
            setReady(true)
            toast.error("An error occurred. Please reload the page")
        },
        onCompleted: (data) => {
            setReady(true)
            if(filterTypeRef.current !== variablesFetch.type){
                responseRef.current = ""
            }
            formatPosts({
                getPosts: undefined,
                getPostFromUser: data
            })
        }
    })

    const modifyInteraction = (post_id: string, interactions: PostInteractionType) => {
        const copy = posts.map(_ => {
            if(_.post_id === post_id){
                return {
                    ..._,
                    interaction: interactions
                }
            }else{
                return _
            }
        })
        setPosts(copy)
    }
    const formatPosts = ({getPosts, getPostFromUser}: {getPosts?: Get_PostsQuery, getPostFromUser?: Get_Post_From_UserQuery}) => {
        const data = responseRef.current !== "" ? getPosts?.getPosts.slice(1) ?? getPostFromUser?.getPostFromUser.slice(1) : getPosts?.getPosts ?? getPostFromUser?.getPostFromUser
        if(data){
            const postsCopy: PostType[] = data.map(_ => {
                let isNft = false
                let nftId: string | undefined = undefined
                let warning = false
                if(_.ipfs){
                    for(const __ of _.content){
                        if(__.nft_id){
                            isNft = true
                            break
                        }
                    }
                    if(!isNft){
                        warning = true
                    }
                }

                let allNft = true
                for(const __ of _.content){
                    if(!__.nft_id){
                        allNft = false
                        break
                    }else{
                        nftId = __.nft_id
                    }
                }

                return {
                    post_id: _.post_id,
                    header: {
                        type: isNft ? "NFT" : "POST",
                        date: _.created_at,
                        allNft: allNft,
                        nickname: _.user.nickname
                    },
                    body: _.content.map(__ => {
                        return {
                            data: __.text,
                            type: __.type === MediaType.Text ? PostContentTypeEnum.TEXT :
                                __.type === MediaType.Photo ? PostContentTypeEnum.PHOTO : PostContentTypeEnum.GIF,
                            nft: !!__.nft_id,
                            content_id: __.post_content_id
                        }
                    }),
                    interaction: {
                        nft: isNft,
                        selling: false,
                        commentTotal: _.interactions.comment_total,
                        downvoteTotal: _.interactions.downvote_total,
                        upvoteTotal: _.interactions.upvote_total,
                        upvoteUsers: _.interactions.upvote_users.map(__ => __.nickname),
                        downvoteUsers: _.interactions.downvote_users.map(__ => __.nickname)
                    },
                    warningSync: warning,
                    nft: _.ipfs ? {
                        ipfs: _.ipfs,
                        nft_id: nftId
                    } : undefined
                }
            })
            if(responseRef.current === JSON.stringify([...posts, ...postsCopy])){
                setStopFetching(true)
            }else{
                setStopFetching(false)
            }
            if(filterTypeRef.current === variablesFetch.type){
                responseRef.current = JSON.stringify([...posts, ...postsCopy])
                setPosts([...posts, ...postsCopy])
            }else{
                responseRef.current = JSON.stringify([...postsCopy])
                setPosts([...postsCopy])
            }
            filterTypeRef.current = variablesFetch.type
        }
    }
    const resetStatus = () => {
        setPosts([])
        responseRef.current = ""
        filterTypeRef.current = PostTypeFilter.All
    }

    useEffect(() => {
        if(threshold.current){
            const observer = new IntersectionObserver(entries => {
                for(const _ of entries){
                    if(_.isIntersecting && !stopFetching && posts.length > 0){
                        setStopFetching(true)
                        setVariablesFetch({
                            ...variablesFetch,
                            dateMax: DateTime.fromISO(posts[posts.length - 1].header.date).toJSDate(),
                            maxPosts: variablesFetch.maxPosts
                        })
                    }
                }
            })
            observer.observe(threshold.current)
            return () => observer.disconnect()
        }
    }, [loading_getPosts, loading_getPostFromUser, posts])

    const value: ContextType = {
        getPosts,
        refetch_getPosts,
        loading_getPosts,
        getPostFromUser,
        refetch_getPostFromUser,
        loading_getPostFromUser,
        posts,
        modifyPost: {
            modifyInteraction
        },
        resetStatus,
        variablesFetch: {
            value: variablesFetch,
            set: setVariablesFetch
        }
    }
    return (
        <fetchingPostsContext.Provider value={value}>
            {children}
            {ready && <div className="w-full" ref={threshold}/>}
        </fetchingPostsContext.Provider>
    );
};

export const useFetchingPostsContext = () => {
    const context = React.useContext(fetchingPostsContext)
    if (context === undefined) {
        throw new Error('useFetchingPostsContext must be used within a FetchingPostsContextProvider')
    }
    return context
}
