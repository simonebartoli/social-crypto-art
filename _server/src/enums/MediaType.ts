import {registerEnumType} from "type-graphql";

export enum MediaType {
    TEXT = "TEXT",
    VIDEO = "VIDEO",
    PHOTO = "PHOTO",
    GIF = "GIF"
}

registerEnumType(MediaType, {
    name: "MediaType"
});