import React, {useEffect} from 'react';
import {NextPage} from "next";
import {useLogin} from "@/contexts/login";
import {useRouter} from "next/router";
import Loader from "@/components/library/loader";

type Props = {
    children: JSX.Element
}

const RequireNotLogin: NextPage<Props> = ({children}) => {
    const router = useRouter()
    const {logged, getUser} = useLogin()

    useEffect(() => {
        getUser()
    }, [])
    useEffect(() => {
        if(logged === true){
            router.push("/settings")
        }
    }, [logged])

    if(logged === null || logged){
        return <Loader/>
    }

    return (
        <>
            {children}
        </>
    );
};

export default RequireNotLogin;