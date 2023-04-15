import React, {ChangeEvent, useMemo, useState} from 'react';
import {LoginEnum} from "@/enums/local/login-enum";
import {NextPage} from "next";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import Errors from "@/components/login/errors";
import Button from "@/components/login/button";
import KeyboardDoubleArrowRightOutlinedIcon from "@mui/icons-material/KeyboardDoubleArrowRightOutlined";
import {emailRegex} from "@/filters";
import {useMutation} from "@apollo/client";
import {CREATE_NEW_LOGIN_INSTANCE_EMAIL} from "@/graphql/access";
import {toast} from "react-toastify";
import {socket} from "@/globals";

type Props = {
    changeTab: (selected: LoginEnum) => void
}

const LoginWithEmail: NextPage<Props> = ({changeTab}) => {
    const [email, setEmail] = useState("")
    const [errors, setErrors] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const buttonDisabled = useMemo(() => {
        return errors.length > 0;
    }, [errors])

    const [createNewLoginInstance_Email] = useMutation(CREATE_NEW_LOGIN_INSTANCE_EMAIL, {
        onError: (error) => {
            setLoading(false)
            if(error.graphQLErrors && error.graphQLErrors[0]){
                const errorMessage = error.graphQLErrors[0].message
                toast.error(errorMessage)
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
                setErrors([])
            }else{
                setErrors(["The email provided is not valid"])
            }
        }else{
            setErrors([])
        }
    }
    const onProceedClick = () => {
        if(socket.connected){
            setLoading(true)
            createNewLoginInstance_Email({
                variables: {
                    data: {
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
                <h2 className="text-3xl font-semibold">Login with Email</h2>
            </div>
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
                <Errors errors={errors}/>
            </div>
            <Button trigger={true} onClick={onProceedClick} disabled={buttonDisabled || loading} text={"Proceed"} icon={<KeyboardDoubleArrowRightOutlinedIcon/>}/>
        </>
    );
};

export default LoginWithEmail;