import React, {useEffect, useState} from 'react';
import {BlockchainOperationType} from "@/components/library/blockchain-interaction";
import {HardhatProvider, socialNFTContract} from "@/contracts";
import {ethers} from "ethers";
import {NextPage} from "next";
import {Contract_makeOfferAuction} from "@/contexts/contract";
import {useBlockchainCallbackPostsContext} from "@/contexts/blockchain-callback";
import {useWeb3Info} from "@/contexts/web3-info";

type Props = {
    nft_id: string
    auction_id: string
    amount: string
    type: "NATIVE" | "ERC20"
    onFinish?: () => void
}

const MakeOfferAuctionBlockchainInteraction: NextPage<Props> = ({nft_id, auction_id, type, amount, onFinish}) => {
    const {account} = useWeb3Info()

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
            if(type === "NATIVE"){
                const result = (await socialNFTContract.connect(account!).estimateGas.makeOfferAuction(nftId, auction_id, amount, {value: amount})).mul(await HardhatProvider.getGasPrice())
                setEstimate(ethers.utils.formatEther(result))
            }else{
                const result = (await socialNFTContract.connect(account!).estimateGas.makeOfferAuction(nftId, auction_id, amount)).mul(await HardhatProvider.getGasPrice())
                setEstimate(ethers.utils.formatEther(result))
            }
        }catch (e) {
            console.log(e)
            setEstimate("NOT CALCULABLE")
        }
    }

    useEffect(() => {
        if(!finished){
            const newOp: BlockchainOperationType = {
                name: "MAKE OFFER AUCTION",
                disabled: {
                    value: disabled,
                    set: setDisabled
                },
                contract: <Contract_makeOfferAuction
                    nft_id={nft_id}
                    auction_id={auction_id}
                    amount={amount}
                    type={type}
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

export default MakeOfferAuctionBlockchainInteraction;