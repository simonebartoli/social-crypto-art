import * as fs from "fs";
import * as Path from "path";

const loadExternalTypes = () => {
    createFolders()
    loadCommon()
    loadVerifySignature()
}

const createFolders = () => {
    // fs.mkdirSync()
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

export default loadExternalTypes