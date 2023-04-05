import React, {ReactElement, useState} from 'react';
import RequireLogin from "@/components/library/auth/require-login";
import Navbar from "@/components/settings/navbar";
import {SettingsCreateWeb3Enum} from "@/enums/local/settings-enum";
import Password from "@/components/settings/components/password";
import GenerateAccount from "@/components/settings/components/generate-account";

const Create = () => {
    const [step, setStep] = useState(SettingsCreateWeb3Enum.PASSWORD)
    const [accountName, setAccountName] = useState("")
    const [password, setPassword] = useState("")

    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center justify-center text-white gap-8 w-3/4">
                <h2 className="text-4xl text-white">Create a New Account</h2>
                <p className="text-center text-white">
                    If you don&apos;t have any account yet, you can create it with our system.
                </p>
                <span className="w-full border-t-[1px] border-white"/>
                {
                    step === SettingsCreateWeb3Enum.PASSWORD ?
                    <Password setStep={setStep}
                              password={password}
                              setPassword={setPassword}
                              accountName={accountName}
                              setAccountName={setAccountName}
                    /> :
                    step === SettingsCreateWeb3Enum.WEB3_GENERATION ?
                    <GenerateAccount
                        setStep={setStep}
                        accountName={accountName}
                        password={password}/> :
                    <></>
                }
            </div>
        </div>
    );
};

Create.getLayout = function getLayout(page: ReactElement) {
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

export default Create;