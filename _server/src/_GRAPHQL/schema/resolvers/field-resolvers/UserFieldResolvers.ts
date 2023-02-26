import {FieldResolver, Resolver, ResolverInterface, Root} from "type-graphql";
import {AccountType, UserType} from "../../types";
import {prisma} from "../../../../globals";

@Resolver(() => UserType)
export class UserFieldResolvers implements ResolverInterface<UserType>{
    @FieldResolver()
    async accounts(@Root() user: UserType): Promise<AccountType[]> {
        const accounts = await prisma.accounts.findMany({
            where: {
                nickname: user.nickname
            },
            include: {
                account_packets: true
            }
        })
        return accounts.map(_ => {
            return {
                name: _.name,
                address: _.address,
                packet: _.account_packets?.packet ?? null
            }
        })
    }
}