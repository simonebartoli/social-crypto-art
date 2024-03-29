import {createMethodDecorator} from "type-graphql";
import {ContextAuth} from "../../../types";
import {AUTH_ERROR} from "../../errors";
import ErrorCode from "../../enums/ErrorCode";
import AccessToken from "../../models/token/access/AccessToken";

export function RequireAccessToken() {
    return createMethodDecorator<ContextAuth>(async ({context}, next) => {
        const token = context.request.cookies["access_token"]
        if(token === undefined){
            throw new AUTH_ERROR("Access Token not provided", ErrorCode.ERR_401_014)
        }
        const ip = context.request.headers['cf-connecting-ip'] as string || context.request.headers['x-forwarded-for'] as string || context.request.ip
        const ua = context.request.header("User-Agent") || "NOT_DEFINED"
        try{
            const accessToken = await AccessToken.verifyAndLoadJwt(token, ip, ua)
            const properties = accessToken.getProperties()
            context.nickname = properties.nickname
            return next()
        }catch (e) {
            context.response.clearCookie("access_token")
            throw e
        }
    });
}