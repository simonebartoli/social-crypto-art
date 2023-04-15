import React, {useState} from 'react';
import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";
import ArrowDropUpOutlinedIcon from '@mui/icons-material/ArrowDropUpOutlined';
import {NextPage} from "next";
import {NftSellingStatusEnum} from "@/enums/global/nft-enum";
import {usePostContext} from "@/contexts/post-info";
import {ZERO_ADDRESS} from "@/globals";

type Props = {
    allNft: boolean
}

const NftInfo: NextPage<Props> = ({allNft}) => {
    const {nftInfo} = usePostContext() || {}
    const [showInfo, setShowInfo] = useState(false)

    return (
        <div className="p-4 flex flex-col items-center justify-center w-full bg-custom-light-grey rounded-lg gap-6">
            <div className="w-full flex flex-row justify-between items-center">
                <span className="text-xl font-bold">
                    {
                        nftInfo?.sellingType === NftSellingStatusEnum.NO_SELLING ? "NO SELLING" :
                        nftInfo?.sellingType === NftSellingStatusEnum.SELLING_FIXED_PRICE ? "SELLING - FIXED PRICE" :
                        "SELLING - AUCTION"
                    }
                </span>
                {
                    showInfo ?
                    <ArrowDropUpOutlinedIcon onClick={() => setShowInfo(false)} className="!text-2xl cursor-pointer"/>:
                    <ArrowDropDownOutlinedIcon onClick={() => setShowInfo(true)} className="!text-2xl cursor-pointer"/>
                }
            </div>
            {
                showInfo &&
                <div className="flex flex-col items-start justify-center gap-4 w-full text-lg">
                    <div className="flex flex-row gap-3 w-full items-center">
                        <span>Seller: </span>
                        <span className="font-bold">{nftInfo?.currentOwner}</span>
                    </div>
                    <div className="flex flex-row gap-3 w-full items-center">
                        <span>Original Creator: </span>
                        <span className="font-bold">{nftInfo?.originalOwner === ZERO_ADDRESS ? nftInfo?.currentOwner : nftInfo?.originalOwner}</span>
                    </div>
                    <div className="flex flex-row gap-3 w-full items-center">
                        <span>Status: </span>
                        <span className="p-2 bg-custom-red rounded-lg font-bold">NOT VERIFIED</span>
                    </div>
                    <span className="italic text-base">
                        {
                            allNft ? "All the contents of this post are NFTs.":
                                "Only the contents highlighted are NFTs"
                        }
                    </span>
                </div>
            }
        </div>
    );
};

export default NftInfo;