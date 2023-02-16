import React, {useEffect} from 'react';
import {NextPage} from "next";
import {useLogin} from "@/contexts/login";
import Loader from "@/components/library/loader";

type Props = {
    children: JSX.Element
}

const OptionalLogin: NextPage<Props> = ({children}) => {
    const {logged, getUser} = useLogin()

    useEffect(() => {
        getUser()
    }, [])

    if(logged === null){
        return <Loader/>
    }

    return (
        <>
            {children}
        </>
    );
};

export default OptionalLogin;