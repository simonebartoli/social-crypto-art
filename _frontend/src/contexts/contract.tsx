import React, {useEffect, useState} from 'react';
import {NextPage} from "next";
import {useCall, useContractFunction} from "@usedapp/core";
import {VerifySignature} from "@/__typechain";
import {socialNFTContract, verifySignatureAddress, VerifySignatureContract} from "@/contracts";
import {DateTime} from "luxon";
import {CurrencyEnum, NftSellingStatusEnum} from "@/enums/global/nft-enum";
import {ZERO_ADDRESS} from "@/globals";

export type Contract_getMessageHash_CallbackType = {
    value: string[] | undefined
    error: Error | undefined
    date: Date
}
type Contract_getMessageHash_Props = {
    account: string
    ip: string
    callback: (value: Contract_getMessageHash_CallbackType) => void
}
export const Contract_getMessageHash: NextPage<Contract_getMessageHash_Props> = ({account, ip, callback}) => {
    const [date] = useState(new Date())
    const {value, error} = useCall<VerifySignature, "getMessageHash">({
        contract: VerifySignatureContract,
        method: "getMessageHash",
        args: [account, verifySignatureAddress, DateTime.fromJSDate(date).toISO(), ip]
    }) ?? {}

    useEffect(() => {
        if(value || error){
            callback({
                value: value,
                error: error,
                date: date
            })
        }
    }, [value, error])
    return <></>
}

export type Contract_getVerification_CallbackType = {
    value?: boolean
    error?: Error
}
type Contract_getVerification_Props = {
    ipfs: string
    nft_id: string
    callback: (value: Contract_getVerification_CallbackType) => void
}
export const Contract_getVerification: NextPage<Contract_getVerification_Props> = ({ipfs, nft_id, callback}) => {
    const {value, error} = useCall({
        contract: socialNFTContract,
        method: "s_uriToNftId",
        args: [ipfs]
    }) ?? {}

    useEffect(() => {
        if(value || error){
            if(error){
                callback({
                    error: error
                })
            }else if(value){
                if(value.toString() === nft_id){
                    callback({
                        value: true
                    })
                }else{
                    callback({
                        value: false
                    })
                }
            }
        }
    }, [value, error])
    return <></>
}

// export type Contract_getSellingInfo_CallbackType = {
//     value?: {
//         sellingType: NftSellingStatusEnum,
//         owner: string
//     }
//     error?: Error
// }
// type Contract_getSellingInfo_Props = {
//     nft_id: string
//     callback: (value: Contract_getSellingInfo_CallbackType) => void
// }
// export const Contract_getSellingInfo: NextPage<Contract_getSellingInfo_Props> = ({nft_id, callback}) => {
//     const {value: value_sellingStatus, error: error_sellingStatus} = useCall({
//         contract: socialNFTContract,
//         method: "s_nftIdStatus",
//         args: [nft_id]
//     }) ?? {}
//     const {value: value_originalOwner, error: error_originalOwner} = useCall({
//         contract: socialNFTContract,
//         method: "getOriginalOwner",
//         args: [nft_id]
//     }) ?? {}
//
//     useEffect(() => {
//         if(error_sellingStatus || error_originalOwner){
//             callback({
//                 error: error_sellingStatus ?? error_originalOwner
//             })
//         }else if(value_sellingStatus && value_originalOwner){
//             callback({
//                 value: {
//                     sellingType: value_sellingStatus.sellingType,
//                     owner: value_originalOwner[0].owner
//                 }
//             })
//         }
//     }, [
//         value_sellingStatus, value_originalOwner,
//         error_sellingStatus, error_originalOwner
//     ])
//     return <></>
// }

export type Contract_getAllInfoNft_CallbackType = {
    value?: {
        currentOwner: string
        sellingType: NftSellingStatusEnum,
        owner: string
        royalties: string
        fixedPrice?: {
            amount: string
            currency: CurrencyEnum
        }
        auction?: {
            currency: CurrencyEnum
            deadline: string
            minIncrement: string
            refundable: boolean
            initialPrice: string
        }
    }
    error?: Error
}
type Contract_getAllInfoNft_Props = {
    nft_id: string
    callback: (value: Contract_getAllInfoNft_CallbackType) => void
}
export const Contract_getAllInfoNft: NextPage<Contract_getAllInfoNft_Props> = ({nft_id, callback}) => {
    const [fetchSelling, setFetchSelling] = useState<"FIXED" | "AUCTION" | "NO_SELLING">()

    const {value: value_currentOwner, error: error_currentOwner} = useCall({
        contract: socialNFTContract,
        method: "ownerOf",
        args: [nft_id]
    }) ?? {}
    const {value: value_sellingStatus, error: error_sellingStatus} = useCall({
        contract: socialNFTContract,
        method: "s_nftIdStatus",
        args: [nft_id]
    }) ?? {}
    const {value: value_originalOwner, error: error_originalOwner} = useCall({
        contract: socialNFTContract,
        method: "getOriginalOwner",
        args: [nft_id]
    }) ?? {}
    const {value: value_royalties, error: error_royalties} = useCall({
        contract: socialNFTContract,
        method: "s_nftIdToRoyalties",
        args: [nft_id]
    }) ?? {}

    const {value: value_sellingFixedPrice, error: error_sellingFixedPrice} = useCall({
        contract: socialNFTContract,
        method: "s_nftIdToSellingFixedPrice",
        args: [nft_id]
    }) ?? {}
    const {value: value_sellingAuction, error: error_sellingAuction} = useCall({
        contract: socialNFTContract,
        method: "s_nftIdToSellingAuction",
        args: [nft_id]
    }) ?? {}


    useEffect(() => {
        if(fetchSelling){
            if(fetchSelling === "NO_SELLING"){
                callback({
                    value: {
                        currentOwner: value_currentOwner![0].toString(),
                        owner: value_originalOwner![0].owner.toString(),
                        royalties: value_royalties!.percentage.toString(),
                        sellingType: value_sellingStatus!.sellingType
                    }
                })
            }else if(fetchSelling === "FIXED" && value_sellingFixedPrice){
                callback({
                    value: {
                        currentOwner: value_currentOwner![0].toString(),
                        owner: value_originalOwner![0].owner.toString(),
                        royalties: value_royalties!.percentage.toString(),
                        sellingType: value_sellingStatus!.sellingType,
                        fixedPrice: {
                            amount: value_sellingFixedPrice.amount.toString(),
                            currency: CurrencyEnum[value_sellingFixedPrice.currency as keyof typeof CurrencyEnum]
                        }
                    }
                })
            }else if(fetchSelling === "AUCTION" && value_sellingAuction){
                callback({
                    value: {
                        currentOwner: value_currentOwner![0].toString(),
                        owner: value_originalOwner![0].owner.toString(),
                        royalties: value_royalties!.percentage.toString(),
                        sellingType: value_sellingStatus!.sellingType,
                        auction: {
                            currency: CurrencyEnum[value_sellingAuction.currency as keyof typeof CurrencyEnum],
                            deadline: value_sellingAuction.deadline.toString(),
                            minIncrement: value_sellingAuction.minIncrement.toString(),
                            refundable: value_sellingAuction.refundable,
                            initialPrice: value_sellingAuction.initialPrice.toString()
                        }
                    }
                })
            }
        }
    }, [
        fetchSelling,
        value_sellingStatus, value_originalOwner, value_royalties,
        value_sellingFixedPrice, value_sellingAuction
    ])
    useEffect(() => {
        if(error_sellingStatus || error_originalOwner || error_royalties || error_currentOwner || error_sellingFixedPrice || error_sellingAuction){
            callback({
                error: error_sellingStatus ?? error_originalOwner ?? error_royalties ?? error_sellingFixedPrice ?? error_sellingAuction ?? error_currentOwner
            })
        }else if(value_sellingStatus && value_originalOwner && value_royalties && value_currentOwner){
            if(value_sellingStatus.sellingType === NftSellingStatusEnum.SELLING_FIXED_PRICE){
                setFetchSelling("FIXED")
            }else if(value_sellingStatus.sellingType === NftSellingStatusEnum.SELLING_AUCTION){
                setFetchSelling("AUCTION")
            }else{
                setFetchSelling("NO_SELLING")
            }
        }
    }, [
        value_sellingStatus, value_originalOwner, value_royalties, value_currentOwner,
        error_sellingStatus, error_originalOwner, error_royalties, error_currentOwner, error_sellingFixedPrice, error_sellingAuction,
    ])
    return <></>
}

type Contract_createNft_Props = {
    execute: boolean
    URI: string
    callback: (id: string) => void
    onError: (message: string) => void
}
export const Contract_createNft: NextPage<Contract_createNft_Props> = ({execute, URI, onError, callback}) => {
    const {send, events, state} = useContractFunction(socialNFTContract, "createNft")
    useEffect(() => {
        if(execute){
            send(URI)
        }
    }, [execute])
    useEffect(() => {
        if(execute){
            if(state.errorMessage){
                onError(state.errorMessage)
            }
        }
    }, [state])
    useEffect(() => {
        if(execute){
            if (events) {
                callback((events[1].args[0]).toString())
            }
        }
    }, [events])
    return (
        <></>
    )
}

type Contract_setRoyalties_Props = {
    execute: boolean
    nft_id: string
    percentage: string
    callback: () => void
    onError: (message: string) => void
}
export const Contract_setRoyalties: NextPage<Contract_setRoyalties_Props> = ({execute, nft_id, percentage, onError, callback}) => {
    const {send, events, state} = useContractFunction(socialNFTContract, "setRoyalties")

    useEffect(() => {
        if(execute){
            send(nft_id, percentage)
        }
    }, [execute])
    useEffect(() => {
        if(execute){
            if(state.errorMessage){
                onError(state.errorMessage)
            }
        }
    }, [state])
    useEffect(() => {
        if(execute){
            if (events) {
                callback()
            }
        }
    }, [events])
    return (
        <></>
    )
}

type Contract_resetSellingStatus_Props = {
    execute: boolean
    callback: () => void
    onError: (message: string) => void
    nft_id: string
}
export const Contract_resetSellingStatus: NextPage<Contract_resetSellingStatus_Props> = ({execute, nft_id, onError, callback}) => {
    const {send, events, state} = useContractFunction(socialNFTContract, "resetSellingStatus")

    useEffect(() => {
        if(execute){
            send(nft_id)
        }
    }, [execute])
    useEffect(() => {
        if(execute){
            if(state.errorMessage){
                onError(state.errorMessage)
            }
        }
    }, [state])
    useEffect(() => {
        if(execute){
            if (events) {
                callback()
            }
        }
    }, [events])
    return (
        <></>
    )
}

type Contract_setSellingFixedPrice_Props = {
    execute: boolean
    callback: () => void
    onError: (message: string) => void
    nft_id: string
    amount: string,
    currency: string
}
export const Contract_setSellingFixedPrice: NextPage<Contract_setSellingFixedPrice_Props> = ({execute, nft_id, amount, currency, onError, callback}) => {
    const {send, events, state} = useContractFunction(socialNFTContract, "setSellingFixedPrice")

    useEffect(() => {
        if(execute){
            send(nft_id, amount, currency)
        }
    }, [execute])
    useEffect(() => {
        if(execute){
            if(state.errorMessage){
                onError(state.errorMessage)
            }
        }
    }, [state])
    useEffect(() => {
        if(execute){
            if (events) {
                callback()
            }
        }
    }, [events])
    return (
        <></>
    )
}

type Contract_setSellingAuction_Props = {
    execute: boolean
    callback: () => void
    onError: (message: string) => void
    nft_id: string
    initialPrice: string
    refundable: boolean
    minIncrement: string
    currency: string
    deadline: string
}
export const Contract_setSellingAuction: NextPage<Contract_setSellingAuction_Props> =
    ({execute, nft_id, currency, deadline, minIncrement, refundable,initialPrice, onError, callback}) => {
    const {send, events, state} = useContractFunction(socialNFTContract, "setSellingAuction")

    useEffect(() => {
        if(execute){
            send(nft_id, initialPrice, refundable, minIncrement, currency, deadline)
        }
    }, [execute])
    useEffect(() => {
        if(execute){
            if(state.errorMessage){
                onError(state.errorMessage)
            }
        }
    }, [state])
    useEffect(() => {
        if(execute){
            if (events) {
                callback()
            }
        }
    }, [events])
    return (
        <></>
    )
}

type Contract_buyNftSellingFixedPrice_Props = {
    execute: boolean
    callback: () => void
    onError: (message: string) => void
    nft_id: string
}
export const Contract_buyNftSellingFixedPrice: NextPage<Contract_buyNftSellingFixedPrice_Props> =
    ({execute, nft_id, onError, callback}) => {
    const {value, error} = useCall({
        contract: socialNFTContract,
        method: "s_nftIdToSellingFixedPrice",
        args: [nft_id]
    }) ?? {}
    const {send, state, events} = useContractFunction(socialNFTContract, "buyNftSellingFixedPrice")

    useEffect(() => {
        if(value){
            if(value.amount.toString() !== "0" && value.currency !== ZERO_ADDRESS){
                if(execute){
                    send(value.amount)
                }
            }else{
                onError("The NFT ID provided is not in selling (FIXED PRICE MODE)")
            }
        }
    }, [execute, value])
    useEffect(() => {
        if(execute){
            if(state.errorMessage){
                onError(state.errorMessage)
            }
        }
    }, [state])
    useEffect(() => {
        if(execute){
            if (events) {
                callback()
            }
        }
    }, [events])
    useEffect(() => {
        if(error){
            onError(error.message)
        }
    }, [error])

    return (
        <></>
    )
}