import React, {createContext, ReactNode, useState} from 'react';
import {NextPage} from "next";
import {LazyQueryExecFunction, useLazyQuery} from "@apollo/client";
import {CHECK_AUTHORIZATION} from "@/graphql/access";
import {Check_AuthorizationQuery, Exact} from "@/__generated__/graphql";

type ContextType = {
    logged: boolean | null
    checkAuthorization: LazyQueryExecFunction<Check_AuthorizationQuery, Exact<{ [key: string]: never; }>>
    loading: boolean
}

const loginContext = createContext<undefined | ContextType>(undefined)

type Props = {
    children: ReactNode
}

export const LoginContext: NextPage<Props> = ({children}) => {
    const [logged, setLogged] = useState<boolean | null>(null)
    const [checkAuthorization, {loading}] = useLazyQuery(CHECK_AUTHORIZATION, {
        fetchPolicy: "no-cache",
        onCompleted: () => {
            setLogged(true)
        },
        onError: () => {
            setLogged(false)
        }
    })

    const value = {logged, checkAuthorization, loading}
    return (
        <loginContext.Provider value={value}>
            {children}
        </loginContext.Provider>
    );
};

export const useLogin = () => {
    const context = React.useContext(loginContext)
    if (context === undefined) {
        throw new Error('useRequireLogin must be used within a LoginProvider')
    }
    return context
}
