import React, {ChangeEvent, FormEvent, useEffect, useRef, useState} from 'react';
import {NftInfoType} from "@/components/library/post/nft.type";
import {NextPage} from "next";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import Offer from "@/components/library/post/interactions/auction/offer";
import Button from "@/components/login/button";
import {SocialNFT} from "@/__typechain";
import {CurrencyEnum} from "@/enums/global/nft-enum";
import {BigNumber, ethers} from "ethers";
import {DateTime} from "luxon";
import MakeOfferAuctionBlockchainInteraction
    from "@/components/library/blockchain-operations/make-offer-auction-blockchain-interaction";
import {BlockchainCallbackContext} from "@/contexts/blockchain-callback";
import BlockchainWrapper from "@/components/library/blockchain-wrapper";
import {toast} from "react-toastify";
import {useEthers} from "@usedapp/core";
import {usePostContext} from "@/contexts/post-info";
import IncreaseAllowanceErc20BlockchainInteraction
    from "@/components/library/blockchain-operations/increase-allowance-erc20-blockchain-interaction";


type Props = {
    nftId: string
    nftInfo: NftInfoType<"AUCTION">
    offers:  SocialNFT.Selling_AuctionOffersStructOutput[]
    erc20Balance?: string
    erc20Allowance?: string
    goBack: () => void
}

const Offers: NextPage<Props> = ({nftId, nftInfo, offers, erc20Balance, erc20Allowance, goBack}) => {
    const {account} = useEthers()
    const {setLoadingWeb3Changes} = usePostContext() || {}

    const form = useRef<HTMLFormElement>(null)
    const [interactions, setInteractions] = useState<JSX.Element[]>([])
    const [minimumOffer, setMinimumOffer] = useState(nftInfo.auction.initialPrice)
    const [remainingTime, setRemainingTime] = useState("")

    const [errorMessage, setErrorMessage] = useState("")
    const [disabled, setDisabled] = useState(true)

    const [amount, setAmount] = useState("0")
    const onAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        if(!isNaN(Number(newValue.at(-1))) || newValue.at(-1) === "." || newValue.length === 0){
            if(!isNaN(Number(newValue + "0"))){
                setAmount(newValue)
            }
        }
    }
    const calculateRemainingTime = () => {
        const date = DateTime.fromSeconds(Number(nftInfo.auction.deadline))
        const diff = date.diffNow(["days", "hours", "minutes"])
        setRemainingTime(`${diff.days} days, ${diff.hours} hours and ${Math.floor(diff.minutes)} minutes`)
    }
    const onFormSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formattedAmount = ethers.utils.parseEther(amount)
        const newOps = []
        if(nftInfo.auction.currency !== CurrencyEnum.ETH){
            const erc20ToAllow = formattedAmount.sub(BigNumber.from(erc20Allowance))
            if(erc20ToAllow.gt(0)){
                newOps.push(<IncreaseAllowanceErc20BlockchainInteraction
                    address={nftInfo.auction.currencyAddress}
                    amount={erc20ToAllow.toString()}
                    onFinish={() => {
                        if(setLoadingWeb3Changes){
                            setLoadingWeb3Changes(true)
                        }
                        toast.success("Offer Placed 🎉")
                    }}
                />)
            }
        }
        newOps.push(<MakeOfferAuctionBlockchainInteraction
            nft_id={nftId}
            auction_id={nftInfo.auction.auctionId}
            type={nftInfo.auction.currency === CurrencyEnum.ETH ? "NATIVE" : "ERC20"}
            amount={formattedAmount.toString()}
            onFinish={() => {
                if(setLoadingWeb3Changes){
                    setLoadingWeb3Changes(true)
                }
                toast.success("Offer Placed 🎉")
            }}
        />)
        setInteractions(newOps)
    }

    useEffect(() => {
        if(offers.length > 0){
            const maxOffer = offers.sort((a, b) => a.amount.lt(b.amount) ? 1 : -1)[0].amount
            const alreadyOffered = offers.find(_ => _.owner === account)?.amount
            if(alreadyOffered){
                setMinimumOffer(maxOffer.mul(BigNumber.from(nftInfo.auction.minIncrement).add(100)).div(100).sub(alreadyOffered).toString())
            }else{
                setMinimumOffer(maxOffer.mul(BigNumber.from(nftInfo.auction.minIncrement).add(100)).div(100).toString())
            }
        }else{
            setMinimumOffer(BigNumber.from(nftInfo.auction.initialPrice)
                .mul(BigNumber.from(nftInfo.auction.minIncrement).add(100)).div(100).toString()
            )
        }
    }, [offers, account])
    useEffect(() => {
        setInterval(() => {
            calculateRemainingTime()
        }, 1000*60)
        calculateRemainingTime()
    }, [nftInfo])
    useEffect(() => {
        if(nftInfo.auction.currency !== CurrencyEnum.ETH && BigNumber.from(erc20Balance).lt(minimumOffer)){
            setDisabled(true)
            setErrorMessage(`Not enough ${CurrencyEnum[nftInfo.auction.currency]} owned`)
        }else{
            setErrorMessage("")
            if(amount !== ""){
                if(ethers.utils.parseEther(amount).gte(minimumOffer)){
                    setDisabled(false)
                }else{
                    setDisabled(true)
                }
            }else{
                setDisabled(true)
            }
        }
    }, [amount, minimumOffer, erc20Balance])

    if(interactions.length > 0){
        return <BlockchainCallbackContext>
            <BlockchainWrapper interactions={interactions}/>
        </BlockchainCallbackContext>
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
            <form ref={form} onSubmit={onFormSubmit} className="flex flex-col items-center justify-center gap-6">
                <h2 className="text-2xl font-bold">{nftInfo.currentOwner !== account ? "Want to Offer?" : "Auction Details:"}</h2>
                <div className="grid bg-custom-grey text-white grid-cols-2">
                    <span className="p-4 border-b-[1px] border-white text-lg">MINIMUM OFFER:</span>
                    <span className="p-4 border-b-[1px] border-white font-bold text-lg">{`${ethers.utils.formatEther(minimumOffer)} ${CurrencyEnum[nftInfo.auction.currency]}`}</span>
                    <span className="p-4">AUCTION REMAINING TIME:</span>
                    <span className="p-4">{remainingTime}</span>
                </div>
                {
                    nftInfo.currentOwner !== account &&
                    <>
                        <div className="flex flex-col gap-2 w-full">
                            <span>Amount Bidded</span>
                            <div className="flex flex-row gap-2 items-center">
                                <input
                                    value={amount}
                                    onChange={onAmountChange}
                                    className="p-2 w-2/3 bg-custom-grey text-white rounded-lg border-2 border-white text-lg font-bold"/>
                                <span className="w-1/3 text-center text-lg">{CurrencyEnum[nftInfo.auction.currency]}</span>
                            </div>
                        </div>
                        <Button onClick={() => form.current && form.current.submit()} disabled={disabled} text={"Submit Offer"}/>
                        <span>{errorMessage}</span>
                    </>
                }

            </form>
        </div>
    );
};

export default Offers;