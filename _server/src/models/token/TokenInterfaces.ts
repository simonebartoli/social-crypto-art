export interface TokenHeader {
    tokenId: string
    ip: string
    ua: string
    exp: Date
    type: "ACCESS" | "SPECIAL" | "RECOVERY"
    securityPatch: string
}
export interface TokenBody {
    nickname: string
}
export interface TokenConstructor {
    header: Omit<TokenHeader, "securityPatch">
    body: TokenBody
}

export interface AccessTokenType {
    header: TokenHeader & {timeout: Date}
    body: TokenBody
}
export interface NewAccessTokenConstructor {
    header: Omit<TokenHeader, "securityPatch" | "exp">
    body: TokenBody
}
export interface LoadAccessTokenConstructor {
    header: Omit<TokenHeader, "securityPatch"> & {timeout: Date}
    body: TokenBody
}

export interface SyncTokenType {
    header: TokenHeader
    body: TokenBody
    socketId: string
}
export interface SyncTokenConstructor {
    header: Omit<TokenHeader, "securityPatch">
    body: TokenBody
    socketId: string
}

export interface NewSyncTokenConstructor{
    header: Omit<TokenHeader, "exp" | "securityPatch">
    body: TokenBody
    socketId: string
}
export interface LoadSyncTokenConstructor{
    header: Omit<TokenHeader, "securityPatch">
    body: TokenBody
    socketId: string
}

export interface EncryptionKey {
    key: string,
    created: string
}