import { extractMessage, setupMessagingServices } from "../exports/messages";
import { menu } from "./users/menu";

export async function handleMenuCommand(pico, from, messageDetails) {
    const { enviarTexto } = setupMessagingServices(pico, from, messageDetails);

    const { fullMessage, commandName, fromUser, media, isCommand, from: messageFrom } = extractMessage(messageDetails);

    // Verifica se a mensagem foi enviada pelo próprio bot para evitar loops
    if (messageFrom === pico) {
        console.log("Mensagem do bot");
        return;
    }

    // Mapeamento de comandos disponíveis
    const commands = {
        help: menu,
    };

    console.log(`Comando recebido: ${commandName} de ${fromUser}`);

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
