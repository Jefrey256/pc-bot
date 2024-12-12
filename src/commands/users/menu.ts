import { setupMessagingServices } from "../../exports/messages";
import { menuCaption } from "../caption";


export async function menu(pico, from, messageDetails: any, userName: string, fromUser) {
    const {enviarTexto, enviarImagem} = setupMessagingServices(pico, from, messageDetails)

    try{
    await enviarImagem("assets/img/menu.jpg", menuCaption(fromUser))

    } catch (error){
     console.log("errror")
    }
}