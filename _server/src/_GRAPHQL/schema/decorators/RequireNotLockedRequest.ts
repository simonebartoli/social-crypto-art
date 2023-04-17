import {createMethodDecorator} from "type-graphql";
import {ContextWithLocking} from "../../../types";
import LockedRequest from "../../models/LockedRequest";
import {AUTH_ERROR} from "../../errors";
import {DateTime} from "luxon";
import ErrorCode from "../../enums/ErrorCode";

export function RequireNotLockedRequest() {
    return createMethodDecorator<ContextWithLocking>(async ({context}, next) => {
        const ip = context.request.headers['cf-connecting-ip'] as string || context.request.headers['x-forwarded-for'] as string || context.request.ip
        const request = LockedRequest.getUser(ip)
        const lock = request.checkIfLocked()
        if(!lock){
            context.lock = request
            return next()
        }else{
            throw new AUTH_ERROR(`Too Many Failed Attempts. Try Again after ${DateTime.fromJSDate(lock).toISO()}`, ErrorCode.ERR_401_001)
        }
    });
}