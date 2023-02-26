import React, {useEffect, useRef, useState} from 'react';
import PostHeader from "@/components/library/post/header/post-header";
import PostContent from "@/components/library/post/post-content";
import PostInteractions from "@/components/library/post/post-interactions";
import Comment from "@/components/library/comment/comment";
import {NextPage} from "next";
import {PostContentType, PostHeaderType, PostInteractionType, PostType} from "@/components/library/post/post.type";
import {PostContentTypeEnum} from "@/enums/global/post-enum";
import {__mock__post_content_paragraph} from "@/mock-data/mock-post";

type Props = {
    nft: boolean
    post?: PostType
}

const Post: NextPage<Props> = ({nft, post}) => {
    const postRef = useRef<HTMLDivElement>(null)
    const [showComments, setShowComments] = useState(false)
    const [postHeaderMock] = useState<PostHeaderType>({
        type: "POST",
        allNft: true,
        date: new Date().toISOString(),
        nickname: "simo2001"
    })
    const [postContentMock] = useState<PostContentType[]>(
        new Array(5).fill({
            content_id: 1,
            type: PostContentTypeEnum.TEXT,
            data: __mock__post_content_paragraph,
            nft: true
        }).map(_ => {return {..._, nft: Math.random() < 0.25}})
    )
    const [postInteractionMock] = useState<PostInteractionType>({
        nft: false,
        upvoteTotal: 1200,
        downvoteTotal: 50,
        commentTotal: 20
    })

    const [postHeight, setPostHeight] = useState<number | null>(null)

    useEffect(() => {
        if(postRef.current !== null){
            const resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    setPostHeight(entry.target.clientHeight)
                }
            })
            resizeObserver.observe(postRef.current)
            return () => resizeObserver.disconnect()
        }
    }, [])


    return (
        <div className="flex flex-row gap-16 items-start justify-center w-full">
            <div ref={postRef} className="flex flex-col w-1/2 p-8 bg-white text-black rounded-lg gap-4">
                <PostHeader header={post ? post.header : postHeaderMock}/>
                <PostContent
                    allNft={false}
                    post={post ? post.body : postContentMock}
                />
                <PostInteractions interactions={post ? post.interaction : postInteractionMock} comment={{
                    value: showComments,
                    set: setShowComments
                }}/>
            </div>
            {
                showComments &&
                <div style={{height: postHeight !== null ? `${postHeight}px`: "auto"}}
                     className="min-h-[200px] flex flex-col w-1/3 p-8 bg-white text-black rounded-lg gap-6 overflow-y-scroll">
                    <h2 className="font-bold text-2xl">Comments</h2>
                    <div className="flex flex-col gap-8">
                        {
                            new Array(4).fill([]).map((_, index) =>
                                <Comment key={index}/>
                            )
                        }
                    </div>
                </div>
            }
        </div>
    );
};

export default Post;