import React from 'react';
import Image from "next/image";
import MetamaskImage from "/public/metamask.svg"
import {useEthers} from "@usedapp/core";
import {useWeb3Info} from "@/contexts/web3-info";

const Metamask = () => {
    const { activateBrowserWallet} = useEthers()
    const {account} = useWeb3Info()
    return (
        <div onClick={() => !account && activateBrowserWallet({type: "metamask"})}
             className={`${!account ? "hover:bg-black hover:text-white bg-orange-600" : "bg-custom-light-grey cursor-not-allowed"} transition w-full p-4 flex flex-row gap-4 rounded-lg items-center justify-center cursor-pointer shadow-lg`}>

            <div className="w-1/4">
                <Image src={MetamaskImage} alt="" className="h-[50px] text-black"/>
            </div>
            <span className="w-3/4 text-2xl text-center">Connect to Metamask</span>
        </div>
    );
};

export default Metamask;