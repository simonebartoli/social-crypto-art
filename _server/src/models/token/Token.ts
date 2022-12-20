import * as fs from "fs";
import {KeyLike} from "jose"

import {EncryptionKey, TokenBody, TokenConstructor, TokenHeader} from "./TokenInterfaces";
import {KEY_PATH} from "../../globals";
import * as Path from "path";
import * as crypto from "crypto";

export default abstract class Token {
    protected static readonly ALG: string = "HS256"
    protected static readonly SECURITY_PATCH = "1.0"

    protected tokenHeader: TokenHeader
    protected tokenBody: TokenBody

    protected constructor(data: TokenConstructor) {
        this.tokenHeader = {...data.header, securityPatch: Token.SECURITY_PATCH}
        this.tokenBody = data.body
    }
    protected static async getEncryptionKey(): Promise<KeyLike | Uint8Array> {
        try{
            const buffer = fs.readFileSync(Path.join(process.cwd(), KEY_PATH), "utf-8")
            const keyObject: EncryptionKey = JSON.parse(buffer)
            return Buffer.from(keyObject.key, "hex")
        }catch (e) {
            return await this.createEncryptionKey()
        }
    }
    private static async createEncryptionKey(): Promise<KeyLike | Uint8Array> {
        const key = crypto.randomBytes(256)
        const keyString = Buffer.from(key).toString("hex")
        const keyObject: EncryptionKey = {
            key: keyString,
            created: String(Math.floor(Date.now() / 1000))
        }

        fs.writeFileSync(Path.join(process.cwd(), KEY_PATH), JSON.stringify(keyObject))
        return key
    }

    public abstract createJwt(): Promise<string>
}