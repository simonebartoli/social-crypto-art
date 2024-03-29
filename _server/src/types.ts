import express from "express";
import LockedRequest from "./_GRAPHQL/models/LockedRequest";

export type Context = {
    request: express.Request
    response: express.Response
    nickname: null
}
export type ContextWithLocking = {
    request: express.Request
    response: express.Response
    nickname: null
    lock: LockedRequest
}
export type ContextAuth = {
    request: express.Request
    response: express.Response
    nickname: string
}

export type ContextCustom<T> = {
    request: express.Request
    response: express.Response
    nickname: null
} & {[x: string]: T}
export type ContextAuthCustom<T> = {
    request: express.Request
    response: express.Response
    nickname: string
} & {[x: string]: T}

export type ArrayOneOrMore<T> = [T, ...Array<T>]

export type MetadataNft = {
    properties: {
        name: string
        URI: string
    }[],
    created_at: string
    issuer: string
    creator: string
}