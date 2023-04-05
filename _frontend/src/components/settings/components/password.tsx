import React, {useEffect, useState} from 'react';
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import KeyboardDoubleArrowRightOutlinedIcon from "@mui/icons-material/KeyboardDoubleArrowRightOutlined";
import StarOutlineOutlinedIcon from '@mui/icons-material/StarOutlineOutlined';
import {passwordRegex} from "@/filters";
import {NextPage} from "next";
import {SettingsCreateWeb3Enum} from "@/enums/local/settings-enum";

type Props = {
    password: string
    setPassword: React.Dispatch<React.SetStateAction<string>>
    accountName: string
    setAccountName: React.Dispatch<React.SetStateAction<string>>
    setStep: React.Dispatch<React.SetStateAction<SettingsCreateWeb3Enum>>
}

const Password: NextPage<Props> = ({password, setPassword, accountName, setAccountName, setStep}) => {
    const [goNext, setGoNext] = useState(false)

    useEffect(() => {
        if(passwordRegex.test(password) && accountName.length >= 3){
            setGoNext(true)
        }
    }, [password, accountName])

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <h3 className="text-2xl font-bold">First of all, let&apos;s create a secure password</h3>
            <p className="text-center">
                The password is required to store your data in a secure way. Noone (not even us) will be
                able to read the keys of your account. <span className="font-bold">MAKE SURE YOUR PASSWORD IS STRONG ENOUGH.</span>
            </p>
            <div className="flex my-8 flex-col gap-3 items-center justify-center">
                <div className="bg-black border-white border-[1px] text-white shadow-2xl p-4 rounded-lg flex flex-row items-center gap-6 justify-center">
                    <StarOutlineOutlinedIcon className="!text-4xl"/>
                    <input type="text"
                           value={accountName}
                           onChange={(e) => setAccountName(e.target.value)}
                           className="text-xl outline-none bg-black min-w-[300px]"
                           placeholder="Input a name for your account..."/>
                </div>
            </div>
            <div className="flex flex-col gap-3 items-center justify-center">
                <div className="bg-black border-white border-[1px] text-white shadow-2xl p-4 rounded-lg flex flex-row items-center gap-6 justify-center">
                    <LockOutlinedIcon className="!text-4xl"/>
                    <input type="password"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           className="text-xl outline-none bg-black min-w-[300px]"
                           placeholder="Input your password here..."/>
                </div>
                <span>The password should be at least 8 chars</span>
            </div>
            {
                goNext &&
                <>
                    <div onClick={() => setStep(SettingsCreateWeb3Enum.WEB3_GENERATION)} className="flex cursor-pointer flex-row items-center justify-center gap-4">
                        <KeyboardDoubleArrowRightOutlinedIcon className="!text-4xl"/>
                        <span className="text-2xl my-4 font-bold">Continue...</span>
                    </div>
                    <span className="my-8 border-2 border-black p-4 w-full text-4xl text-center bg-white text-black font-bold">BE SURE TO REMEMBER THE PASSWORD</span>
                </>
            }
        </div>
    );
};

export default Password;