import React, {ReactElement, useEffect, useState} from 'react';
import RequireLogin from "@/components/library/auth/require-login";
import Layout from "@/components/library/layout";
import {useLogin} from "@/contexts/login";
import Loader from "@/components/library/loader";
import {FetchingPostsContext, useFetchingPostsContext} from "@/contexts/fetching-posts";
import {PostType} from "@/components/library/post/post.type";
import {PostContext} from "@/contexts/post-info";
import Post from "@/components/library/post/post";
import {PostTypeFilter} from "@/__generated__/graphql";
import {useRouter} from "next/router";
import {useWeb3Info} from "@/contexts/web3-info";

const Account = () => {
    const {account} = useWeb3Info()
    const {logged} = useLogin()
    const router = useRouter()

    const [ready, setReady] = useState(false)
    const [typePage, setTypePage] = useState<"PERSONAL" | "SEARCH">()

    const [accountToSearch, setAccountToSearch] = useState<string>()
    const [postsFormatted, setPostsFormatted] = useState<PostType[]>([])

    const [filterType, setFilterType] = useState<PostTypeFilter>(PostTypeFilter.All)
    const {posts, resetStatus, variablesFetch, getPostFromUser, loading_getPostFromUser: loading, refetch_getPostFromUser: refetch} = useFetchingPostsContext()

    useEffect(() => {
        if(!ready && router.isReady){
            if(router.query.user){
                setTypePage("SEARCH")
                setAccountToSearch(router.query.user as string)
            }else if(logged) {
                setTypePage("PERSONAL")
                setAccountToSearch(undefined)
            }
        }

    }, [router.isReady, logged, ready])
    useEffect(() => {
        if(ready) {
            resetStatus()
            setFilterType(PostTypeFilter.All)
            setReady(false)
        }
    }, [router.asPath])
    useEffect(() => {
        if(typePage){
            if(typePage === "PERSONAL"){
                variablesFetch.set({
                    ...variablesFetch.value,
                    address: account,
                    nickname: undefined
                })
            }else if(typePage === "SEARCH" && accountToSearch){
                variablesFetch.set({
                    ...variablesFetch.value,
                    address: undefined,
                    nickname: accountToSearch
                })
            }
            if(!ready) setReady(true)
        }
    }, [typePage, accountToSearch, account])
    useEffect(() => {
        if(ready){
            getPostFromUser()
        }
    }, [ready])

    useEffect(() => {
        setPostsFormatted(posts)
    }, [posts])
    useEffect(() => {
        if(ready){
            if(filterType === PostTypeFilter.All){
                variablesFetch.set({
                    ...variablesFetch.value,
                    dateMax: new Date(),
                    type: PostTypeFilter.All
                })
            }else if(filterType === PostTypeFilter.NftCreated){
                variablesFetch.set({
                    ...variablesFetch.value,
                    dateMax: new Date(),
                    type: PostTypeFilter.NftCreated
                })
            }else if(filterType === PostTypeFilter.PostOnly){
                variablesFetch.set({
                    ...variablesFetch.value,
                    dateMax: new Date(),
                    type: PostTypeFilter.PostOnly
                })
            }else if(filterType === PostTypeFilter.NftOwned){
                variablesFetch.set({
                    ...variablesFetch.value,
                    dateMax: new Date(),
                    type: PostTypeFilter.NftOwned
                })
            }
        }
    }, [filterType, ready])
    if((loading && posts.length === 0) || !ready){
        return <Loader/>
    }

    return (
        <div className="w-full flex flex-col gap-6 font-main">
            {
                accountToSearch &&
                <div className="w-full p-4 bg-black border-l-4 border-r-4 border-white">
                    <h1 className="text-4xl text-center text-white">{accountToSearch}</h1>
                </div>
            }
            <div className="flex flex-row gap-12 items-start justify-center w-full">
                <div className="text-xl sticky top-[20%] flex w-1/3 flex-col items-start justify-center p-4 rounded-lg bg-white gap-1">
                    <span className="text-2xl font-bold text-center w-full mb-4">Filters</span>
                    <span onClick={() => setFilterType(PostTypeFilter.All)} className={`${filterType === PostTypeFilter.All ? "text-white bg-black" : "hover:text-white hover:bg-black"} p-2 cursor-pointer transition rounded-lg w-full`}>All</span>
                    <span onClick={() => setFilterType(PostTypeFilter.PostOnly)} className={`${filterType === PostTypeFilter.PostOnly ? "text-white bg-black" : "hover:text-white hover:bg-black"} p-2 cursor-pointer transition rounded-lg w-full`}>Post Only</span>
                    <span onClick={() => setFilterType(PostTypeFilter.NftOwned)} className={`${filterType === PostTypeFilter.NftOwned ? "text-white bg-black" : "hover:text-white hover:bg-black"} p-2 cursor-pointer transition rounded-lg w-full`}>NFT Owned</span>
                    <span onClick={() => setFilterType(PostTypeFilter.NftCreated)} className={`${filterType === PostTypeFilter.NftCreated ? "text-white bg-black" : "hover:text-white hover:bg-black"} p-2 cursor-pointer transition rounded-lg w-full`}>NFT Created</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-12 w-full">
                    {
                        postsFormatted.map((_, index) =>
                            <PostContext key={index} post={_}>
                                <Post
                                    style={{
                                        width: {"width": "70%"}
                                    }}
                                    refetch={refetch}
                                />
                            </PostContext>
                        )
                    }
                    {
                        postsFormatted.length === 0 &&
                        <div className="h-[calc(90vh-4rem)] flex flex-col items-center justify-center">
                            <span className="text-white text-4xl uppercase">You still haven&apos;t published any post</span>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
};

Account.getLayout = function getLayout(page: ReactElement) {
    return (
        <RequireLogin>
            <Layout left={true} top={true}>
                <FetchingPostsContext>
                    {page}
                </FetchingPostsContext>
            </Layout>
        </RequireLogin>
    )
}

export default Account;