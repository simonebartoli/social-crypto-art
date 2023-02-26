import * as nodemailer from "nodemailer"
import {BUILD_TYPE} from "../globals";
import {INTERNAL_ERROR} from "../_GRAPHQL/errors";
import ErrorCode from "../_GRAPHQL/enums/ErrorCode";

type SendEmailType = {
    from: string
    to: string
    subject: string
    text: string
}

const getTransporter = async () => {
    let config = {}
    if(BUILD_TYPE === "development"){
        const {user, pass} = await nodemailer.createTestAccount()
        config = {
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: user,
                pass: pass
            }
        }
    }else{

    }
    return nodemailer.createTransport(config)
}
export const sendEmail = async (options: SendEmailType) => {
    try {
        const transporter = await getTransporter()
        const response = await transporter.sendMail(options)
        if(BUILD_TYPE === "development"){
            console.log(nodemailer.getTestMessageUrl(response))
        }
    }catch (e) {
        console.log(e)
        throw new INTERNAL_ERROR("The email could not be sent", ErrorCode.ERR_501_003)
    }
}