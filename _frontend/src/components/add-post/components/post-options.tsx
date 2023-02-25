import React, {ChangeEvent, useEffect, useState} from 'react';
import KeyboardDoubleArrowDownOutlinedIcon from "@mui/icons-material/KeyboardDoubleArrowDownOutlined";
import KeyboardDoubleArrowUpOutlinedIcon from "@mui/icons-material/KeyboardDoubleArrowUpOutlined";
import Visibility from "@/components/add-post/components/options/visibility";
import {AddPostTypeEnum} from "@/enums/local/add-post-enum";
import Selling from "@/components/add-post/components/options/selling";
import {useAddPostInfo} from "@/contexts/add-post-info";
import {useModal} from "@/contexts/modal";
import {useEthers} from "@usedapp/core";
import RequireWeb3Account from "@/components/library/auth/require-web3-account";


const PostOptions = () => {
    const [selectedBeforeAccount, setSelectedBeforeAccount] = useState<string>(AddPostTypeEnum[AddPostTypeEnum.POST])

    const {account} = useEthers()
    const {showModal, closeModal} = useModal()
    const {postType} = useAddPostInfo()
    const [showExtraInfo, setShowExtraInfo] = useState(false)

    const onTypeOptionChange = (e: ChangeEvent<HTMLSelectElement>) => {
        if(e.target.value !== AddPostTypeEnum[AddPostTypeEnum.POST]){
            if(account){
                postType.set(AddPostTypeEnum[e.target.value as keyof typeof AddPostTypeEnum])
            }else{
                setSelectedBeforeAccount(e.target.value)
                showModal(<RequireWeb3Account/>)
            }
        }else{
            postType.set(AddPostTypeEnum[e.target.value as keyof typeof AddPostTypeEnum])
        }
    }

    useEffect(() => {
        if(account && selectedBeforeAccount !== AddPostTypeEnum[AddPostTypeEnum.POST]){
            closeModal()
            postType.set(AddPostTypeEnum[selectedBeforeAccount as keyof typeof AddPostTypeEnum])
        }else if(!account && selectedBeforeAccount !== AddPostTypeEnum[AddPostTypeEnum.POST]){
            postType.set(AddPostTypeEnum.POST)
        }
    }, [account])

    return (
        <div className="w-full flex text-black text-lg flex-col justify-center items-center gap-6 rounded-lg bg-white p-4">
            <div className="w-full flex flex-row justify-between items-center">
                <div className="flex flex-row gap-4 items-center justify-center">
                    <span>This Post is </span>
                    <select value={AddPostTypeEnum[postType.value]}
                            onChange={onTypeOptionChange}
                            className="p-3 font-main"
                    >
                        <option value={AddPostTypeEnum[AddPostTypeEnum.POST]}>just a post</option>
                        <option value={AddPostTypeEnum[AddPostTypeEnum.NFT]}>an NFT</option>
                        <option value={AddPostTypeEnum[AddPostTypeEnum.POST_NFT]}>an NFT and a post</option>
                    </select>
                </div>
                {
                    !showExtraInfo ?
                    <KeyboardDoubleArrowDownOutlinedIcon onClick={() => setShowExtraInfo(!showExtraInfo)} className="cursor-pointer !text-3xl"/> :
                    <KeyboardDoubleArrowUpOutlinedIcon onClick={() => setShowExtraInfo(!showExtraInfo)} className="cursor-pointer !text-3xl"/>
                }
            </div>
            {
                showExtraInfo &&
                <div className="flex flex-col gap-8 items-center justify-center w-full">
                    <div className="w-full h-[1px] border-t-[1px] border-custom-grey"/>
                    <Visibility/>
                    {
                        postType.value !== AddPostTypeEnum.POST &&
                        <Selling/>
                    }
                </div>
            }
        </div>
    );
};

export default PostOptions;