import "reflect-metadata"
import express from 'express';
import { ApolloServer } from '@apollo/server';
import http from 'http';
import cookieParser from "cookie-parser";
import path from "path";
import fileUpload from "express-fileupload";
import {expressMiddleware} from "@apollo/server/express4";
import {Server} from "socket.io";

import formatError from "./FormatError";
import {Context} from "../types";
import {initSocket} from "../socket/InitSocket";
import {getSchema} from "./schema";
import {setComplexity, setHttpPlugin} from "./HttpPlugin";
import {router} from "../REST/MediaUpload";
import * as Path from "path";


async function startApolloServer() {

    const app = express();
    const httpServer = http.createServer(app);
    const io = new Server(httpServer);
    initSocket(io)

    app.use(fileUpload({
        abortOnLimit: true,
        limits: { fileSize: 100 * 1024 * 1024 },
        useTempFiles : true,
        tempFileDir : path.join(process.cwd() + "/media/tmp/")
    }));
    app.use(express.json())
    app.use(cookieParser())
    app.use(router)
    app.use("/images", express.static(Path.join(process.cwd(), "media/images")))

    const server = new ApolloServer({
        schema: await getSchema(),
        csrfPrevention: true,
        cache: "bounded",
        formatError: formatError,
        plugins: [setHttpPlugin, setComplexity]
    });
    await server.start()
    app.use("/graphql", expressMiddleware(server, {
        context: async ({req, res}): Promise<Context> => {
            return {
                request: req,
                response: res,
                nickname: null
            }
        }
    }))

    await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
    console.log(`🚀 Server ready at http://localhost:4000/graphql`);
}

// noinspection JSIgnoredPromiseFromCall
startApolloServer()