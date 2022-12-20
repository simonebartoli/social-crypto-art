import "reflect-metadata"
import express from 'express';
import { ApolloServer } from '@apollo/server';
import http from 'http';
import cookieParser from "cookie-parser";
import {buildSchema} from "type-graphql";
import path from "path";
import fileUpload from "express-fileupload";
import {expressMiddleware} from "@apollo/server/express4";

import {Access} from "../schema/resolvers/Access";
import formatError from "./FormatError";
import setHttpPlugin from "./HttpPlugin";


async function startApolloServer() {
    const schema = await buildSchema({
        resolvers: [Access]
    });
    const app = express();
    const httpServer = http.createServer(app);

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
        context: async ({req, res}) => {
            return {
                request: req,
                response: res
            }
        }
    }))

    await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
    console.log(`🚀 Server ready at http://localhost:4000/graphql`);
}

startApolloServer()