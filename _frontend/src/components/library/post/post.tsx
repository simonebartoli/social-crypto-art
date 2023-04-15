import React, {useEffect, useRef, useState} from 'react';
import PostHeader from "@/components/library/post/components/header/post-header";
import PostContent from "@/components/library/post/components/post-content";
import PostInteractions from "@/components/library/post/components/post-interactions";
import Comment from "@/components/library/comment/comment";
import {NextPage} from "next";
import {usePostContext} from "@/contexts/post-info";


type Props = {
    refetch?: () => void
    style?: {
        width: React.CSSProperties
    }
}

const Post: NextPage<Props> = ({refetch, style}) => {
    const {post, verified} = usePostContext() || {}
    const postRef = useRef<HTMLDivElement>(null)

    const [showComments, setShowComments] = useState(false)
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
            <div style={style?.width} ref={postRef} className="flex flex-col w-1/2 p-8 bg-white text-black rounded-lg gap-4">
                <PostHeader
                    refetch={refetch}
                    visibility={post!.visibility}
                    ipfs={post!.nft?.ipfs}
                    verified={verified}
                    warningSync={verified === false ? true : post!.warningSync}
                    header={post!.header}/>
                <PostContent
                    allNft={verified === false ? true : (post!.body.filter(_ => _.nft)).length === post!.body.length}
                    post={post!.body}
                />
                <PostInteractions
                    nft_id={post!.nft?.nft_id}
                    post_id={post!.post_id}
                    interactions={post!.interaction}
                    comment={{
                        value: showComments,
                        set: setShowComments
                    }}
                />
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