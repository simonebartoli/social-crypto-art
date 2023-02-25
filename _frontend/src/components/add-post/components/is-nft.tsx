import React, {useEffect, useRef, useState} from 'react';
import {NextPage} from "next";

type Props = {
    callback: (nft: boolean) => void
    nftEnabled?: boolean
}

const IsNft: NextPage<Props> = ({callback, nftEnabled}) => {
    const [nft, setNft] = useState<boolean>(nftEnabled ?? false)
    const inputRef = useRef<HTMLInputElement>(null)

    const onClick = () => {
        if(inputRef.current !== null && nftEnabled === undefined){
            inputRef.current.click()
        }
    }

    useEffect(() => {
        setNft(nftEnabled ?? nft)
    }, [nftEnabled])

    useEffect(() => {
        callback(nft)
    }, [nft])

    return (
        <div className={`${nftEnabled === undefined ? "bg-white" : "bg-custom-light-grey cursor-not-allowed"} z-30 cursor-default flex flex-row items-center justify-center gap-4 p-4 rounded-lg text-lg w-full text-black`}>
            <input checked={nft}
                   onChange={(e) => nftEnabled === undefined && setNft(e.target.checked)}
                   ref={inputRef} type="checkbox" className={`${nftEnabled === undefined ? "cursor-pointer": "cursor-not-allowed"}`}
            />
            <span onClick={onClick} className={`${nftEnabled === undefined ? "cursor-pointer": "cursor-not-allowed"} select-none`}>is an NFT</span>
        </div>
    );
};

export default IsNft;