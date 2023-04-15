import React from 'react';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import {useLogin} from "@/contexts/login";
import Link from "next/link";
import {useWeb3Info} from "@/contexts/web3-info";

const NavbarTop = () => {
    const {account, disconnect} = useWeb3Info()
    const {personalInfo, logout} = useLogin()

    const logoutSession = () => {
        disconnect()
        logout()
    }

    return (
        <div className="shadow-lg border-b-2 border-x-2 border-custom-grey flex z-50 flex-row font-main rounded-b-lg justify-between items-center gap-16 fixed top-0 left-[7.5%] bg-custom-light-grey w-[90%] py-3 px-8 h-[10vh]">
            <div className="flex flex-row gap-8 items-center justify-center">
                {
                    personalInfo !== null ?
                    <>
                        <div className="text-2xl">
                            <span>Hello, {personalInfo.nickname}</span>
                        </div>
                        <span className="w-[30px] bg-black h-[1px]"/>
                        {
                            account ?
                                <span className="text-xl">
                                    Connected to <span className="text-xl p-2 rounded-lg bg-black text-white">{account}</span>
                                </span>:
                                <Link href="/settings/web3/connected" className="hover:bg-white hover:text-black transition border-[1px] shadow-lg border-black rounded-lg p-2 bg-black text-white text-center">
                                    Connect Now
                                </Link>
                        }
                    </> :
                    <>
                        <div className="text-2xl">
                            <span>Login for more options</span>
                        </div>
                        <span className="w-[30px] bg-black h-[1px]"/>
                        <Link href={"/login"} className="hover:bg-white hover:text-black transition border-[1px] shadow-lg border-black rounded-lg p-2 bg-black text-white text-center">
                            Login
                        </Link>
                    </>
                }
            </div>
            {
                personalInfo !== null &&
                <div className="flex flex-row gap-6 items-center justify-center">
                    <Link href="/add-post" className="hover:bg-white hover:text-black transition border-[1px] shadow-lg border-black rounded-lg p-2 bg-black text-white text-center">
                        Add Post
                    </Link>
                    <NotificationsNoneOutlinedIcon className="!text-3xl"/>
                    <LogoutOutlinedIcon onClick={() => logoutSession()} className="!text-3xl ml-8 cursor-pointer hover:text-custom-red transition"/>
                </div>
            }
        </div>
    );
};

export default NavbarTop;