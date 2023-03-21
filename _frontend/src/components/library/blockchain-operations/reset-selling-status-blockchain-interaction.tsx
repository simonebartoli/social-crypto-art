import React, {useEffect, useState} from 'react';
import {BlockchainOperationType} from "@/components/library/blockchain-interaction";
import {HardhatProvider, socialNFTContract} from "@/contracts";
import {ethers} from "ethers";
import {NextPage} from "next";
import {Contract_resetSellingStatus} from "@/contexts/contract";
import {useBlockchainCallbackPostsContext} from "@/contexts/blockchain-callback";
import {useEthers} from "@usedapp/core";

type Props = {
    nft_id: string
    onFinish?: () => void
}

const ResetSellingStatusBlockchainInteractions: NextPage<Props> = ({nft_id, onFinish}) => {
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
            const result = (await socialNFTContract.connect(account!).estimateGas.resetSellingStatus(nftId)).mul(await HardhatProvider.getGasPrice())
            setEstimate(ethers.utils.formatEther(result))
        }catch (e) {
            setEstimate("NOT CALCULABLE")
        }
    }

    useEffect(() => {
        if(!finished){
            const newOp: BlockchainOperationType = {
                name: "RESET SELLING",
                disabled: {
                    value: disabled,
                    set: setDisabled
                },
                contract: <Contract_resetSellingStatus
                    nft_id={nft_id}
                    execute={execute}
                    onError={() => {
                        setDisabled(false)
                        setExecute(false)
                    }}
                    callback={() => {
                        if(onFinish && operations.length === 1){
                            onFinish()
                        }
                        setDisabled(true)
                        setFinished(true)
                    }}
                />,
                execute: {
                    value: execute,
                    set: setExecute
                },
                estimate: {
                    value: estimate,
                    set: setEstimate
                },
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

export default ResetSellingStatusBlockchainInteractions;