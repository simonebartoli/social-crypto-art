import React from 'react';
import Image from "next/image";
import TEST from "../../../../../public/test.webp";
import {NextPage} from "next";
import NftInfo from "@/components/library/post/header/nft-info";

type Props = {
    nft: boolean
}

const PostHeader: NextPage<Props> = ({nft}) => {
    return (
        <div className="flex flex-col gap-3 items-center justify-center w-full"> {/*HEADER*/}
            <div className="flex flex-row items-center justify-between w-full">
                <div className="flex flex-row gap-6 items-center justify-center"> {/*HEADER USER INFO*/}
                    <div className="relative h-[50px] w-[50px] rounded-xl overflow-hidden">
                        <Image
                            src={TEST}
                            fill={true}
                            style={{objectFit: "contain"}}
                            alt={""}
                        />
                    </div>
                    <span className="text-2xl bg-black py-2 px-4 text-white rounded-lg">simo2001</span>
                </div>
                <div className="flex flex-row gap-6 items-center justify-center">
                    <span className={`${nft ? "bg-custom-green" : "bg-custom-blue"} py-2 px-4 text-lg rounded-lg`}>
                        {
                            nft ? "NFT" : "POST"
                        }
                    </span>
                </div>
            </div>
            <div className="w-full">
                <span className="text-custom-grey">20 December 2023 at 15:15</span>
            </div>
            {
                nft &&
                <NftInfo/>
            }
        </div>
    );
};

export default PostHeader;