import {ethers, utils} from 'ethers'
import VerifySignatureABI from "@/__abi/VerifySignature.json"
import SocialNFTAbi from "@/__abi/SocialNFT.json"
import IER20Abi from "@/__abi/IERC20.json"

import {SocialNFT, VerifySignature} from "@/__typechain";
import {Contract} from '@ethersproject/contracts'
import {JSON_RPC, SOCIAL_NFT_ADDRESS, VERIFY_SIGNATURE_ADDRESS} from "@/globals";

export const HardhatProvider = new ethers.providers.JsonRpcProvider(JSON_RPC)

const verifySignatureInterface = new utils.Interface(VerifySignatureABI.abi)
export const VerifySignatureContract = new Contract(VERIFY_SIGNATURE_ADDRESS, verifySignatureInterface) as VerifySignature

const socialNFTInterface = new utils.Interface(SocialNFTAbi.abi)
export const socialNFTContract = new Contract(SOCIAL_NFT_ADDRESS, socialNFTInterface, HardhatProvider) as SocialNFT

export const IERC20Interface = new utils.Interface(IER20Abi.abi)