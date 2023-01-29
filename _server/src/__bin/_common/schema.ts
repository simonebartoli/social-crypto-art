import {AccessResolver, PostResolver, UserResolver} from "../../_GRAPHQL/schema/resolvers";
import {PostFieldResolvers, UserFieldResolvers} from "../../_GRAPHQL/schema/resolvers/field-resolvers";
import {buildSchema} from "type-graphql";

export const resolvers = [AccessResolver, UserResolver, PostResolver] as const
export const fieldResolvers = [PostFieldResolvers, UserFieldResolvers] as const

export async function getSchema () {
    return await buildSchema({
        resolvers: [...resolvers, ...fieldResolvers],
        validate: {
            forbidUnknownValues: true
        }
    });
}