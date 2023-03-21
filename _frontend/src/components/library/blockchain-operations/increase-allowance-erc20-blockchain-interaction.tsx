import React, {useEffect, useState} from 'react';
import {BlockchainOperationType} from "@/components/library/blockchain-interaction";
import {HardhatProvider, IERC20Interface} from "@/contracts";
import {ethers} from "ethers";
import {NextPage} from "next";
import {Contract_increaseAllowancesErc20} from "@/contexts/contract";
import {useBlockchainCallbackPostsContext} from "@/contexts/blockchain-callback";
import {useEthers} from "@usedapp/core";
import {IERC20} from "@/__typechain";
import {SOCIAL_NFT_ADDRESS} from "@/globals";

type Props = {
    amount: string
    address: string
    onFinish?: () => void
}

const IncreaseAllowanceErc20BlockchainInteractions: NextPage<Props> = ({amount, address, onFinish}) => {
    const {account} = useEthers()

    const {operations, setOperations, shiftIndex, setShiftIndex, indexAllowed, setIndexAllowed} = useBlockchainCallbackPostsContext()
    const [alreadySet, setAlreadySet] = useState(false)
    const [operationId, setOperationId] = useState<number>(-1)

    const [estimate, setEstimate] = useState<string | undefined>(undefined)
    const [execute, setExecute] = useState(false)
    const [disabled, setDisabled] = useState(false)

    const [finished, setFinished] = useState(false)

    const getEstimate = async () => {
        try{
            const contract = new ethers.Contract(address, IERC20Interface, HardhatProvider) as IERC20
            const result = (await contract.connect(account!).estimateGas.approve(SOCIAL_NFT_ADDRESS, amount)).mul(await HardhatProvider.getGasPrice())
            setEstimate(ethers.utils.formatEther(result))
        }catch (e) {
            console.log(e)
            setEstimate("NOT CALCULABLE")
        }
    }

    useEffect(() => {
        if(!finished){
            const newOp: BlockchainOperationType = {
                name: "INCREASE ALLOWANCE",
                disabled: {
                    value: disabled,
                    set: setDisabled
                },
                contract: <Contract_increaseAllowancesErc20
                    amount={amount}
                    address={address}
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
        estimate, execute, disabled, amount, address,
        finished
    ])


    return (
        <></>
    );
};

export default IncreaseAllowanceErc20BlockchainInteractions;