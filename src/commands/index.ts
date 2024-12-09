import { extractMessage, setupMessginSErvice } from "../exports/messages";

export async function handleMenuCommand(pico, from, messageDetails) {

    const {enviarTexto} = setupMessginSErvice(pico, from, messageDetails)
    const {fullMessage,
        commandName,
        fromUser,
        media,
        isCommand,
        from: messageFrom
    } = extractMessage(messageDetails)

    if (messageFrom === pico) {
        console.log("messagem do bot")
        return
    }

    const commads = {}
    console.log(`commando recebido : ${commandName} de ${fromUser}`)

    if (isCommand){
        if(commads[commandName]){
            try{
                await commads[commandName](pico, from, messageDetails)
                console.log(`comando ${commandName} executado com sucesso `)
            } catch (error) {
                await enviarTexto(`error ao eecutar o commando ${commandName}:${error.message}`)
                console.log(`error ao eecutar o commando ${commandName}:${error.message}`)
            }
        } else {
            await enviarTexto(`commando ${commandName} nao encontrado commandos validos ${Object.keys(commads).join(",")}`)
        }
    }
}