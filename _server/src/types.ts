import express from "express";

export type Context = {
    request: express.Request
    response: express.Response
    nickname: null
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