import React, {createContext, ReactNode, useEffect, useState} from 'react';
import {NextPage} from "next";
import {useEthers} from "@usedapp/core";
import {useLogin} from "@/contexts/login";
import * as crypto from "crypto";
import Crypto from "crypto";
import {apolloClient} from "@/pages/_app";
import {GET_SALT} from "@/graphql/access";
import {ethers, Signer} from "ethers";
import {jsonRpcProvider} from "@/contracts";

type DataType = {
    mnemonic: {
        locale: string
        path: string
        phrase: string
    }
    private_key: string
    public_key: string
    address: string
}
type EncDataType = {
    data: string
    tag: string
    iv: string
    secure: string
}

type WalletType = {
    mnemonic: string
    privateKey: string
    publicKey: string
    address: string
}

type LoadWalletType = {
    status: boolean
    message: string
}
export type ContextType = {
    loadWallet: (address: string, password: string) => Promise<LoadWalletType>
    disconnect: () => void
    signer: Signer | undefined
    account: string | undefined
}

const web3InfoContext = createContext<undefined | ContextType>(undefined)

type Props = {
    children: ReactNode
}

export const Web3Info: NextPage<Props> = ({children}) => {
    const {personalInfo} = useLogin()

    const {account: accountExtension, deactivate} = useEthers()
    const [wallet, setWallet] = useState<WalletType>()

    // EXPORTED
    const [customSigner, setCustomSigner] = useState<Signer>()
    const [account, setAccount] = useState<string>()
    const disconnect = () => {
        deactivate()
        setWallet(undefined)
    }
    const loadWallet = async (address: string, password: string) : Promise<LoadWalletType> => {
        const hashKey = crypto.createHash("sha1").update(address).digest("base64")
        const packet = localStorage.getItem(hashKey)
        if(packet){
            const encData = JSON.parse(Buffer.from(packet, "base64").toString("utf-8")) as EncDataType
            const initVector = Buffer.from(encData.iv, "base64")
            const tag = Buffer.from(encData.tag, "base64")
            const secure = encData.secure

            const id = Crypto.pbkdf2Sync(password, secure, 32, 32, "sha256").toString("base64")

            try{
                const response = await apolloClient.query({
                    query: GET_SALT,
                    fetchPolicy: "no-cache",
                    variables: {
                        data: {
                            id: id
                        }
                    }
                })
                if(response.data.getSalt.salt){
                    const securityKey = Crypto.pbkdf2Sync(password, response.data.getSalt.salt, 32, 32, "sha256")
                    const decCypher = Crypto.createDecipheriv("aes-256-gcm", securityKey, initVector)
                    decCypher.setAuthTag(tag)
                    let decryptedData = decCypher.update(encData.data, "base64", "base64")
                    decryptedData += decCypher.final("base64")
                    const data = JSON.parse(Buffer.from(decryptedData, "base64").toString("utf-8")) as DataType

                    setWallet({
                        address: data.address.toLowerCase(),
                        mnemonic: data.mnemonic.phrase,
                        privateKey: data.private_key,
                        publicKey: data.public_key
                    })
                    deactivate()

                    return {
                        status: true,
                        message: "Account Loaded Correctly"
                    }
                }else{
                    return {
                        status: false,
                        message: "Password or Packet Not Valid"
                    }
                }
            }catch (e) {
                if((e as Error).message.includes("Too Many Failed Attempts")){
                    return {
                        status: false,
                        message: (e as Error).message
                    }
                }
                return {
                    status: false,
                    message: "Password or Packet Not Valid"
                }
            }
        }else{
            return {
                status: false,
                message: "Address Not Existing"
            }
        }
    }
    /////////////////////////////////////

    const createLocalstoragePacket = () => {
        const accounts = personalInfo?.accounts.filter(_ => _.packet !== null) ?? []
        if(accounts.length > 0){
            localStorage.clear()
        }

        const addressMapKey = crypto.createHash("sha1").update("address-map-key").digest("base64")
        const addressMap = Buffer.from(JSON.stringify(accounts.map(_ => _.address))).toString("base64")

        localStorage.setItem(addressMapKey, addressMap)

        for(const acc of accounts){
            const packet = acc.packet as string
            const address = acc.address
            const hashKey = crypto.createHash("sha1").update(address).digest("base64")
            localStorage.setItem(hashKey, packet)
        }
    }

    useEffect(() => {
        if(accountExtension){
            setCustomSigner(undefined)
            setAccount(accountExtension)
        }else if(wallet){
            setAccount(wallet.address)
            setCustomSigner(new ethers.Wallet(wallet.privateKey, jsonRpcProvider))
            deactivate()
        }else{
            setCustomSigner(undefined)
            setAccount(undefined)
            deactivate()
        }
    }, [accountExtension, wallet])
    useEffect(() => {
        if(personalInfo?.accounts){
            createLocalstoragePacket()
        }
    }, [personalInfo?.accounts])

    const value: ContextType = {
        loadWallet,
        disconnect,
        signer: customSigner ?? undefined,
        account
    }
    return (
        <web3InfoContext.Provider value={value}>
            {children}
        </web3InfoContext.Provider>
    );
};

export const useWeb3Info = () => {
    const context = React.useContext(web3InfoContext)
    if (context === undefined) {
        throw new Error('web3InfoContext must be used within a Web3InfoContext')
    }
    return context
}
