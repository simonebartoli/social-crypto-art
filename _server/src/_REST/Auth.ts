import {AUTH_ERROR} from "../_GRAPHQL/errors";
import ErrorCode from "../_GRAPHQL/enums/ErrorCode";
import AccessToken from "../_GRAPHQL/models/token/access/AccessToken";
import {Request, Response} from "express";

export const requireAccessToken = async (request: Request, response: Response) => {
    const token = request.cookies["access_token"]
    if(token === undefined){
        throw new AUTH_ERROR("Access Token not provided", ErrorCode.ERR_401_014)
    }
    const ip = request.ip
    const ua = request.header("User-Agent") || "NOT_DEFINED"
    const accessToken = await AccessToken.verifyAndLoadJwt(token, ip, ua)
    const properties = accessToken.getProperties()
    response.locals["nickname"] = properties.nickname
}