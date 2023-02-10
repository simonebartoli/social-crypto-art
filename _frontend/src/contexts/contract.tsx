import React, {useEffect, useState} from 'react';
import {NextPage} from "next";
import {useCall} from "@usedapp/core";
import {VerifySignature} from "@/__typechain";
import {verifySignatureAddress, VerifySignatureContract} from "@/contracts";
import {DateTime} from "luxon";

type Props = {
    account: string
    ip: string
    callback: (value: Contract_getMessageHash_CallbackType) => void
}

export type Contract_getMessageHash_CallbackType = {
    value: string[] | undefined
    error: Error | undefined
    date: Date
}
export const Contract_getMessageHash: NextPage<Props> = ({account, ip, callback}) => {
    const [date, setDate] = useState(new Date())
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
