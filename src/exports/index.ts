import readline from "readline";
import pino from "pino";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

export  const question = (text: string): Promise<string> => {

    return new Promise((resolve) => {
        rl.question(text, resolve)
    })
}

export const logger = pino({ timestamp: ()=>`"time":"${new Date().toJSON}"`}, pino.destination("./database/wa-logs.txt"))
logger.level = "trace"