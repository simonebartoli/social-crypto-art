import {CurrencyEnum, NftSellingStatusEnum} from "@/enums/global/nft-enum";

export type NftInfoType<T extends never | "FIXED" | "AUCTION" = never> = {
    originalOwner: string
    currentOwner: string
    royalties: string
    sellingType: NftSellingStatusEnum,
    fixedPrice: T extends never ? ({
        amount: string
        currency: CurrencyEnum
        currencyAddress: string
    } | undefined) : T extends "FIXED" ? {
        amount: string
        currency: CurrencyEnum
        currencyAddress: string
    } : undefined
    auction: T extends never ? ({
        currency: CurrencyEnum
        currencyAddress: string
        deadline: string
        minIncrement: string
        refundable: boolean
        initialPrice: string
    } | undefined) : T extends "AUCTION" ? {
        currency: CurrencyEnum
        currencyAddress: string
        deadline: string
        minIncrement: string
        refundable: boolean
        initialPrice: string
    } : undefined
}

export type NftAuctionOffer = {
    bidder: string
    amount: string
}