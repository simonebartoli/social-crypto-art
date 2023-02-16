import React from 'react';
import Connect from "@/components/settings/components/connect";
import Accounts from "@/components/settings/components/accounts";
import Loader from "@/components/library/loader";
import {useLogin} from "@/contexts/login";

const Web3 = () => {
    const {personalInfo, getUser, loading} = useLogin()

    const refetch = () => {
        getUser()
    }
    if(personalInfo === null || loading){
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
                    <Accounts accounts={personalInfo["accounts"]}/>
                </div>
                <span className="bg-white h-[1px] w-full"/>
                <Connect accounts={personalInfo["accounts"]} refetch={refetch}/>
            </div>
        </div>
    );
};

export default Web3;