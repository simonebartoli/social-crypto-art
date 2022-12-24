import * as crypto from "crypto";
import {v4 as uuidv4} from "uuid"
import {DateTime} from "luxon";
import {DATA_ERROR} from "../schema/errors";
import ErrorCode from "../enums/ErrorCode";

type SecretKeyObject = {
    key: string
    exp: Date
}

class Secret {
    private static encryptedTokens = new Map<string, Map<string, Secret>>()
    public static EXP_TIME = 60*60

    private readonly key: string
    private readonly exp: Date = DateTime.now().plus({second: Secret.EXP_TIME}).toJSDate()
    public readonly id = uuidv4()

    constructor(nickname: string) {
        this.key = crypto.randomBytes(32).toString("base64")

        const existingSecretObjects = Secret.encryptedTokens.get(nickname)
        Secret.encryptedTokens.set(nickname,
            existingSecretObjects ? existingSecretObjects.set(this.id, this) :
            new Map().set(this.id, this)
        )
        this.removeToken(nickname)
    }

    private removeToken(nickname: string){
        setTimeout(() => {
            Secret.encryptedTokens.get(nickname)!.delete(this.id)
        }, Secret.EXP_TIME * 1000)
    }
    public getToken() {
        return {
            key: this.key,
            exp: this.exp,
            id: this.id
        }
    }

    public static getSecret(nickname: string, id: string): Secret {
        const secretObject = Secret.encryptedTokens.get(nickname)
        if(secretObject === undefined){
            throw new DATA_ERROR("Token not existing", ErrorCode.ERR_404_003)
        }
        const secret = secretObject.get(id)
        if(secret === undefined){
            throw new DATA_ERROR("Token not existing", ErrorCode.ERR_404_003)
        }
        if(DateTime.fromJSDate(secret.exp) < DateTime.now()){
            throw new DATA_ERROR("Token Expired", ErrorCode.ERR_403_007)
        }
        return secret
    }
}

export default Secret