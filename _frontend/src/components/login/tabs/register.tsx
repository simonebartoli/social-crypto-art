import React, {ChangeEvent, useMemo, useState} from 'react';
import KeyboardDoubleArrowRightOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowRightOutlined';
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import PermIdentityOutlinedIcon from '@mui/icons-material/PermIdentityOutlined';
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined';

import Button from "@/components/login/button";
import {LoginEnum} from "@/enums/local/login-enum";
import {NextPage} from "next";
import Errors from "@/components/login/errors";
import {emailRegex, maxNicknameLength, minNicknameLength} from "@/filters";
import {socket} from "@/globals";
import {useMutation} from "@apollo/client";
import {CREATE_USER} from "@/graphql/access";

type Props = {
    changeTab: (selected: LoginEnum) => void
}

const Register: NextPage<Props> = ({changeTab}) => {
    const [email, setEmail] = useState("")
    const [nickname, setNickname] = useState("")

    const [errorEmail, setErrorEmail] = useState<string[]>([])
    const [errorNickname, setErrorNickname] = useState<string[]>([])
    const buttonDisabled = useMemo(() => {
        return errorNickname.length > 0 || errorEmail.length > 0 || email.length === 0 || nickname.length === 0;
    }, [errorNickname, errorEmail])
    const [loading, setLoading] = useState(false)

    const [createUser] = useMutation(CREATE_USER, {
        onError: (error) => {
            setLoading(false)
            if(error.graphQLErrors && error.graphQLErrors[0]){
                const errorMessage = error.graphQLErrors[0].message
                if(errorMessage.toLowerCase().includes("email")){
                    setErrorEmail([errorMessage])
                }else if(errorMessage.toLowerCase().includes("nickname")){
                    setErrorNickname([errorMessage])
                }
            }
        },
        onCompleted: () => {
            setLoading(false)
            changeTab(LoginEnum.CONFIRMATION)
        }
    })

    const onEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newEmail = e.target.value
        setEmail(newEmail)
        if(newEmail !== ""){
            if(emailRegex.test(newEmail)){
                setErrorEmail([])
            }else{
                setErrorEmail(["The email provided is not valid"])
            }
        }else{
            setErrorEmail([])
        }
    }
    const onNicknameChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newNickname = e.target.value
        setNickname(newNickname)
        if(newNickname !== ""){
            if(newNickname.length >= maxNicknameLength) {
                setErrorNickname(["Your Nickname is too long"])
            }else if(newNickname.length <= minNicknameLength){
                setErrorNickname(["Your Nickname is too short"])
            }else{
                setErrorNickname([])
            }
        }else{
            setErrorNickname([])
        }
    }

    const onProceedClick = () => {
        if(socket.connected){
            setLoading(true)
            createUser({
                variables: {
                    data: {
                        nickname: nickname,
                        email: email,
                        socket: socket.id
                    }
                }
            })
        }else{
            window.location.reload()
        }
    }

    return (
        <>
            <div className="space-y-4">
                <span onClick={() => changeTab(LoginEnum.MAIN)} className="flex flex-row gap-2 text-base cursor-pointer">
                    <UndoOutlinedIcon/>
                    Go Back
                </span>
                <h2 className="text-3xl font-semibold">Register</h2>
            </div>
            <div className="flex flex-col w-full gap-6">
                <div className="w-full flex flex-col gap-2">
                    <span className="flex flex-row gap-2 text-custom-grey">
                        <MailOutlineOutlinedIcon/>
                        Email
                    </span>
                    <input className="w-full shadow-lg text-lg p-4 border-custom-grey border-[1px] rounded-lg"
                           type="email"
                           value={email}
                           onChange={onEmailChange}
                           placeholder={"Insert your email here..."}/>
                    <Errors errors={errorEmail}/>
                </div>
                <div className="w-full flex flex-col gap-2">
                    <span className="flex flex-row gap-2 text-custom-grey">
                        <PermIdentityOutlinedIcon/>
                        Nickname
                    </span>
                    <input className="w-full shadow-lg text-lg p-4 border-custom-grey border-[1px] rounded-lg"
                           type="text"
                           value={nickname}
                           onChange={onNicknameChange}
                           placeholder={"Insert your nickname here..."}/>
                    <Errors errors={errorNickname}/>
                </div>
            </div>
            <Button onClick={onProceedClick} disabled={buttonDisabled || loading} text={"Proceed"} icon={<KeyboardDoubleArrowRightOutlinedIcon/>}/>
        </>
    );
};

export default Register;