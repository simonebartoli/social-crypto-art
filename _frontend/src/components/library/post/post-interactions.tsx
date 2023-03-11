import React, {useEffect, useRef, useState} from 'react';
import KeyboardDoubleArrowUpOutlinedIcon from "@mui/icons-material/KeyboardDoubleArrowUpOutlined";
import KeyboardDoubleArrowDownOutlinedIcon from "@mui/icons-material/KeyboardDoubleArrowDownOutlined";
import QuestionAnswerOutlinedIcon from "@mui/icons-material/QuestionAnswerOutlined";
import {NextPage} from "next";
import {useModal} from "@/contexts/modal";
import ActionRequireLogin from "@/components/library/auth/action-require-login";
import {PostInteractionType} from "@/components/library/post/post.type";
import {useMutation} from "@apollo/client";
import {ADD_UPVOTE_DOWNVOTE, REMOVE_UPVOTE_DOWNVOTE} from "@/graphql/post";
import {toast} from "react-toastify";
import {useLogin} from "@/contexts/login";
import {useFetchingPostsContext} from "@/contexts/fetching-posts";
import {Interaction} from "@/__generated__/graphql";
import FixedPriceSelling from "@/components/library/nft-selling/fixed-price-selling";
import ModifyNft from "@/components/library/post/interactions/modify-nft";
import ActionRequireWeb3Account from "@/components/library/auth/action-require-web3-account";
import {usePostContext} from "@/contexts/post-info";

type Props = {
    post_id: string
    nft_id?: string
    interactions: PostInteractionType
    comment: {
        value: boolean
        set: React.Dispatch<React.SetStateAction<boolean>>
    }
}

const PostInteractions: NextPage<Props> = ({post_id, interactions, nft_id, comment}) => {
    const {showModal, open} = useModal()
    const {nftInfo, setLoadingWeb3Changes} = usePostContext() || {}
    const {modifyPost: {modifyInteraction}} = useFetchingPostsContext()
    const {personalInfo} = useLogin()
    const opened = useRef<boolean>(false)

    const [showSections, setShowSections] = useState({
        selling: false,
        nftModify: false
    })

    const [optionSelected, setOptionSelected] = useState<"UPVOTE" | "DOWNVOTE">()
    const [upvoteSelected, setUpvoteSelected] = useState<boolean>(personalInfo ? interactions.upvoteUsers.includes(personalInfo.nickname) : false)
    const [downvoteSelected, setDownvoteSelected] = useState<boolean>(personalInfo ? interactions.downvoteUsers.includes(personalInfo.nickname) : false)

    const [addUpvoteDownvote] = useMutation(ADD_UPVOTE_DOWNVOTE, {
        onError: (error) => {
            toast.error(error.message)
        },
        onCompleted: (data) => {
            modifyInteraction(data.addUpvoteDownvote.post_id, {
                nft: interactions.nft,
                selling: interactions.selling,
                downvoteUsers: data.addUpvoteDownvote.interactions.downvote_users.map(_ => _.nickname),
                upvoteUsers: data.addUpvoteDownvote.interactions.upvote_users.map(_ => _.nickname),
                upvoteTotal: data.addUpvoteDownvote.interactions.upvote_total,
                downvoteTotal: data.addUpvoteDownvote.interactions.downvote_total,
                commentTotal: interactions.commentTotal
            })
        }
    })
    const [removeUpvoteDownvote] = useMutation(REMOVE_UPVOTE_DOWNVOTE, {
        onError: (error) => {
            toast.error(error.message)
        },
        onCompleted: (data) => {
            modifyInteraction(data.removeUpvoteDownvote.post_id, {
                nft: interactions.nft,
                selling: interactions.selling,
                downvoteUsers: data.removeUpvoteDownvote.interactions.downvote_users.map(_ => _.nickname),
                upvoteUsers: data.removeUpvoteDownvote.interactions.upvote_users.map(_ => _.nickname),
                upvoteTotal: data.removeUpvoteDownvote.interactions.upvote_total,
                downvoteTotal: data.removeUpvoteDownvote.interactions.downvote_total,
                commentTotal: interactions.commentTotal
            })
        }
    })

    const addInteraction = (type: "UPVOTE" | "DOWNVOTE") => {
        if(type === "UPVOTE") {
            if(!personalInfo){
                setOptionSelected("UPVOTE")
            }
            else if(!upvoteSelected){
                addUpvoteDownvote({
                    variables: {
                        data: {
                            post_id: Number(post_id),
                            type: Interaction.Upvote
                        }
                    }
                })
            }else if(upvoteSelected){
                removeUpvoteDownvote({
                    variables: {
                        data: {
                            post_id: Number(post_id),
                            type: Interaction.Upvote
                        }
                    }
                })
            }
        }else if(type === "DOWNVOTE") {
            if(!personalInfo){
                setOptionSelected("DOWNVOTE")
            }
            else if(!downvoteSelected){
                addUpvoteDownvote({
                    variables: {
                        data: {
                            post_id: Number(post_id),
                            type: Interaction.Downvote
                        }
                    }
                })
            }else if(downvoteSelected){
                removeUpvoteDownvote({
                    variables: {
                        data: {
                            post_id: Number(post_id),
                            type: Interaction.Downvote
                        }
                    }
                })
            }
        }
    }

    useEffect(() => {
        if(showSections.selling || showSections.nftModify){
            if(open){
                opened.current = true
            }else if(!open && opened.current){
                opened.current = false
                setShowSections({nftModify: false, selling: false})
            }
        }
    }, [showSections, open])
    useEffect(() => {
        setUpvoteSelected(personalInfo ? interactions.upvoteUsers.includes(personalInfo.nickname) : false)
        setDownvoteSelected(personalInfo ? interactions.downvoteUsers.includes(personalInfo.nickname) : false)
    }, [interactions])
    useEffect(() => {
        if(!open){
            setOptionSelected(undefined)
        }
    }, [open])

    return (
        <div className="mt-8 text-white w-full flex flex-col gap-3">
            {
                optionSelected &&
                    <ActionRequireLogin
                        callback={() => addInteraction(optionSelected)}
                    />
            }
            {
                (interactions.nft && interactions.selling) &&
                <div onClick={() => setShowSections({...showSections, selling: true})}
                     className="cursor-pointer hover:bg-white hover:text-black transition border-black border-[1px] shadow-lg p-4 text-xl bg-black rounded-lg w-full flex flex-col items-center justify-center">
                    {
                        showSections.selling &&
                        <ActionRequireLogin callback={() => showModal(
                            <FixedPriceSelling/>
                        )}/>
                    }
                    <span>Check Further Info / Make Offer</span>
                </div>
            }
            {
                (interactions.nft && nft_id && nftInfo) &&
                <div onClick={() => setShowSections({...showSections, nftModify: true})}
                     className="cursor-pointer hover:bg-white hover:text-black transition border-black border-[1px] shadow-lg p-4 text-xl bg-black rounded-lg w-full flex flex-col items-center justify-center">
                    {
                        showSections.nftModify &&
                        <ActionRequireLogin callback={() => showModal(
                            <ActionRequireWeb3Account
                                specificAccount={nftInfo.currentOwner}
                                callback={() => showModal(
                                    <ModifyNft
                                        callback={() => {
                                            if(setLoadingWeb3Changes) setLoadingWeb3Changes(true)
                                        }}
                                        nftInfo={nftInfo}
                                        nft_id={nft_id}
                                    />
                                )}
                            />
                        )}/>
                    }
                    <span>Modify NFT</span>
                </div>
            }
            <div className="flex flex-row items-center justify-around p-3 rounded-lg w-full bg-black">
                <div className="flex flex-row items-center justify-center gap-2">
                    <span>{interactions.upvoteTotal}</span>
                    <KeyboardDoubleArrowUpOutlinedIcon
                        onClick={() => addInteraction("UPVOTE")}
                        className={`${upvoteSelected ? "text-custom-blue" : "hover:text-custom-blue"} cursor-pointer transition !text-3xl`}/>
                </div>
                <div className="flex flex-row items-center justify-center gap-2">
                    <span>{interactions.downvoteTotal}</span>
                    <KeyboardDoubleArrowDownOutlinedIcon
                        onClick={() => addInteraction("DOWNVOTE")}
                        className={`${downvoteSelected ? "text-custom-blue" : "hover:text-custom-blue"} cursor-pointer transition !text-3xl`}/>
                </div>
                <div className="flex flex-row items-center justify-center gap-2">
                    <span>{interactions.commentTotal}</span>
                    <QuestionAnswerOutlinedIcon onClick={() => comment.set(!comment.value)}
                                                className={`${comment.value && "text-custom-blue"} cursor-pointer hover:text-custom-blue transition !text-3xl`}/>
                </div>
            </div>
        </div>
    );
};

export default PostInteractions;