import * as crypto from "crypto";

class OneTimeToken {
    public readonly token: string
    private static tokens = new Map<string, string>()

    private constructor(token: string) {
        this.token = token
    }

    public static createNewToken(nickname: string) {
        const token = crypto.randomUUID()
        OneTimeToken.tokens.set(token, nickname)
        return new OneTimeToken(token)
    }

    public static verifyToken(token: string) {
        if(OneTimeToken.tokens.has(token)){
            const nickname = OneTimeToken.tokens.get(token)
            OneTimeToken.tokens.delete(token)
            return nickname
        }
        return undefined
    }
}

export default OneTimeToken