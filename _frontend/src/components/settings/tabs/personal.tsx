import React from 'react';
import Image from "next/image";

import TEST from "/public/test.webp"
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import PermIdentityOutlinedIcon from '@mui/icons-material/PermIdentityOutlined';

const Personal = () => {
    return (
        <div className="flex flex-col items-center justify-start gap-32">
            <div className="flex flex-row items-center justify-center w-3/4 gap-16">
                <div className="relative w-[200px] h-[200px] rounded-2xl overflow-hidden p-2 border-4 border-white">
                    <Image fill={true} style={{objectFit: "fill"}} src={TEST} alt={""}/>
                </div>
                <div className="rounded-lg bg-custom-light-grey p-6 py-16 text-lg  w-[calc(80%-200px)] flex items-center justify-center">
                    Future Bio Arriving...
                </div>
            </div>
            <div className="flex flex-col gap-16 w-3/4 w-full items-start justify-center">
                <div className="flex flex-col text-3xl items-start justify-center gap-4 text-white w-full">
                    <span className="flex flex-row gap-4 text-2xl items-center justify-center">
                        <PermIdentityOutlinedIcon className="!text-3xl"/>
                        Nickname
                    </span>
                    <span className="p-4 w-full bg-black rounded-lg">micheal2000</span>
                </div>
                <div className="flex flex-col text-3xl items-start justify-center gap-4 text-white w-full">
                    <span className="flex flex-row gap-4 text-2xl items-center justify-center">
                        <MailOutlineOutlinedIcon className="!text-3xl"/>
                        Email
                    </span>
                    <span className="p-4 w-full bg-black rounded-lg">micheal@gmail.com</span>
                </div>
            </div>
        </div>
    );
};

export default Personal;