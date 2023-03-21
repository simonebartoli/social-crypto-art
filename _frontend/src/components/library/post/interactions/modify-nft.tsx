import React, {ChangeEvent, useEffect, useRef, useState} from 'react';
import {NextPage} from "next";
import {ZERO_ADDRESS} from "@/globals";
import {CurrencyEnum, NftSellingStatusEnum} from "@/enums/global/nft-enum";
import {DateTime} from "luxon";
import {ethers} from "ethers";
import Button from "@/components/login/button";
import BlockchainWrapper from "@/components/library/blockchain-wrapper";
import FixedPriceSellingBlockchainInteraction
    from "@/components/library/blockchain-operations/fixed-price-selling-blockchain-interaction";
import {BlockchainCallbackContext} from "@/contexts/blockchain-callback";
import ResetSellingStatusBlockchainInteraction
    from "@/components/library/blockchain-operations/reset-selling-status-blockchain-interaction";
import AuctionSellingBlockchainInteraction
    from "@/components/library/blockchain-operations/auction-selling-blockchain-interaction";
import SetRoyaltiesBlockchainInteractions
    from "@/components/library/blockchain-operations/set-royalties-blockchain-interaction";
import {NftInfoType} from "@/components/library/post/nft.type";

type Props = {
    nft_id: string
    nftInfo: NftInfoType
    callback: () => void
}

const ModifyNft: NextPage<Props> = ({nft_id, nftInfo, callback}) => {

    const [blockchainInteraction, setBlockchainInteraction] = useState(false)
    const [creator, setCreator] = useState("")

    const originalValuesRef = useRef({
        royalties: "",
        sellingMode: "NO SELLING",
        amount: "",
        currency: CurrencyEnum[CurrencyEnum.ETH],
        deadline: "",
        minIncrement: "",
        refundable: false
    })
    const [royalties, setRoyalties] = useState("")
    const [sellingMode, setSellingMode] = useState<"NO SELLING" | "FIXED PRICE SELLING" | "AUCTION SELLING">("NO SELLING")

    const [amount, setAmount] = useState("")
    const [currency, setCurrency] = useState(CurrencyEnum[CurrencyEnum.ETH])
    const [deadline, setDeadline] = useState("")
    const [minIncrement, setMinIncrement] = useState("")
    const [refundable, setRefundable] = useState(false)

    const [disabled, setDisabled] = useState(false)
    const [interactions, setInteractions] = useState<JSX.Element[]>([])

    // INPUT VALIDATION
    const onAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        if(!isNaN(Number(newValue.at(-1))) || newValue.at(-1) === "." || newValue.length === 0){
            if(!isNaN(Number(newValue + "0"))){
                setAmount(newValue)
            }
        }
    }
    const onRoyaltiesChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        if((!isNaN(Number(newValue.at(-1))) || newValue.length === 0) && newValue.length < 3){
            if(newValue.length === 0 || Number(newValue) >= 0 && Number(newValue) <= 25){
                setRoyalties(newValue)
            }
        }
    }
    const onIncrementChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        if(!isNaN(Number(newValue.at(-1))) || newValue.length === 0){
            if(newValue.length === 0 || Number(newValue) >= 0 && Number(newValue) <= 50){
                setMinIncrement(newValue)
            }
        }
    }


    // FORM SUBMIT
    // TODO CHECK CURRENCY NOT CONSIDERED CORRECTLY
    const onFinishBlockchainInteraction = () => {
        callback()
    }
    const onModifyClick = () => {
        const newInteractions: JSX.Element[] = []

        if(royalties !== originalValuesRef.current.royalties){
            newInteractions.push(
                <SetRoyaltiesBlockchainInteractions
                    nft_id={nft_id}
                    percentage={royalties}
                    onFinish={() => onFinishBlockchainInteraction()}
                />
            )
        }
        if(sellingMode !== originalValuesRef.current.sellingMode){
            if(originalValuesRef.current.sellingMode !== "AUCTION SELLING"){
                if(originalValuesRef.current.sellingMode !== "NO SELLING"){
                    newInteractions.push(
                        <ResetSellingStatusBlockchainInteraction
                            nft_id={nft_id}
                            onFinish={() => onFinishBlockchainInteraction()}
                        />
                    )
                }
                if(sellingMode === "AUCTION SELLING"){
                    newInteractions.push(
                        <AuctionSellingBlockchainInteraction
                            nft_id={nft_id}
                            currency={CurrencyEnum[currency as keyof typeof CurrencyEnum]}
                            deadline={String(Math.floor(DateTime.fromISO(deadline).toSeconds()))}
                            minIncrement={minIncrement}
                            refundable={refundable}
                            initialPrice={ethers.utils.parseEther(amount).toString()}
                            onFinish={() => onFinishBlockchainInteraction()}
                        />
                    )
                }else if(sellingMode === "FIXED PRICE SELLING"){
                    newInteractions.push(
                        <FixedPriceSellingBlockchainInteraction
                            nft_id={nft_id}
                            currency={CurrencyEnum[currency as keyof typeof CurrencyEnum]}
                            amount={ethers.utils.parseEther(amount).toString()}
                            onFinish={() => onFinishBlockchainInteraction()}
                        />
                    )
                }
            }
        }
        else if(sellingMode === "FIXED PRICE SELLING"){
            if(amount !== originalValuesRef.current.amount || currency !== originalValuesRef.current.currency){
                newInteractions.push(
                    <ResetSellingStatusBlockchainInteraction
                        nft_id={nft_id}
                        onFinish={() => onFinishBlockchainInteraction()}
                    />
                )
                newInteractions.push(
                    <FixedPriceSellingBlockchainInteraction
                        nft_id={nft_id}
                        currency={CurrencyEnum[currency as keyof typeof CurrencyEnum]}
                        amount={ethers.utils.parseEther(amount).toString()}
                        onFinish={() => onFinishBlockchainInteraction()}
                    />
                )
            }
        }

        setInteractions(newInteractions)
    }

    useEffect(() => {
        const mode =
            nftInfo.sellingType === NftSellingStatusEnum.NO_SELLING ? "NO SELLING" :
                nftInfo.sellingType === NftSellingStatusEnum.SELLING_FIXED_PRICE ? "FIXED PRICE SELLING" :
                    "AUCTION SELLING"

        setCreator(nftInfo.originalOwner !== ZERO_ADDRESS ? nftInfo.originalOwner : nftInfo.currentOwner)
        setRoyalties(nftInfo.royalties)
        setSellingMode(mode)
        if(nftInfo.fixedPrice){
            setAmount(ethers.utils.formatEther(nftInfo.fixedPrice["amount"]))
            setCurrency(CurrencyEnum[nftInfo.fixedPrice["currency"]])
            originalValuesRef.current = {
                ...originalValuesRef.current,
                amount: ethers.utils.formatEther(nftInfo.fixedPrice["amount"]),
                currency: CurrencyEnum[nftInfo.fixedPrice["currency"]]
            }
        }else if(nftInfo.auction){
            setAmount(ethers.utils.formatEther(nftInfo.auction["initialPrice"]))
            setMinIncrement(nftInfo.auction["minIncrement"])
            setCurrency(CurrencyEnum[nftInfo.auction["currency"]])
            setDeadline(DateTime.fromSeconds(Number(nftInfo.auction["deadline"])).toISO({includeOffset: false}))
            setRefundable(nftInfo.auction["refundable"])
            originalValuesRef.current = {
                ...originalValuesRef.current,
                amount: ethers.utils.formatEther(nftInfo.auction["initialPrice"]),
                minIncrement: nftInfo.auction["initialPrice"],
                currency: CurrencyEnum[nftInfo.auction["currency"]],
                deadline: nftInfo.auction["deadline"],
                refundable: nftInfo.auction["refundable"]
            }
        }

        originalValuesRef.current = {
            ...originalValuesRef.current,
            royalties: nftInfo.royalties,
            sellingMode: mode
        }

    }, [nftInfo])
    useEffect(() => {
        if(interactions.length > 0){
            setBlockchainInteraction(true)
        }
    }, [interactions])
    useEffect(() => {

    }, [sellingMode, amount, currency, deadline, minIncrement, refundable])
    if(blockchainInteraction){
        return <BlockchainCallbackContext>
            <BlockchainWrapper
                interactions={interactions}
            />
        </BlockchainCallbackContext>
    }

    return (
        <div className="flex flex-col items-center justify-start gap-6 w-full">
            <h2 className="text-4xl font-bold">Modify your NFT options</h2>
            <div className="w-full flex grid grid-cols-3 gap-4 justify-center items-center gap-4 bg-custom-light-grey p-4 rounded-lg w-full">
                <span className="text-xl font-bold">PARAMETER</span>
                <span className="col-span-2 text-xl font-bold">VALUE</span>
                <span className="text-lg">NFT ID:</span>
                <span className="col-span-2 text-lg font-bold">{nft_id}</span>
                <span className="text-lg">CREATOR:</span>
                <span className="col-span-2 text-lg font-bold">{creator}</span>
                <span className="text-lg">ROYALTIES:</span>
                <div className="col-span-2 text-lg font-bold flex flex-row items-center gap-4">
                    <input
                        className="p-2 bg-custom-grey border-2 border-white text-white rounded-lg"
                        type="text"
                        value={royalties}
                        onChange={onRoyaltiesChange}
                    />
                    <span>%</span>
                </div>
                <span className="col-span-3 w-full border-t-[1px] border-custom-grey"/>
                <span>SELLING MODE:</span>
                <select className="col-span-2 text-lg bg-custom-grey p-2 text-white rounded-lg border-2 border-white font-bold"
                        value={sellingMode}
                        onChange={(e) => setSellingMode(e.target.value as typeof sellingMode)}
                >
                    <option>NO SELLING</option>
                    <option>FIXED PRICE SELLING</option>
                    <option>AUCTION SELLING</option>
                </select>
                {
                    sellingMode === "FIXED PRICE SELLING" ?
                    <>
                        <span>SELLING PRICE:</span>
                        <div className="col-span-2 flex flex-row gap-2 items-center">
                            <input
                                value={amount}
                                onChange={onAmountChange}
                                className="p-2 bg-custom-grey text-white rounded-lg border-2 border-white text-lg font-bold"/>
                            <span>{currency}</span>
                        </div>
                        <span>CURRENCY:</span>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="col-span-2 p-2 bg-custom-grey text-white rounded-lg border-2 border-white text-lg font-bold">
                            <option>{CurrencyEnum[CurrencyEnum.ETH]}</option>
                            <option>{CurrencyEnum[CurrencyEnum.DAI]}</option>
                            <option>{CurrencyEnum[CurrencyEnum.USDC]}</option>
                            <option>{CurrencyEnum[CurrencyEnum.USDC]}</option>
                            <option>{CurrencyEnum[CurrencyEnum.WETH]}</option>
                        </select>
                    </>
                        :
                    sellingMode === "AUCTION SELLING" &&
                    <>
                        <span>AMOUNT:</span>
                        <div className="col-span-2 flex flex-row gap-2 items-center">
                            <input
                                value={amount}
                                onChange={onAmountChange}
                                className="p-2 bg-custom-grey text-white rounded-lg border-2 border-white text-lg font-bold"/>
                            <span>{currency}</span>
                        </div>
                        <span>CURRENCY:</span>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="col-span-2 p-2 bg-custom-grey text-white rounded-lg border-2 border-white text-lg font-bold">
                            <option>{CurrencyEnum[CurrencyEnum.ETH]}</option>
                            <option>{CurrencyEnum[CurrencyEnum.DAI]}</option>
                            <option>{CurrencyEnum[CurrencyEnum.USDC]}</option>
                            <option>{CurrencyEnum[CurrencyEnum.USDC]}</option>
                            <option>{CurrencyEnum[CurrencyEnum.WETH]}</option>
                        </select>
                        <span>DEADLINE:</span>
                        <input
                            type={"datetime-local"}
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            min={DateTime.now().plus({day: 5, minute: 30}).toISO({includeOffset: false})}
                            max={DateTime.now().plus({day: 29, hour: 23, minute: 30}).toISO({includeOffset: false})}
                            className="col-span-2 p-2 bg-custom-grey text-white rounded-lg border-2 border-white text-lg font-bold"/>
                        <span>MIN INCREMENT:</span>
                        <div className="col-span-2 flex flex-row gap-2 items-center">
                            <input
                                value={minIncrement}
                                onChange={onIncrementChange}
                                className="p-2 bg-custom-grey text-white rounded-lg border-2 border-white text-lg font-bold"/>
                            <span>%</span>
                        </div>
                        <span>REFUNDABLE:</span>
                        <input checked={refundable} onChange={(e) => setRefundable(e.target.checked)} className="col-span-2 justify-self-start scale-150" type="checkbox"/>
                    </>
                }
                <span className="col-span-3 w-full border-t-[1px] border-custom-grey"/>
            </div>
            <Button onClick={onModifyClick} disabled={disabled} style={{fontSize: "1.25rem"}} text={"Modify NFT"}/>
        </div>
    );
};

export default ModifyNft;