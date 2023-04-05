import React, {createContext, ReactNode, useEffect, useState} from 'react';
import {NextPage} from "next";
import {useRouter} from "next/router";
import SearchBar from "@/components/library/search-bar/search-bar";

type ContextType = {
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const searchBarContext = createContext<undefined | ContextType>(undefined)

type Props = {
    children: ReactNode
}

export const SearchBarContext: NextPage<Props> = ({children}) => {
    const router = useRouter()
    const [open, setOpen] = useState(false)

    useEffect(() => setOpen(false), [router.asPath])

    const value = {open, setOpen}
    return (
        <searchBarContext.Provider value={value}>
            {
                open &&
                <div className="font-main h-[75vh] rounded-lg p-3 fixed top-1/2 left-[52.5%] -translate-y-1/2 -translate-x-1/2 z-50 w-[75%]">
                    <SearchBar/>
                </div>
            }
            <>
                {
                    open &&
                    <div onClick={() => setOpen(false)} className="backdrop-blur-lg fixed bg-black opacity-60 top-0 left-0 w-screen h-screen z-20"/>
                }
                {children}
            </>
        </searchBarContext.Provider>
    );
};

export const useSearchBar = () => {
    const context = React.useContext(searchBarContext)
    if (context === undefined) {
        throw new Error('searchBarContext must be used within a SearchBarProvider')
    }
    return context
}
