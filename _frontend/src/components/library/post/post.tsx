import React, {useEffect, useRef, useState} from 'react';
import PostHeader from "@/components/library/post/header/post-header";
import PostContent from "@/components/library/post/post-content";
import PostInteractions from "@/components/library/post/post-interactions";
import Comment from "@/components/library/comment/comment";
import {NextPage} from "next";
import {PostContentType} from "@/components/library/post/post.type";
import {PostContentTypeEnum} from "@/enums/global/post-enum";
import {__mock__post_content_paragraph} from "@/mock-data/mock-post";

type Props = {
    nft: boolean
}

const Post: NextPage<Props> = ({nft}) => {
    const postRef = useRef<HTMLDivElement>(null)
    const [postMock] = useState<PostContentType[]>(
        new Array(5).fill({
            content_id: 1,
            type: PostContentTypeEnum.TEXT,
            data: __mock__post_content_paragraph,
            nft: true
        }).map(_ => {return {..._, nft: Math.random() < 0.25}})
    )

    const [postHeight, setPostHeight] = useState<number | null>(null)
    const [showComments, setShowComments] = useState(false)

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
        <div className="flex flex-row gap-16 items-start justify-center">
            <div ref={postRef} className="flex flex-col w-1/2 p-8 bg-white text-black rounded-lg gap-4">
                <PostHeader data={{
                    allNft: false,
                    nft: true,
                    date: new Date(),
                    nickname: "simo2001"
                }}/>
                <PostContent
                    allNft={false}
                    post={postMock}
                />
                <PostInteractions nft={nft} comment={{
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