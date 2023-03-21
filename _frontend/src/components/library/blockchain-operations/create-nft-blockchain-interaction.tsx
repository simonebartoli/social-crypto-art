import React, {useEffect, useRef, useState} from 'react';
import {BlockchainOperationType} from "@/components/library/blockchain-interaction";
import {HardhatProvider, socialNFTContract} from "@/contracts";
import {ethers} from "ethers";
import {NextPage} from "next";
import {Contract_createNft} from "@/contexts/contract";
import {useBlockchainCallbackPostsContext} from "@/contexts/blockchain-callback";
import {useEthers} from "@usedapp/core";
import {useMutation} from "@apollo/client";
import {VALIDATE_NFT_CREATION} from "@/graphql/post";
import {toast} from "react-toastify";

type Props = {
    ipfsURI: string
    setNftId?: React.Dispatch<React.SetStateAction<string | undefined>>
    onFinish?: () => void
}

const CreateNftBlockchainInteraction: NextPage<Props> = ({ipfsURI, setNftId, onFinish}) => {
    const {account} = useEthers()

    const {operations, setOperations, shiftIndex, setShiftIndex, indexAllowed, setIndexAllowed} = useBlockchainCallbackPostsContext()
    const [alreadySet, setAlreadySet] = useState(false)
    const [operationId, setOperationId] = useState<number>(-1)

    const tempNftId = useRef<string>()
    const [estimate, setEstimate] = useState<string | undefined>(undefined)
    const [execute, setExecute] = useState(false)
    const [disabled, setDisabled] = useState(false)

    const [finished, setFinished] = useState(false)
    const [validateNftCreation] = useMutation(VALIDATE_NFT_CREATION, {
        onError: (error) => {
            console.log("ERROR SERVER")
            toast.error(error.message)
        },
        onCompleted: () => {
            setFinished(true)
            console.log("VERIFIED ON THE SERVER")
        }
    })
    const getEstimate = async () => {
        try{
            const result = (await socialNFTContract.connect(account!).estimateGas.createNft(ipfsURI)).mul(await HardhatProvider.getGasPrice())
            setEstimate(ethers.utils.formatEther(result))
        }catch (e) {
            setEstimate("NOT CALCULABLE")
        }
    }

    useEffect(() => {
        if(!finished){
            const newOp: BlockchainOperationType = {
                name: "CREATE NFT",
                disabled: {
                    value: disabled,
                    set: setDisabled
                },
                contract: <Contract_createNft
                    callback={(id) => {
                        setDisabled(true)
                        tempNftId.current = id
                        validateNftCreation({
                            variables: {
                                data: {
                                    ipfs: ipfsURI
                                }
                            }
                        })
                    }}
                    onError={(message) => {
                        console.log(message)
                        setExecute(false)
                        setDisabled(false)
                    }}
                    execute={execute}
                    URI={ipfsURI}
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
            setShiftIndex(0)
            setIndexAllowed([0])

            setOperations([...operations].slice(1))
        }
    }, [
        estimate, execute, disabled, ipfsURI,
        finished
    ])
    useEffect(() => {
        if(finished && operations.length === 0 && shiftIndex === 0 && indexAllowed[0] === 0){
            if(onFinish){
                onFinish()
            }
            if(setNftId){
                setNftId(tempNftId.current)
            }
        }
    }, [finished, operations, shiftIndex, indexAllowed])


    return (
        <></>
    );
};

export default CreateNftBlockchainInteraction;