import {registerEnumType} from "type-graphql";

export enum Interaction {
    UPVOTE = "UPVOTE",
    DOWNVOTE = "DOWNVOTE"
}
registerEnumType(Interaction, {
    name: "Interaction"
});