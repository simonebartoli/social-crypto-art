import React, {useEffect, useState} from 'react';
import PostHeader from "@/components/library/post/header/post-header";
import PostContent from "@/components/library/post/post-content";
import {NextPage} from "next";
import {useLogin} from "@/contexts/login";
import {useAddPostInfo} from "@/contexts/add-post-info";

type Props = {
    header: {
        nft: boolean
    }
}

const PreviewContent: NextPage<Props> = ({header}) => {
    const {personalInfo} = useLogin()
    const {postInfo} = useAddPostInfo()

    const [allNft, setAllNft] = useState(true)

    useEffect(() => {
        let allNFT = true
        for(const _ of postInfo.value){
            if(!_.nft){
                allNFT = false
                break
            }
        }
        setAllNft(allNFT)
    }, [postInfo])

    return (
        <div className="bg-black rounded-lg p-8 border-white border-2 w-[calc(50%-1.5rem)] flex flex-col gap-8 items-center justify-center">
            <h2 className="text-3xl font-bold tracking-wider">Preview</h2>
            <div className="flex flex-col w-full p-8 bg-white text-black rounded-lg gap-4">
                <PostHeader warningSync={false} header={{
                    allNft: allNft,
                    type: header.nft ? "NFT" : "POST",
                    date: new Date().toISOString(),
                    nickname: personalInfo?.nickname ?? ""
                }}/>
                <PostContent
                    allNft={allNft}
                    post={
                        postInfo.value.map(_ => {
                            return {
                                type: _.type,
                                data: _.data ? _.data : _.file ? URL.createObjectURL(_.file) : "",
                                content_id: "1",
                                nft: _.nft
                            }
                        })
                    }/>
            </div>
        </div>
    );
};

export default PreviewContent;