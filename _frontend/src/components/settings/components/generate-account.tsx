import React, {useEffect, useState} from 'react';
import * as Crypto from "crypto";
import {useMutation, useQuery} from "@apollo/client";
import {ADD_NEW_WEB3_ACCOUNT, CREATE_NEW_SALT, GET_IP_ADDRESS} from "@/graphql/access";
import {toast} from "react-toastify";
import {NextPage} from "next";
import {ethers} from "ethers";
import {Contract_getMessageHash, Contract_getMessageHash_CallbackType} from "@/contexts/contract";
import {SettingsCreateWeb3Enum} from "@/enums/local/settings-enum";
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import {useLogin} from "@/contexts/login";

type Props = {
    accountName: string
    password: string
    setStep: React.Dispatch<React.SetStateAction<SettingsCreateWeb3Enum>>
}

const GenerateAccount: NextPage<Props> = ({accountName, password, setStep}) => {
    const {refetch} = useLogin()

    const [showPrivateKey, setShowPrivateKey] = useState(false)
    const [showMnemonic, setShowMnemonic] = useState(false)

    const [ready, setReady] = useState(false)

    const [ip, setIp] = useState<string>()
    const [date, setDate] = useState<Date>()
    const [signature, setSignature] = useState<string>()

    const [wallet, setWallet] = useState<ethers.Wallet>()
    const [encWallet, setEncWallet] = useState<string>()
    const [downloadableTextFile, setDownloadableTextFile] = useState<string>()

    const [salt, setSalt] = useState("")
    const [secure] = useState(Crypto.randomBytes(32).toString("base64"))

    const {} = useQuery(GET_IP_ADDRESS, {
        onCompleted: (data) => setIp(data.getIpAddress),
        onError: () => toast.error("There is an error, Please refresh the page")
    })
    const [createNewSalt] = useMutation(CREATE_NEW_SALT, {
        variables: {
           data: {
               id: Crypto.pbkdf2Sync(password, secure, 32, 32, "sha256").toString("base64")
           }
        },
        onCompleted: (data) => {
            setSalt(data.createNewSalt.salt)
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })
    const [addNewWeb3Account] = useMutation(ADD_NEW_WEB3_ACCOUNT, {
        onCompleted: () => {
            refetch()
            setReady(true)
        },
        onError: (error) => {
            setStep(SettingsCreateWeb3Enum.PASSWORD)
            toast.error(error.message)
        }
    })

    const generateWeb3Account = () => {
        const newWallet = ethers.Wallet.createRandom()
        console.log(newWallet)
        setWallet(newWallet)
    }
    const generateTextFile = () => {
        if(wallet){
            const text = `
            KEEP THESE INFORMATION IN A SECURE PLACE
            ------------------------------------------------------
            MNEMONIC:    ${wallet.mnemonic.phrase}
            PRIVATE KEY: ${wallet.privateKey}
            ------------------------------------------------------
            
            PUBLIC KEY:  ${wallet.publicKey}
            ADDRESS:     ${wallet.address}
            `
            const file = new Blob([text], {type: "text/plain"})
            setDownloadableTextFile(URL.createObjectURL(file))
        }
    }
    const encryptWallet = async () => {
        const securityKey = Crypto.pbkdf2Sync(password, salt, 32, 32, "sha256")
        const initVector = Crypto.randomBytes(32)

        if(wallet){
            const data = Buffer.from(JSON.stringify({
                mnemonic: wallet.mnemonic,
                private_key: wallet.privateKey,
                public_key: wallet.publicKey,
                address: wallet.address
            })).toString("base64")
            const encCypher = Crypto.createCipheriv("aes-256-gcm", securityKey, initVector)
            let encData = encCypher.update(data, "base64", "base64")
            encData += encCypher.final("base64")
            const tag = encCypher.getAuthTag().toString("base64")

            const newEncWallet = Buffer.from(JSON.stringify({
                data: encData,
                tag: tag,
                iv: Buffer.from(initVector).toString("base64"),
                secure: secure
            })).toString("base64")
            setEncWallet(newEncWallet)
        }
    }
    const onMessageHashCallback = async ({value, error, date}: Contract_getMessageHash_CallbackType) => {
        if(error){
            toast.error(error.message)
        }else if(value && wallet){
            setDate(date)
            try{
                const signedMessage = await wallet.signMessage(ethers.utils.arrayify(value[0]))
                setSignature(signedMessage)
            }catch (e) {
                toast.error("Please sign the transaction")
            }
        }
    }

    useEffect(() => {
        createNewSalt()
        generateWeb3Account()
    }, [])
    useEffect(() => {
        if(salt !== "" && wallet && !encWallet){
            generateTextFile()
            encryptWallet()
        }
    }, [salt, wallet, encWallet])
    useEffect(() => {
        if(encWallet && wallet && date && signature && downloadableTextFile){
            addNewWeb3Account({
                variables: {
                    data: {
                        name: accountName,
                        date: date,
                        signature: signature,
                        address: wallet.address,
                        packet: encWallet
                    }
                }
            })
            setReady(true)
        }
    }, [encWallet, wallet, date, signature, downloadableTextFile])

    return (
        <div className="flex flex-col items-center justify-center gap-4 w-full">
            {
                (wallet?.address && ip) &&
                <Contract_getMessageHash account={wallet.address} ip={ip} callback={onMessageHashCallback}/>
            }
            <h3 className="text-2xl font-bold">
                {
                    ready ? "We have generated your account!" : "We are generating your account..."
                }
            </h3>
            <p>
                {
                    ready ? "The following one is your new account." : "Please wait few seconds while we create your new account..."
                }
            </p>
            {
                ready &&
                <div className="mt-8 flex flex-col gap-6 items-center justify-center w-full">
                    <div className="p-4 border-[1px] border-custom-red rounded-lg flex flex-col gap-6 items-center justify-center w-full">
                        <span className="text-3xl text-custom-red font-bold">KEEP THESE INFORMATION IN A SAFE PLACE</span>
                        <div className="flex flex-col gap-2 items-start justify-center bg-black rounded-lg w-full p-4">
                            <span className="text-2xl">MNEMONIC</span>
                            <div className="flex border-[1px] border-white flex-row items-center justify-between bg-custom-grey p-2 rounded-lg w-full">
                            <span className="text-lg break-all">
                                {showMnemonic ? wallet?.mnemonic.phrase : "●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●"}
                            </span>
                                {
                                    showMnemonic ?
                                        <VisibilityOffOutlinedIcon onClick={() => setShowMnemonic(false)} className="!text-4xl"/> :
                                        <RemoveRedEyeOutlinedIcon onClick={() => setShowMnemonic(true)} className="!text-4xl"/>
                                }
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 items-start justify-center bg-black rounded-lg w-full p-4">
                            <span className="text-2xl">PRIVATE KEY</span>
                            <div className="flex border-[1px] border-white flex-row items-center justify-between bg-custom-grey p-2 rounded-lg w-full">
                            <span className="text-lg break-all">
                                {showPrivateKey ? wallet?.privateKey : "●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●"}
                            </span>
                                {
                                    showPrivateKey ?
                                        <VisibilityOffOutlinedIcon onClick={() => setShowPrivateKey(false)} className="!text-4xl"/> :
                                        <RemoveRedEyeOutlinedIcon onClick={() => setShowPrivateKey(true)} className="!text-4xl"/>
                                }
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 items-start justify-center bg-black rounded-lg w-full p-4">
                        <span className="text-2xl">ADDRESS</span>
                        <div className="flex border-[1px] border-white flex-row items-center justify-between bg-custom-grey p-2 rounded-lg w-full">
                            <span className="text-lg break-all">{wallet?.address}</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 items-start justify-center bg-black rounded-lg w-full p-4">
                        <span className="text-2xl">PUBLIC KEY</span>
                        <div className="flex border-[1px] border-white flex-row items-center justify-between bg-custom-grey p-2 rounded-lg w-full">
                            <span className="text-lg break-all">{wallet?.publicKey}</span>
                        </div>
                    </div>
                    <a download="account.txt" target="_blank" href={downloadableTextFile} rel={"noreferrer"} className="hover:text-black hover:bg-white transition cursor-pointer flex flex-row gap-4 items-center justify-center w-full bg-black text-white p-4 rounded-lg">
                        <SaveOutlinedIcon className="!text-4xl"/>
                        <span>DOWNLOAD THESE CREDENTIAL</span>
                    </a>
                </div>
            }
        </div>
    );
};

export default GenerateAccount;