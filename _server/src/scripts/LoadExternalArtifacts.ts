import * as fs from "fs";
import * as Path from "path";

const loadExternalArtifacts = () => {
    removeFolders()
    createFolders()
    loadVerifySignatureAbi()
    loadSocialNFTAbi()
}
const removeFolders = () => {
    const PATH_SOURCE = "src/external-artifacts"
    fs.rmSync(Path.join(process.cwd(), PATH_SOURCE), { recursive: true, force: true });
}

const createFolders = () => {
    const PATH_SOURCE = "src/external-artifacts"
    fs.mkdirSync(Path.join(process.cwd(), PATH_SOURCE), {recursive: true})
}

const loadVerifySignatureAbi = () => {
    const PATH_SOURCE = "../artifacts/contracts/VerifySignature.sol/VerifySignature.json"
    const PATH_DESTINATION = "src/external-artifacts/VerifySignature.json"
    const file = fs.readFileSync(Path.join(process.cwd(), PATH_SOURCE), "utf-8")
    fs.writeFileSync(Path.join(process.cwd(), PATH_DESTINATION), file)
}

const loadSocialNFTAbi = () => {
    const PATH_SOURCE = "../artifacts/contracts/SocialNFT.sol/SocialNFT.json"
    const PATH_DESTINATION = "src/external-artifacts/SocialNFT.json"
    const file = fs.readFileSync(Path.join(process.cwd(), PATH_SOURCE), "utf-8")
    fs.writeFileSync(Path.join(process.cwd(), PATH_DESTINATION), file)
}

export default loadExternalArtifacts