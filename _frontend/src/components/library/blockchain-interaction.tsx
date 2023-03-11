import React, {useEffect} from 'react';
import {NextPage} from "next";
import {useEthers} from "@usedapp/core";
import Metamask from "@/components/settings/buttons/metamask";
import WalletConnect from "@/components/settings/buttons/wallet-connect";

export type BlockchainOperationType = {
    name: string
    estimateFunction: () => void
    contract: JSX.Element
    estimate: {
        value: string | undefined
        set: React.Dispatch<React.SetStateAction<string | undefined>>
    }
    disabled: {
        value: boolean
        set: React.Dispatch<React.SetStateAction<boolean>>
    }
    execute: {
        value: boolean
        set: React.Dispatch<React.SetStateAction<boolean>>
    }
}
type Props = {
    operations: BlockchainOperationType[]
    finished: boolean
    args?: {
        [id: string]: {
            value: string
            set: React.Dispatch<React.SetStateAction<string>>
        }
    }
}

const BlockchainInteraction: NextPage<Props> =
    ({operations, finished, args}) => {
    const {account} = useEthers()

    const estimate = async () => {
        for(const _ of operations){
            _.estimateFunction()
        }
    }

    useEffect(() => {
        estimate()
    }, [operations])

    return (
        <div className="flex flex-col gap-8 items-center justify-start w-3/4">
            {
                operations.map((_, index) =>
                    <React.Fragment key={index}>
                        {_.contract}
                    </React.Fragment>
                )
            }
            {
                finished ?
                <div className="flex flex-col gap-3 items-center justify-center h-full">
                    <h2 className="text-3xl font-bold">All the steps have been done</h2>
                    <span className="italic text-sm">Redirecting...</span>
                </div> :
                <>
                    <div className="flex flex-col gap-3 items-center justify-center">
                        <h2 className="text-3xl font-bold">Last Step...</h2>
                        <p className="text-lg">To create your NFT we need some authorization from you.</p>
                        <p className="text-sm italic">
                            Don&apos;t exit before terminating this process as your NFT will not be created
                        </p>
                    </div>
                    <div className="w-full flex flex-col items-center justify-center gap-6">
                        <div className="flex flex-col items-center justify-center gap-2 p-4 bg-custom-grey text-white rounded-lg w-full">
                    <span className="text-xl font-bold">
                        {
                            `${operations.length} AUTHORIZATION WILL BE PROMPTED`
                        }
                    </span>
                            <span>
                        {
                            operations.map((_, index) => {
                                return index < operations.length - 1 ? (
                                    <span key={index}>{_.name} + </span>
                                ) : (<span key={index}>{_.name}</span>)
                            })
                        }
                    </span>
                        </div>
                        {
                            operations.length > 0 &&
                            <div className="flex flex-col items-center justify-center gap-4 bg-custom-light-grey p-4 rounded-lg">
                                <h2 className="text-xl text-custom-red">Cost Involved</h2>
                                <div className="grid grid-cols-2 gap-x-6 gap-3">
                                    {
                                        operations.map((_, index) => {
                                            return (
                                                <React.Fragment key={index}>
                                                    <span className="text-center">{`${_.name}:`}</span>
                                                    <span className="text-center">
                                                    {
                                                        _.estimate.value ? `~${_.estimate.value} ETH` : "Calculating..."
                                                    }
                                                    </span>
                                                </React.Fragment>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        }
                    </div>
                    {
                        account ?
                            <div className="mb-8 flex flex-col gap-4 w-full">
                                {
                                    operations.map((_, index) => {
                                        if(index === 0){
                                            return (
                                                <React.Fragment key={index}>
                                                    <button disabled={_.disabled.value}
                                                            onClick={() => {
                                                                _.disabled.set(true)
                                                                _.execute.set(true)
                                                            }}
                                                            className="disabled:bg-custom-light-grey disabled:cursor-not-allowed disabled:text-black hover:bg-white hover:text-black transition text-lg bg-black text-white border-[1px] border-black p-4 w-full rounded-lg">
                                                        {_.name}
                                                    </button>
                                                </React.Fragment>
                                            )
                                        }
                                    })
                                }
                            </div> :
                            <div className="flex flex-col gap-4 w-full">
                                <Metamask/>
                                <WalletConnect/>
                            </div>
                    }
                </>
            }
        </div>
    );
};

export default BlockchainInteraction;