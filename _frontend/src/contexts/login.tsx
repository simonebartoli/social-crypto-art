import React, {createContext, ReactNode, useState} from 'react';
import {NextPage} from "next";
import {LazyQueryExecFunction, useLazyQuery, useMutation} from "@apollo/client";
import {Get_UserQuery, Exact} from "@/__generated__/graphql";
import {GET_USER} from "@/graphql/account-info";
import {LOGOUT} from "@/graphql/access";
import {toast} from "react-toastify";
import {useRouter} from "next/router";

export type ContextType = {
    logged: boolean | null
    logout: () => void
    getUser: LazyQueryExecFunction<Get_UserQuery, Exact<{ [key: string]: never; }>>
    loading: boolean
    personalInfo: PersonalInfoType | null
}
type PersonalInfoType = {
    nickname: string
    email: string
    accounts: {
       name: string
       address: string
       packet: string | null
    }[]
}

const loginContext = createContext<undefined | ContextType>(undefined)

type Props = {
    children: ReactNode
}

export const LoginContext: NextPage<Props> = ({children}) => {
    const router = useRouter()

    const [personalInfo, setPersonalInfo] = useState<PersonalInfoType | null>(null)
    const [logged, setLogged] = useState<boolean | null>(null)
    const [getUser, {loading}] = useLazyQuery(GET_USER, {
        fetchPolicy: "no-cache",
        onCompleted: (data) => {
            setLogged(true)
            setPersonalInfo({
                email: data.getUser.email,
                nickname: data.getUser.nickname,
                accounts: (data.getUser.accounts).map(_ => {
                    return {
                        name: _.name,
                        address: _.address,
                        packet: _.packet as string | null
                    }
                })
            })
        },
        onError: () => {
            setLogged(false)
            setPersonalInfo(null)
        }
    })
    const [logout] = useMutation(LOGOUT, {
        onCompleted: () => {
            setLogged(false)
            setPersonalInfo(null)
            router.push("/home")
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const value = {logged, getUser, loading, personalInfo, logout}
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
