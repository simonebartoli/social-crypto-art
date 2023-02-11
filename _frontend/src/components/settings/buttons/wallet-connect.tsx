import React from 'react';
import Image from "next/image";
import WalletConnectImage from "/public/wallet-connect.svg"
import {useEthers} from "@usedapp/core";

const WalletConnect = () => {
    const {account} = useEthers()

    const onClick = async () => {

    }

    return (
        <div
            onClick={onClick}
            className={`${!account ? "hover:bg-black hover:text-white bg-white" : "bg-custom-light-grey cursor-not-allowed"} transition w-full p-4 flex flex-row gap-4 rounded-lg items-center justify-center cursor-pointer shadow-lg`}>
            <div className="w-1/4">
                <Image src={WalletConnectImage} alt="" className="h-[50px] text-black"/>
            </div>
            <span className="w-3/4 text-2xl text-center">Wallet Connect</span>
        </div>
    );
};

export default WalletConnect;