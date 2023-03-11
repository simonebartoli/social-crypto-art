import React, {ChangeEvent} from 'react';
import {CurrencyEnum, NftSellingStatusEnum} from "@/enums/global/nft-enum";
import {NextPage} from "next";
import {DateTime} from "luxon";
import {useAddPostInfo} from "@/contexts/add-post-info";

type Props = {
    type: NftSellingStatusEnum
}

const SellingFixedAuction: NextPage<Props> = ({type}) => {
    const {amount, deadline, minIncrement, royalties, currency} = useAddPostInfo()

    const onAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        if(!isNaN(Number(newValue.at(-1))) || newValue.at(-1) === "." || newValue.length === 0){
            if(!isNaN(Number(newValue + "0"))){
                amount.set(newValue)
            }
        }
    }
    const onRoyaltiesChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        if((!isNaN(Number(newValue.at(-1))) || newValue.length === 0) && newValue.length < 3){
            if(newValue.length === 0 || Number(newValue) >= 0 && Number(newValue) <= 25){
                royalties.set(newValue)
            }
        }
    }
    const onIncrementChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        if(!isNaN(Number(newValue.at(-1))) || newValue.length === 0){
            if(newValue.length === 0 || Number(newValue) >= 0 && Number(newValue) <= 50){
                minIncrement.set(newValue)
            }
        }
    }

    return (
        <>
            <div className="w-full h-[1px] border-t-[1px] border-custom-light-grey"/>
            <div className="flex flex-col gap-4 items-start justify-start w-full">
                <div className="flex flex-row gap-4 w-full items-center">
                    <span className="w-1/4">Currency: </span>
                    <select value={currency.value} onChange={(e) => currency.set(e.target.value)} className="bg-white text-black p-2">
                        <option value={CurrencyEnum[CurrencyEnum.ETH]}>Ethereum (ETH)</option>
                        <option value={CurrencyEnum[CurrencyEnum.USDC]}>USDC</option>
                        <option value={CurrencyEnum[CurrencyEnum.DAI]}>DAI</option>
                    </select>
                </div>
                <div className="flex flex-row gap-4 w-full items-center">
                    <span className="w-1/4">Value: </span>
                    <input
                        value={amount.value} onChange={onAmountChange}
                        type="text" className="p-2 text-black" placeholder="Insert the value here..."/>
                    {
                        (amount.value !== "" && !isNaN(Number(amount.value))) &&
                        <span className="italic text-sm">{`${amount.value} ${currency.value}`}</span>
                    }
                </div>
                {
                    type === NftSellingStatusEnum.SELLING_AUCTION &&
                    <div className="flex flex-row gap-4 w-full items-center">
                        <span className="w-1/4">Min Increment (%): </span>
                        <input
                            value={minIncrement.value} onChange={onIncrementChange}
                            type="text" className="p-2 text-black" placeholder="Insert the value here..."/>
                        <span className="italic text-sm">Min 1% | Max 50%</span>
                    </div>
                }
                <div className="flex flex-row gap-4 w-full items-center">
                    <span className="w-1/4">Royalties (%): </span>
                    <input
                        value={royalties.value} onChange={onRoyaltiesChange}
                        type="text" className="p-2 text-black" placeholder="Insert the value here..."/>
                    <span className="italic text-sm">Min 0% | Max 25%</span>
                </div>
                {
                    type === NftSellingStatusEnum.SELLING_AUCTION &&
                    <div className="flex flex-row gap-4 w-full items-center">
                        <span className="w-1/4">Deadline: </span>
                        <input
                            min={DateTime.now().plus({day: 5}).toISODate()}
                            max={DateTime.now().plus({day: 30}).toISODate()}
                            value={DateTime.fromJSDate(deadline.value).toISODate()} onChange={(e) => deadline.set(DateTime.fromISO(e.target.value).toJSDate())}
                            type="date" className="p-2 text-black" placeholder="Insert the value here..."/>
                        <span className="italic text-sm">Min 5 days | Max 30 days</span>
                    </div>
                }
            </div>
        </>
    );
};

export default SellingFixedAuction;