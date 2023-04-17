import AccessToken from "../../models/token/access/AccessToken";
import {createMethodDecorator} from "type-graphql";
import {ContextAuth} from "../../../types";

export function OptionalAccessToken() {
    return createMethodDecorator<ContextAuth>(async ({context}, next) => {
        const token = context.request.cookies["access_token"]
        if(token === undefined){
            return next()
        }
        const ip = context.request.headers['cf-connecting-ip'] as string || context.request.headers['x-forwarded-for'] as string || context.request.ip
        const ua = context.request.header("User-Agent") || "NOT_DEFINED"
        try{
            const accessToken = await AccessToken.verifyAndLoadJwt(token, ip, ua)
            const properties = accessToken.getProperties()
            context.nickname = properties.nickname
            return next()
        }catch (e) {
            return next()
        }
    });
}