import React, {createContext, ReactNode, useEffect, useState} from 'react';
import {NextPage} from "next";
import {BlockchainOperationType} from "@/components/library/blockchain-interaction";

export type BlockchainCallbackType = {
    operations: BlockchainOperationType[]
    setOperations: React.Dispatch<React.SetStateAction<BlockchainOperationType[]>>
    shiftIndex: number
    setShiftIndex: React.Dispatch<React.SetStateAction<number>>
    indexAllowed: number[]
    setIndexAllowed: React.Dispatch<React.SetStateAction<number[]>>
    wait: () => void
}
const blockchainCallbackContext = createContext<undefined | BlockchainCallbackType>(undefined)

type Props = {
    children: ReactNode
}

export const BlockchainCallbackContext: NextPage<Props> = ({children}) => {
    const [operations, setOperations] = useState<BlockchainOperationType[]>([])
    const [shiftIndex, setShiftIndex] = useState(0)

    const [resolveWait, setResolveWait] = useState<(value: unknown) => void>()
    const [indexAllowed, setIndexAllowed] = useState<number[]>([0])

    const wait = async () => {
        await new Promise((resolve) => {
            setResolveWait(resolve)
        })
    }

    useEffect(() => {
        if (resolveWait) {
            resolveWait("OK")
        }
    }, [operations])

    const value: BlockchainCallbackType = {
        operations,
        setOperations,
        shiftIndex,
        setShiftIndex,
        indexAllowed,
        setIndexAllowed,
        wait
    }
    return (
        <blockchainCallbackContext.Provider value={value}>
            {children}
        </blockchainCallbackContext.Provider>
    );
};

export const useBlockchainCallbackPostsContext = () => {
    const context = React.useContext(blockchainCallbackContext)
    if (context === undefined) {
        throw new Error('useBlockchainCallbackPostsContext must be used within a BlockchainCallbackContextProvider')
    }
    return context
}
