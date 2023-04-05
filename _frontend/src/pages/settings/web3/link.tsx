import React, {ReactElement} from 'react';
import RequireLogin from "@/components/library/auth/require-login";
import Navbar from "@/components/settings/navbar";
import {useLogin} from "@/contexts/login";
import Loader from "@/components/library/loader";
import Connect from "@/components/settings/components/connect";

const Link = () => {
    const {personalInfo, getUser, loading} = useLogin()
    const refetch = () => {
        getUser()
    }
    if(personalInfo === null || loading){
        return <Loader/>
    }

    return (
        <div className="flex w-full items-center justify-center h-full">
            <div className="flex flex-col items-center justify-center gap-8 w-3/4">
                <h2 className="text-4xl text-white">Create a New Account</h2>
                <p className="text-center text-white">
                    If you link your web3 address, you&apos;ll be able to login in your account using it. <br/>
                    Also your NFT will be listed and people will be able to see them from this portal.
                </p>
                <Connect accounts={personalInfo["accounts"]} refetch={refetch}/>
            </div>
        </div>
    );
};

Link.getLayout = function getLayout(page: ReactElement) {
    return (
        <RequireLogin>
            <div className="w-full flex flex-row min-h-screen bg-custom-grey font-main">
                <Navbar/>
                <div className="relative top-0 left-[25%] w-3/4 p-8 bg-custom-grey">
                    {page}
                </div>
            </div>
        </RequireLogin>
    )
}

export default Link;