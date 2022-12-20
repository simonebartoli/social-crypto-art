import {GraphQLFormattedError} from "graphql/error";
import {unwrapResolverError} from "@apollo/server/errors";
import {AUTH_ERROR} from "../schema/errors/AuthError";
import {DATA_ERROR} from "../schema/errors/DataError";

export default function formatError(
    formattedError: GraphQLFormattedError,
    error: unknown
): GraphQLFormattedError {
    const originalError = unwrapResolverError(error) as AUTH_ERROR | DATA_ERROR
    return {
        ...formattedError,
        message: originalError.message,
        extensions: {
            type: originalError.errorType,
            code: originalError.errorCode,
            createdAt: originalError.createdAt,
            status: originalError.status
        }
    };
}