import React, {useEffect, useRef, useState} from 'react';
import {
    Contract_getAuctionDetails,
    Contract_getAuctionDetails_CallbackType,
    Contract_getAuctionOffersEvent,
    Contract_getAuctionOffersEvent_CallbackType
} from "@/contexts/contract";
import {toast} from "react-toastify";

type AuctionInfoType = {
    auctionId: string
    deadline: string
    currency: string
}
type OfferType = {
    auctionId: string
    date: string
    amount: string
    winner: boolean
}

const TestOffer = () => {
    const firstRender = useRef(true)
    const [offerMade, setOfferMade] = useState<string[]>([]) // AUCTION ID INVOLVED
    const [auctions, setAuctions] = useState<AuctionInfoType[]>([])

    const onGetAuctionOffersEvent = (e: Contract_getAuctionOffersEvent_CallbackType) => {
        if(e.error) {
            toast.error(e.error.message)
        }else if(e.value){
            if(JSON.stringify(e.value.auctionId) !== JSON.stringify(offerMade)){
                setOfferMade(e.value.auctionId)
            }
        }
    }
    const onGetAuctionDetailsCallback = (e: Contract_getAuctionDetails_CallbackType) => {
        if(e.error) {
            toast.error(e.error.message)
        }else if(e.value){

            setAuctions([...auctions, {
                auctionId: e.value.id,
                deadline: e.value.deadline,
                currency: e.value.currency
            }])
        }
    }

    useEffect(() => {
        console.log("I'M RE RENDERING")
    })

    return (
        <div>

            <Contract_getAuctionOffersEvent
                account={"0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc"}
                nftId={"1"}
                callback={onGetAuctionOffersEvent}
            />

            <Contract_getAuctionDetails
                nft_id={"1"}
                auction_id={"1"}
                callback={onGetAuctionDetailsCallback}
            />

        </div>
    );
};

export default TestOffer;