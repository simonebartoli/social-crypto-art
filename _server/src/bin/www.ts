import "reflect-metadata"
import express from 'express';
import { ApolloServer } from '@apollo/server';
import http from 'http';
import cookieParser from "cookie-parser";
import {buildSchema} from "type-graphql";
import path from "path";
import fileUpload from "express-fileupload";
import {expressMiddleware} from "@apollo/server/express4";
import {Server} from "socket.io";

import formatError from "./FormatError";
import setHttpPlugin from "./HttpPlugin";
import {Context} from "../types";
import {initSocket} from "../socket/InitSocket";
import {Access, User} from "../schema/resolvers";


async function startApolloServer() {
    const schema = await buildSchema({
        resolvers: [Access, User]
    });
    const app = express();
    const httpServer = http.createServer(app);
    const io = new Server(httpServer);
    initSocket(io)

    app.use(fileUpload({
        abortOnLimit: true,
        limits: { fileSize: 2 * 1024 * 1024 },
        useTempFiles : true,
        tempFileDir : path.join(process.cwd() + "/images/tmp/")
    }));
    app.use(express.json())
    app.use(cookieParser())

    const server = new ApolloServer({
        schema,
        csrfPrevention: true,
        cache: "bounded",
        formatError: formatError,
        plugins: [setHttpPlugin]
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

startApolloServer()