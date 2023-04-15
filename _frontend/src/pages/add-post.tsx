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
import {PostContentTypeEnum} from "@/enums/global/post-enum";
import {Input_Content, Input_NftInfo, MediaType, NftSellingType, Visibility} from "@/__generated__/graphql";
import {API_URL_REST} from "@/globals";
import {CurrencyEnum, NftSellingStatusEnum} from "@/enums/global/nft-enum";
import {useModal} from "@/contexts/modal";
import {useRouter} from "next/router";
import {ethers} from "ethers";
import {DateTime} from "luxon";
import BlockchainWrapper from "@/components/library/blockchain-wrapper";
import CreateNftBlockchainInteraction
    from "@/components/library/blockchain-operations/create-nft-blockchain-interaction";
import SetRoyaltiesBlockchainInteraction
    from "@/components/library/blockchain-operations/set-royalties-blockchain-interaction";
import FixedPriceSellingBlockchainInteraction
    from "@/components/library/blockchain-operations/fixed-price-selling-blockchain-interaction";
import AuctionSellingBlockchainInteraction
    from "@/components/library/blockchain-operations/auction-selling-blockchain-interaction";
import {BlockchainCallbackContext} from "@/contexts/blockchain-callback";
import {NextPage} from "next";
import DOMPurify from "dompurify";

const AddPost = () => {
    const router = useRouter()
    const {showModal, open} = useModal()
    const [nftDialogueOpen] = useState(false)

    const [blockchainInteraction, setBlockchainInteraction] = useState(false)
    const [dataModal, setDataModal] = useState<Props["data"]>()

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

    const uploadImages = async (file: File) => {
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
    const uploadGif = async (file: File) => {
        const URL = `${API_URL_REST}/upload-gif`
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
                    const filePosition = await uploadImages(_.file)
                    content.push({
                        type: type,
                        is_nft: _.nft,
                        text: filePosition,
                        position: index
                    })
                    index += 1
                }else if(_.file && _.type === PostContentTypeEnum.GIF){
                    const filePosition = await uploadGif(_.file)
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
                        text: DOMPurify.sanitize(_.data),
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
                const visible = visibility.value as Visibility
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
            setDataModal({
                ipfs: ipfsURI,
                percentage: royalties.value,
                selling: selling.value,
                fixedPrice: selling.value === NftSellingStatusEnum[NftSellingStatusEnum.SELLING_FIXED_PRICE] ? {
                    currency: currency.value,
                    amount: amount.value
                } : undefined,
                auction: selling.value === NftSellingStatusEnum[NftSellingStatusEnum.SELLING_AUCTION] ? {
                    currency: currency.value,
                    deadline: deadline.value,
                    minIncrement: minIncrement.value,
                    initialPrice: amount.value,
                    refundable: false
                } : undefined
            })
            setBlockchainInteraction(true)
        }
    }, [ipfsURI])
    useEffect(() => {
        if(!open && nftDialogueOpen){
            router.push("/home")
        }
    }, [open, nftDialogueOpen])
    useEffect(() => {
        if(blockchainInteraction && dataModal){
            showModal(<Modal data={dataModal}/>)
        }
    }, [blockchainInteraction, dataModal])

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

type Props = {
    data: {
        ipfs: string
        selling: string
        percentage?: string
        fixedPrice?: {
            amount: string
            currency: string
        }
        auction?: {
            currency: string
            initialPrice: string
            refundable: boolean
            minIncrement: string
            deadline: Date
        }
    }
}
const Modal: NextPage<Props> = ({data}) => {
    const router = useRouter()

    const [nftId, setNftId] = useState<string>()
    const [interactions, setInteractions] = useState<JSX.Element[]>([])

    useEffect(() => {
        if(data.ipfs && !nftId){
            const sellingOptions = data.selling === NftSellingStatusEnum[NftSellingStatusEnum.NO_SELLING] ? undefined : true
            const royaltiesOptions = data.selling === NftSellingStatusEnum[NftSellingStatusEnum.NO_SELLING] ? undefined : true
            const createNftOptions = {
                ipfsURI: data.ipfs,
                onFinish: (sellingOptions === undefined && royaltiesOptions === undefined) ? () => {
                    console.log("FUNCTION TRIGGER")
                    toast.success("Good Job, Your NFT has been added")
                    setTimeout(() => router.push("/home"), 5000)
                } : undefined
            }
            const newOps: JSX.Element[] = [
                <CreateNftBlockchainInteraction
                    key={1}
                    ipfsURI={createNftOptions.ipfsURI}
                    setNftId={setNftId}
                    onFinish={createNftOptions.onFinish}
                />
            ]
            setInteractions(newOps)
        }
    }, [data.ipfs])
    useEffect(() => {
        if(nftId){
            const newOps: JSX.Element[] = []
            if(data.selling === NftSellingStatusEnum[NftSellingStatusEnum.SELLING_FIXED_PRICE] || data.selling === NftSellingStatusEnum[NftSellingStatusEnum.SELLING_AUCTION]){
                newOps.push(
                    <SetRoyaltiesBlockchainInteraction
                        nft_id={nftId}
                        onFinish={() => {
                            toast.success("Good Job, Your NFT has been added")
                            setTimeout(() => router.push("/home"), 5000)
                        }}
                        percentage={data.percentage!}
                    />
                )
                if(data.selling === NftSellingStatusEnum[NftSellingStatusEnum.SELLING_FIXED_PRICE]){
                    newOps.push(
                        <FixedPriceSellingBlockchainInteraction
                            nft_id={nftId}
                            amount={ethers.utils.parseEther(data.fixedPrice!.amount!).toString()}
                            currency={CurrencyEnum[data.fixedPrice!.currency as keyof typeof CurrencyEnum]}
                            onFinish={() => {
                                toast.success("Good Job, Your NFT has been added")
                                setTimeout(() => router.push("/home"), 5000)
                            }}
                        />
                    )
                }else if(data.selling === NftSellingStatusEnum[NftSellingStatusEnum.SELLING_AUCTION]) {
                    newOps.push(
                        <AuctionSellingBlockchainInteraction
                            nft_id={nftId}
                            currency={CurrencyEnum[data.auction!.currency as keyof typeof CurrencyEnum]}
                            initialPrice={ethers.utils.parseEther(data.auction!.initialPrice).toString()}
                            refundable={false}
                            minIncrement={data.auction!.minIncrement}
                            deadline={String(Number(DateTime.fromJSDate(data.auction!.deadline).toSeconds()))}
                            onFinish={() => {
                                toast.success("Good Job, Your NFT has been added")
                                setTimeout(() => router.push("/home"), 5000)
                            }}
                        />
                    )
                }
            }
            setInteractions(newOps)
        }
    }, [nftId])
    return (
        <BlockchainCallbackContext>
            <BlockchainWrapper
                interactions={interactions}
            />
        </BlockchainCallbackContext>
    )
}

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