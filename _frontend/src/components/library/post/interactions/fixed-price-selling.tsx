import React, {useEffect, useState} from 'react';
import {BigNumber, ethers} from "ethers";
import {NftInfoType} from "@/components/library/post/nft.type";
import {NextPage} from "next";
import {CurrencyEnum} from "@/enums/global/nft-enum";
import {SOCIAL_NFT_ADDRESS, ZERO_ADDRESS} from "@/globals";
import {Contract_getERC20TokenBalance, Contract_getERC20TokenBalance_CallbackType} from "@/contexts/contract";
import Metamask from "@/components/settings/buttons/metamask";
import WalletConnect from "@/components/settings/buttons/wallet-connect";
import IncreaseAllowanceErc20BlockchainInteractions
    from "@/components/library/blockchain-operations/increase-allowance-erc20-blockchain-interaction";
import {useModal} from "@/contexts/modal";
import {BlockchainCallbackContext} from "@/contexts/blockchain-callback";
import BlockchainWrapper from "@/components/library/blockchain-wrapper";
import Button from "@/components/login/button";
import BuyFixedPriceBlockchainInteractions
    from "@/components/library/blockchain-operations/buy-fixed-price-blockchain-interaction";
import {toast} from "react-toastify";
import {useWeb3Info} from "@/contexts/web3-info";

type Props = {
    nftId: string
    nftInfo: NftInfoType<"FIXED">
}

const FixedPriceSelling: NextPage<Props> = ({nftId, nftInfo}) => {
    const {closeModal} = useModal()
    const {account} = useWeb3Info()

    const [balance, setBalance] = useState<string>()
    const [allowance, setAllowance] = useState<string>()

    const [disabled, setDisabled] = useState(true)

    const [interactWithBlockchain, setInteractWithBlockchain] = useState(false)
    const [interactions, setInteractions] = useState<JSX.Element[]>([])

    const onCallback = (e: Contract_getERC20TokenBalance_CallbackType) => {
        if(e.error){
            console.log(e.error.message)
        }else if(e.value){
            setBalance(e.value.balance)
            setAllowance(e.value.allowance)
            console.log(`Allowance: ${ethers.utils.formatEther(e.value.allowance)}`)
            console.log(`Balance: ${ethers.utils.formatEther(e.value.balance)}`)
        }
    }
    const onBuyFinish = () => {
        toast.success("The NFT has been purchased😎")
        closeModal()
    }
    const onBuy = () => {
        const ops: JSX.Element[] = []
        if(nftInfo.fixedPrice.currencyAddress === ZERO_ADDRESS){
            ops.push(
                <BuyFixedPriceBlockchainInteractions
                    nft_id={nftId}
                    amount={nftInfo.fixedPrice.amount}
                    onFinish={onBuyFinish}
                />
            )
        }else if(allowance){
            const amountToAllow = BigNumber.from(nftInfo.fixedPrice.amount).sub(BigNumber.from(allowance))
            if(amountToAllow.gt(0)) {
                ops.push(
                    <IncreaseAllowanceErc20BlockchainInteractions
                        amount={nftInfo.fixedPrice.amount}
                        address={nftInfo.fixedPrice.currencyAddress}
                    />
                )
            }
            ops.push(
                <BuyFixedPriceBlockchainInteractions
                    nft_id={nftId}
                    amount={nftInfo.fixedPrice.amount}
                    onFinish={onBuyFinish}
                />
            )
        }
        setInteractions(ops)
        setInteractWithBlockchain(true)

    }

    useEffect(() => {
        if(nftInfo.fixedPrice.currencyAddress !== ZERO_ADDRESS){
            if(balance){
                if(BigNumber.from(balance).lt(BigNumber.from(nftInfo.fixedPrice.amount))){
                    setDisabled(true)
                }else{
                    setDisabled(false)
                }
            }else{
                setDisabled(true)
            }
        }else{
            setDisabled(false)
        }
    }, [nftInfo, balance])

    if(!account){
        return (
            <div className="flex flex-col gap-4 w-3/4">
                <span className="text-2xl font-bold mb-8">
                    You need to connect to a Web3 Account to continue
                </span>
                <Metamask/>
                <WalletConnect/>
            </div>
        )
    }
    if(interactWithBlockchain){
        return (
            <BlockchainCallbackContext>
                <BlockchainWrapper interactions={interactions}/>
            </BlockchainCallbackContext>
        )
    }

    return (
        <div className="h-full flex flex-col items-center justify-start font-main gap-6 w-full">
            <h2 className="text-4xl font-bold">Information and Selling NFT</h2>
            {
                nftInfo.fixedPrice.currencyAddress !== ZERO_ADDRESS &&
                <Contract_getERC20TokenBalance
                    owner={account}
                    erc20Address={nftInfo.fixedPrice.currencyAddress}
                    callback={onCallback}
                />
            }
            <div className="flex grid grid-cols-3 gap-4 justify-center items-center gap-4 bg-custom-light-grey p-4 rounded-lg w-full">
                <span className="text-xl font-bold">PARAMETER</span>
                <span className="col-span-2 text-xl font-bold">VALUE</span>
                <span className="text-lg">NFT ID:</span>
                <span className="col-span-2 text-lg font-bold">{nftId}</span>
                <span className="text-lg">SELLER:</span>
                <span className="col-span-2 text-lg font-bold">{nftInfo.currentOwner}</span>
                <span className="text-lg">CREATOR:</span>
                <span className="col-span-2 text-lg font-bold">{nftInfo.originalOwner === ZERO_ADDRESS ? nftInfo.currentOwner : nftInfo.originalOwner}</span>
                <span className="col-span-3 w-full border-t-[1px] border-custom-grey"/>
                <span>SELLING PRICE:</span>
                <span className="col-span-2 text-lg font-bold">{`${ethers.utils.formatEther(nftInfo.fixedPrice.amount)} ${CurrencyEnum[nftInfo.fixedPrice.currency]}`}</span>
                <span>CURRENCY:</span>
                <span className="col-span-2 text-lg font-bold">{
                    `${CurrencyEnum[nftInfo.fixedPrice.currency]} ${nftInfo.fixedPrice.currency !== CurrencyEnum.ETH ? "(" + nftInfo.fixedPrice.currencyAddress + ")" : ""}`
                }</span>
                <span className="col-span-3 w-full border-t-[1px] border-custom-grey"/>
                <span>TX CONTRACT (SocialNFT):</span>
                <span className="col-span-2 text-lg font-bold">{SOCIAL_NFT_ADDRESS}</span>
            </div>
            {
                (balance && BigNumber.from(balance).lt(BigNumber.from(nftInfo.fixedPrice.amount))) &&
                <span>No enough funds for this transaction</span>
            }
            <Button text={"Buy Now"} disabled={disabled} onClick={onBuy}/>
        </div>
    );
};

export default FixedPriceSelling;