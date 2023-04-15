import React, {useEffect, useState} from 'react';
import {useWeb3Info} from "@/contexts/web3-info";
import {
    Contract_getAuctionDetails,
    Contract_getAuctionDetails_CallbackType,
    Contract_getAuctionOffers,
    Contract_getAuctionOffers_CallbackType,
    Contract_getAuctionOffersEvent,
    Contract_getAuctionOffersEvent_CallbackType
} from "@/contexts/contract";
import {usePostContext} from "@/contexts/post-info";
import {toast} from "react-toastify";
import ArrowDropUpOutlinedIcon from "@mui/icons-material/ArrowDropUpOutlined";
import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";
import {BigNumber, ethers} from "ethers";
import {DateTime} from "luxon";
import Button from "@/components/login/button";
import TerminateAuctionBlockchainInteractions
    from "@/components/library/blockchain-operations/terminate-auction-blockchain-interaction";
import {BlockchainCallbackContext} from "@/contexts/blockchain-callback";
import BlockchainWrapper from "@/components/library/blockchain-wrapper";
import {useModal} from "@/contexts/modal";

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

const MyOffer = () => {
    const {showModal} = useModal()
    const {account} = useWeb3Info()
    const {post} = usePostContext() || {}

    const [auctions, setAuctions] = useState<AuctionInfoType[]>([])
    const [interactions, setInteractions] = useState<JSX.Element[]>([])
    const [offerMade, setOfferMade] = useState<string[]>([]) // AUCTION ID INVOLVED
    const [offers, setOffers] = useState<OfferType[]>([])
    const [showInfo, setShowInfo] = useState(false)

    const onButtonClick = (auctionId: string) => {
        setInteractions([
            <TerminateAuctionBlockchainInteractions
                key={1}
                nft_id={post!.nft!.nft_id!}
                auction_id={auctionId}
                onFinish={() => {
                    toast.success("The auction has been terminated! 😎")
                }}
            />
        ])
    }
    const onGetAuctionOffersEventCallback = (e: Contract_getAuctionOffersEvent_CallbackType) => {
        if (e.error) {
            toast.error(e.error.message)
        } else if (e.value) {
            if(JSON.stringify(e.value.auctionId) !== JSON.stringify(offerMade)){
                setOfferMade(e.value.auctionId)
            }
        }
    }
    const onGetAuctionOffersCallback = (e: Contract_getAuctionOffers_CallbackType, auctionId: string) => {
        if (e.error) {
            toast.error(e.error.message)
        } else if (e.value) {
            if(e.value.length > 0){
                const personalOffer = e.value.filter(_ => _.owner.toLowerCase() === account?.toLowerCase())[0] ?? undefined
                if(personalOffer){
                    const winner = e.value.sort((a, b) => BigNumber.from(a.amount).lt(b.amount) ? 1 : -1)[0]
                    const finalValue = [...offers, {
                        auctionId: auctionId,
                        amount: personalOffer.amount.toString(),
                        date: personalOffer.date.toString(),
                        winner: winner.owner.toLowerCase() === account?.toLowerCase()
                    }]
                    if(JSON.stringify(finalValue.at(-1)) !== JSON.stringify(offers.at(-1))){
                        setOffers(finalValue)
                    }
                }else if(offers.length > 0){
                    setOffers([])
                }
            }
        }
    }
    const onGetAuctionDetailsCallback = (e: Contract_getAuctionDetails_CallbackType) => {
        if (e.error) {
            toast.error(e.error.message)
        } else if (e.value) {
            const finalValue = [...auctions, {
                auctionId: e.value.id,
                deadline: e.value.deadline,
                currency: e.value.currency
            }]
            if(JSON.stringify(finalValue.at(-1)) !== JSON.stringify(auctions.at(-1))){
                setAuctions(finalValue)
            }
        }
    }

    useEffect(() => {
        if(interactions.length > 0){
            showModal(
                <BlockchainCallbackContext>
                    <BlockchainWrapper interactions={interactions}/>
                </BlockchainCallbackContext>
            )
        }
    }, [interactions])

    return (
        <>
            {
                (account && post?.nft?.nft_id) &&
                <>
                    <Contract_getAuctionOffersEvent
                        account={account}
                        nftId={post.nft.nft_id}
                        callback={onGetAuctionOffersEventCallback}
                    />
                    {
                        offerMade.map((_, index) =>{
                            if(post?.nft?.nft_id){
                                return (
                                    <React.Fragment key={index}>
                                        <Contract_getAuctionOffers
                                            key={_}
                                            nft_id={post.nft.nft_id}
                                            auction_id={_}
                                            callback={(e) => onGetAuctionOffersCallback(e, _)}
                                        />
                                        <Contract_getAuctionDetails
                                            nft_id={post.nft.nft_id}
                                            auction_id={_}
                                            callback={onGetAuctionDetailsCallback}
                                        />
                                    </React.Fragment>
                                )
                            }
                        })
                    }
                    {
                        offers.map((_) =>
                            <div key={_.auctionId} className="p-4 flex flex-col items-center justify-center w-full bg-custom-light-grey rounded-lg gap-6">
                                <div className="w-full flex flex-row justify-between items-center">
                                    <span className="text-xl font-bold">
                                        My Offer
                                    </span>
                                    {
                                        showInfo ?
                                        <ArrowDropUpOutlinedIcon onClick={() => setShowInfo(false)} className="!text-2xl cursor-pointer"/>:
                                        <ArrowDropDownOutlinedIcon onClick={() => setShowInfo(true)} className="!text-2xl cursor-pointer"/>
                                    }
                                </div>
                                {
                                    showInfo &&
                                    <div className="flex flex-col items-start justify-center gap-4 w-full text-lg">
                                        <div className="flex flex-row gap-3 w-full items-center">
                                            <span>Amount: </span>
                                            <span className="font-bold">
                                                {`${ethers.utils.formatEther(_.amount)} ${auctions.filter(__ => __.auctionId === _.auctionId)[0].currency}`}
                                            </span>
                                        </div>
                                        <div className="flex flex-row gap-3 w-full items-center">
                                            <span>Proposed On: </span>
                                            <span className="font-bold">
                                                {DateTime.fromSeconds(Number(_.date)).toLocaleString(DateTime.DATETIME_FULL)}
                                            </span>
                                        </div>
                                        <span className="border-t-[1px] border-custom-grey w-full"/>
                                        {
                                            DateTime.now() < DateTime.fromSeconds(Number(auctions.filter(__ => __.auctionId === _.auctionId)[0].deadline)) ?
                                            <div className="flex flex-row gap-3 w-full items-center">
                                                <span>Auction Deadline: </span>
                                                <span className="font-bold">
                                                    {DateTime.fromSeconds(Number(auctions.filter(__ => __.auctionId === _.auctionId)[0].deadline)).toLocaleString(DateTime.DATETIME_FULL)}
                                                </span>
                                            </div> :
                                            <>
                                                <div className="flex flex-row gap-3 w-full items-center">
                                                    <span>Auction Deadline: </span>
                                                    <span className="font-bold">
                                                        {`The auction has finished on ${DateTime.fromSeconds(Number(auctions.filter(__ => __.auctionId === _.auctionId)[0].deadline)).toLocaleString(DateTime.DATETIME_FULL)}`}
                                                    </span>
                                                </div>
                                                {
                                                    _.winner ?
                                                    <div className="flex flex-col items-center justify-center w-full gap-2">
                                                        <span>Congratulations, You won the auction</span>
                                                        <Button onClick={() => onButtonClick(_.auctionId)} text={"Transfer NFT"}/>
                                                    </div> :
                                                    <div className="flex flex-col items-center justify-center w-full gap-2">
                                                        <span>We are sorry, you lost the last auction</span>
                                                        <Button onClick={() => onButtonClick(_.auctionId)} text={"Get a Refund"}/>
                                                    </div>
                                                }
                                            </>
                                        }
                                    </div>
                                }
                            </div>
                        )
                    }
                </>
            }
        </>
    );
};

// <>
//     {
//         (account && post?.nft?.nft_id) &&
//         <>
//             <Contract_getAuctionOffersEvent
//                 account={account}
//                 nftId={post.nft.nft_id}
//                 callback={onGetAuctionOffersEventCallback}
//             />
//             {/*{*/}
//             {/*    offerMade.map((_, index) =>{*/}
//             {/*        if(post?.nft?.nft_id){*/}
//             {/*            return (*/}
//             {/*                <React.Fragment key={index}>*/}
//             {/*                    <Contract_getAuctionOffers*/}
//             {/*                        key={_}*/}
//             {/*                        nft_id={post.nft.nft_id}*/}
//             {/*                        auction_id={_}*/}
//             {/*                        callback={(e) => onGetAuctionOffersCallback(e, _)}*/}
//             {/*                    />*/}
//             {/*                    <Contract_getAuctionDetails*/}
//             {/*                        nft_id={post.nft.nft_id}*/}
//             {/*                        auction_id={_}*/}
//             {/*                        callback={onGetAuctionDetailsCallback}*/}
//             {/*                    />*/}
//             {/*                </React.Fragment>*/}
//             {/*            )*/}
//             {/*        }*/}
//             {/*    })*/}
//             {/*}*/}
//             {
//                 // offers.map((_, index) =>
//                 //     <div key={_.auctionId} className="p-4 flex flex-col items-center justify-center w-full bg-custom-light-grey rounded-lg gap-6">
//                 //         <div className="w-full flex flex-row justify-between items-center">
//                 //             <span className="text-xl font-bold">
//                 //                 My Offer
//                 //             </span>
//                 //             {
//                 //                 showInfo ?
//                 //                 <ArrowDropUpOutlinedIcon onClick={() => setShowInfo(false)} className="!text-2xl cursor-pointer"/>:
//                 //                 <ArrowDropDownOutlinedIcon onClick={() => setShowInfo(true)} className="!text-2xl cursor-pointer"/>
//                 //             }
//                 //         </div>
//                 //         {
//                 //             showInfo &&
//                 //             <div className="flex flex-col items-start justify-center gap-4 w-full text-lg">
//                 //                 <div className="flex flex-row gap-3 w-full items-center">
//                 //                     <span>Amount: </span>
//                 //                     <span className="font-bold">
//                 //                         {`${ethers.utils.formatEther(_.amount)} ${auctions.filter(__ => __.auctionId === _.auctionId)[0].currency}`}
//                 //                     </span>
//                 //                 </div>
//                 //                 <div className="flex flex-row gap-3 w-full items-center">
//                 //                     <span>Proposed On: </span>
//                 //                     <span className="font-bold">
//                 //                         {DateTime.fromSeconds(Number(_.date)).toLocaleString(DateTime.DATETIME_FULL)}
//                 //                     </span>
//                 //                 </div>
//                 //                 <span className="border-t-[1px] border-custom-grey w-full"/>
//                 //                 {
//                 //                     DateTime.now() < DateTime.fromSeconds(Number(auctions.filter(__ => __.auctionId === _.auctionId)[0].deadline)) ?
//                 //                     <div className="flex flex-row gap-3 w-full items-center">
//                 //                         <span>Auction Deadline: </span>
//                 //                         <span className="font-bold">
//                 //                             {DateTime.fromSeconds(Number(auctions.filter(__ => __.auctionId === _.auctionId)[0].deadline)).toLocaleString(DateTime.DATETIME_FULL)}
//                 //                         </span>
//                 //                     </div> :
//                 //                     <>
//                 //                         <div className="flex flex-row gap-3 w-full items-center">
//                 //                             <span>Auction Deadline: </span>
//                 //                             <span className="font-bold">
//                 //                                 {`The auction has finished on ${DateTime.fromSeconds(Number(auctions.filter(__ => __.auctionId === _.auctionId)[0].deadline)).toLocaleString(DateTime.DATETIME_FULL)}`}
//                 //                             </span>
//                 //                         </div>
//                 //                         {
//                 //                             _.winner ?
//                 //                             <div className="flex flex-col items-center justify-center w-full gap-2">
//                 //                                 <span>Congratulations, You won the auction</span>
//                 //                                 <Button onClick={onButtonClick} text={"Transfer NFT"}/>
//                 //                             </div> :
//                 //                             <div className="flex flex-col items-center justify-center w-full gap-2">
//                 //                                 <span>We are sorry, you lost the last auction</span>
//                 //                                 <Button onClick={onButtonClick} text={"Get a Refund"}/>
//                 //                             </div>
//                 //                         }
//                 //                     </>
//                 //                 }
//                 //             </div>
//                 //         }
//                 //     </div>
//                 // )
//             }
//         </>
//     }
// </>

export default MyOffer;