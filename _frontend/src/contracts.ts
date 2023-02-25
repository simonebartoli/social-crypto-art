import {ethers, utils} from 'ethers'
import VerifySignatureABI from "@/__abi/VerifySignature.json"
import SocialNFTAbi from "@/__abi/SocialNFT.json"

import {SocialNFT, VerifySignature} from "@/__typechain";
import { Contract } from '@ethersproject/contracts'

export const HardhatProvider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/")

const verifySignatureInterface = new utils.Interface(VerifySignatureABI.abi)
export const verifySignatureAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
export const VerifySignatureContract = new Contract(verifySignatureAddress, verifySignatureInterface) as VerifySignature

const socialNFTInterface = new utils.Interface(SocialNFTAbi.abi)
export const socialNFTAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
export const socialNFTContract = new Contract(socialNFTAddress, socialNFTInterface, HardhatProvider) as SocialNFT