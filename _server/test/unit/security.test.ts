// @ts-ignore
import chaiGraphQl from "chai-graphql"

import AccessToken from "../../src/_GRAPHQL/models/token/access/AccessToken";
import chaiAsPromised from "chai-as-promised"
import chaiHttp from "chai-http";
import chai from "chai"
import assert from "assert"
import {DateTime, Settings} from "luxon";
import {prisma} from "../../src/globals";
import {AUTH_ERROR} from "../../src/_GRAPHQL/errors";
import * as jose from "jose"
import Token from "../../src/_GRAPHQL/models/token/access/Token"
import crypto from "crypto";
import RecoveryToken from "../../src/_GRAPHQL/models/token/access/RecoveryToken";
import {io} from "socket.io-client";


chai.use(chaiAsPromised)
chai.use(chaiHttp)
chai.use(chaiGraphQl)
const expect = chai.expect

describe("Security Testing", () => {
    const HOST_SOCKET  = "http://localhost:4000"
    const HOST_GRAPHQL = "http://localhost:4000/graphql"

    describe("Hierarchy Token Testing", () => {
        const nickname = "simo2001"
        const ip = "TEST_IP"
        const ua = "TEST_UA"

        beforeEach(() => {
            Settings.now = () => Date.now()
        })

        describe("Access Token Testing", () => {
            it("Should Create the right access token", async () => {
                const expExpected = DateTime.now().plus({second: AccessToken.EXP_DEFAULT}).toSeconds()
                const timeoutExpected = DateTime.now().plus({second: AccessToken.TIMEOUT_DEFAULT}).toSeconds()

                const accessToken = await AccessToken.createNewAccessToken({
                    header: {
                        ua: ua,
                        ip: ip
                    },
                    body: {
                        nickname: "simo2001"
                    }
                })
                const properties = accessToken.getProperties()
                const databaseResult = await prisma.tokens.findUnique({
                    where: {
                        token_id: Number(properties.tokenId)
                    }
                })

                assert(databaseResult)

                assert.equal(properties.ip, ip)
                assert.equal(properties.nickname, nickname)
                assert.equal(properties.ua, ua)
                assert.equal(properties.type, "ACCESS")

                assert(DateTime.fromISO(properties.exp).toSeconds() > expExpected - 10 && DateTime.fromISO(properties.exp).toSeconds() < expExpected + 10)
                assert(DateTime.fromISO(properties.timeout).toSeconds() > timeoutExpected - 10 && DateTime.fromISO(properties.timeout).toSeconds() < timeoutExpected + 10)

                assert.equal(databaseResult.token_id, properties.tokenId)
                assert.equal(databaseResult.enabled, true)
                assert.equal(databaseResult.nickname, nickname)
            })
            it("Should Validate the Token", async () => {
                const accessToken = await AccessToken.createNewAccessToken({
                    header: {
                        ua: ua,
                        ip: ip
                    },
                    body: {
                        nickname: nickname
                    }
                })
                const jwt = await accessToken.createJwt()
                await expect(AccessToken.verifyAndLoadJwt(jwt, ip, ua)).to.not.be.rejected
            })
            it("Should Not Validate the Token - TIMEOUT EXPIRED", async () => {
                const accessToken = await AccessToken.createNewAccessToken({
                    header: {
                        ua: ua,
                        ip: ip
                    },
                    body: {
                        nickname: nickname
                    }
                })
                const jwt = await accessToken.createJwt()
                const exp = DateTime.now().plus({second: AccessToken.EXP_DEFAULT}).toMillis()
                Settings.now = () => exp
                await expect(AccessToken.verifyAndLoadJwt(jwt, ip, ua)).to.be.rejectedWith(AUTH_ERROR, "Timeout has been passed")
            })
            it("Should Not Validate the Token - EXPIRED", async () => {
                const accessToken = await AccessToken.createNewAccessToken({
                    header: {
                        ua: ua,
                        ip: ip
                    },
                    body: {
                        nickname: nickname
                    }
                })
                const jwt = await accessToken.createJwt()

                let expTimeout = DateTime.now().toMillis()
                let timeoutAccessToken: AccessToken
                let timeoutJwt: string | undefined = undefined
                let OK = false

                while(!OK){
                    expTimeout = DateTime.fromMillis(expTimeout).plus({second: AccessToken.TIMEOUT_DEFAULT - 10}).toMillis()
                    Settings.now = () => expTimeout
                    try{
                        timeoutAccessToken = await AccessToken.verifyAndLoadJwt(timeoutJwt ?? jwt, ip, ua)
                        timeoutJwt = await timeoutAccessToken.createJwt()
                    }catch (e) {
                        OK = true
                    }
                }

                Settings.now = () => Date.now()
                const exp = DateTime.now().plus({second: AccessToken.EXP_DEFAULT}).toMillis()
                const finalJwt = await timeoutAccessToken!.createJwt()
                Settings.now = () => exp
                await expect(AccessToken.verifyAndLoadJwt(finalJwt, ip, ua)).to.be.rejectedWith(AUTH_ERROR, "Token is expired")
            })
            it("Should Not Validate the Token - UA not matching", async () => {
                const fakeUA = "BAD_UA"

                const accessToken = await AccessToken.createNewAccessToken({
                    header: {
                        ua: ua,
                        ip: ip
                    },
                    body: {
                        nickname: nickname
                    }
                })
                const jwt = await accessToken.createJwt()

                await expect(AccessToken.verifyAndLoadJwt(jwt, ip, fakeUA)).to.be.rejectedWith(AUTH_ERROR, "UA is not matching")
            })
            it("Should Not Validate the Token - IP not matching", async () => {
                const fakeIP = "BAD_IP"

                const accessToken = await AccessToken.createNewAccessToken({
                    header: {
                        ua: ua,
                        ip: ip
                    },
                    body: {
                        nickname: nickname
                    }
                })
                const jwt = await accessToken.createJwt()

                await expect(AccessToken.verifyAndLoadJwt(jwt, fakeIP, ua)).to.be.rejectedWith(AUTH_ERROR, "IP is not matching")
            })
            it("Should Not Validate the Token - Invalid Input", async () => {
                const jwt = "FAKE_JWT"
                await expect(AccessToken.verifyAndLoadJwt(jwt, ip, ua)).to.be.rejectedWith(AUTH_ERROR, "Signature is invalid")
            })
            it("Should Not Validate the Token - Invalid Signing Key", async () => {
                const key = crypto.randomBytes(32)
                const exp = DateTime.now().plus({day: 5}).toSeconds()

                const jwt = await new jose.SignJWT({nickname: nickname})
                    .setProtectedHeader({alg: Token.ALG})
                    .setExpirationTime(exp)
                    .sign(key)

                await expect(AccessToken.verifyAndLoadJwt(jwt, ip, ua)).to.be.rejectedWith(AUTH_ERROR, "Signature is invalid")
            })
            it("Should Not Validate the Token - Invalid Type of Token", async () => {
                const socketId = "TEST_SOCKET"
                const recToken = await RecoveryToken.createNewRecoveryToken({
                    body: {
                        nickname: nickname
                    },
                    header: {
                        ua: ua,
                        ip: ip
                    },
                    socketId: socketId,
                    newUser: false
                })
                const jwt = await recToken.createJwt()
                await expect(AccessToken.verifyAndLoadJwt(jwt, ip, ua)).to.be.rejectedWith(AUTH_ERROR, "Access Token Required. Other type provided")
            })
        })
        describe("Recovery Token Testing", () => {
            it("Should Create the right recovery token", async () => {
                const socketId = "TEST_SOCKET"
                const expExpected = DateTime.now().plus({second: RecoveryToken.EXP_DEFAULT_RECOVERY}).toSeconds()

                const recoveryToken = await RecoveryToken.createNewRecoveryToken({
                    header: {
                        ua: ua,
                        ip: ip
                    },
                    body: {
                        nickname: "simo2001"
                    },
                    newUser: false,
                    socketId: socketId
                })
                const properties = recoveryToken.getProperties()
                const databaseResult = await prisma.access_requests.findUnique({
                    where: {
                        jwt_id: Number(properties.tokenId)
                    }
                })

                assert(databaseResult)

                assert.equal(properties.ip, ip)
                assert.equal(properties.nickname, nickname)
                assert.equal(properties.ua, ua)
                assert.equal(properties.type, "RECOVERY")

                assert(DateTime.fromISO(properties.exp).toSeconds() > expExpected - 10 && DateTime.fromISO(properties.exp).toSeconds() < expExpected + 10)

                assert.equal(databaseResult.socket, socketId)

                const expirationActual = DateTime.fromJSDate(databaseResult.expire_at).toSeconds()
                assert(expExpected - 10 < expirationActual && expirationActual < expExpected + 10)
            })
            it("Should Validate the Token", async () => {
                const clientSocket = io(HOST_SOCKET)
                const returnSocketId = (): Promise<string> => {
                    return new Promise((resolve, reject) => {
                        clientSocket.on("connect", () => {
                            resolve(clientSocket.id)
                        })
                    })
                }
                const socketId = await returnSocketId()

                const recoveryToken = await RecoveryToken.createNewRecoveryToken({
                    header: {
                        ua: ua,
                        ip: ip
                    },
                    body: {
                        nickname: nickname
                    },
                    socketId: socketId,
                    newUser: false
                })
                const jwt = await recoveryToken.createJwt()
                const secretToken = (await recoveryToken.getRequestToken()).token

                const server = await chai.request(HOST_GRAPHQL).keepOpen()
                await server
                    .post("/")
                    .set("Content-Type", "application/json")
                    .send({
                        query: `mutation test {
                            enableToken(data: {token: "${secretToken}", isNewAccount: false})
                        }`
                    })

                await expect(RecoveryToken.verifyAndLoadJwt(jwt, ip, ua)).to.not.be.rejected
            })
            it("Should Not Validate the Token - Not Enabled", async () => {
                const socketId = "TEST_SOCKET"
                const recoveryToken = await RecoveryToken.createNewRecoveryToken({
                    header: {
                        ua: ua,
                        ip: ip
                    },
                    body: {
                        nickname: "simo2001"
                    },
                    newUser: false,
                    socketId: socketId
                })
                const jwt = await recoveryToken.createJwt()
                await expect(RecoveryToken.verifyAndLoadJwt(jwt, ip, ua)).to.be.rejectedWith(AUTH_ERROR, "Token Not Enabled")
            })
            it("Should Not Validate the Token - UA not matching", async () => {
                const fakeUA = "BAD_UA"
                const socketId = "TEST_SOCKET"

                const recoveryToken = await RecoveryToken.createNewRecoveryToken({
                    header: {
                        ua: ua,
                        ip: ip
                    },
                    body: {
                        nickname: "simo2001"
                    },
                    newUser: false,
                    socketId: socketId
                })
                const jwt = await recoveryToken.createJwt()

                await expect(RecoveryToken.verifyAndLoadJwt(jwt, ip, fakeUA)).to.be.rejectedWith(AUTH_ERROR, "UA is not matching")
            })
            it("Should Not Validate the Token - IP not matching", async () => {
                const fakeIP = "BAD_IP"
                const socketId = "TEST_SOCKET"

                const recoveryToken = await RecoveryToken.createNewRecoveryToken({
                    header: {
                        ua: ua,
                        ip: ip
                    },
                    body: {
                        nickname: "simo2001"
                    },
                    newUser: false,
                    socketId: socketId
                })
                const jwt = await recoveryToken.createJwt()

                await expect(RecoveryToken.verifyAndLoadJwt(jwt, fakeIP, ua)).to.be.rejectedWith(AUTH_ERROR, "IP is not matching")
            })
            it("Should Not Validate the Token - Invalid Input", async () => {
                const jwt = "FAKE_JWT"
                await expect(RecoveryToken.verifyAndLoadJwt(jwt, ip, ua)).to.be.rejectedWith(AUTH_ERROR, "Signature is invalid")
            })
            it("Should Not Validate the Token - Invalid Signing Key", async () => {
                const key = crypto.randomBytes(32)
                const exp = DateTime.now().plus({day: 5}).toSeconds()

                const jwt = await new jose.SignJWT({nickname: nickname})
                    .setProtectedHeader({alg: Token.ALG})
                    .setExpirationTime(exp)
                    .sign(key)

                await expect(RecoveryToken.verifyAndLoadJwt(jwt, ip, ua)).to.be.rejectedWith(AUTH_ERROR, "Signature is invalid")
            })
            it("Should Not Validate the Token - Invalid Type of Token", async () => {
                const accToken = await AccessToken.createNewAccessToken({
                    body: {
                        nickname: nickname
                    },
                    header: {
                        ua: ua,
                        ip: ip
                    }
                })
                const jwt = await accToken.createJwt()
                await expect(RecoveryToken.verifyAndLoadJwt(jwt, ip, ua)).to.be.rejectedWith(AUTH_ERROR, "Recovery Token Required. Other type provided")
            })
        })
    })
})