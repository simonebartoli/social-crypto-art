import React from 'react';
import Metamask from "@/components/settings/buttons/metamask";
import WalletConnect from "@/components/settings/buttons/wallet-connect";
import {useEthers} from "@usedapp/core";
import {useModal} from "@/contexts/modal";
import LinkToAccount from "@/components/settings/components/link-to-account";
import {ApolloQueryResult} from "@apollo/client";
import {Get_Web3_AccountsQuery} from "@/__generated__/graphql";
import {NextPage} from "next";

type Props = {
    refetch: () => Promise<ApolloQueryResult<Get_Web3_AccountsQuery>>
}

const Connect: NextPage<Props> = ({refetch}) => {
    const {account, deactivate} = useEthers()
    const {showModal} = useModal()

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
                            <div className="mt-6 flex flex-col items-center justify-center gap-4 p-6 border-custom-red border-[3px] rounded-lg">
                                <span>If you want to link it to your account for future access please press the button below</span>
                                <button
                                    onClick={() => showModal(<LinkToAccount callback={refetchAccounts}/>)}
                                    className="shadow-lg py-2 px-6 rounded-lg bg-black text-white text-xl hover:bg-white hover:text-black transition">
                                    Link It to Your Account
                                </button>
                            </div>
                        </div>:
                        <span>You are currently not connected to any of your account.</span>
                }
            </div>
            {
                account &&
                <div className="rounded-lg flex flex-col items-center justify-center gap-6 p-6 bg-custom-light-grey w-full">
                    <span>If you want to connect another account, Please disconnect first.</span>
                    <button onClick={deactivate} className="shadow-lg py-2 px-6 rounded-lg bg-black text-white text-xl hover:bg-white hover:text-black transition">Disconnect</button>
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