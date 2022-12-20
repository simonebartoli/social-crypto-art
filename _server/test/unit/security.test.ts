import AccessToken from "../../src/models/token/AccessToken";
import RecoveryToken from "../../src/models/token/RecoveryToken";
import SpecialToken from "../../src/models/token/SpecialToken";

describe("Security Testing", () => {
    // NOT PROPER TESTING | JUST LOOKING IF WORKING
    describe("Hierarchy Token Testing", () => {
        const ip = "192.168.1.1"
        const ua = "TEST"
        const socket = "TEST SOCKET"
        let jwt: string

        it("Should Create the right access token", async () => {
            const accessToken = await AccessToken.createNewAccessToken({
                header: {
                    ua: ua,
                    ip: ip
                },
                body: {
                    nickname: "simo2001"
                }
            })
            console.log(accessToken.getProperties())
            jwt = await accessToken.createJwt()
        })
        it("Should verify the access token", async () => {
            const accessToken = await AccessToken.verifyAndLoadJwt(jwt, ip, ua)
            console.log(accessToken.getProperties())
        })

        it("Should Create the right recovery token", async () => {
            const recoveryToken = await RecoveryToken.createNewRecoveryToken({
                header: {
                    ua: ua,
                    ip: ip
                },
                body: {
                    nickname: "simo2001"
                },
                socketId: socket
            })
            jwt = await recoveryToken.createJwt()
            console.log(jwt)
        })
        it("Should verify the recovery token", async () => {
            const recoveryToken = await RecoveryToken.verifyAndLoadJwt(jwt, ip, ua)
            console.log(recoveryToken.getProperties())
        })

        it("Should Create the right special token", async () => {
            const specialToken = await SpecialToken.createNewSpecialToken({
                header: {
                    ua: ua,
                    ip: ip
                },
                body: {
                    nickname: "simo2001"
                },
                socketId: socket
            })
            jwt = await specialToken.createJwt()
            console.log(jwt)
        })
        it("Should verify the special token", async () => {
            const specialToken = await SpecialToken.verifyAndLoadJwt(jwt, ip, ua)
            console.log(specialToken.getProperties())
        })
    })
})