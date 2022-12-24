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
export type ArrayOneOrMore<T> = [T, ...Array<T>]