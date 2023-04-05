import React from 'react';
import {NextPage} from "next";
import Account from "@/components/settings/components/account";
import Metamask from "@/components/settings/buttons/metamask";
import WalletConnect from "@/components/settings/buttons/wallet-connect";
import Link from "next/link";
import {useWeb3Info} from "@/contexts/web3-info";
import {useEthers} from "@usedapp/core";

type Props = {
    accounts: {
        address: string
        name: string
        packet: string | null
    }[]
}

const Accounts: NextPage<Props> = ({accounts}) => {
    const {deactivate} = useEthers()
    const {account} = useWeb3Info()
    return (
        <>
            {
                accounts.length > 0 ?
                <>
                    {
                        accounts.map(_ =>
                            <Account
                                key={_.address}
                                name={_.name}
                                packet={_.packet}
                                address={_.address}
                            />
                        )
                    }
                    {
                        account &&
                        <span className="min-w-[50%] text-white text-lg p-2 bg-black rounded-lg text-center">
                            {
                                account ? `Connected to ${account}` : "You're not connected"
                            }
                        </span>
                    }
                    <div className="w-1/2 flex flex-col gap-4 items-center justify-center">
                        <Metamask/>
                        <WalletConnect/>
                    </div>
                    {
                        account && !accounts.map(_ => _.address.toLowerCase()).includes(account.toLowerCase()) &&
                        <span onClick={deactivate} className="text-white text-xl cursor-pointer">Disconnect</span>
                    }
                </> :
                <>
                    <div className="rounded-lg flex-col gap-2 p-4 w-full bg-custom-light-grey text-black flex items-center justify-center">
                        <span className="text-2xl">You don&apos;t have any Web3 account associated yet</span>
                        <span>
                            <Link href="/settings/web3/link">LINK IT NOW</Link> or <Link href="/settings/web3/create">CREATE A NEW ONE</Link>
                        </span>
                    </div>
                    <span className="min-w-[50%] text-white text-lg p-2 bg-black rounded-lg text-center">
                        {
                            account ? `Connected to ${account}` : "You're not connected"
                        }
                    </span>
                    <div className="w-1/2 flex flex-col gap-4 items-center justify-center">
                        <Metamask/>
                        <WalletConnect/>
                    </div>
                    {
                        account &&
                        <span onClick={deactivate} className="text-white text-xl cursor-pointer">Disconnect</span>
                    }
                </>
            }
        </>
    );
};

export default Accounts;