import React, {useEffect} from 'react';
import {NextPage} from "next";
import {useLogin} from "@/contexts/login";
import {useRouter} from "next/router";
import Loader from "@/components/library/loader";

type Props = {
    children: JSX.Element
}

const RequireLogin: NextPage<Props> = ({children}) => {
    const router = useRouter()
    const {logged, checkAuthorization} = useLogin()

    useEffect(() => {
        checkAuthorization()
    }, [])
    useEffect(() => {
        if(logged === false){
            router.push("/login")
        }
    }, [logged])

    if(logged === null || !logged){
        return <Loader/>
    }

    return (
        <>
            {children}
        </>
    );
};

export default RequireLogin;