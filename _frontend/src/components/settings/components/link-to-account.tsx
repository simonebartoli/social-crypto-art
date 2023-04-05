import React, {useEffect, useState} from 'react';
import PermIdentityOutlinedIcon from "@mui/icons-material/PermIdentityOutlined";
import {useEthers} from "@usedapp/core";
import {Contract_getMessageHash, Contract_getMessageHash_CallbackType} from "@/contexts/contract";
import {toast} from "react-toastify";
import {JsonRpcProvider} from "@ethersproject/providers";
import {useMutation, useQuery} from "@apollo/client";
import {ADD_NEW_WEB3_ACCOUNT, GET_IP_ADDRESS} from "@/graphql/access";
import {useModal} from "@/contexts/modal";
import {useLoader} from "@/contexts/loader";
import {ethers} from "ethers";
import {NextPage} from "next";
import {useWeb3Info} from "@/contexts/web3-info";

type Props = {
    callback: () => void
}

const LinkToAccount: NextPage<Props> = ({callback}) => {
    const {changeLoading} = useLoader()
    const {closeModal} = useModal()

    const {} = useQuery(GET_IP_ADDRESS, {
        onCompleted: (data) => setIp(data.getIpAddress),
        onError: () => toast.error("There is an error, Please refresh the page")
    })
    const [addNewWeb3Account, {loading}] = useMutation(ADD_NEW_WEB3_ACCOUNT, {
        onCompleted: () => {
            callback()
            changeLoading(false)
            setDisabled(false)
            toast.success("Account Added Successfully")
            closeModal()
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const [accountName, setAccountName] = useState("")
    const [ip, setIp] = useState<string | null>(null)
    const [date, setDate] = useState<Date | null>(null)
    const [signature, setSignature] = useState<string | null>(null)

    const [disabled, setDisabled] = useState(true)
    const [getContract, setGetContract] = useState(false)
    const {library} = useEthers()
    const {account} = useWeb3Info()

    const onFormSubmit = async () => {
        setGetContract(true)
        setDisabled(true)
    }
    const onMessageHashCallback = async ({value, error, date}: Contract_getMessageHash_CallbackType) => {
        if(error){
            toast.error(error.message)
            setDisabled(false)
        }else if(value){
            setGetContract(false)
            setDate(date)
            const signer = (library as JsonRpcProvider).getSigner()
            try{
                const signedMessage = await signer.signMessage(ethers.utils.arrayify(value[0]))
                setSignature(signedMessage)
            }catch (e) {
                toast.error("Please sign the transaction")
                setDisabled(false)
            }
        }
    }

    useEffect(() => {
        if(signature !== null && date !== null && account){
            addNewWeb3Account({
                variables: {
                    data: {
                        name: accountName,
                        date: date,
                        signature: signature,
                        address: account
                    }
                }
            })
        }
    }, [signature])
    useEffect(() => {
        if(accountName !== "") {
            setDisabled(false)
        }else{
            setDisabled(true)
        }
    }, [accountName])

    useEffect(() => {
        if(loading) changeLoading(true)
        else changeLoading(false)
    }, [loading])

    return (
        <div className="w-full flex flex-col items-center justify-center gap-12">
            {
                (account && ip && getContract) &&
                <Contract_getMessageHash account={account} ip={ip} callback={onMessageHashCallback}/>
            }
            <h2 className="text-3xl font-bold">Connect your Web3 to the Login</h2>
            <p className="text-center text-lg">
                You&apos;re about to connect the account below to the login system of this app.<br/>
                After this operation you&apos;ll be able to connect to your account using this address.
            </p>
            <div className="p-4 bg-custom-light-grey rounded-lg w-full text-lg font-bold">
                <span className="text-center w-full block">{account}</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-6 w-full">
                <span className="w-full text-center">Please provide a name to your account, so you can better identify it.</span>
                <div className="flex flex-col gap-2 items-start justify-center w-3/4">
                    <div className="flex flex-row items-center justify-center gap-2">
                        <PermIdentityOutlinedIcon className="!text-2xl"/>
                        <span>Account Name</span>
                    </div>
                    <input
                        className="p-3 bg-custom-grey text-white rounded-lg border-[1px] border-black w-full"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        type="text"
                        placeholder="Insert the name of you account..."
                    />
                </div>
                <button
                    disabled={disabled}
                    onClick={onFormSubmit}
                    className="disabled:text-black disabled:bg-custom-light-grey disabled:pointer-events-none disabled:cursor-not-allowed border-[1px] border-black w-3/4 shadow-lg py-2 px-6 rounded-lg bg-black text-white text-2xl hover:bg-white hover:text-black transition"
                >
                    Link Now
                </button>
                <span className="text-sm italic">
                    A digital signature will be asked to verify your account
                </span>
            </div>
        </div>
    );
};


export default LinkToAccount;