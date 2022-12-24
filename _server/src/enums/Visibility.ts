import {registerEnumType} from "type-graphql";

export enum Visibility {
    PUBLIC = "PUBLIC",
    PRIVATE = "PRIVATE",
    RESTRICTED = "RESTRICTED"
}
registerEnumType(Visibility, {
    name: "Visibility"
});