import React, {createContext, ReactNode, useEffect, useState} from 'react';
import {NextPage} from "next";
import {PostType} from "@/components/library/post/post.type";
import {NftInfoType} from "@/components/library/post/nft.type";
import {
    Contract_getAllInfoNft, Contract_getAllInfoNft_CallbackType,
    Contract_getVerification,
    Contract_getVerification_CallbackType
} from "@/contexts/contract";
import {NftSellingStatusEnum} from "@/enums/global/nft-enum";

export type ContextType = {
    post: PostType
    verified: boolean | undefined
    nftInfo: NftInfoType | undefined
    loadingWeb3Changes: boolean
    setLoadingWeb3Changes: React.Dispatch<React.SetStateAction<boolean>>
}
const postContext = createContext<undefined | ContextType>(undefined)

type Props = {
    children: ReactNode,
    post: PostType
}

export const PostContext: NextPage<Props> = ({children, post}) => {
    const [postFormatted, setPostFormatted] = useState(post)
    const [nftInfo, setNftInfo] = useState<NftInfoType>()
    const [verified, setVerified] = useState<boolean | undefined>(undefined)
    const [loadingWeb3Changes, setLoadingWeb3Changes] = useState<boolean>(!!(post.nft && !post.warningSync))

    const onVerificationCallback = (e: Contract_getVerification_CallbackType) => {
        if(e.error){
            console.log((e.error as Error).message)
        }else{
            setVerified(e.value)
        }
        setLoadingWeb3Changes(false)
    }
    const onGetAllInfoCallback = (e: Contract_getAllInfoNft_CallbackType) => {
        if(e.error){
            console.log(e.error)
        }else if(e.value){
            setNftInfo({
                currentOwner: e.value.currentOwner,
                royalties: e.value.royalties,
                originalOwner: e.value.owner,
                sellingType: e.value.sellingType,
                fixedPrice: e.value.fixedPrice,
                auction: e.value.auction
            })
        }
        setLoadingWeb3Changes(false)
    }
    useEffect(() => {
        const newPost = {...post}
        if(verified === false){
            newPost.warningSync = true
            newPost.header = {
                ...newPost.header,
                type: "POST"
            }
        }
        if(verified === false || post.warningSync){
            newPost.interaction = {
                ...newPost.interaction,
                nft: false
            }
        }else if(verified === true && nftInfo?.sellingType !== NftSellingStatusEnum.NO_SELLING){
            newPost.interaction = {
                ...newPost.interaction,
                nft: true,
                selling: true
            }
        }
        setPostFormatted(newPost)
    }, [post, verified, nftInfo])

    const value: ContextType = {
        post: postFormatted,
        verified,
        nftInfo,
        loadingWeb3Changes,
        setLoadingWeb3Changes
    }
    return (
        <postContext.Provider value={value}>
            {
                (post.nft && !post.warningSync) &&
                <Contract_getVerification
                    ipfs={post.nft.ipfs}
                    nft_id={post.nft.nft_id!}
                    callback={onVerificationCallback}
                />
            }
            {
                (verified === true && post.nft?.nft_id) &&
                <Contract_getAllInfoNft
                    nft_id={post.nft.nft_id}
                    callback={onGetAllInfoCallback}
                />
            }
            {children}
        </postContext.Provider>
    );
};

export const usePostContext = () => {
    const context = React.useContext(postContext)
    if (context === undefined) {
        return undefined
        // throw new Error('usePostContext must be used within a PostContextProvider')
    }
    return context
}
