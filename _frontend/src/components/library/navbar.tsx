import React, {useEffect, useState} from 'react';
import CameraOutdoorOutlinedIcon from '@mui/icons-material/CameraOutdoorOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import OndemandVideoOutlinedIcon from '@mui/icons-material/OndemandVideoOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import Link from "next/link";
import {useRouter} from "next/router";
import {useSearchBar} from "@/contexts/search-bar";

const Navbar = () => {
    const {setOpen} = useSearchBar()
    const [reference, setReference] = useState({
        "/home": false,
        "/search": false,
        "/trends": false,
        "/account": false,
        "/settings": false
    })
    const router = useRouter()
    useEffect(() => {
        const link = router.asPath.split("?")[0]
        const copy = {...reference}
        if(link in copy){
            for(const _ of Object.keys(copy)){
                copy[_ as keyof typeof reference] = false
            }
            copy[link as keyof typeof reference] = true
        }
        setReference(copy)
    }, [router.asPath])

    return (
        <div className="font-main rounded-r-lg text-white p-2 flex flex-col items-center justify-around bg-black fixed top-0 left-0 h-screen w-[5%]">
            <Link href="/home" className={`${reference["/home"] ? "bg-white text-black" : "hover:bg-white hover:text-black"} w-full relative flex flex-row justify-center items-center gap-4 cursor-pointer p-3 transition rounded-full`}>
                <CameraOutdoorOutlinedIcon className="!text-3xl"/>
            </Link>
            <div onClick={() => setOpen(true)} className="w-full relative flex flex-row justify-center items-center gap-4 cursor-pointer p-3 hover:bg-white hover:text-black transition rounded-full">
                <SearchOutlinedIcon className="!text-3xl"/>
            </div>
            <div className="w-full relative flex flex-row justify-center items-center gap-4 cursor-pointer p-3 hover:bg-white hover:text-black transition rounded-full">
                <OndemandVideoOutlinedIcon className="!text-3xl"/>
            </div>
            <Link href="/account" className={`${reference["/account"] ? "bg-white text-black" : "hover:bg-white hover:text-black"} w-full relative flex flex-row justify-center items-center gap-4 cursor-pointer p-3 transition rounded-full`}>
                <PersonOutlineOutlinedIcon className="!text-3xl"/>
            </Link>
            <Link href="/settings/personal" className={`${reference["/settings"] ? "bg-white text-black" : "hover:bg-white hover:text-black"} w-full relative flex flex-row justify-center items-center gap-4 cursor-pointer p-3 transition rounded-full`}>
                <SettingsOutlinedIcon className="!text-3xl"/>
            </Link>
        </div>
    );
};

export default Navbar;