import { setupMessagingServices } from "../../exports/messages";
import { menuCaption } from "../caption";


export async function menu(pico, from, messageDetails: any, userName: string, fromUser) {
    const {enviarTexto, enviarImagem, enviarAudioGravacao} = setupMessagingServices(pico, from, messageDetails)

    try{
        await enviarAudioGravacao("assets/audios/menucmd.mp3")
    await enviarImagem("assets/imgs/menu.jpg", menuCaption(fromUser))

    } catch (error){
     console.log("errror")
    }
}