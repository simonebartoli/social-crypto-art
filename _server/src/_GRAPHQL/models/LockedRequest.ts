import {DateTime} from "luxon";

class LockedRequest {
    static MAX_COUNTER = 5
    static MAX_REQUEST_PER_HOUR = 25
    static BAN_TIME = 3600 * 6

    private static users = new Map<string, LockedRequest>()

    private ip: string
    private counter: number = 0
    private locked: Date | undefined = undefined
    private lastRequest: Date | undefined = undefined
    private totalRequests: number = 0

    private constructor(ip: string) {
        this.ip = ip
        LockedRequest.users.set(ip, this)
    }
    static getUser(ip: string): LockedRequest{
        const user = LockedRequest.users.get(ip)
        if(user){
            return user
        }else{
            return new LockedRequest(ip)
        }
    }

    checkIfLocked(): Date | undefined{
        if(this.locked){
            if(DateTime.now() < DateTime.fromJSDate(this.locked)){
                return this.locked
            }else{
                this.locked = undefined
                this.counter = 0
                return undefined
            }
        }else{
            return undefined
        }
    }

    private requireLock() {
        if(this.counter > LockedRequest.MAX_COUNTER || this.totalRequests > LockedRequest.MAX_REQUEST_PER_HOUR){
            this.counter = 0
            this.locked = DateTime.now().plus({second: LockedRequest.BAN_TIME}).toJSDate()
        }
    }
    increaseCounter(){
        if(this.lastRequest){
            if(DateTime.now() > DateTime.fromJSDate(this.lastRequest).plus({hour: 1})){
                const diff = Math.floor(DateTime.fromJSDate(this.lastRequest).diffNow("hour").hours)
                this.counter -= (diff <= this.counter) ? diff : this.counter
                this.totalRequests = 0
            }
        }

        this.lastRequest = DateTime.now().toJSDate()
        this.counter += 1
        this.totalRequests += 1

        this.requireLock()
    }
    cancelCounter() {
        if(!this.checkIfLocked()){
            this.totalRequests += 1
            this.counter = 0
            this.requireLock()
        }
    }
}

export default LockedRequest