import {prisma, PROVIDER, SOCIAL_NFT_ADDRESS, SocialNFTAbi} from "../../globals";
import {AUTH_ERROR, DATA_ERROR, INTERNAL_ERROR} from "../errors";
import ErrorCode from "../enums/ErrorCode";
import {ethers} from "ethers";
import {SocialNFT} from "../../external-types/contracts/SocialNFT";

class Nft {
    private readonly postContentId: number[]
    private readonly ipfs: string
    private readonly nftId: string | undefined = undefined
    private static socialNftContract = new ethers.Contract(SOCIAL_NFT_ADDRESS, SocialNFTAbi(), PROVIDER) as SocialNFT

    private constructor(ipfs: string, nftId: string | undefined, postContentId: number[]) {
        this.ipfs = ipfs
        this.nftId = nftId
        this.postContentId = postContentId
    }

    public static async getNftByIpfs(ipfs: string, nickname: string) {
        const result = await prisma.nft_backup.findUnique({
            where: {
                ipfs: ipfs
            },
            include: {
                posts: true
            }
        })
        if(result === null){
            throw new DATA_ERROR("IPFS link not found", ErrorCode.ERR_404_003)
        }
        else if(result.posts.nickname !== nickname){
            throw new AUTH_ERROR("IPFS link is owned by someone else", ErrorCode.ERR_403_006)
        }
        const content = await prisma.post_contents.findUnique({
            where: {
                content_id: result.nft[0]
            }
        })
        if(content){
            return new Nft(ipfs, content.nft_id ?? undefined, result.nft)
        }
        throw new INTERNAL_ERROR("Function Error", ErrorCode.ERR_501_001)
    }
    public isVerified() {
        return !!this.nftId
    }

    public async checkIfNftVerified() {
        let nftId: string
        try{
            nftId = (await Nft.socialNftContract.getNftId(this.ipfs)).toString()
        }catch (e) {
            throw new DATA_ERROR("The NFT has not been verified", ErrorCode.ERR_403_005)
        }
        await prisma.post_contents.updateMany({
            data: {
                nft_id: nftId
            },
            where: {
                content_id: {
                    in: this.postContentId
                }
            }
        })
    }

}

export default Nft