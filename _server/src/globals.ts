import {PrismaClient} from "@prisma/client";

export const KEY_PATH = "./src/keys/encrypted-key.json"
export const prisma = new PrismaClient()