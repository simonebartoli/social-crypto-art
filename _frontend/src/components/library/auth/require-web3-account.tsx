import React from 'react';
import Metamask from "@/components/settings/buttons/metamask";
import WalletConnect from "@/components/settings/buttons/wallet-connect";

const RequireWeb3Account = () => {
    return (
        <div className="flex flex-col gap-8 items-center justify-center h-full w-2/3">
            <h1 className="text-2xl font-bold text-center">You need a Web3 Account for this functionality</h1>
            <div className="flex flex-col gap-4">
                <Metamask/>
                <div className="border-[1px] border-black rounded-lg">
                    <WalletConnect/>
                </div>
            </div>
        </div>
    );
};

export default RequireWeb3Account;