import React, {useEffect, useState} from 'react';
import {LoginEnum} from "@/enums/local/login-enum";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import {NextPage} from "next";
import {useMutation} from "@apollo/client";
import {GET_ACCESS_TOKEN_RECOVERY_TOKEN} from "@/graphql/access";
import {socket} from "@/globals";
import {toast} from "react-toastify";
import {useRouter} from "next/router";

type Props = {
    changeTab: (selected: LoginEnum) => void
}

const Confirmation: NextPage<Props> = ({changeTab}) => {
    const router = useRouter()
    const [success, setSuccess] = useState(false)

    const [getAccessToken_RecoveryToken] = useMutation(GET_ACCESS_TOKEN_RECOVERY_TOKEN, {
        onCompleted: () => {
            setSuccess(true)
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })
    useEffect(() => {
        if(socket.connected){
            socket.on("sync", () => {
                getAccessToken_RecoveryToken()
            })
        }else{
            window.location.reload()
        }
    }, [])
    useEffect(() => {
        if(success){
            setTimeout(() => {
                router.push("/settings")
            }, 3000)
        }
    }, [success])

    return (
        <>
            <div className="space-y-4">
                <span onClick={() => changeTab(LoginEnum.REGISTER)} className="flex flex-row gap-2 text-base cursor-pointer">
                    <UndoOutlinedIcon/>
                    Go Back
                </span>
                <h2 className="text-3xl font-semibold">Waiting for confirmation...</h2>
            </div>
            <span className="p-4 border-2 border-black text-center font-bold">
                {
                    success ?
                        "Good, You are logged in!" :
                        "..."
                }
            </span>
            <p className="text-center">
                We have sent you an email containing a link to authorize this session.<br/>
                <b>THE SENDER IS ONLY noreply@socialcryptoart.com</b>
            </p>
            <p className="text-sm text-center">
                DO NOT CLOSE THIS TAB. LEAVE IT OPEN AND AFTER YOU CLICK THE LINK, <br/>THIS PAGE WILL RELOAD AUTOMATICALLY.
            </p>
        </>
    );
};

export default Confirmation;