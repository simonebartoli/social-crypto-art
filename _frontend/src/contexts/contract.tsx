import React, {useEffect, useState} from 'react';
import {NextPage} from "next";
import {useCall, useContractFunction} from "@usedapp/core";
import {VerifySignature} from "@/__typechain";
import {socialNFTContract, verifySignatureAddress, VerifySignatureContract} from "@/contracts";
import {DateTime} from "luxon";

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
        console.log(DateTime.fromJSDate(date).toISO())
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