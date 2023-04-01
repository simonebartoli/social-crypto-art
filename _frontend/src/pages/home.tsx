import React, {ReactElement, useEffect, useState} from 'react';
import Layout from "@/components/library/layout";
import Post from "@/components/library/post/post";
import OptionalLogin from "@/components/library/auth/optional-login";
import {useLogin} from "@/contexts/login";
import Loader from "@/components/library/loader";
import {FetchingPostsContext, useFetchingPostsContext} from "@/contexts/fetching-posts";
import {PostContext} from "@/contexts/post-info";

const Home = () => {
    const {logged} = useLogin()
    const [ready, setReady] = useState(false)
    const {posts, resetStatus, getPosts, refetch_getPosts: refetch, loading_getPosts: loading} = useFetchingPostsContext()

    useEffect(() => {
        resetStatus()
        getPosts()
        setReady(true)
    }, [logged])

    if((loading && posts.length === 0) || !ready){
        return <Loader/>
    }

    return (
        <div className="font-main flex flex-col gap-12 items-center justify-center w-full">
            {
                posts.map((_, index) =>
                    <PostContext key={index} post={_}>
                        <Post refetch={refetch}/>
                    </PostContext>
                )
            }
            {
                posts.length === 0 &&
                <div className="h-[calc(90vh-4rem)] flex flex-col items-center justify-center">
                    <span className="text-white text-4xl uppercase">No Posts Have Been Published, yet...</span>
                </div>
            }
        </div>
    );
};

Home.getLayout = function getLayout(page: ReactElement) {
    return (
        <OptionalLogin>
            <Layout left={true} top={true}>
                <FetchingPostsContext>
                    {page}
                </FetchingPostsContext>
            </Layout>
        </OptionalLogin>
    )
}

export default Home;