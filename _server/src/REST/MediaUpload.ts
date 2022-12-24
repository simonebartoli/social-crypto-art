import express from "express";
import * as Path from "path";
import {UploadedFile} from "express-fileupload";
import {v4 as uuidv4} from "uuid"

export const router = express.Router()

router.post("/upload-images", async (req, res) => {
    let sampleFile: UploadedFile;
    let uploadPath;

    if (!req.files || Object.keys(req.files).length === 0 || Object.keys(req.files).length > 1) {
        return res.status(400).json({error: "You Need to Upload 1 File"})
    }
    if (!req.files.image) {
        return res.status(400).json({error: "Wrong Parameter Name"})
    }
    sampleFile = req.files.image as UploadedFile;
    const extension = sampleFile.mimetype.split("/")[1]
    const fileName = `${uuidv4()}.${extension}`

    uploadPath = Path.join(process.cwd(), `media/images/${fileName}`) ;
    console.log(uploadPath)

    try{
        await sampleFile.mv(uploadPath)
    }catch (e) {
        return res.status(500).json({error: "An error occurred, Please Try Again"})
    }

    return res.status(200).json({message: "UPLOADED", url: fileName})
})