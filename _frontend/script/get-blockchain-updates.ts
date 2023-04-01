import * as Path from "path";
import * as process from "process";
import * as fs from "fs";

function getBlockchainUpdates() {
    const PATH_ABI_INITIAL = Path.join(process.cwd(), "../deployments/localhost")
    const PATH_TYPES_INITIAL = Path.join(process.cwd(), "../typechain-types")

    const PATH_ABI_FINAL = Path.join(process.cwd(), "./src/__abi")
    const PATH_TYPES_FINAL = Path.join(process.cwd(), "./src/__typechain")

    fs.cpSync(PATH_ABI_INITIAL, PATH_ABI_FINAL, {recursive: true})
    fs.cpSync(PATH_TYPES_INITIAL, PATH_TYPES_FINAL, {recursive: true})
}

export default getBlockchainUpdates