import React from 'react';

import Box from "@/components/index/box";
import Link from "next/link";

const Comp3 = () => {
    return (
        <div className="comp3 relative text-white w-screen h-screen flex items-center justify-center">
            <div className="w-screen h-screen bg-black absolute top-0 left-0 opacity-20"/>
            <div className={"z-10 flex items-center justify-center flex-col gap-16 w-full"}>
                <h2 className="text-4xl font-title">Who are You?</h2>
                <div className="flex flex-row justify-center items-start gap-16 w-full">
                    <Box
                        type={"NOT_EXPERT"}
                        title={"NFT Newbie"}
                        reasons={[
                            "Experience Completely Guided",
                            "Easy Creation of your First Account Web3.0",
                            "Interaction with Other People",
                            "No Need to Buy or Sell Anything"
                        ]}
                    />
                    <Box
                        type={"EXPERT"}
                        title={"NFT Expert"}
                        reasons={[
                            "Auction Selling Available",
                            "Fixed Price Selling Available",
                            "Selling using Native Currency",
                            "Selling using WETH, DAI, USDC, USDT",
                            "Detailed Stats (Future Update)"
                        ]}
                    />
                </div>
                <Link href={"/home"} className="font-main hover:bg-white hover:text-black transition duration-300 px-8 py-4 bg-black rounded-full text-3xl">
                    Launch the App
                </Link>
            </div>
        </div>
    );
};

export default Comp3;