import React, {useEffect} from 'react';
import {NextPage} from "next";
import {useLogin} from "@/contexts/login";
import Loader from "@/components/library/loader";
import {useModal} from "@/contexts/modal";
import LoginModal from "@/components/library/modal/login-modal";

type Props = {
    children?: JSX.Element
    callback?: () => void
}

const ActionRequireLogin: NextPage<Props> = ({children, callback}) => {
    const {showModal} = useModal()
    const {logged, getUser} = useLogin()

    useEffect(() => {
        if(logged === null){
            getUser()
        }
    }, [])

    useEffect(() => {
        if(logged && callback){
            callback()
        }else if(!logged){
            showModal(<LoginModal/>)
        }
    }, [logged])

    if(logged === null){
        return <Loader/>
    }
    if(!logged){
        return (
            <></>
        )
    }

    return (
        <>
            {
                children && children
            }
        </>
    );
};

export default ActionRequireLogin;