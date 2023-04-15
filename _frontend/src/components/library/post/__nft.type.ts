import {CurrencyEnum, NftSellingStatusEnum} from "@/enums/global/nft-enum";

export type NftInfoType<T extends (void | "FIXED" | "AUCTION") = void> = {
    uri: string
    originalOwner: string
    currentOwner: string
    royalties: string
    sellingType: NftSellingStatusEnum,
    fixedPrice: T extends void ? ({
        amount: string
        currency: CurrencyEnum
        currencyAddress: string
    } | undefined) : T extends "FIXED" ? {
        amount: string
        currency: CurrencyEnum
        currencyAddress: string
    } : undefined
    auction: T extends void ? ({
        auctionId: string
        currency: CurrencyEnum
        currencyAddress: string
        deadline: string
        minIncrement: string
        refundable: boolean
        initialPrice: string
    } | undefined) : T extends "AUCTION" ? {
        auctionId: string
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