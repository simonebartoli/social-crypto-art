import React from 'react';
import Image from "next/image";
import TEST from "../../../../../../public/test.webp";
import {NextPage} from "next";

type Props = {
    bidder: string
    date: string
    amount: string,
    currency: string
}

const Offer: NextPage<Props> = ({bidder, amount, date, currency}) => {
    return (
        <div className="flex flex-col items-center justify-center gap-4 p-6 bg-custom-light-grey rounded-lg">
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
                    <span>{`${amount} ${currency}`}</span>
                </div>
                <span>Offer Made on 17/08/2023 at 14:53</span>
            </div>
        </div>
    );
};

export default Offer;