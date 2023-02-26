import React, {ReactElement, useEffect, useState} from 'react';
import Layout from "@/components/library/layout";
import RequireLogin from "@/components/library/auth/require-login";
import 'react-quill/dist/quill.snow.css';
import AddContent from "@/components/add-post/tabs/add-content";
import PreviewContent from "@/components/add-post/tabs/preview-content";
import {AddPostTypeEnum} from "@/enums/local/add-post-enum";
import {AddPostInfo, useAddPostInfo} from "@/contexts/add-post-info";
import {useMutation} from "@apollo/client";
import {ADD_POST} from "@/graphql/post";
import {toast} from "react-toastify";
import {PostContentTypeEnum, PostVisibilityEnum} from "@/enums/global/post-enum";
import {Input_Content, Input_NftInfo, MediaType, NftSellingType, Visibility} from "@/__generated__/graphql";
import {API_URL_REST} from "@/globals";
import {CurrencyEnum, NftSellingStatusEnum} from "@/enums/global/nft-enum";
import {useModal} from "@/contexts/modal";
import {useRouter} from "next/router";
import BlockchainWrapper from "@/components/add-post/components/blockchain-wrapper";
import {ethers} from "ethers";
import {DateTime} from "luxon";

const AddPost = () => {
    const router = useRouter()
    const {showModal, open} = useModal()
    const [nftDialogueOpen, setNftDialogueOpen] = useState(false)

    const [postSubmitted, setPostSubmitted] = useState(false)
    const [ipfsURI, setIpfsURI] = useState<string | undefined>(undefined)
    const {postType, postInfo, currency, amount, deadline, selling, visibility, royalties, minIncrement, disabled} = useAddPostInfo()

    const [addPost] = useMutation(ADD_POST, {
        onError: (error) => {
            toast.error(error.message)
            disabled.set(false)
        },
        onCompleted: (data) => {
            if(data.addPost.ipfs){
                setIpfsURI(data.addPost.ipfs)
            }else{
                router.push("/home")
            }
            setPostSubmitted(true)
            toast.success("Post Added 👍")
            disabled.set(false)
        }
    })

    const uploadFiles = async (file: File) => {
        const URL = `${API_URL_REST}/upload-images`
        const formData = new FormData()
        formData.append("image", file)
        const response = await fetch(URL, {
            method: "POST",
            credentials: "include",
            body: formData
        })
        const result = await response.json()
        return `${result.url}`
    }
    const formatData = async () => {
        const content: Input_Content[] = []
        let index = 1
        for(const _ of postInfo.value){
            if(_.data || _.file){
                const type: MediaType =
                    _.type === PostContentTypeEnum.TEXT ? MediaType.Text :
                    _.type === PostContentTypeEnum.PHOTO ? MediaType.Photo :
                    MediaType.Gif
                if(_.file && _.type === PostContentTypeEnum.PHOTO){
                    const filePosition = await uploadFiles(_.file)
                    content.push({
                        type: type,
                        is_nft: _.nft,
                        text: filePosition,
                        position: index
                    })
                    index += 1
                }else if(_.data){
                    content.push({
                        type: type,
                        is_nft: _.nft,
                        text: _.data,
                        position: index
                    })
                    index += 1
                }
            }
        }
        return content
    }
    const formatNftInfo = () => {
        const sellingType =
            NftSellingStatusEnum[NftSellingStatusEnum.NO_SELLING] === selling.value ? NftSellingType.NoSelling :
            NftSellingStatusEnum[NftSellingStatusEnum.SELLING_FIXED_PRICE] === selling.value ? NftSellingType.SellingFixedPrice :
            NftSellingType.SellingAuction
        const info: Input_NftInfo = {
            selling_type: sellingType,
            options: {
                offer: amount.value,
                deadline: deadline.value,
                currency: currency.value,
                royalties: Number(royalties.value),
                min_increment: Number(minIncrement.value),
                refundable: undefined
            }
        }
        return info
    }

    const submitForm = async () => {
        if(!postSubmitted){
            disabled.set(true)
            try {
                const content = await formatData()
                const nftInfo = postType.value === AddPostTypeEnum.POST
                    ? undefined : formatNftInfo()
                const visible =
                    visibility.value === PostVisibilityEnum[PostVisibilityEnum.PUBLIC] ? Visibility.Public :
                        visibility.value === PostVisibilityEnum[PostVisibilityEnum.PRIVATE] ? Visibility.Private :
                            Visibility.Restricted
                addPost({
                    variables: {
                        data: {
                            allowed: undefined,
                            visibility: visible,
                            content: content,
                            nft_info: nftInfo
                        }
                    }
                })
            }catch (e) {
                console.log((e as Error).message)
                toast.error("Please try again")
                disabled.set(false)
            }
        }
    }

    useEffect(() => {
        if(ipfsURI){
            const sellingOptions =
                selling.value === NftSellingStatusEnum[NftSellingStatusEnum.NO_SELLING] ? undefined :
                selling.value === NftSellingStatusEnum[NftSellingStatusEnum.SELLING_FIXED_PRICE] ?
                    {
                        setSellingFixedPrice: {
                            amount: ethers.utils.parseEther(amount.value).toString(),
                            currency: String(CurrencyEnum[currency.value as keyof typeof CurrencyEnum]),
                            onFinish: () => {
                                toast.success("Good Job, Your NFT has been added")
                                setTimeout(() => router.push("/home"), 5000)
                            }
                        }
                    }:
                    {
                        setSellingAuction: {
                            initialPrice: ethers.utils.parseEther(amount.value).toString(),
                            refundable: false,
                            minIncrement: minIncrement.value,
                            currency: String(CurrencyEnum[currency.value as keyof typeof CurrencyEnum]),
                            deadline: String(Number(DateTime.fromJSDate(deadline.value).toSeconds())),
                            onFinish: () => {
                                toast.success("Good Job, Your NFT has been added")
                                setTimeout(() => router.push("/home"), 5000)
                            }
                        }
                    }

            const royaltiesOptions =
                selling.value === NftSellingStatusEnum[NftSellingStatusEnum.NO_SELLING] ? undefined :
                    {
                        percentage: royalties.value,
                        onFinish: sellingOptions === undefined ? () => {
                            toast.success("Good Job, Your NFT has been added")
                            setTimeout(() => router.push("/home"), 5000)
                        } : undefined
                    }

            const createNftOptions = {
                ipfsURI: ipfsURI,
                onFinish: (sellingOptions === undefined && royaltiesOptions === undefined) ? () => {
                    console.log("FUNCTION TRIGGER")
                    toast.success("Good Job, Your NFT has been added")
                    setTimeout(() => router.push("/home"), 5000)
                } : undefined
            }
            setNftDialogueOpen(true)
            showModal(
                <BlockchainWrapper
                    createNft={createNftOptions}
                    setRoyalties={royaltiesOptions}
                    setSelling={sellingOptions}
                />
            )
        }
    }, [ipfsURI])
    useEffect(() => {
        if(!open && nftDialogueOpen){
            router.push("/home")
        }
    }, [open, nftDialogueOpen])

    return (
        <div className="flex font-main flex-col gap-12 items-center justify-center w-full text-white">
            <h1 className="text-4xl font-bold">Add a New Post</h1>
            <div className="flex flex-row gap-12 w-full items-start justify-center">
                <AddContent onFormSubmit={submitForm}/>
                <PreviewContent
                    header={{
                        nft: postType.value === AddPostTypeEnum.NFT || postType.value === AddPostTypeEnum.POST_NFT
                    }}
                />
            </div>
        </div>
    );
};

AddPost.getLayout = function getLayout(page: ReactElement) {
    return (
        <RequireLogin>
            <Layout left={true} top={false}>
                <AddPostInfo>
                    {page}
                </AddPostInfo>
            </Layout>
        </RequireLogin>
    )
}

export default AddPost;