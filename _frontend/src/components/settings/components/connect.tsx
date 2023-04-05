import React, {useEffect, useState} from 'react';
import Metamask from "@/components/settings/buttons/metamask";
import WalletConnect from "@/components/settings/buttons/wallet-connect";
import {useModal} from "@/contexts/modal";
import LinkToAccount from "@/components/settings/components/link-to-account";
import {NextPage} from "next";
import {useWeb3Info} from "@/contexts/web3-info";

type Props = {
    accounts: {
        address: string
        name: string
        packet: string | null
    }[]
    refetch: () => void
}

const Connect: NextPage<Props> = ({accounts, refetch}) => {
    const {account, disconnect} = useWeb3Info()
    const [alreadySet, setAlreadySet] = useState(false)
    const {showModal} = useModal()

    useEffect(() => {
        if(account){
            if(accounts.map(_ => _.address.toLowerCase()).includes(account.toLowerCase())){
                setAlreadySet(true)
            }else{
                setAlreadySet(false)
            }
        }
    }, [account])

    const refetchAccounts = () => {
        refetch()
    }

    return (
        <>
            <div className="rounded-lg flex flex-col items-center justify-center gap-6 p-6 bg-custom-light-grey w-full">
                <span className="text-3xl">{account ? "Connected" : "Not Connected"}</span>
                {
                    account ?
                        <div className="text-center flex flex-col gap-2">
                            <span>Your address is the following: </span>
                            <span className="font-bold tracking-wider text-lg">{account}</span>
                            {
                                alreadySet ?
                                <span className="text-xl">This account already exist in our system</span> :
                                <div className="mt-6 flex flex-col items-center justify-center gap-4 p-6 border-custom-red border-[3px] rounded-lg">
                                    <span>If you want to link it to your account for future access please press the button below</span>
                                    <button
                                        onClick={() => showModal(<LinkToAccount callback={refetchAccounts}/>)}
                                        className="shadow-lg py-2 px-6 rounded-lg bg-black text-white text-xl hover:bg-white hover:text-black transition">
                                        Link It to Your Account
                                    </button>
                                </div>
                            }

                        </div>:
                        <span>You are currently not connected to any of your account.</span>
                }
            </div>
            {
                account &&
                <div className="rounded-lg flex flex-col items-center justify-center gap-6 p-6 bg-custom-light-grey w-full">
                    <span>If you want to connect another account, Please disconnect first.</span>
                    <button onClick={disconnect} className="shadow-lg py-2 px-6 rounded-lg bg-black text-white text-xl hover:bg-white hover:text-black transition">Disconnect</button>
                </div>
            }
            <div className="w-1/2 flex flex-col gap-6">
                <Metamask/>
                <WalletConnect/>
            </div>
        </>
    );
};

export default Connect;