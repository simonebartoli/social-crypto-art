import React, {useEffect, useRef, useState} from 'react';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import {SettingsEnum} from "@/enums/local/settings-enum";
import {NextPage} from "next";
import Link from "next/link";
import {useRouter} from "next/router";

const Navbar: NextPage = () => {
    const router = useRouter()
    const [tabToShow, setTabToShow] = useState<SettingsEnum>(SettingsEnum.PERSONAL)
    const navRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if(router.isReady){
            const path = router.asPath
            if(path.includes(SettingsEnum[SettingsEnum.PERSONAL].toLowerCase())){
                setTabToShow(SettingsEnum.PERSONAL)
            }else if(path.includes(SettingsEnum[SettingsEnum.WEB3_CONNECTED].split("_")[1].toLowerCase())){
                setTabToShow(SettingsEnum.WEB3_CONNECTED)
            }else if(path.includes(SettingsEnum[SettingsEnum.WEB3_LINK].split("_")[1].toLowerCase())){
                setTabToShow(SettingsEnum.WEB3_LINK)
            }else if(path.includes(SettingsEnum[SettingsEnum.WEB3_CREATE].split("_")[1].toLowerCase())){
                setTabToShow(SettingsEnum.WEB3_CREATE)
            }
        }
    }, [router.isReady, router.asPath])

    return (
        <nav ref={navRef} className="fixed top-0 left-0 p-8 flex flex-col items-center justify-center w-1/4 bg-black h-screen text-white text-2xl">
            <Link href="/home" className="w-full h-[10%] flex flex-row gap-2 text-base cursor-pointer">
                <UndoOutlinedIcon/>
                Go Back
            </Link>
            <div className="flex flex-col items-center justify-around h-[90%]">
                <Link href={"/settings/personal"}
                     className={`${tabToShow === SettingsEnum.PERSONAL && "font-bold w-full rounded-lg bg-white text-black"} p-4 w-full flex flex-row gap-6 items-center justify-start cursor-pointer`}>

                    <ManageAccountsOutlinedIcon className="!text-4xl"/>
                    <span>Personal Account</span>
                </Link>
                <div
                     className={`${
                         (tabToShow === SettingsEnum.WEB3_CONNECTED || 
                         tabToShow === SettingsEnum.WEB3_CREATE ||
                         tabToShow === SettingsEnum.WEB3_LINK)
                     && "font-bold w-full rounded-lg bg-white text-black"} 
                     p-4 w-full flex flex-col gap-4`}>
                    <Link
                        href={"/settings/web3/connected"}
                        className="flex flex-row gap-6 items-center justify-start cursor-pointer"
                    >
                        <LanguageOutlinedIcon className="!text-4xl"/>
                        <span>Web3 Linked Accounts</span>
                    </Link>
                    {
                        (tabToShow === SettingsEnum.WEB3_CONNECTED ||
                        tabToShow === SettingsEnum.WEB3_CREATE ||
                        tabToShow === SettingsEnum.WEB3_LINK) &&
                        <div className="flex flex-col items-end justify-center gap-2 font-normal text-xl">
                            <Link href={"/settings/web3/connected"} className={`${tabToShow === SettingsEnum.WEB3_CONNECTED && "font-bold"}`}>Connected Account</Link>
                            <Link href={"/settings/web3/create"} className={`${tabToShow === SettingsEnum.WEB3_CREATE && "font-bold"}`}>Create New Account</Link>
                            <Link href={"/settings/web3/link"} className={`${tabToShow === SettingsEnum.WEB3_LINK && "font-bold"}`}>Connect a new Account</Link>
                        </div>
                    }
                </div>
                <div
                    className={`${tabToShow === SettingsEnum.TRANSACTIONS && "font-bold w-full rounded-lg bg-white text-black"} p-4 w-full flex flex-row gap-6 items-center justify-start cursor-pointer`}>

                    <AccountBalanceWalletOutlinedIcon className="!text-4xl"/>
                    <span>Transactions</span>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;