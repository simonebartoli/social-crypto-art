import {CurrencyEnum, NftSellingStatusEnum} from "@/enums/global/nft-enum";

export type NftInfoType = {
    originalOwner: string
    currentOwner: string
    royalties: string
    sellingType: NftSellingStatusEnum,
    fixedPrice: {
        amount: string
        currency: CurrencyEnum
    } | undefined
    auction:  {
        currency: CurrencyEnum
        deadline: string
        minIncrement: string
        refundable: boolean
        initialPrice: string
    } | undefined
}