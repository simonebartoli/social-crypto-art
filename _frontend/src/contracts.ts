import { utils } from 'ethers'
import VerifySignatureABI from "@/__abi/VerifySignature.json"
import {VerifySignature} from "@/__typechain";
import { Contract } from '@ethersproject/contracts'

const verifySignatureInterface = new utils.Interface(VerifySignatureABI.abi)
export const verifySignatureAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
export const VerifySignatureContract = new Contract(verifySignatureAddress, verifySignatureInterface) as VerifySignature
