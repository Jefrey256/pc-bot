"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMenuCommand = handleMenuCommand;
const messages_1 = require("../exports/messages");
// Comandos
const menu_1 = require("./users/menu");
const ping_1 = require("./users/ping");
const sticker_1 = require("./users/sticker");
const ftperfil_1 = require("./owner/ftperfil");
const dow_1 = require("./users/dow");
//fim comandos
function handleMenuCommand(pico, from, messageDetails) {
    return __awaiter(this, void 0, void 0, function* () {
        const { enviarTexto } = (0, messages_1.setupMessagingServices)(pico, from, messageDetails);
        const { fullMessage, commandName, fromUser, media, isCommand, from: messageFrom, userName } = (0, messages_1.extractMessage)(messageDetails);
        // Verifica se a mensagem foi enviada pelo próprio bot para evitar loops
        if (messageFrom === pico) {
            console.log("Mensagem do bot");
            return;
        }
        // Mapeamento de comandos disponíveis
        const commands = {
            help: menu_1.menu,
            menu: menu_1.menu,
            ft: ftperfil_1.alterarP,
            d: dow_1.videoDow,
            ping: ping_1.ping,
            //comandos de figurinha
            s: sticker_1.createSticker,
            sticker: sticker_1.createSticker,
            stk: sticker_1.createSticker,
            f: sticker_1.createSticker,
            //fim
        };
        console.log(`Comando recebido: ${commandName} de ${fromUser}`);
        console.log(userName);
        if (isCommand) {
            if (commands[commandName]) {
                try {
                    // Executa o comando correspondente
                    yield commands[commandName](pico, from, messageDetails);
                    console.log(`Comando ${commandName} executado com sucesso.`);
                }
                catch (error) {
                    // Envia mensagem de erro caso o comando falhe
                    yield enviarTexto(`Erro ao executar o comando ${commandName}: ${error.message}`);
                    console.log(`Erro ao executar o comando ${commandName}: ${error.message}`);
                }
            }
            else {
                // Envia mensagem caso o comando não seja encontrado
                yield enviarTexto(`Comando ${commandName} não encontrado. `);
            }
        }
    });
}
