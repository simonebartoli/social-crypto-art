import React, {createContext, ReactNode, useState} from 'react';
import {NextPage} from "next";
import Loader from "@/components/library/loader";

type ContextType = {
    changeLoading: (x: boolean) => void
    loader: boolean
}

const loaderContext = createContext<undefined | ContextType>(undefined)

type Props = {
    children: ReactNode
}

export const LoaderContext: NextPage<Props> = ({children}) => {
    const [loader, setLoader] = useState(false)

    const changeLoading = (x: boolean) => {
        setLoader(x)
    }
    const value = {changeLoading, loader}
    return (
        <loaderContext.Provider value={value}>
            {children}
            {loader && <Loader/>}
        </loaderContext.Provider>
    );
};

export const useLoader = () => {
    const context = React.useContext(loaderContext)
    if (context === undefined) {
        throw new Error('useLoader must be used within a LoaderProvider')
    }
    return context
}
