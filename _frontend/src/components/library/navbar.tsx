import React from 'react';
import CameraOutdoorOutlinedIcon from '@mui/icons-material/CameraOutdoorOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import OndemandVideoOutlinedIcon from '@mui/icons-material/OndemandVideoOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import Link from "next/link";

const Navbar = () => {
    return (
        <div className="font-main rounded-r-lg text-white p-2 flex flex-col items-center justify-around bg-black fixed top-0 left-0 h-screen w-[5%]">
            <div className="w-full relative flex flex-row justify-center items-center gap-4 cursor-pointer p-3 hover:bg-white hover:text-black transition rounded-full">
                <CameraOutdoorOutlinedIcon className="!text-3xl"/>
            </div>
            <div className="w-full relative flex flex-row justify-center items-center gap-4 cursor-pointer p-3 hover:bg-white hover:text-black transition rounded-full">
                <SearchOutlinedIcon className="!text-3xl"/>
            </div>
            <div className="w-full relative flex flex-row justify-center items-center gap-4 cursor-pointer p-3 hover:bg-white hover:text-black transition rounded-full">
                <OndemandVideoOutlinedIcon className="!text-3xl"/>
            </div>
            <div className="w-full relative flex flex-row justify-center items-center gap-4 cursor-pointer p-3 hover:bg-white hover:text-black transition rounded-full">
                <PersonOutlineOutlinedIcon className="!text-3xl"/>
            </div>
            <Link href="/settings" className="w-full relative flex flex-row justify-center items-center gap-4 cursor-pointer p-3 hover:bg-white hover:text-black transition rounded-full">
                <SettingsOutlinedIcon className="!text-3xl"/>
            </Link>
        </div>
    );
};

export default Navbar;