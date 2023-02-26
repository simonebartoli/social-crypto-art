import express from "express";
import * as Path from "path";
import {UploadedFile} from "express-fileupload";
import * as crypto from "crypto";
import {requireAccessToken} from "./Auth";
import {DATA_ERROR, INTERNAL_ERROR} from "../_GRAPHQL/errors";
import ErrorCode from "../_GRAPHQL/enums/ErrorCode";

export const router = express.Router()
router.post("/upload-images", async (req, res) => {
    await requireAccessToken(req, res)
    const supportedMimeTypes = ["image/apng", "image/avif", "image/jpeg", "image/png", "image/webp"]
    const nickname = res.locals["nickname"]
    if (!req.files || Object.keys(req.files).length === 0 || Object.keys(req.files).length > 1) {
        throw new DATA_ERROR("You need to upload 1 file", ErrorCode.ERR_403_008)
    }
    if (!req.files.image) {
        throw new DATA_ERROR("You need to upload 1 file", ErrorCode.ERR_403_008)
    }

    const uploadedFile = req.files.image as UploadedFile;
    if(!supportedMimeTypes.includes(uploadedFile.mimetype)){
        throw new DATA_ERROR("File Type Not Supported", ErrorCode.ERR_403_008)
    }

    const extension = uploadedFile.mimetype.split("/")[1]
    const fileName = `${crypto.randomUUID()}.${extension}`
    const uploadPath = Path.join(process.cwd(), `public/media/images/${nickname}/${fileName}`) ;

    try{
        await uploadedFile.mv(uploadPath)
    }catch (e) {
        throw new INTERNAL_ERROR("An error occurred", ErrorCode.ERR_501_001)
    }

    return res.status(200).json({message: "UPLOADED", url: `/${nickname}/${fileName}`})
})
router.post("/upload-gif", async (req, res) => {
    await requireAccessToken(req, res)
    const supportedMimeTypes = ["image/gif"]
    const nickname = res.locals["nickname"]
    if (!req.files || Object.keys(req.files).length === 0 || Object.keys(req.files).length > 1) {
        throw new DATA_ERROR("You need to upload 1 file", ErrorCode.ERR_403_008)
    }
    if (!req.files.image) {
        throw new DATA_ERROR("You need to upload 1 file", ErrorCode.ERR_403_008)
    }

    const uploadedFile = req.files.image as UploadedFile;
    if(!supportedMimeTypes.includes(uploadedFile.mimetype)){
        throw new DATA_ERROR("File Type Not Supported", ErrorCode.ERR_403_008)
    }

    const extension = uploadedFile.mimetype.split("/")[1]
    const fileName = `${crypto.randomUUID()}.${extension}`
    const uploadPath = Path.join(process.cwd(), `public/media/gif/${nickname}/${fileName}`) ;

    try{
        await uploadedFile.mv(uploadPath)
    }catch (e) {
        throw new INTERNAL_ERROR("An error occurred", ErrorCode.ERR_501_001)
    }

    return res.status(200).json({message: "UPLOADED", url: `/${nickname}/${fileName}`})
})