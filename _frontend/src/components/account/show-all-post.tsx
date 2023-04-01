import React from 'react';
import {PostContext} from "@/contexts/post-info";
import Post from "@/components/library/post/post";
import {useFetchingPostsContext} from "@/contexts/fetching-posts";
import {PostType} from "@/components/library/post/post.type";
import {NextPage} from "next";

type Props = {
    posts: PostType[]
}

const ShowAllPost: NextPage<Props> = ({posts}) => {
    const {refetch_getPostFromUser: refetch} = useFetchingPostsContext()

    return (
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
            {
                posts.length === 0 &&
                <div className="h-[calc(90vh-4rem)] flex flex-col items-center justify-center">
                    <span className="text-white text-4xl uppercase">You still haven&apos;t published any post</span>
                </div>
            }
        </div>
    );
};

export default ShowAllPost;