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
exports.delMarkedMessage = delMarkedMessage;
exports.testeDel = testeDel;
function delMarkedMessage(pico, from, quotedKey) {
    return __awaiter(this, void 0, void 0, function* () {
        // Deletar a mensagem marcada
        console.log(`ID da mensagem a ser deletada: ${quotedKey.id}`);
        if (quotedKey) {
            yield pico.sendMessage(from, {
                delete: {
                    remoteJid: quotedKey.remoteJid,
                    id: quotedKey.id,
                    participant: quotedKey.participant || undefined, // Necessário para grupos
                },
            });
        }
        else {
            console.error('Nenhuma mensagem marcada para apagar.');
        }
    });
}
function testeDel(pico, from, quoted) {
    return __awaiter(this, void 0, void 0, function* () {
        // Log para depuração
        console.log(`Dados recebidos para exclusão:`, quoted);
        if (quoted && quoted.key) {
            // Passar apenas a chave para delMarkedMessage
            yield delMarkedMessage(pico, from, quoted.key);
            console.log(`aqui o key: ${quoted}`);
            console.log('Comando del executado com sucesso.');
        }
        else {
            console.error('Nenhuma mensagem foi marcada para ser apagada.');
        }
    });
}
