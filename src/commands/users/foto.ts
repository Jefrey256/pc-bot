import { setupMessagingServices } from "../../exports/messages";

export async function ft(pico, from, messageDetails){
    const {enviarImagem} = setupMessagingServices(pico, from, messageDetails )
    try{
        await enviarImagem("/assets/img/menu.jpg")
    } catch(error){
        console.log("error")
    }
}