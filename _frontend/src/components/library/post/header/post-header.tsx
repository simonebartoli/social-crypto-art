import React, {useEffect, useState} from 'react';
import Image from "next/image";
import TEST from "../../../../../public/test.webp";
import {NextPage} from "next";
import NftInfo from "@/components/library/post/header/nft-info";
import {DateTime} from "luxon";

type Props = {
    data: {
        nft: boolean
        allNft: boolean
        nickname: string
        date: Date
    }
}

const PostHeader: NextPage<Props> = ({data}) => {
    const [date, setDate] = useState<string>("")
    useEffect(() => setDate(DateTime.fromJSDate(data.date).toLocaleString(DateTime.DATETIME_FULL)), [])

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
                    <span className="text-2xl bg-black py-2 px-4 text-white rounded-lg">{data.nickname}</span>
                </div>
                <div className="flex flex-row gap-6 items-center justify-center">
                    <span className={`${data.nft ? "bg-custom-green" : "bg-custom-blue"} py-2 px-4 text-lg rounded-lg`}>
                        {
                            data.nft ? "NFT" : "POST"
                        }
                    </span>
                </div>
            </div>
            <div className="w-full">
                <span className="text-custom-grey">{date}</span>
            </div>
            {
                data.nft &&
                <NftInfo allNft={data.allNft}/>
            }
        </div>
    );
};

export default PostHeader;