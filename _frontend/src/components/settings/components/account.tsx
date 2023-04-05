import React from 'react';
import {NextPage} from "next";
import {useModal} from "@/contexts/modal";
import PromptPassword from "@/components/settings/components/prompt-password";
import {useWeb3Info} from "@/contexts/web3-info";
import {toast} from "react-toastify";
import {useEthers} from "@usedapp/core";

type Props = {
    address: string
    name: string
    packet: string | null
}

const Account: NextPage<Props> = ({address, name, packet}) => {
    const {showModal, closeModal} = useModal()
    const {activateBrowserWallet} = useEthers()
    const {loadWallet, account, disconnect} = useWeb3Info()

    const onPasswordSubmit = async (password: string) => {
        const result = await loadWallet(address, password)
        if(result.status){
            closeModal()
        }else{
            toast.error(result.message)
        }
    }
    const promptPassword = () => {
        showModal(
            <PromptPassword
                address={address}
                callback={onPasswordSubmit}
            />
        )
    }

    return (
        <div key={address} className={`${account?.toLowerCase() === address.toLowerCase() ? "bg-custom-dark-green" : "bg-black"} p-3 text-white flex flex-col items-center justify-center w-full gap-4 border-4 border-white rounded-lg`}>
            <div className="w-full text-xl w-full flex flex-row justify-between items-center">
                <div className="flex flex-col gap-2 rounded-lg">
                    <span className="font-bold">Account Address</span>
                    <span>{address}</span>
                </div>
                <span className="text-2xl font-bold">{name}</span>
            </div>
            <span className="border-t-[1px] border-white w-full"/>
            <div className="flex flex-col w-full">
                <span>
                    {
                        account?.toLowerCase() === address.toLowerCase() ? "Currently in Use" : "Currently not in Use"
                    }
                </span>
                {
                    packet ?
                    <div className="flex flex-row gap-6 items-center justify-start">
                        <span>This account is saved on the system.</span>
                        {
                            account?.toLowerCase() !== address.toLowerCase() ?
                            <button onClick={promptPassword} className="p-2 bg-white text-black rounded-lg cursor-pointer">CLICK TO USE IT NOW</button> :
                            <button onClick={disconnect} className="p-2 bg-white text-black rounded-lg cursor-pointer">DISCONNECT</button>
                        }
                    </div> :
                    <div className="flex flex-row gap-6 items-center justify-start">
                        <span>This account is used by a third party extension.</span>
                        {
                            account?.toLowerCase() !== address.toLowerCase() ?
                                <button onClick={activateBrowserWallet} className="p-2 bg-white text-black rounded-lg cursor-pointer">CLICK TO USE IT NOW</button> :
                                <button onClick={disconnect} className="p-2 bg-white text-black rounded-lg cursor-pointer">DISCONNECT</button>
                        }
                    </div>
                }
            </div>
        </div>
    );
};

export default Account;