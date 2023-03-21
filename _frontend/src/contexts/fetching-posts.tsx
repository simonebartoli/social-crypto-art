import React, {createContext, ReactNode, useEffect, useRef, useState} from 'react';
import {NextPage} from "next";
import {LazyQueryExecFunction, useLazyQuery} from "@apollo/client";
import {Exact, Get_PostsQuery, MediaType, InputMaybe, Input_GetPosts, Get_Post_From_UserQuery} from "@/__generated__/graphql";
import {useLogin} from "@/contexts/login";
import {PostInteractionType, PostType} from "@/components/library/post/post.type";
import {GET_POST_FROM_USER, GET_POSTS} from "@/graphql/post";
import {toast} from "react-toastify";
import {PostContentTypeEnum} from "@/enums/global/post-enum";

export type ContextType = {
    getPosts: LazyQueryExecFunction<Get_PostsQuery, Exact<{data?: InputMaybe<Input_GetPosts> | undefined}>>
    refetch_getPosts: () => void
    loading_getPosts: boolean

    getPostFromUser: LazyQueryExecFunction<Get_Post_From_UserQuery, Exact<{nickname: string, data?: InputMaybe<Input_GetPosts> | undefined}>>
    refetch_getPostFromUser: () => void
    loading_getPostFromUser: boolean

    posts: PostType[]
    modifyPost: {
        modifyInteraction: (post_id: string, interactions: PostInteractionType) => void
    }
}
const fetchingPostsContext = createContext<undefined | ContextType>(undefined)

type Props = {
    children: ReactNode
}

export const FetchingPostsContext: NextPage<Props> = ({children}) => {
    const {personalInfo} = useLogin()
    const responseRef = useRef<string>("")
    const threshold = useRef<HTMLDivElement>(null)

    const [ready, setReady] = useState(false)
    const [variablesFetch, setVariablesFetch] = useState({
        maxPosts: 5,
        dateMax: new Date()
    })
    const [posts, setPosts] = useState<PostType[]>([])
    const [stopFetching, setStopFetching] = useState(false)

    const [getPosts, {loading: loading_getPosts, refetch: refetch_getPosts}] = useLazyQuery(GET_POSTS, {
        fetchPolicy: "cache-and-network",
        variables: {
            data: variablesFetch
        },
        onError: () => {
            setReady(true)
            toast.error("An error occurred. Please reload the page")
        },
        onCompleted: (data) => {
            setReady(true)
            formatPosts({
                getPosts: data,
                getPostFromUser: undefined
            })
        }
    })
    const [getPostFromUser, {loading: loading_getPostFromUser, refetch: refetch_getPostFromUser}] = useLazyQuery(GET_POST_FROM_USER, {
        fetchPolicy: "cache-and-network",
        variables: {
            nickname: personalInfo?.nickname ?? "",
            data: variablesFetch
        },
        onError: () => {
            setReady(true)
            toast.error("An error occurred. Please reload the page")
        },
        onCompleted: (data) => {
            setReady(true)
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
        const data = getPosts?.getPosts ?? getPostFromUser?.getPostFromUser
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
            if(responseRef.current === JSON.stringify(postsCopy)){
                setStopFetching(true)
            }else{
                setStopFetching(false)
            }
            responseRef.current = JSON.stringify(postsCopy)
            setPosts(postsCopy)
        }
    }
    useEffect(() => {
        if(threshold.current){
            const observer = new IntersectionObserver(entries => {
                for(const _ of entries){
                    if(_.isIntersecting && !stopFetching){
                        setStopFetching(true)
                        setVariablesFetch({
                            dateMax: variablesFetch.dateMax,
                            maxPosts: variablesFetch.maxPosts + 5
                        })
                    }
                }
            })
            observer.observe(threshold.current)
            return () => observer.disconnect()
        }
    }, [loading_getPosts, loading_getPostFromUser])

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
