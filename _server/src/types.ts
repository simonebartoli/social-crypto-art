import express from "express";

export type Context = {
    request: express.Request
    response: express.Response
}

