import React, {useEffect} from 'react';
import {NextPage} from "next";
import {useModal} from "@/contexts/modal";
import RequireWeb3Account from "@/components/library/auth/require-web3-account";
import {useWeb3Info} from "@/contexts/web3-info";

type Props = {
    specificAccount?: string
    specificNotAccount?: string
    children?: JSX.Element
    callback?: () => void
}

const ActionRequireWeb3Account: NextPage<Props> = ({specificAccount, specificNotAccount, children, callback}) => {
    const {showModal} = useModal()
    const {account} = useWeb3Info()

    useEffect(() => {
        // TODO FIX BUG HERE - NOT UPDATING ACCOUNT
        if(specificAccount){
            if(account && account.toLowerCase() === specificAccount.toLowerCase()){
                if (callback) {
                    callback()
                }
            }else{
                showModal(<RequireWeb3Account specificAccount={specificAccount}/>)
            }
        }else if(specificNotAccount) {
            if(account && account.toLowerCase() !== specificNotAccount.toLowerCase()){
                if(callback){
                    callback()
                }
            }else{
                showModal(<RequireWeb3Account specificNotAccount={specificNotAccount}/>)
            }
        } else{
            if(account){
                if (callback) {
                    callback()
                }
            }else{
                showModal(<RequireWeb3Account specificAccount={specificAccount}/>)
            }
        }
    }, [account])


    if(!account || (specificAccount && account.toLowerCase() !== specificAccount.toLowerCase()) || (specificNotAccount && specificNotAccount.toLowerCase() === account.toLowerCase())){
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