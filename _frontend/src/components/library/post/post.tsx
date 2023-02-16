import React, {useEffect, useRef, useState} from 'react';
import PostHeader from "@/components/library/post/header/post-header";
import PostContent from "@/components/library/post/post-content";
import PostInteractions from "@/components/library/post/post-interactions";
import Comment from "@/components/library/comment/comment";
import {NextPage} from "next";

type Props = {
    nft: boolean
}

const Post: NextPage<Props> = ({nft}) => {
    const postRef = useRef<HTMLDivElement>(null)
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
                <PostHeader nft={nft}/>
                <PostContent nft={nft}/>
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