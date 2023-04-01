import React, {useEffect} from 'react';
import {NextPage} from "next";
import {Hardhat, useEthers} from "@usedapp/core";
import {useModal} from "@/contexts/modal";
import Button from "@/components/login/button";
import {useRouter} from "next/router";

type Props = {
    children: React.ReactNode
}
const Web3Account: NextPage<Props> = ({children}) => {
    const router = useRouter()
    const {switchNetwork, chainId} = useEthers()
    const {showModal, closeModal} = useModal()

    useEffect(() => {
        if(chainId){
            if(chainId !== Hardhat.chainId){
                showModal(
                    <div className="flex flex-col justify-center h-full items-center gap-6">
                        <h1 className="text-3xl font-bold">This Network is Not Supported</h1>
                        <p>To continue with the application please switch network</p>
                        <Button text={"Switch Network"} onClick={() => switchNetwork(Hardhat.chainId)}/>
                    </div>, false
                )
            }else{
                closeModal()
            }
        }
    }, [chainId, router.asPath])

    return (
        <div>
            {
                children
            }
        </div>
    );
};

export default Web3Account;