import {
    BUILD_TYPE,
    EMAIL_FROM,
    EMAIL_HOST,
    EMAIL_PASSWORD,
    EMAIL_PORT,
    EMAIL_SECURE,
    EMAIL_USERNAME
} from "../../../globals";
import * as nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import {INTERNAL_ERROR} from "../../errors";
import ErrorCode from "../../enums/ErrorCode";
import * as Handlebars from 'handlebars/runtime';
import "./session-confirm-precompiled.js"
import * as Path from "path";

type SendEmailType = {
    to: string
    subject: string
    info: {
        "ACCESS"?: {
            nickname: string
            date: string
            ip: string
            ua: string
            link: string
        }
    }
}

class Email {
    private transport: Mail<SMTPTransport.SentMessageInfo> | undefined = undefined

    private static from = BUILD_TYPE === "development" ? "noreply@socialcryptoart.com" : EMAIL_FROM
    private static host = BUILD_TYPE === "development" ? "smtp.ethereal.email" : EMAIL_HOST
    private static port = BUILD_TYPE === "development" ? "587" : EMAIL_PORT
    private static secure = BUILD_TYPE === "development" ? false : EMAIL_SECURE

    private username: string
    private password: string

    constructor() {
        if(BUILD_TYPE !== "development"){
            this.username = EMAIL_USERNAME
            this.password = EMAIL_PASSWORD
        }
    }
    async init() {
        if(BUILD_TYPE === "development"){
            const {user, pass} = await nodemailer.createTestAccount()
            this.username = user
            this.password = pass
        }
        this.transport = nodemailer.createTransport({
            host: Email.host,
            port: Number(Email.port),
            secure: Email.secure,
            auth: {
                user: this.username,
                pass: this.password
            },
            tls: {
                rejectUnauthorized: false
            }
        })
    }
    async sendEmail(options: SendEmailType) {
        if(this.transport){
            try {
                const response = await this.transport.sendMail({
                    from: Email.from,
                    to: options.to,
                    subject: options.subject,
                    html: this.getHTMLEmail(options.info),
                    attachments: [{
                        filename: 'logo-transparent.png',
                        path: Path.join(process.cwd(), "src/_GRAPHQL/models/email/logo-transparent.png"),
                        cid: 'logo-transparent'
                    }]
                })
                if(BUILD_TYPE === "development"){
                    console.log(nodemailer.getTestMessageUrl(response))
                }
            }catch (e) {
                console.log(e)
                throw new INTERNAL_ERROR("The email could not be sent", ErrorCode.ERR_501_003)
            }
        }else{
            throw new INTERNAL_ERROR("The transporter has not been initialized", ErrorCode.ERR_501_003)
        }
    }

    private getHTMLEmail(info: SendEmailType["info"]) {
        if(info.ACCESS){
            return Handlebars.templates["session-confirm.hbs"]({
                nickname: info.ACCESS.nickname,
                date: info.ACCESS.date,
                ip: info.ACCESS.ip,
                ua: info.ACCESS.ua,
                link: info.ACCESS.link
            })
        }
        throw new INTERNAL_ERROR("Wrong Parameters Passed to a function", ErrorCode.ERR_501_003)
    }
}

export default Email