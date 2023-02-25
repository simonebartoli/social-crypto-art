import React from 'react';
import {NftSellingStatusEnum} from "@/enums/global/nft-enum";
import SellingFixedAuction from "@/components/add-post/components/options/selling-fixed-auction";
import {useAddPostInfo} from "@/contexts/add-post-info";

const Selling = () => {
    const {selling} = useAddPostInfo()

    return (
        <div className="p-4 bg-black text-white rounded-lg flex flex-col items-center justify-center w-full gap-8">
            <div className="flex text-xl flex-row gap-4 w-full items-center justify-start">
                <span>Selling Status: </span>
                <select value={selling.value} onChange={(e) => selling.set(e.target.value)} className="bg-white text-black p-2">
                    <option value={NftSellingStatusEnum[NftSellingStatusEnum.NO_SELLING]}>NO SELLING</option>
                    <option value={NftSellingStatusEnum[NftSellingStatusEnum.SELLING_FIXED_PRICE]}>FIXED PRICE SELLING</option>
                    <option value={NftSellingStatusEnum[NftSellingStatusEnum.SELLING_AUCTION]}>AUCTION SELLING</option>
                </select>
            </div>
            {
                selling.value === NftSellingStatusEnum[NftSellingStatusEnum.SELLING_FIXED_PRICE] ?
                <SellingFixedAuction type={NftSellingStatusEnum[selling.value as keyof typeof NftSellingStatusEnum]}/> :
                selling.value === NftSellingStatusEnum[NftSellingStatusEnum.SELLING_AUCTION] &&
                <SellingFixedAuction type={NftSellingStatusEnum[selling.value as keyof typeof NftSellingStatusEnum]}/>
            }
        </div>
    );
};

export default Selling;