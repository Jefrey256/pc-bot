import makeWASocket from "baileys"
import { PREFIX } from "../config"

export const extractMessage = (messageDetails: any) => {
    if (!messageDetails ||  !messageDetails.message) {
        return{
            media: null,
            text: null,
            args: [],
            fullMessage: null,
            mentions: null,
            from: null,
            fromUser: null,
            isGroupMsg: null,
            isCommand: null,
            commandName: null,
            userName: null,
            participant: null,

        }
    }

    const textMessage = messageDetails.message?.conversation || ""
    const extendedTextMessage = messageDetails.message?.extendedTextMessage?.text || ""
    const imagemMessage = messageDetails.message?.imageMessage || ""
    const videoMessage = messageDetails.message?.videoMessage.caption || ""
    const audioMessage = messageDetails.message?.audioMessage || "" 
    const quotedMessage = messageDetails.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation || ""

    const fullMessage = textMessage || extendedTextMessage || imagemMessage || videoMessage || audioMessage || quotedMessage

    const mentions = messageDetails.message?.extendedTextMessage?.contextInfo?.mentionedJidList || []
    const fromUser = messageDetails.participant?.split("@")[0] || "" || messageDetails.key.remoteJid.split("@")[0] || ""
    const from = messageDetails.key.remoteJid || ""
    const userName = messageDetails?.pushName || ""

    const isCommand = fullMessage.startsWith(PREFIX)


    const commandName = isCommand ? fullMessage.slice(PREFIX,length).split("")[0]: ""
    const args = isCommand ? fullMessage.slice(PREFIX.length).split("").slice(1) : []

    const media = messageDetails.message?.imageMessage ||
    messageDetails.message?.videoMessage ||
    messageDetails.message?.audioMessage||
    messageDetails.message?.stickerMessage ||
    messageDetails.message?.documentMessage ||
    messageDetails.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ||
    messageDetails.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage ||
    messageDetails.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage ||
    messageDetails.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage ||
    messageDetails.message?.extendedTextMessage?.contextInfo?.quotedMessage?.documentMessage ||
    undefined

    return {
        media,
        mentions,
        fullMessage,
        from,
        fromUser,
        isCommand,
        commandName,
        args,
        userName,
        participant: messageDetails.key?.participant || messageDetails.key?.remoteJid

    }


}


export function setupMessginSErvice(pico, from, messageDetails){
    const enviarTexto = async (texto) =>{
        try{
            await pico.sendMessage(from,{text: texto},{quoted: messageDetails})
        } catch(error){
            console.log(`Error ao enviar o texto: `, error)
        }
    }

    return{
        enviarTexto
    }
}