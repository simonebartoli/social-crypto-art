import React from 'react';
import PostHeader from "@/components/library/post/header/post-header";
import PostContent from "@/components/library/post/post-content";

const PreviewContent = () => {
    return (
        <div className="bg-black rounded-lg p-8 border-white border-2 w-[calc(50%-1.5rem)] flex flex-col gap-8 items-center justify-center">
            <h2 className="text-3xl font-bold tracking-wider">Preview</h2>
            <div className="flex flex-col w-full p-8 bg-white text-black rounded-lg gap-4">
                <PostHeader nft={false}/>
                <PostContent nft={false}/>
            </div>
        </div>
    );
};

export default PreviewContent;