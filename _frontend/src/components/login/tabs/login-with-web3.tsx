import React, {useEffect, useState} from 'react';
import {LoginEnum} from "@/enums/local/login-enum";
import {NextPage} from "next";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import Button from "@/components/login/button";
import KeyboardDoubleArrowRightOutlinedIcon from "@mui/icons-material/KeyboardDoubleArrowRightOutlined";
import {useMutation, useQuery} from "@apollo/client";
import {GET_ACCESS_TOKEN_WEB3_ACCOUNT, GET_IP_ADDRESS} from "@/graphql/access";
import {toast} from "react-toastify";
import Metamask from "@/components/settings/buttons/metamask";
import WalletConnect from "@/components/settings/buttons/wallet-connect";
import {useEthers} from "@usedapp/core";
import {Contract_getMessageHash, Contract_getMessageHash_CallbackType} from "@/contexts/contract";
import {JsonRpcProvider} from "@ethersproject/providers";
import {ethers} from "ethers";
import {useRouter} from "next/router";
import {useLoader} from "@/contexts/loader";

type Props = {
    changeTab: (selected: LoginEnum) => void
}

const LoginWithWeb3: NextPage<Props> = ({changeTab}) => {
    const {account, deactivate, library} = useEthers()
    const {changeLoading} = useLoader()
    const router = useRouter()

    const {} = useQuery(GET_IP_ADDRESS, {
        onCompleted: (data) => setIp(data.getIpAddress),
        onError: () => toast.error("There is an error, Please refresh the page")
    })
    const [getAccessToken_Web3Account] = useMutation(GET_ACCESS_TOKEN_WEB3_ACCOUNT, {
        onError: (error) => {
            changeLoading(false)
            setDisabled(false)
            toast.error(error.message)
        },
        onCompleted: async () => {
            setDisabled(false)
            toast.success("Good, You're logged in!")
            await router.push("/settings")
            changeLoading(false)
        },

    })

    const [ip, setIp] = useState<string | null>(null)
    const [date, setDate] = useState<Date | null>(null)
    const [signature, setSignature] = useState<string | null>(null)
    const [disabled, setDisabled] = useState(true)

    const [getHash, setGetHash] = useState(false)

    const onFormSubmit = async () => {
        setDisabled(true)
        setGetHash(true)
    }
    const getMessageHashCallback = async ({value, error, date}: Contract_getMessageHash_CallbackType) => {
        if(error){
            setDisabled(false)
            toast.error(error.message)
        }else if(value){
            setGetHash(false)
            setDate(date)
            const signer = (library as JsonRpcProvider).getSigner()
            try{
                const signedMessage = await signer.signMessage(ethers.utils.arrayify(value[0]))
                setSignature(signedMessage)
            }catch (e) {
                setDisabled(false)
                toast.error("Please sign the transaction")
            }
        }
    }

    useEffect(() => {
        if(account && ip !== null) setDisabled(false)
        else setDisabled(true)
    }, [ip, account])
    useEffect(() => {
        if(signature !== null && account){
            changeLoading(true)
            getAccessToken_Web3Account({
                variables: {
                    data: {
                        signature: signature,
                        address: account,
                        date: date
                    }
                }
            })
        }
    }, [signature])


    return (
        <>
            {
                (getHash && account && ip !== null) &&
                <Contract_getMessageHash account={account} ip={ip} callback={getMessageHashCallback}/>
            }
            <div className="space-y-4">
                <span onClick={() => changeTab(LoginEnum.MAIN)} className="flex flex-row gap-2 text-base cursor-pointer">
                    <UndoOutlinedIcon/>
                    Go Back
                </span>
                <h2 className="text-3xl font-semibold">Login with Web3 Account</h2>
            </div>
            <div className="flex flex-col gap-4">
                <Metamask/>
                <WalletConnect/>
            </div>
            {
                account &&
                <div className="p-4 bg-custom-light-grey rounded-lg flex flex-col items-center justify-center gap-3">
                    <span>You&apos;re about to use the following address:</span>
                    <span className="font-bold">{account}</span>
                    <button onClick={deactivate} className="hover:bg-white hover:text-black transition shadow-lg border-[1px] border-black w-full p-2 bg-black text-white rounded-lg">Disconnect</button>
                </div>
            }
            <div className="w-full flex flex-col gap-3 items-center">
                <Button onClick={onFormSubmit} disabled={disabled} text={"Proceed"} icon={<KeyboardDoubleArrowRightOutlinedIcon/>}/>
                <span className="text-sm italic">
                    A digital signature will be asked to verify your account
                </span>
            </div>
        </>
    );
};

export default LoginWithWeb3;