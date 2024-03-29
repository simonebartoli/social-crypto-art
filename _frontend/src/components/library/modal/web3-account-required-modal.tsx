import React from 'react';
import Metamask from "@/components/settings/buttons/metamask";
import WalletConnect from "@/components/settings/buttons/wallet-connect";
import {NextPage} from "next";
import Button from "@/components/login/button";
import {useWeb3Info} from "@/contexts/web3-info";
import CustomAccount from "@/components/settings/buttons/custom-account";

type Props = {
    specificAccount?: string
    specificNotAccount?: string
}

const Web3AccountRequiredModal: NextPage<Props> = ({specificAccount, specificNotAccount}) => {
    const {disconnect} = useWeb3Info()
    const {account} = useWeb3Info()

    return (
        <div className="flex flex-col gap-8 items-center justify-start h-full w-2/3">
            <h1 className="text-2xl font-bold text-center">
                {
                    specificAccount ?
                        <>
                            <span>You need the following account for this functionality:<br/><br/></span>
                            <span className="p-2 bg-black text-white rounded-lg text-lg">
                                {specificAccount}
                            </span>
                        </> :
                    specificNotAccount ?
                        <>
                            <span>You need a different account from the following for this functionality:<br/><br/></span>
                            <span className="p-2 bg-black text-white rounded-lg text-lg">
                                {specificNotAccount}
                            </span>
                        </> :
                        "You need a Web3 Account for this functionality"
                }
            </h1>
            <div className="flex flex-col gap-4">
                <Metamask/>
                <div className="border-[1px] border-black rounded-lg">
                    <WalletConnect/>
                </div>
                <CustomAccount/>
            </div>
            {
                account &&
                <Button
                    text={"Disconnect"}
                    disabled={false}
                    onClick={disconnect}
                />
            }
        </div>
    );
};

export default Web3AccountRequiredModal;