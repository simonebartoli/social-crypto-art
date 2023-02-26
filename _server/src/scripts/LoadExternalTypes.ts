import * as fs from "fs";
import * as Path from "path";

const loadExternalTypes = () => {
    removeFolders()
    createFolders()
    loadCommon()
    loadVerifySignature()
    loadSocialNft()
}
const removeFolders = () => {
    const PATH_SOURCE = "src/external-types"
    fs.rmSync(Path.join(process.cwd(), PATH_SOURCE), { recursive: true, force: true });
}

const createFolders = () => {
    const PATH_SOURCE = "src/external-types/contracts"
    fs.mkdirSync(Path.join(process.cwd(), PATH_SOURCE), {recursive: true})
}

const loadCommon = () => {
    const PATH_SOURCE = "../typechain-types/common.ts"
    const PATH_DESTINATION = "src/external-types/common.ts"
    const file = fs.readFileSync(Path.join(process.cwd(), PATH_SOURCE), "utf-8")
    fs.writeFileSync(Path.join(process.cwd(), PATH_DESTINATION), file)
}

const loadVerifySignature = () => {
    const PATH_SOURCE = "../typechain-types/contracts/VerifySignature.ts"
    const PATH_DESTINATION = "src/external-types/contracts/VerifySignature.ts"
    const file = fs.readFileSync(Path.join(process.cwd(), PATH_SOURCE), "utf-8")
    fs.writeFileSync(Path.join(process.cwd(), PATH_DESTINATION), file)
}
const loadSocialNft = () => {
    const PATH_SOURCE = "../typechain-types/contracts/SocialNFT.ts"
    const PATH_DESTINATION = "src/external-types/contracts/SocialNFT.ts"
    const file = fs.readFileSync(Path.join(process.cwd(), PATH_SOURCE), "utf-8")
    fs.writeFileSync(Path.join(process.cwd(), PATH_DESTINATION), file)
}

export default loadExternalTypes