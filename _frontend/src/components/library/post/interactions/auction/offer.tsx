import React from 'react';
import Image from "next/image";
import TEST from "../../../../../../public/test.webp";
import {NextPage} from "next";
import {DateTime} from "luxon";
import {ethers} from "ethers";
import {useWeb3Info} from "@/contexts/web3-info";

type Props = {
    bidder: string
    date: string
    amount: string,
    currency: string
}

const Offer: NextPage<Props> = ({bidder, amount, date, currency}) => {
    const {account} = useWeb3Info()

    return (
        <div className={`${account?.toLowerCase() === bidder.toLowerCase() ? "bg-custom-blue" : "bg-custom-light-grey"} flex flex-col items-center justify-center gap-4 p-6 rounded-lg`}>
            <div className="flex flex-row items-center justify-center gap-4">
                <div className="relative w-[50px] h-[50px] rounded-xl overflow-hidden">
                    <Image fill={true} style={{objectFit: "fill"}} src={TEST} alt={""}/>
                </div>
                <div className="flex flex-col justify-center items-start gap-1">
                    <span className="font-bold text-lg">{bidder}</span>
                    <span>Alias of <span className="underline">micheal</span></span>
                </div>
            </div>
            <span className="border-t-[1px] border-custom-grey w-full"/>
            <div className="flex flex-col gap-4 items-start justify-center w-full">
                <div className="flex flex-row gap-4 text-lg font-bold">
                    <span>AMOUNT OFFERED:</span>
                    <span>{`${ethers.utils.formatEther(amount)} ${currency}`}</span>
                </div>
                <span>Offer Made on {DateTime.fromSeconds(Number(date)).toLocaleString(DateTime.DATETIME_FULL)}</span>
            </div>
        </div>
    );
};

export default Offer;