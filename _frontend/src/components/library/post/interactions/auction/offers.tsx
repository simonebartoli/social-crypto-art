import React, {ChangeEvent, useState} from 'react';
import {NftInfoType} from "@/components/library/post/nft.type";
import {NextPage} from "next";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import Offer from "@/components/library/post/interactions/auction/offer";
import Button from "@/components/login/button";
import {SocialNFT} from "@/__typechain";
import {CurrencyEnum} from "@/enums/global/nft-enum";


type Props = {
    nftId: string
    nftInfo: NftInfoType<"AUCTION">
    offers:  SocialNFT.Selling_AuctionOffersStructOutput[]
    goBack: () => void
}

const Offers: NextPage<Props> = ({nftId, nftInfo, offers, goBack}) => {
    const [amount, setAmount] = useState("0")
    const onAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        if(!isNaN(Number(newValue.at(-1))) || newValue.at(-1) === "." || newValue.length === 0){
            if(!isNaN(Number(newValue + "0"))){
                setAmount(newValue)
            }
        }
    }

    return (
        <div className="flex flex-col gap-8 w-full items-center justify-start">
            <span onClick={goBack} className="flex flex-row gap-2 text-base cursor-pointer">
                <UndoOutlinedIcon/>
                Go Back
            </span>
            {
                offers.length > 0 ?
                    <div className="flex flex-col gap-8 max-h-[300px] overflow-y-scroll p-6 border-2 border-black bg-black">
                        {
                            offers.map((_, index) =>
                                <Offer
                                    amount={_.amount.toString()}
                                    currency={CurrencyEnum[nftInfo.auction.currency]}
                                    bidder={_.owner}
                                    date={_.date.toString()}
                                    key={index}
                                />
                            )
                        }
                    </div> :
                    <div className={"bg-black p-6 text-xl text-white rounded-lg w-full text-center"}>
                        No Offer For Now...
                    </div>
            }
            <div className="flex flex-col items-center justify-center gap-6">
                <h2 className="text-2xl font-bold">Want to Offer?</h2>
                <div className="grid bg-custom-grey text-white grid-cols-2">
                    <span className="p-4 border-b-[1px] border-white text-lg">MINIMUM OFFER:</span>
                    <span className="p-4 border-b-[1px] border-white font-bold text-lg">6.0 DAI</span>
                    <span className="p-4">AUCTION REMAINING TIME:</span>
                    <span className="p-4">4 days and 8 hours</span>
                </div>
                <div className="flex flex-col gap-2 w-full">
                    <span>Amount Bidded</span>
                    <div className="flex flex-row gap-2 items-center">
                        <input
                            value={amount}
                            onChange={onAmountChange}
                            className="p-2 w-2/3 bg-custom-grey text-white rounded-lg border-2 border-white text-lg font-bold"/>
                        <span className="w-1/3 text-center text-lg">DAI</span>
                    </div>
                </div>
                <Button text={"Submit Offer"}/>
            </div>
        </div>
    );
};

export default Offers;