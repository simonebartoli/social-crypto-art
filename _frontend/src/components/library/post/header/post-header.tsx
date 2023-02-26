import React, {useEffect, useState} from 'react';
import Image from "next/image";
import TEST from "../../../../../public/test.webp";
import {NextPage} from "next";
import NftInfo from "@/components/library/post/header/nft-info";
import {DateTime} from "luxon";
import {PostHeaderType} from "@/components/library/post/post.type";

type Props = {
    header: PostHeaderType
}

const PostHeader: NextPage<Props> = ({header}) => {
    const [date, setDate] = useState<string>("")
    useEffect(() => {
        setDate(DateTime.fromISO(header.date).toLocaleString(DateTime.DATETIME_FULL))
    }, [])

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
                    <span className="text-2xl bg-black py-2 px-4 text-white rounded-lg">{header.nickname}</span>
                </div>
                <div className="flex flex-row gap-6 items-center justify-center">
                    <span className={`${header.type === "NFT" ? "bg-custom-green" : "bg-custom-blue"} py-2 px-4 text-lg rounded-lg`}>
                        {
                            header.type === "NFT" ? "NFT" : "POST"
                        }
                    </span>
                </div>
            </div>
            <div className="w-full">
                <span className="text-custom-grey">{date}</span>
            </div>
            {
                header.type === "NFT" &&
                <NftInfo allNft={header.allNft}/>
            }
        </div>
    );
};

export default PostHeader;