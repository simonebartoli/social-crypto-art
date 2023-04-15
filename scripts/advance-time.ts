import * as helper from "@nomicfoundation/hardhat-network-helpers"

const advanceTime = async () => {
    await helper.time.increaseTo(1696892400)
}

advanceTime()
    .then(() => console.log("DONE"))
    .catch((e) => {
        console.log(e)
        process.exit(-1)
    })