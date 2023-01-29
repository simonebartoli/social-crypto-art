import * as fs from "fs";
import * as Path from "path";
import {DateTime} from "luxon";

const PATH = Path.join(process.cwd(), "/public/media/tmp/")
const TIMEOUT = 10
const HOUR = 60 * 60

const startCleaning = async () => {
    const files = await fs.promises.readdir(PATH)
    for(const file of files){
        const {birthtime} = fs.statSync(PATH + file)
        if(DateTime.fromJSDate(birthtime) < DateTime.now().minus({second: TIMEOUT})){
            fs.rmSync(PATH + file)
        }
    }
}

export const cleanTempFiles = async () => {
    await startCleaning()
    setInterval(async () => {
        await startCleaning()
    }, HOUR * 1000)
}