import { extractMessage, setupMessagingServices } from "../exports/messages";
// Comandos
import { menu } from "./users/menu";
import { ping } from "./users/ping";
import { createSticker } from "./users/sticker";
import { alterarP } from "./owner/ftperfil";
import { videoDow } from "./users/dow";
//fim comandos
export async function handleMenuCommand(pico, from, messageDetails, ) {
    const { enviarTexto } = setupMessagingServices(pico, from, messageDetails);

    const { fullMessage, commandName, fromUser, media, isCommand, from: messageFrom, userName } = extractMessage(messageDetails);

    // Verifica se a mensagem foi enviada pelo próprio bot para evitar loops
    if (messageFrom === pico) {
        console.log("Mensagem do bot");
        return;
    }

    // Mapeamento de comandos disponíveis
    const commands = {
        help: menu,
        menu: menu,
        ft: alterarP,
        d: videoDow,
        ping: ping,
        s: createSticker
    };

    console.log(`Comando recebido: ${commandName} de ${fromUser}`);
    console.log(userName)

    if (isCommand) {
        if (commands[commandName]) {
            try {
                // Executa o comando correspondente
                await commands[commandName](pico, from, messageDetails);
                console.log(`Comando ${commandName} executado com sucesso.`);
            } catch (error) {
                // Envia mensagem de erro caso o comando falhe
                await enviarTexto(`Erro ao executar o comando ${commandName}: ${error.message}`);
                console.log(`Erro ao executar o comando ${commandName}: ${error.message}`);
            }
        } else {
            // Envia mensagem caso o comando não seja encontrado
            await enviarTexto(`Comando ${commandName} não encontrado. Comandos válidos: ${Object.keys(commands).join(", ")}`);
        }
    }
}
