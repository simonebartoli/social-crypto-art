import React, {useEffect, useState} from 'react';
import {BlockchainOperationType} from "@/components/library/blockchain-interaction";
import {HardhatProvider, socialNFTContract} from "@/contracts";
import {ethers} from "ethers";
import {CurrencyEnum} from "@/enums/global/nft-enum";
import {NextPage} from "next";
import {Contract_setSellingAuction} from "@/contexts/contract";
import {useBlockchainCallbackPostsContext} from "@/contexts/blockchain-callback";
import {useEthers} from "@usedapp/core";

type Props = {
    nft_id: string
    initialPrice: string,
    refundable: boolean,
    minIncrement: string,
    currency: CurrencyEnum,
    deadline: string
    onFinish?: () => void
}

const AuctionSellingBlockchainInteraction: NextPage<Props> = ({nft_id, initialPrice, refundable, minIncrement, currency, deadline, onFinish}) => {
    const {account} = useEthers()

    const {operations, setOperations, shiftIndex, setShiftIndex, indexAllowed, setIndexAllowed} = useBlockchainCallbackPostsContext()

    const [alreadySet, setAlreadySet] = useState(false)
    const [operationId, setOperationId] = useState<number>(-1)

    const [nftId] = useState(nft_id)

    const [estimate, setEstimate] = useState<string | undefined>(undefined)
    const [execute, setExecute] = useState(false)
    const [disabled, setDisabled] = useState(false)

    const [finished, setFinished] = useState(false)

    const getEstimate = async () => {
        try{
            const result = (await socialNFTContract.connect(account!).estimateGas.setSellingAuction(nftId, initialPrice, refundable, minIncrement, currency, deadline)).mul(await HardhatProvider.getGasPrice())
            setEstimate(ethers.utils.formatEther(result))
        }catch (e) {
            setEstimate("NOT CALCULABLE")
        }
    }

    useEffect(() => {
        if(!finished){
            const newOp: BlockchainOperationType = {
                name: "SET SELLING AUCTION",
                estimate: {
                    value: estimate,
                    set: setEstimate
                },
                disabled: {
                    value: disabled,
                    set: setDisabled
                },
                execute: {
                    value: execute,
                    set: setExecute
                },
                contract: <Contract_setSellingAuction
                    callback={() => {
                        setDisabled(true)
                        if(onFinish && operations.length === 1){
                            onFinish()
                        }
                        setFinished(true)
                    }}
                    onError={(message) => {
                        setExecute(false)
                        setDisabled(false)
                        console.log(message)
                    }}
                    execute={execute}
                    nft_id={nftId}
                    currency={String(currency)}
                    deadline={deadline}
                    initialPrice={initialPrice}
                    refundable={refundable}
                    minIncrement={minIncrement}
                />,
                estimateFunction: getEstimate
            }
            if(!alreadySet){
                setOperationId(operations.length)
                setIndexAllowed([...indexAllowed, indexAllowed[indexAllowed.length - 1] + 1])
                setAlreadySet(true)
                setOperations([...operations, newOp])
            }else{
                const indexOperation = operationId - shiftIndex
                const newOps = operations.map((_, index) => {
                    if(index === indexOperation){
                        return newOp
                    }
                    return _
                })
                setOperations(newOps)
            }
        }else{
            setShiftIndex(shiftIndex + 1)
            setOperations([...operations].slice(1))
        }
    }, [
        estimate, execute, disabled, nftId,
        finished
    ])
    return (
        <></>
    );
};

export default AuctionSellingBlockchainInteraction;