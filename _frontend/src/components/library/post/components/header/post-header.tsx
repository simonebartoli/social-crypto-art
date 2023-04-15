import React, {useEffect, useState} from 'react';
import Image from "next/image";
import TEST from "../../../../../../public/test.webp";
import {NextPage} from "next";
import NftInfo from "@/components/library/post/components/header/components/nft-info";
import {DateTime} from "luxon";
import {PostHeaderType} from "@/components/library/post/__post.type";
import {useLogin} from "@/contexts/login";
import Warning from "@/components/library/post/components/header/components/warning";
import {usePostContext} from "@/contexts/post-info";
import {useWeb3Info} from "@/contexts/web3-info";
import MyOffer from "@/components/library/post/components/header/components/my-offer";
import {Visibility} from "@/__generated__/graphql";

type Props = {
    header: PostHeaderType
    visibility: Visibility
    warningSync: boolean
    ipfs?: string
    verified?: boolean
    refetch?: () => void
}

const PostHeader: NextPage<Props> = ({header, visibility, warningSync, ipfs, verified, refetch}) => {
    const {nftInfo, loadingWeb3Changes} = usePostContext() || {}
    const {account} = useWeb3Info()
    const {logged, personalInfo} = useLogin()

    const [date, setDate] = useState<string>("")
    useEffect(() => {
        setDate(DateTime.fromISO(header.date).toLocaleString(DateTime.DATETIME_FULL))
    }, [])

    return (
        <div className="flex flex-col gap-3 items-center justify-center w-full"> {/*HEADER*/}
            {
                loadingWeb3Changes === true && <span className="text-custom-blue text-lg mb-4 font-bold">Loading Changes...</span>
            }
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
                    {
                        header.type === "NFT" ?
                        <div className="flex flex-row items-center justify-center gap-2">
                            <span className={`w-[10px] h-[10px] rounded-full ${verified === undefined ? "bg-custom-blue" : !verified ? "bg-custom-red" : "bg-custom-green"}`}/>
                            {
                                verified === undefined ?
                                <span className="text-custom-grey text-sm">Verifying...</span> :
                                !verified ?
                                <span className="text-custom-red text-sm">Not Existing</span> :
                                <span className="text-custom-green text-sm">Existing</span>
                            }
                        </div> :
                        <div className="flex flex-row items-center justify-center gap-2">
                            <span className={`w-[10px] h-[10px] rounded-full ${visibility === Visibility.Private ? "bg-custom-red" : "bg-custom-green"}`}/>
                            {
                                visibility === Visibility.Private ?
                                <span className="text-custom-red text-sm">Private</span> :
                                <span className="text-custom-green text-sm">Public</span>
                            }
                        </div>
                    }
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
                (warningSync && ipfs && refetch && logged && personalInfo && personalInfo.nickname === header.nickname) &&
                <Warning refetch={refetch} ipfs={ipfs}/>
            }
            {
                (header.type === "NFT" && nftInfo) &&
                <NftInfo allNft={header.allNft}/>
            }
            {
                (header.type === "NFT" && account) &&
                <MyOffer/>
            }
        </div>
    );
};

export default PostHeader;