import React, {useEffect, useState} from 'react';
import {NextPage} from "next";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Button from "@/components/login/button";

type Props = {
    address: string
    callback: (password: string) => void
}

const PromptPassword: NextPage<Props> = ({address, callback}) => {
    const [disabled, setDisabled] = useState(true)
    const [password, setPassword] = useState("")
    const onPasswordSubmit = async () => {
        setDisabled(true)
        await callback(password)
        setDisabled(false)
    }

    useEffect(() => {
        if(password.length >= 8){
            setDisabled(false)
        }else{
            setDisabled(true)
        }
    }, [password])

    return (
        <div className="flex flex-col items-center w-3/4">
            <div className="flex flex-col gap-6 items-center justify-start w-full">
                <h2 className="text-4xl font-bold">Unlock your Account</h2>
                <p>
                    Please type the password you set when you created the following account
                </p>
                <span className="p-3 bg-black text-white rounded-lg text-xl tracking-wider font-bold">{address}</span>
                <div className="bg-black my-8 border-white border-[1px] text-white shadow-2xl p-4 rounded-lg flex flex-row items-center gap-6 justify-center">
                    <LockOutlinedIcon className="!text-4xl"/>
                    <input type="password"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           className="text-xl outline-none bg-black min-w-[300px]"
                           placeholder="Input your password here..."/>
                </div>
                <Button disabled={disabled} onClick={onPasswordSubmit} text={"Continue"}/>
            </div>
        </div>
    );
};

export default PromptPassword;