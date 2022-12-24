import {Resolver, ResolverInterface} from "type-graphql";
import {UserType} from "../../types";

@Resolver(() => UserType)
export class UserFieldResolvers implements ResolverInterface<UserType>{

}