import { extractMessage, setupMessagingServices } from "../exports/messages";
import { OWNER_NUMBER } from "../config";  // Importe a constante OWNER_NUMBER

// Comandos
import { menu } from "./users/menu";
import { ping } from "./users/ping";
import { createSticker } from "./users/sticker";
import { alterarP } from "./owner/ftperfil";
import { videoDow } from "./users/dow";
import { formatFrom } from "../exports/testedoFrom";
// Fim comandos

// Lista de comandos restritos para administradores
const adminCommands = ['ft', 'ping'];  // Comandos apenas para 

//

//
async function getUserRole(pico: any, groupId: string, fromUserAdm: string): Promise<string> {
    try {
        // Obtém os participantes do grupo
        const groupMetadata = await pico.groupMetadata(groupId);
        const admins = groupMetadata.participants.filter((participant: any) => participant.admin);
        const isAdmin = admins.some((admin: any) => admin.id.split('@')[0] === fromUserAdm);

        // Verifica se o número do usuário é o do dono
        if (fromUserAdm === OWNER_NUMBER) {
            return 'dono';  // Usuário é o dono
        } else if (isAdmin) {
            return 'admin';  // Usuário é um administrador
        } else {
            return 'membro';  // Usuário é um membro
        }
    } catch (error) {
        console.error("Erro ao verificar o cargo:", error);
        return 'membro';  // Caso ocorra erro, considera como membro
    }
}

export async function handleMenuCommand(pico: any, from: string, messageDetails: any) {
    const { enviarTexto } = setupMessagingServices(pico, from, messageDetails);

    const { fullMessage, commandName, fromUser, media, isCommand, from: messageFrom, userName } = extractMessage(messageDetails);

    // Verifica se a mensagem foi enviada pelo próprio bot para evitar loops
    if (messageFrom === pico) {
        console.log("Mensagem do bot");
        return;
    }

    console.log(`Comando recebido: ${commandName} de ${fromUser}`);

    // Mapeamento de comandos disponíveis
    const commands = {
        help: menu,
        menu: menu,
        ft: alterarP,  // Apenas admin pode usar
        d: videoDow,
        ping: ping,  // Apenas admin pode usar
        // Comandos de figurinha
        s: createSticker,
        sticker: createSticker,
        stk: createSticker,
        f: createSticker,
        // Fim
    };

    // Verifica se é um comando
    if (isCommand) {
        // Aqui usamos o fromUserAdm extraído
        const role = await getUserRole(pico, from, fromUser);

        console.log(`Comando: ${commandName} - Usuário: ${fromUser} - Cargo: ${role}`);

        // Se o comando for restrito para admin e o usuário não for admin nem dono, exibe mensagem de erro
        if (adminCommands.includes(commandName) && role !== 'admin' && role !== 'dono') {
            await enviarTexto("Você não tem permissão para executar este comando.");
            return;
        }

        // Se o comando for público ou o usuário for admin/dono, executa o comando
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
            await enviarTexto(`Comando ${commandName} não encontrado.`);
        }
    }
}
