import React, {createContext, ReactNode, useState} from 'react';
import {NextPage} from "next";
import CloseIcon from '@mui/icons-material/Close';
type ContextType = {
    showModal: (e: JSX.Element) => void
    closeModal: () => void
}

const modalContext = createContext<undefined | ContextType>(undefined)

type Props = {
    children: ReactNode
}

export const ModalContext: NextPage<Props> = ({children}) => {
    const [open, setOpen] = useState(false)
    const [element, setElement] = useState<JSX.Element | null>(null)

    const showModal = (e: JSX.Element) => {
        setElement(e)
        setOpen(true)
    }
    const closeModal = () => {
        setOpen(false)
    }

    const value = {showModal, closeModal}
    return (
        <modalContext.Provider value={value}>
            {
                open &&
                <div className="font-main h-[75vh] rounded-lg p-3 fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 z-50 bg-white shadow-lg w-1/2">
                    <CloseIcon onClick={() => setOpen(false)} className="cursor-pointer !text-3xl absolute right-[1%] top-[2.5%]"/>
                    <div className="overflow-y-scroll flex flex-col items-center justify-start w-[calc(100%-1.5rem)] absolute top-[10%] h-[calc(90%-0.75rem)] left-[0.75rem] p-4">
                        {
                            element !== null &&
                            element
                        }
                    </div>
                </div>
            }
            <>
                {
                    open &&
                    <div className="backdrop-blur-lg fixed bg-black opacity-60 top-0 left-0 w-screen h-screen z-20"/>
                }
                {children}
            </>
        </modalContext.Provider>
    );
};

export const useModal = () => {
    const context = React.useContext(modalContext)
    if (context === undefined) {
        throw new Error('modalContext must be used within a ModalProvider')
    }
    return context
}
