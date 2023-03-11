import React from 'react';
import Metamask from "@/components/settings/buttons/metamask";
import WalletConnect from "@/components/settings/buttons/wallet-connect";
import {NextPage} from "next";
import {useEthers} from "@usedapp/core";
import Button from "@/components/login/button";

type Props = {
    specificAccount?: string
}

const RequireWeb3Account: NextPage<Props> = ({specificAccount}) => {
    const {deactivate, account} = useEthers()
    return (
        <div className="flex flex-col gap-8 items-center justify-center h-full w-2/3">
            <h1 className="text-2xl font-bold text-center">
                {
                    specificAccount ?
                        <>
                            <span>You need the following account for this functionality:<br/><br/></span>
                            <span className="p-2 bg-black text-white rounded-lg text-lg">
                                {specificAccount}
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
            </div>
            {
                account &&
                <Button
                    text={"Disconnect"}
                    disabled={false}
                    onClick={() => deactivate()}
                />
            }
        </div>
    );
};

export default RequireWeb3Account;