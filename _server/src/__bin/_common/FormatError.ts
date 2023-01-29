import {GraphQLFormattedError} from "graphql/error";
import {unwrapResolverError} from "@apollo/server/errors";
import {AUTH_ERROR} from "../../_GRAPHQL/errors";
import {DATA_ERROR} from "../../_GRAPHQL/errors";

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