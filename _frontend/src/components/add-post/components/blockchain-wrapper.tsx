import React, {useEffect, useState} from 'react';
import {HardhatProvider, socialNFTContract} from "@/contracts";
import { ethers } from 'ethers';
import {NextPage} from "next";
import BlockchainInteraction, {BlockchainOperationType} from "@/components/library/blockchain-interaction";
import {
    Contract_createNft,
    Contract_setRoyalties,
    Contract_setSellingAuction,
    Contract_setSellingFixedPrice
} from "@/contexts/contract";

type Props = {
    createNft?: {
        ipfsURI: string
        onFinish?: () => void
    }
    setRoyalties?: {
        percentage: string
        onFinish?: () => void
    }
    setSelling?: {
        setSellingFixedPrice?: {
            amount: string,
            currency: string
            onFinish?: () => void
        }
        setSellingAuction?: {
            initialPrice: string,
            refundable: boolean,
            minIncrement: string,
            currency: string,
            deadline: string
            onFinish?: () => void
        }
    }
    nft_id?: string
}

const BlockchainWrapper: NextPage<Props> = ({nft_id, createNft, setRoyalties, setSelling}) => {
    const [nftId, setNftId] = useState(nft_id)

    const [nftCreation, setNftCreation] = useState(!!createNft)
    const [nftRoyalties, setNftRoyalties] = useState(!!setRoyalties)
    const [nftSelling, setNftSelling] = useState(!!setSelling)

    const [estimate_createNft, setEstimate_createNft] = useState<string | undefined>(undefined)
    const [estimate_setRoyalties, setEstimate_setRoyalties] = useState<string | undefined>(undefined)
    const [estimate_setSellingFixedPrice, setEstimate_setSellingFixedPrice] = useState<string | undefined>(undefined)
    const [estimate_setSellingAuction, setEstimate_setSellingAuction] = useState<string | undefined>(undefined)

    const [execute_createNft, setExecute_createNft] = useState(false)
    const [execute_setRoyalties, setExecute_setRoyalties] = useState(false)
    const [execute_setSellingFixedPrice, setExecute_setSellingFixedPrice] = useState(false)
    const [execute_setSellingAuction, setExecute_setSellingAuction] = useState(false)

    const [disabled_createNft, setDisabled_createNft] = useState(false)
    const [disabled_setRoyalties, setDisabled_setRoyalties] = useState(false)
    const [disabled_setSellingFixedPrice, setDisabled_setSellingFixedPrice] = useState(false)
    const [disabled_setSellingAuction, setDisabled_setSellingAuction] = useState(false)

    const [operations, setOperations] = useState<BlockchainOperationType[]>([])

    const getEstimate_createNft = async (ipfs: string) => {
        try{
            const result = (await socialNFTContract.estimateGas.createNft(ipfs)).mul(await HardhatProvider.getGasPrice())
            setEstimate_createNft(ethers.utils.formatEther(result))
        }catch (e) {
            setEstimate_createNft(undefined)
        }
    }
    const getEstimate_setRoyalties = async (nftId: string, royalties: string) => {
        try{
            const result = (await socialNFTContract.estimateGas.setRoyalties(nftId, royalties)).mul(await HardhatProvider.getGasPrice())
            setEstimate_setRoyalties(ethers.utils.formatEther(result))
        }catch (e) {
            setEstimate_setRoyalties(undefined)
        }
    }
    const getEstimate_setSellingFixedPrice = async (nftId: string, amount: string, currency: string) => {
        try{
            const result = (await socialNFTContract.estimateGas.setSellingFixedPrice(nftId, amount, currency)).mul(await HardhatProvider.getGasPrice())
            setEstimate_setSellingFixedPrice(ethers.utils.formatEther(result))
        }catch (e) {
            setEstimate_setSellingFixedPrice(undefined)
        }
    }
    const getEstimate_setSellingAuction = async (nftId: string, initialPrice: string, refundable: boolean, minIncrement: string, currency: string, deadline: string) => {
        try{
            const result = (await socialNFTContract.estimateGas.setSellingAuction(nftId, initialPrice, refundable, minIncrement, currency, deadline)).mul(await HardhatProvider.getGasPrice())
            setEstimate_setSellingAuction(ethers.utils.formatEther(result))
        }catch (e) {
            setEstimate_setSellingAuction(undefined)
        }
    }

    useEffect(() => {
        const newOps: BlockchainOperationType[] = []
        if(createNft && nftCreation){
            newOps.push({
                name: "CREATE NFT",
                estimate: {
                    value: estimate_createNft,
                    set: setEstimate_createNft
                },
                disabled: {
                    value: disabled_createNft,
                    set: setDisabled_createNft
                },
                execute: {
                    value: execute_createNft,
                    set: setExecute_createNft
                },
                contract: <Contract_createNft
                    callback={(id) => {
                        setDisabled_createNft(true)
                        setNftId(id)

                        if(createNft.onFinish){
                            createNft.onFinish()
                        }
                        setNftCreation(false)
                    }}
                    onError={(message) => {
                        console.log(message)
                    }}
                    execute={execute_createNft}
                    URI={createNft.ipfsURI}
                />,
                estimateFunction: () => {
                    getEstimate_createNft(createNft.ipfsURI)
                }
            })
        }
        if(setRoyalties && nftId && nftRoyalties){
            newOps.push({
                name: "SET ROYALTIES",
                estimate: {
                    value: estimate_setRoyalties,
                    set: setEstimate_setRoyalties
                },
                disabled: {
                    value: disabled_setRoyalties,
                    set: setDisabled_setRoyalties
                },
                execute: {
                    value: execute_setRoyalties,
                    set: setExecute_setRoyalties
                },
                contract: <Contract_setRoyalties
                    callback={() => {
                        setDisabled_setRoyalties(true)
                        if(setRoyalties.onFinish){
                            setRoyalties.onFinish()
                        }
                        setNftRoyalties(false)
                    }}
                    onError={(message) => {
                        console.log(message)
                    }}
                    execute={execute_setRoyalties}
                    nft_id={nftId}
                    percentage={setRoyalties.percentage}
                />,
                estimateFunction: () => {
                    getEstimate_setRoyalties(nftId, setRoyalties.percentage)
                }
            })
        }
        if(setSelling && nftId && nftSelling){
            if(setSelling.setSellingFixedPrice){
                newOps.push({
                    name: "SET SELLING FIXED PRICE",
                    estimate: {
                        value: estimate_setSellingFixedPrice,
                        set: setEstimate_setSellingFixedPrice
                    },
                    disabled: {
                        value: disabled_setSellingFixedPrice,
                        set: setDisabled_setSellingFixedPrice
                    },
                    execute: {
                        value: execute_setSellingFixedPrice,
                        set: setExecute_setSellingFixedPrice
                    },
                    contract: <Contract_setSellingFixedPrice
                        callback={() => {
                            setDisabled_setSellingFixedPrice(true)
                            if(setSelling.setSellingFixedPrice?.onFinish){
                                setSelling.setSellingFixedPrice.onFinish()
                            }
                            setNftSelling(false)
                        }}
                        onError={(message) => {
                            console.log(message)
                        }}
                        execute={execute_setSellingFixedPrice}
                        nft_id={nftId}
                        amount={setSelling.setSellingFixedPrice.amount}
                        currency={setSelling.setSellingFixedPrice.currency}
                    />,
                    estimateFunction: () => {
                        getEstimate_setSellingFixedPrice(nftId, setSelling.setSellingFixedPrice!.amount, setSelling.setSellingFixedPrice!.amount)
                    }
                })
            }else if(setSelling.setSellingAuction){
                newOps.push({
                    name: "SET SELLING AUCTION",
                    estimate: {
                        value: estimate_setSellingAuction,
                        set: setEstimate_setSellingAuction
                    },
                    disabled: {
                        value: disabled_setSellingAuction,
                        set: setDisabled_setSellingAuction
                    },
                    execute: {
                        value: execute_setSellingAuction,
                        set: setExecute_setSellingAuction
                    },
                    contract: <Contract_setSellingAuction
                        callback={() => {
                            setDisabled_setSellingAuction(true)

                            if(setSelling.setSellingAuction?.onFinish){
                                setSelling.setSellingAuction.onFinish()
                            }
                            setNftSelling(false)
                        }}
                        onError={(message) => {
                            console.log(message)
                        }}
                        execute={execute_setSellingFixedPrice}
                        nft_id={nftId}
                        currency={setSelling.setSellingAuction.currency}
                        deadline={setSelling.setSellingAuction.deadline}
                        initialPrice={setSelling.setSellingAuction.initialPrice}
                        refundable={setSelling.setSellingAuction.refundable}
                        minIncrement={setSelling.setSellingAuction.minIncrement}
                    />,
                    estimateFunction: () => {
                        getEstimate_setSellingAuction(nftId, setSelling.setSellingAuction!.initialPrice, setSelling.setSellingAuction!.refundable, setSelling.setSellingAuction!.minIncrement, setSelling.setSellingAuction!.currency, setSelling.setSellingAuction!.deadline)
                    }
                })
            }
        }
        setOperations(newOps)
    }, [
        estimate_createNft, execute_createNft, disabled_createNft, nftId,
        estimate_setRoyalties, execute_setRoyalties, disabled_setRoyalties,
        estimate_setSellingFixedPrice, execute_setSellingFixedPrice, disabled_setSellingFixedPrice,
        estimate_setSellingAuction, execute_setSellingAuction, disabled_setSellingAuction,
        nftCreation, nftRoyalties, nftSelling
    ])

    return (
        <>
            <BlockchainInteraction
                operations={operations}
            />
        </>
    );
};

export default BlockchainWrapper;