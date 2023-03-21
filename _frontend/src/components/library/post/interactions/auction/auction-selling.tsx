import React, {useState} from 'react';
import {ethers} from "ethers";
import {NftInfoType} from "@/components/library/post/nft.type";
import {NextPage} from "next";
import {CurrencyEnum} from "@/enums/global/nft-enum";
import {ZERO_ADDRESS} from "@/globals";
import {socialNFTAddress} from "@/contracts";
import {
    Contract_getAuctionOffers, Contract_getAuctionOffers_CallbackType
} from "@/contexts/contract";
import {useEthers} from "@usedapp/core";
import Metamask from "@/components/settings/buttons/metamask";
import WalletConnect from "@/components/settings/buttons/wallet-connect";
import Button from "@/components/login/button";
import {toast} from "react-toastify";
import {DateTime} from "luxon";
import Offers from "@/components/library/post/interactions/auction/offers";
import {SocialNFT} from "@/__typechain";

type Props = {
    nftId: string
    nftInfo: NftInfoType<"AUCTION">
}

const AuctionSelling: NextPage<Props> = ({nftId, nftInfo}) => {
    const {account} = useEthers()
    const [tabToShow, setTabToShow] = useState<"MAIN" | "OFFERS">("MAIN")
    const [offers, setOffers] = useState< SocialNFT.Selling_AuctionOffersStructOutput[]>()

    const onCallback = (e: Contract_getAuctionOffers_CallbackType) => {
        if(e.error){
            toast.error(e.error.message)
        }else if(e.value){
            setOffers(e.value)
            console.log(e.value)
        }
    }
    const goBack = () => {
        setTabToShow("MAIN")
    }
    if(!account){
        return (
            <div className="flex flex-col gap-4 w-3/4">
                <span className="text-2xl font-bold mb-8">
                    You need to connect to a Web3 Account to continue
                </span>
                <Metamask/>
                <WalletConnect/>
            </div>
        )
    }

    return (
        tabToShow === "MAIN" ?
            <div className="h-full flex flex-col items-center justify-start font-main gap-6 w-full">
                <h2 className="text-4xl font-bold">Information and Selling NFT</h2>
                <Contract_getAuctionOffers nft_id={nftId} callback={onCallback}/>
                <div className="flex grid grid-cols-3 gap-4 justify-center items-center gap-4 bg-custom-light-grey p-4 rounded-lg w-full">
                    <span className="text-xl font-bold">PARAMETER</span>
                    <span className="col-span-2 text-xl font-bold">VALUE</span>
                    <span className="text-lg">NFT ID:</span>
                    <span className="col-span-2 text-lg font-bold">{nftId}</span>
                    <span className="text-lg">SELLER:</span>
                    <span className="col-span-2 text-lg font-bold">{nftInfo.currentOwner}</span>
                    <span className="text-lg">CREATOR:</span>
                    <span className="col-span-2 text-lg font-bold">{nftInfo.originalOwner === ZERO_ADDRESS ? nftInfo.currentOwner : nftInfo.originalOwner}</span>
                    <span className="col-span-3 w-full border-t-[1px] border-custom-grey"/>
                    <span>INITIAL PRICE:</span>
                    <span className="col-span-2 text-lg font-bold">{`${ethers.utils.formatEther(nftInfo.auction.initialPrice)} ${CurrencyEnum[nftInfo.auction.currency]}`}</span>
                    <span>CURRENCY:</span>
                    <span className="col-span-2 text-lg font-bold">{
                        `${CurrencyEnum[nftInfo.auction.currency]} ${nftInfo.auction.currency !== CurrencyEnum.ETH ? "(" + nftInfo.auction.currencyAddress + ")" : ""}`
                    }</span>
                    <span>DEADLINE:</span>
                    <span className="col-span-2 text-lg font-bold">{`${DateTime.fromSeconds(Number(nftInfo.auction.deadline)).toISO()}`}</span>
                    <span>MIN INCREMENT:</span>
                    <span className="col-span-2 text-lg font-bold">{`${nftInfo.auction.minIncrement}%`}</span>
                    <span className="col-span-3 w-full border-t-[1px] border-custom-grey"/>
                    <span>TX CONTRACT (SocialNFT):</span>
                    <span className="col-span-2 text-lg font-bold">{socialNFTAddress}</span>
                </div>
                <Button onClick={() => setTabToShow("OFFERS")} text={"Check Current Offers"}/>
            </div> : offers ?
            <Offers offers={offers} nftId={nftId} nftInfo={nftInfo} goBack={goBack}/> : <></>
    );
};

export default AuctionSelling;