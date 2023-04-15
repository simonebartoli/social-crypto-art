import React, {useEffect, useRef, useState} from 'react';
import {useWeb3Info} from "@/contexts/web3-info";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import * as Crypto from "crypto"
import {useModal} from "@/contexts/modal";
import PromptPassword from "@/components/settings/components/prompt-password";
import {toast} from "react-toastify";

const CustomAccount = () => {
    const addressToUnlock = useRef<string>("")

    const {account, loadWallet} = useWeb3Info()
    const {showModal, closeModal} = useModal()
    const [accountsAvailable, setAccountsAvailable] = useState<string[]>([])
    const [active, setActive] = useState(false)

    const onPasswordTyped = async (password: string) => {
        const result = await loadWallet(addressToUnlock.current, password)
        if(result.status){
            closeModal()
        }else{
            toast.error(result.message)
        }
    }
    const listAccountsAvailable = () => {
        const addressMapKey = Crypto.createHash("sha1").update("address-map-key").digest("base64")
        const addressMap = localStorage.getItem(addressMapKey)
        if(addressMap){
            const addresses = JSON.parse(Buffer.from(addressMap, "base64").toString("utf8")) as string[]
            setAccountsAvailable(addresses)
        }
    }
    const connectToAccount = (address: string) => {
        if(!account){
            addressToUnlock.current = address
            showModal(
                <PromptPassword
                    address={addressToUnlock.current}
                    callback={onPasswordTyped}
                />
            )
        }
    }

    useEffect(() => {
        listAccountsAvailable()
    }, [])

    return (
        <div
             className={`${!account ? "hover:bg-black hover:text-white bg-custom-grey" : "bg-custom-light-grey text-black cursor-not-allowed"} text-white transition w-full p-4 flex flex-col gap-4 rounded-lg items-center justify-center shadow-lg`}>
            <div onClick={() => setActive(true)} className={`flex flex-row gap-4 w-full items-center justify-center ${account ? "cursor-not-allowed" : "cursor-pointer"}`}>
                <div className="w-1/4 h-[50px] flex items-center justify-center">
                    <LockOutlinedIcon className="!text-5xl"/>
                </div>
                <span className="w-3/4 text-2xl text-center">Use our System</span>
            </div>
            {
                (active && accountsAvailable.length > 0) ?
                accountsAvailable.map(_ =>
                    <div key={_} className="flex flex-col gap-4 items-center justify-center">
                        <div className="flex text-black flex-col items-center justify-center p-3 bg-white shadow-lg rounded-lg w-full">
                            <span>{_}</span>
                            <span onClick={() => connectToAccount(_)} className={`font-bold w-full text-right ${account ? "cursor-not-allowed" : "cursor-pointer"}`}>
                                {
                                    account === _ ? "Connected" : "Connect Now"
                                }
                            </span>
                        </div>
                    </div>
                ) : (active) &&
                <div className="flex text-black flex-col items-center justify-center p-3 bg-white shadow-lg rounded-lg w-full">
                    <span>No Account is Saved in the System</span>
                </div>
            }
        </div>
    );
};

export default CustomAccount;