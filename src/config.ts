import { extractMessage } from "./exports/messages"
export const userName = (messageDetails: any)=>{
    const {userName} = extractMessage(messageDetails)
    console.log(userName)

}

export const PREFIX = ","
export const BOT_NAME = "Furryz"
export const USER = userName