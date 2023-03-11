import React, {useEffect} from 'react';
import {NextPage} from "next";
import {useModal} from "@/contexts/modal";
import RequireWeb3Account from "@/components/library/auth/require-web3-account";
import {useEthers} from "@usedapp/core";

type Props = {
    specificAccount?: string
    children?: JSX.Element
    callback?: () => void
}

const ActionRequireWeb3Account: NextPage<Props> = ({specificAccount, children, callback}) => {
    const {showModal} = useModal()
    const {account} = useEthers()

    useEffect(() => {
        if(specificAccount){
            if(account && account === specificAccount){
                if (callback) {
                    callback()
                }
            }else{
                showModal(<RequireWeb3Account specificAccount={specificAccount}/>)
            }
        }else{
            if(account){
                if (callback) {
                    callback()
                }
            }else{
                showModal(<RequireWeb3Account specificAccount={specificAccount}/>)
            }
        }
    }, [account])


    if(!account || (specificAccount && account !== specificAccount)){
        return (
            <></>
        )
    }

    return (
        <>
            {
                children && children
            }
        </>
    );
};

export default ActionRequireWeb3Account;