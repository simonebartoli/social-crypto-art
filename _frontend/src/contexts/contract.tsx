import React, {useEffect, useState} from 'react';
import {NextPage} from "next";
import {useCall, useContractFunction} from "@usedapp/core";
import {IERC20, SocialNFT, VerifySignature} from "@/__typechain";
import {HardhatProvider, IERC20Interface, socialNFTContract, VerifySignatureContract} from "@/contracts";
import {DateTime} from "luxon";
import {NftSellingStatusEnum} from "@/enums/global/nft-enum";
import {SOCIAL_NFT_ADDRESS, VERIFY_SIGNATURE_ADDRESS, ZERO_ADDRESS} from "@/globals";
import {ethers} from "ethers";
import {useWeb3Info} from "@/contexts/web3-info";

// VIEW FUNCTIONS

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
        args: [account, VERIFY_SIGNATURE_ADDRESS, DateTime.fromJSDate(date).toISO(), ip]
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

export type Contract_getAllInfoNft_CallbackType = {
    value?: {
        currentOwner: string
        sellingType: NftSellingStatusEnum,
        owner: string
        royalties: string
        fixedPrice?: {
            amount: string
            currency: string
        }
        auction?: {
            auctionId: string
            currency: string
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
    const [auctionId, setAuctionId] = useState("0")
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
    const {value: value_currentAuctionId, error: error_currentAuctionId} = useCall({
        contract: socialNFTContract,
        method: "s_nftIdToCurrentAuctionId",
        args: [nft_id]
    }) ?? {}
    const {value: value_sellingAuction, error: error_sellingAuction} = useCall({
        contract: socialNFTContract,
        method: "s_nftIdToAuctionIdToSellingAuction",
        args: [nft_id, auctionId]
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
                            currency: value_sellingFixedPrice.currency
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
                            auctionId: auctionId,
                            currency: value_sellingAuction.currency,
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
        if(error_sellingStatus || error_originalOwner || error_royalties || error_currentOwner || error_sellingFixedPrice || error_sellingAuction || error_currentAuctionId){
            callback({
                error: error_sellingStatus ?? error_originalOwner ?? error_royalties ?? error_sellingFixedPrice ?? error_sellingAuction ?? error_currentOwner ?? error_currentAuctionId
            })
        }else if(value_sellingStatus && value_originalOwner && value_royalties && value_currentOwner && value_currentAuctionId){
            setAuctionId(value_currentAuctionId.toString())
            if(value_sellingStatus.sellingType === NftSellingStatusEnum.SELLING_FIXED_PRICE){
                setFetchSelling("FIXED")
            }else if(value_sellingStatus.sellingType === NftSellingStatusEnum.SELLING_AUCTION){
                setFetchSelling("AUCTION")
            }else{
                setFetchSelling("NO_SELLING")
            }
        }
    }, [
        value_sellingStatus, value_originalOwner, value_royalties, value_currentOwner, value_currentAuctionId,
        error_sellingStatus, error_originalOwner, error_royalties, error_currentOwner, error_sellingFixedPrice, error_sellingAuction, error_currentAuctionId
    ])
    return <></>
}

export type Contract_getAuctionOffers_CallbackType = {
    value?: SocialNFT.Selling_AuctionOffersStructOutput[]
    error?: Error
}
type Contract_getAuctionOffers_Props = {
    nft_id: string
    auction_id: string
    callback: (value: Contract_getAuctionOffers_CallbackType) => void
}
export const Contract_getAuctionOffers: NextPage<Contract_getAuctionOffers_Props> = ({nft_id, auction_id, callback}) => {
    const {value, error} = useCall({
        contract: socialNFTContract,
        method: "getAllOffers",
        args: [nft_id, auction_id]
    }) ?? {}

    useEffect(() => {
        if(error){
            callback({
                error: error
            })
        }else if(value){
            callback({
                value: value[0].filter(_ => _.owner !== ZERO_ADDRESS)
            })
        }
    }, [
        value, error
    ])
    return <></>
}

export type Contract_getERC20TokenBalance_CallbackType = {
    value?: {
        balance: string
        allowance: string
    }
    error?: Error
}
type Contract_getERC20TokenBalance = {
    erc20Address: string
    owner: string
    callback: (value: Contract_getERC20TokenBalance_CallbackType) => void
}
export const Contract_getERC20TokenBalance: NextPage<Contract_getERC20TokenBalance> = ({erc20Address, owner, callback}) => {
    const {value: value_allowance, error: error_allowance} = useCall({
        contract: new ethers.Contract(erc20Address, IERC20Interface) as IERC20,
        method: "allowance",
        args: [owner, SOCIAL_NFT_ADDRESS]
    }) ?? {}
    const {value: value_balanceOf, error: error_balanceOf} = useCall({
        contract: new ethers.Contract(erc20Address, IERC20Interface) as IERC20,
        method: "balanceOf",
        args: [owner]
    }) ?? {}

    useEffect(() => {
        if(error_allowance || error_balanceOf){
            callback({
                error: error_allowance ?? error_balanceOf
            })
        }else if(value_allowance && value_balanceOf){
            callback({
                value: {
                    balance: value_balanceOf.toString(),
                    allowance: value_allowance.toString()
                }
            })
        }
    }, [
        value_allowance, value_balanceOf,
        error_allowance, error_balanceOf
    ])
    return <></>
}


// CHANGE STATE FUNCTIONS

type Contract_createNft_Props = {
    execute: boolean
    URI: string
    callback: (id: string) => void
    onError: (message: string) => void
}
export const Contract_createNft: NextPage<Contract_createNft_Props> = ({execute, URI, onError, callback}) => {
    const {signer} = useWeb3Info()
    const {send, events, state} = useContractFunction(socialNFTContract, "createNft", signer ? {signer: signer} : undefined)
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
    const {signer} = useWeb3Info()
    const {send, events, state} = useContractFunction(socialNFTContract, "setRoyalties", signer ? {signer: signer} : undefined)

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
    const {signer} = useWeb3Info()
    const {send, events, state} = useContractFunction(socialNFTContract, "resetSellingStatus", signer ? {signer: signer} : undefined)

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
    const {signer} = useWeb3Info()
    const {send, events, state} = useContractFunction(socialNFTContract, "setSellingFixedPrice", signer ? {signer: signer} : undefined)

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
    const {signer} = useWeb3Info()
    const {send, events, state} = useContractFunction(socialNFTContract, "setSellingAuction", signer ? {signer: signer} : undefined)

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
    const {signer} = useWeb3Info()
    const {value, error} = useCall({
        contract: socialNFTContract,
        method: "s_nftIdToSellingFixedPrice",
        args: [nft_id]
    }) ?? {}
    const {send, state, events} = useContractFunction(socialNFTContract, "buyNftSellingFixedPrice", signer ? {signer: signer} : undefined)

    useEffect(() => {
        if(value){
            if(value.amount.toString() !== "0" && value.currency !== ZERO_ADDRESS){
                if(execute){
                    send(nft_id)
                }
            }else if(value.amount.toString() !== "0" && value.currency === ZERO_ADDRESS) {
                if(execute){
                    send(nft_id, {
                        value: value.amount.toString()
                    })
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

type Contract_makeOfferAuction_Props = {
    execute: boolean
    callback: () => void
    onError: (message: string) => void
    nft_id: string
    auction_id: string
    amount: string
    type: "NATIVE" | "ERC20"
}
export const Contract_makeOfferAuction: NextPage<Contract_makeOfferAuction_Props> =
    ({execute, nft_id, auction_id, amount, type, onError, callback}) => {
    const {signer} = useWeb3Info()
    const {send, state, events} = useContractFunction(socialNFTContract, "makeOfferAuction", signer ? {signer: signer} : undefined)

    useEffect(() => {
        if(execute){
            if(type === "NATIVE"){
                send(nft_id, auction_id, amount, {value: amount})
            }else{
                send(nft_id, auction_id, amount)
            }
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

type Contract_increaseAllowancesErc20_Props = {
    execute: boolean
    amount: string
    address: string
    callback: () => void
    onError: (message: string) => void
}
export const Contract_increaseAllowancesErc20: NextPage<Contract_increaseAllowancesErc20_Props> = ({execute, amount, address, onError, callback}) => {
    const {signer} = useWeb3Info()
    const {send, events, state} = useContractFunction(new ethers.Contract(address, IERC20Interface, HardhatProvider) as IERC20, "approve", signer ? {signer: signer} : undefined)

    useEffect(() => {
        if(execute){
            send(SOCIAL_NFT_ADDRESS, amount)
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
