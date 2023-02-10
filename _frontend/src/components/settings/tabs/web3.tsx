import React, {useState} from 'react';
import Connect from "@/components/settings/components/connect";
import Accounts from "@/components/settings/components/accounts";
import {Get_Web3_AccountsQuery} from "@/__generated__/graphql";
import {useQuery} from "@apollo/client";
import {GET_WEB3_ACCOUNTS} from "@/graphql/account-info";
import {toast} from "react-toastify";
import Loader from "@/components/library/loader";

const Web3 = () => {
    const [accounts, setAccounts] = useState<Get_Web3_AccountsQuery["getWeb3Accounts"]>([])
    const {loading, refetch} = useQuery(GET_WEB3_ACCOUNTS, {
        onCompleted: (data) => {
            setAccounts(data.getWeb3Accounts)
        },
        onError: () => {
            toast.error("Please refresh your page")
        }
    })

    if(loading){
        return <Loader/>
    }
    return (
        <div className="flex flex-col items-center justify-start gap-32">
            <div className="flex flex-col items-center justify-center gap-8 w-3/4">
                <div className="flex flex-col items-center justify-center gap-8 w-full">
                    <h2 className="text-4xl text-white">Connected Account</h2>
                    <p className="text-center text-white">
                        The following accounts can be used to login to any of your trusted devices. <br/>
                        We do not save any private data and you still need to have access to this accounts listed if you want to use them.
                    </p>
                    <Accounts accounts={accounts}/>
                </div>
                <span className="bg-white h-[1px] w-full"/>
                <Connect refetch={refetch}/>
            </div>
        </div>
    );
};

export default Web3;