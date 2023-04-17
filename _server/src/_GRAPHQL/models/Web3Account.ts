import {DateTime} from "luxon";
import {AUTH_ERROR, DATA_ERROR} from "../errors";
import ErrorCode from "../enums/ErrorCode";
import {prisma, PROVIDER, VERIFY_SIGNATURE_ADDRESS, VerifySignatureAbi} from "../../globals";
import {ethers} from "ethers";
import {VerifySignature} from "../../external-types/contracts/VerifySignature";

type Web3AccountConstructor = {
    name: string
    nickname: string
    address: string
}
type NewWeb3Account = {
    signature: string
    date: Date
    name: string
    nickname: string
    address: string
    ip: string
}

class Web3Account {
    public static MAX_DIFFERENCE = 60 * 5
    private static ABI = VerifySignatureAbi()
    private static verifySignatureContract = new ethers.Contract(VERIFY_SIGNATURE_ADDRESS, Web3Account.ABI, PROVIDER) as VerifySignature

    public readonly address: string
    public readonly nickname: string
    public readonly name: string

    private constructor(data: Web3AccountConstructor) {
        this.name = data.name
        this.address = data.address
        this.nickname = data.nickname
    }

    public static async linkNewWeb3Account(data: NewWeb3Account): Promise<Web3Account> {
        await Web3Account.verifyAddress(data)
        await Web3Account.checkDatabase(data.address, data.name, data.nickname)
        await prisma.accounts.create({
            data: {
                name: data.name,
                address: data.address.toLowerCase(),
                nickname: data.nickname
            }
        })
        return new Web3Account({
            name: data.name,
            address: data.address,
            nickname: data.nickname
        })
    }
    public static async getWeb3Account(address: string){
        const result = await prisma.accounts.findFirst({
            where: {
                address: address.toLowerCase()
            }
        })
        if(result === null){
            throw new AUTH_ERROR("The account provided is not registered", ErrorCode.ERR_403_006)
        }
        return new Web3Account({
            name: result.name,
            address: result.address,
            nickname: result.nickname
        })
    }

    public static async verifyAddress(data: Omit<NewWeb3Account, "nickname" | "name">) {
        let error = false, result = false
        const max = DateTime.now().plus({second: Web3Account.MAX_DIFFERENCE})
        const min = DateTime.now().minus({second: Web3Account.MAX_DIFFERENCE})
        if(DateTime.fromJSDate(data.date) < min || DateTime.fromJSDate(data.date) > max){
            throw new DATA_ERROR("The date provided is not in the maximum range allowed", ErrorCode.ERR_403_005)
        }

        const formattedDate = String(DateTime.fromJSDate(data.date).toSeconds())
        try {
            result = await Web3Account.verifySignatureContract.verifySignature(data.address, Web3Account.verifySignatureContract.address, formattedDate, data.ip, data.signature)
        }catch (e) {
            error = true
        }
        if(error || !result){
            throw new DATA_ERROR("The signature provided is invalid", ErrorCode.ERR_403_003)
        }
    }
    private static async checkDatabase(address: string, name: string, nickname: string) {
        const resultAccount = await prisma.accounts.findUnique({
            where: {
                address: address.toLowerCase()
            }
        })
        if(resultAccount !== null){
            throw new DATA_ERROR("The account already exists in the system", ErrorCode.ERR_403_004)
        }

        const resultName = await prisma.accounts.findFirst({
            where: {
                nickname: nickname,
                name: name
            }
        })
        if(resultName !== null){
            throw new DATA_ERROR("The name provided for the account already exists in the system", ErrorCode.ERR_403_004)
        }
    }
}

export default Web3Account