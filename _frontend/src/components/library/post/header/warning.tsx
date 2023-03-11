import React, {useEffect, useState} from 'react';
import {NextPage} from "next";
import {useMutation} from "@apollo/client";
import {VALIDATE_NFT_CREATION} from "@/graphql/post";
import {toast} from "react-toastify";
import {useModal} from "@/contexts/modal";
import BlockchainWrapper from "@/components/add-post/components/blockchain-wrapper";

type Props = {
    ipfs: string
    refetch: () => void
}

const Warning: NextPage<Props> = ({ipfs, refetch}) => {
    const {showModal, closeModal, open} = useModal()
    const [validateNftCreation] = useMutation(VALIDATE_NFT_CREATION, {
        onError: (error) => {
            console.log("ERROR SERVER")
            setSyncDisabled(true)
            setCreateNftDisabled(false)
            toast.error(error.message)
        },
        onCompleted: () => {
            refetch()
            toast.success("The NFT has been verified")
            console.log("VERIFIED ON THE SERVER")
        }
    })

    const [syncDisabled, setSyncDisabled] = useState(false)
    const [createNftDisabled, setCreateNftDisabled] = useState(true)

    const onSyncSubmit = () => {
        validateNftCreation({
            variables: {
                data: {
                    ipfs: ipfs
                }
            }
        })
    }
    const onCreateNftSubmit = () => {
        setCreateNftDisabled(true)
        showModal(
            <BlockchainWrapper
                createNft={{
                    ipfsURI: ipfs,
                    onFinish: () => {
                        closeModal()
                        toast.success("The NFT has been created!")
                        setTimeout(() => {
                            window.location.reload()
                        }, 1000)
                    }
                }}
            />
        )
    }

    useEffect(() => {
        if(!open && createNftDisabled){
            setCreateNftDisabled(false)
        }
    }, [open])

    return (
        <div className="bg-custom-red w-full p-4 flex flex-col items-center justify-center rounded-lg gap-6">
            <span className="text-2xl font-bold">THIS NFT IS NOT RECOGNIZED</span>
            <div className="flex flex-col gap-4 items-center justify-center">
                <span className="text-center">
                    This post (or part of it) has been set as an NFT, however we cannot find the NFT id related.
                    You can create it now or try to sync it with an already previously created NFT.
                </span>
                <span className="text-sm font-bold text-center">
                    REMEMBER THIS POST WILL NOT BE MARKED AS NFT UNTIL YOU PERFORM SUCH OPERATION <br/>
                    <span className="font-normal italic">This message is visible only by you</span>
                </span>
            </div>
            <div className="flex flex-col gap-3 items-center justify-center w-full">
                <button onClick={onSyncSubmit} disabled={syncDisabled} className="disabled:cursor-not-allowed disabled:bg-custom-light-grey disabled:text-black hover:bg-white hover:text-black transition w-full cursor-pointer p-3 border-[1px] border-black bg-black text-white rounded-lg text-center">Try to Sync</button>
                <button onClick={onCreateNftSubmit} disabled={createNftDisabled} className="disabled:cursor-not-allowed disabled:bg-custom-light-grey disabled:text-black hover:bg-white hover:text-black transition w-full cursor-pointer p-3 border-[1px] border-black bg-black text-white rounded-lg text-center">Create NFT</button>
            </div>
        </div>
    );
};

export default Warning;