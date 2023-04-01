import React from 'react';
import Image from "next/image";
import TEST from "../../../../public/test.webp";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import {NextPage} from "next";
import Link from "next/link";

type Props = {
    nickname: string
}

const EntryTab: NextPage<Props> = ({nickname}) => {
    return (
        <Link href={`/account?user=${nickname}`} className="cursor-pointer hover:bg-custom-light-grey bg-white rounded-lg transition p-4 flex flex-row gap-8 items-center justify-between">
            <div className="flex flex-row items-center gap-8">
                <div className="w-[50px] h-[50px] rounded-lg overflow-hidden">
                    <Image src={TEST} alt={""}/>
                </div>
                <span className="text-2xl">{nickname}</span>
            </div>
            <div className="flex flex-row items-center gap-6 z-20">
                <PersonAddOutlinedIcon className="!text-3xl"/>
                <span className="text-2xl">Follow</span>
            </div>
        </Link>
    );
};

export default EntryTab;