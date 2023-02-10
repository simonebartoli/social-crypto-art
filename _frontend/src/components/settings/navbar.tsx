import React, {useEffect, useRef} from 'react';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import {SettingsEnum} from "@/enums/local/settings-enum";
import {NextPage} from "next";

type Props = {
    tabToShow: SettingsEnum
    updateNavWidth: (x: number) => void
    changeTab: (selected: SettingsEnum) => void
}

const Navbar: NextPage<Props> = ({tabToShow, updateNavWidth, changeTab}) => {
    const navRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if(navRef.current !== null){
            updateNavWidth(navRef.current.offsetWidth)
        }
    })

    return (
        <nav ref={navRef} className="fixed top-0 left-0 p-8 flex flex-col items-center justify-center w-1/4 bg-black h-screen text-white text-2xl">
            <span className="w-full h-[10%] flex flex-row gap-2 text-base cursor-pointer">
                <UndoOutlinedIcon/>
                Go Back
            </span>
            <div className="flex flex-col items-center justify-around h-[90%]">
                <div onClick={() => changeTab(SettingsEnum.PERSONAL)}
                     className={`${tabToShow === SettingsEnum.PERSONAL && "font-bold w-full rounded-lg bg-white text-black"} p-4 w-full flex flex-row gap-6 items-center justify-start cursor-pointer`}>

                    <ManageAccountsOutlinedIcon className="!text-4xl"/>
                    <span>Personal Account</span>
                </div>
                <div onClick={() => changeTab(SettingsEnum.WEB3)}
                     className={`${tabToShow === SettingsEnum.WEB3 && "font-bold w-full rounded-lg bg-white text-black"} p-4 w-full flex flex-row gap-6 items-center justify-start cursor-pointer`}>

                    <LanguageOutlinedIcon className="!text-4xl"/>
                    <span>Web3 Linked Accounts</span>
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