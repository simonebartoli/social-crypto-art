import { utils } from 'ethers'
import VerifySignatureABI from "@/__abi/VerifySignature.json"
import {VerifySignature} from "@/__typechain";
import { Contract } from '@ethersproject/contracts'

const verifySignatureInterface = new utils.Interface(VerifySignatureABI.abi)
export const verifySignatureAddress = '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512'
export const VerifySignatureContract = new Contract(verifySignatureAddress, verifySignatureInterface) as VerifySignature
