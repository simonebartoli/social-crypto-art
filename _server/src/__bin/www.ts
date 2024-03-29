import "reflect-metadata"
import "express-async-errors"

import express from 'express';
import { ApolloServer } from '@apollo/server';
import http from 'http';
import cookieParser from "cookie-parser";
import path from "path";
import fileUpload from "express-fileupload";
import {expressMiddleware} from "@apollo/server/express4";
import {Server} from "socket.io";
import cors from "cors"

import formatError from "./_common/FormatError";
import {Context} from "../types";
import {initSocket} from "../socket/InitSocket";
import {getSchema} from "./_common/schema";
import {setComplexity, setHttpPlugin} from "./_common/HttpPlugin";
import {router} from "../_REST/MediaUpload";
import * as Path from "path";
import {cleanTempFiles} from "../scripts/__automated/CleanTempFiles";
import {DOMAIN, FRONT_END_DOMAIN, PORT} from "../globals";
import {errorHandling} from "../_REST/ErrorHandling";


async function startApolloServer() {

    const app = express();
    const httpServer = http.createServer(app);
    const io = new Server(httpServer, {
        cors: {
            origin: FRONT_END_DOMAIN
        }
    });
    initSocket(io)

    app.use(cors({
        origin: FRONT_END_DOMAIN,
        credentials: true
    }))
    app.use(fileUpload({
        abortOnLimit: true,
        limits: { fileSize: 100 * 1024 * 1024 },
        useTempFiles : true,
        tempFileDir : path.join(process.cwd() + "public/media/tmp/"),
        createParentPath: true
    }));
    app.use(express.json())
    app.use(cookieParser())
    app.use(router)

    app.use("/images", express.static(Path.join(process.cwd(), "public/media/images")))
    app.use("/gif", express.static(Path.join(process.cwd(), "public/media/gif")))
    app.use("/videos", express.static(Path.join(process.cwd(), "public/media/videos")))

    app.use(errorHandling)

    cleanTempFiles()

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

    await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
    console.log(`🚀 Server ready at ${DOMAIN}/graphql`);
}

// noinspection JSIgnoredPromiseFromCall
startApolloServer()