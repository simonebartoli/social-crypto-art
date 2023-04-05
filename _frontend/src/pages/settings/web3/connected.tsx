import React, {ReactElement} from 'react';
import RequireLogin from "@/components/library/auth/require-login";
import Navbar from "@/components/settings/navbar";
import Accounts from "@/components/settings/components/accounts";
import {useLogin} from "@/contexts/login";
import Loader from "@/components/library/loader";

const Connected = () => {
    const {personalInfo, loading} = useLogin()
    if(personalInfo === null || loading){
        return <Loader/>
    }
    return (
        <div className="flex flex-col items-center justify-center gap-8 w-full h-full">
            <div className="flex flex-col items-center justify-center gap-8 w-3/4">
                <h2 className="text-4xl text-white">Connected Account</h2>
                <p className="text-center text-white">
                    The following accounts can be used to login to any of your trusted devices. <br/>
                    We do not save any private data and you still need to have access to this accounts listed if you want to use them.
                </p>
                <Accounts accounts={personalInfo["accounts"]}/>
            </div>
        </div>
    );
};

Connected.getLayout = function getLayout(page: ReactElement) {
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

export default Connected;