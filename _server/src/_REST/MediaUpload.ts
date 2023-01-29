import express from "express";
import * as Path from "path";
import {UploadedFile} from "express-fileupload";
import * as crypto from "crypto";
import OneTimeToken from "../_GRAPHQL/models/token/access/OneTimeToken";

export const router = express.Router()

router.post("/upload-images", async (req, res) => {
    const nickname = OneTimeToken.verifyToken(req.body["token"])
    if(!nickname){
        return res.status(401).json({error: "You Need to Be logged to upload"})
    }
    if (!req.files || Object.keys(req.files).length === 0 || Object.keys(req.files).length > 1) {
        return res.status(400).json({error: "You Need to Upload 1 File"})
    }
    if (!req.files.image) {
        return res.status(400).json({error: "Wrong Parameter Name"})
    }

    const uploadedFile = req.files.image as UploadedFile;
    const extension = uploadedFile.mimetype.split("/")[1]
    const fileName = `${crypto.randomUUID()}.${extension}`
    const uploadPath = Path.join(process.cwd(), `media/images/${nickname}/${fileName}`) ;

    try{
        await uploadedFile.mv(uploadPath)
    }catch (e) {
        return res.status(500).json({error: "An error occurred, Please Try Again"})
    }

    return res.status(200).json({message: "UPLOADED", url: fileName})
})