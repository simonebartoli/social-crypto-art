import {GraphQLError} from "graphql";
import ErrorCode from "../../enums/ErrorCode";
import {DateTime} from "luxon";

export class DATA_ERROR extends GraphQLError{
    public readonly errorType = "DATA_ERROR"
    public readonly createdAt = DateTime.now().toISO()
    public readonly status
    public readonly errorCode

    constructor(message: string, errorCode: ErrorCode){
        super(message)
        this.errorCode = errorCode
        this.status = errorCode.split("_")[1]
    }
}