import React, {createContext, ReactNode, useEffect, useState} from 'react';
import {useWindowHeight, useWindowWidth} from "@react-hook/window-size";
import {NextPage} from "next";

type ContextType = {
    widthPage: number
    heightPage: number
    scrollPosition: number
    documentHeight: number
}

const layoutContext = createContext<undefined | ContextType>(undefined)

type Props = {
    children: ReactNode
}

export const LayoutContext: NextPage<Props> = ({children}) => {
    const widthPage = useWindowWidth();
    const heightPage = useWindowHeight()
    const [scrollPosition, setScrollPosition] = useState(0)
    const [documentHeight, setDocumentHeight] = useState(0)

    const updateScrollPosition = () => {
        setScrollPosition(window.scrollY)
        setDocumentHeight(document.body.scrollHeight)
    }

    useEffect(() => {
        window.addEventListener("scroll", updateScrollPosition)
    }, [])

    const value = {widthPage, heightPage, scrollPosition, documentHeight}
    return (
        <layoutContext.Provider value={value}>
            {children}
        </layoutContext.Provider>
    );
};

export const useLayout = () => {
    const context = React.useContext(layoutContext)
    if (context === undefined) {
        throw new Error('useLayout must be used within a LayoutProvider')
    }
    return context
}
