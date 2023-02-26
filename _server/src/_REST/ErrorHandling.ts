import {NextFunction, Request, Response} from "express";
import {AUTH_ERROR, DATA_ERROR} from "../_GRAPHQL/errors";

export const errorHandling = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if(err instanceof AUTH_ERROR || err instanceof DATA_ERROR){
        res.status(Number(err.status)).json({
            message: err.message,
            errorCode: err.errorCode,
            createdAt: err.createdAt,
            errorType: err.errorType
        });
    }else{
        res.status(500).json({
            msg: err.message
        });
    }
};
