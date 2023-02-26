import React, {ReactElement, useState} from 'react';
import RequireLogin from "@/components/library/auth/require-login";
import Layout from "@/components/library/layout";
import Post from "@/components/library/post/post";
import {useQuery} from "@apollo/client";
import {useLogin} from "@/contexts/login";
import {GET_POST_FROM_USER} from "@/graphql/post";
import {toast} from "react-toastify";
import {PostType} from "@/components/library/post/post.type";
import Loader from "@/components/library/loader";
import {MediaType} from "@/__generated__/graphql";
import {PostContentTypeEnum} from "@/enums/global/post-enum";

const Account = () => {
    const {personalInfo} = useLogin()
    const [posts, setPosts] = useState<PostType[]>([])

    const {loading} = useQuery(GET_POST_FROM_USER, {
        fetchPolicy: "cache-and-network",
        variables: {
            nickname: personalInfo!.nickname
        },
        onError: (error) => {
            toast.error("An error occurred. Please reload the page")
        },
        onCompleted: (data) => {
            if(data.getPostFromUser){
                const posts: PostType[] = data.getPostFromUser.map(_ => {
                    return {
                        header: {
                            type: "POST",
                            date: _.created_at,
                            allNft: true,
                            nickname: personalInfo!.nickname
                        },
                        body: _.content.map(__ => {
                            return {
                                data: __.text,
                                type: __.type === MediaType.Text ? PostContentTypeEnum.TEXT :
                                        __.type === MediaType.Photo ? PostContentTypeEnum.PHOTO : PostContentTypeEnum.GIF,
                                nft: false,
                                content_id: "1"
                            }
                        }),
                        interaction: {
                            nft: true,
                            commentTotal: _.interactions.comment_total,
                            downvoteTotal: _.interactions.downvote_total,
                            upvoteTotal: _.interactions.upvote_total
                        },
                        warningSync: false
                    }
                })
                setPosts(posts)
            }
        }
    })

    if(loading){
        return <Loader/>
    }

    return (
        <div className="font-main flex flex-col gap-12 items-center justify-center w-full">
            {
                posts.map((_, index) =>
                    <Post
                        post={_}
                        nft={index % 2 === 0}
                        key={index}/>
                )
            }
        </div>
    );
};

Account.getLayout = function getLayout(page: ReactElement) {
    return (
        <RequireLogin>
            <Layout left={true} top={true}>
                {page}
            </Layout>
        </RequireLogin>
    )
}

export default Account;