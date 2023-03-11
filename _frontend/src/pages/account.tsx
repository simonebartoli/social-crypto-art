import React, {ReactElement, useEffect, useState} from 'react';
import RequireLogin from "@/components/library/auth/require-login";
import Layout from "@/components/library/layout";
import Post from "@/components/library/post/post";
import {useLogin} from "@/contexts/login";
import Loader from "@/components/library/loader";
import {FetchingPostsContext, useFetchingPostsContext} from "@/contexts/fetching-posts";
import {PostContext} from "@/contexts/post-info";

const Account = () => {
    const {logged} = useLogin()
    const [ready, setReady] = useState(false)
    const {posts, getPostFromUser, loading_getPostFromUser: loading, refetch_getPostFromUser: refetch} = useFetchingPostsContext()

    useEffect(() => {
        if(logged) {
            getPostFromUser()
            setReady(true)
        }
    }, [])

    if((loading && posts.length === 0) || !ready){
        return <Loader/>
    }

    return (
        <div className="font-main flex flex-row gap-12 items-start justify-center w-full">
            <div className="text-xl sticky top-[20%] flex w-1/3 flex-col items-start justify-center p-4 rounded-lg bg-white gap-1">
                <span className="text-2xl font-bold text-center w-full mb-4">Filters</span>
                <span className="p-2 cursor-pointer transition rounded-lg text-white bg-black w-full">All</span>
                <span className="p-2 cursor-pointer transition rounded-lg hover:text-white hover:bg-black w-full">Post Only</span>
                <span className="p-2 cursor-pointer transition rounded-lg hover:text-white hover:bg-black w-full">NFT Owned</span>
                <span className="p-2 cursor-pointer transition rounded-lg hover:text-white hover:bg-black w-full">NFT Created</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-12 w-full">
                {
                    posts.map((_, index) =>
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
            </div>
            {
                posts.length === 0 &&
                <div className="h-[calc(90vh-4rem)] flex flex-col items-center justify-center">
                    <span className="text-white text-4xl uppercase">You still haven&apos;t published any post</span>
                </div>
            }
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