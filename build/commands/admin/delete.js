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
function delMarkedMessage(pico, messageDetails) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            // Verifica se a mensagem marcada está presente
            const contextInfo = (_b = (_a = messageDetails.message) === null || _a === void 0 ? void 0 : _a.extendedTextMessage) === null || _b === void 0 ? void 0 : _b.contextInfo;
            const quotedMessage = contextInfo === null || contextInfo === void 0 ? void 0 : contextInfo.quotedMessage;
            const quotedKey = contextInfo === null || contextInfo === void 0 ? void 0 : contextInfo.stanzaId;
            const remoteJid = messageDetails.key.remoteJid;
            const participant = contextInfo === null || contextInfo === void 0 ? void 0 : contextInfo.participant;
            console.log(quotedKey, remoteJid, participant);
            if (!quotedMessage || !quotedKey) {
                console.error('Nenhuma mensagem marcada para apagar.');
                yield pico.sendMessage(remoteJid, {
                    text: '⚠️ Por favor, marque a mensagem que deseja deletar.',
                });
                return;
            }
            console.log(`ID da mensagem a ser deletada: ${quotedKey}`);
            // Deleta a mensagem marcada
            yield pico.sendMessage(remoteJid, {
                delete: {
                    remoteJid: remoteJid,
                    id: quotedKey,
                    participant: participant || undefined, // Necessário em grupos
                },
            });
            console.log('Mensagem marcada deletada com sucesso.');
        }
        catch (error) {
            console.error('Erro ao deletar a mensagem marcada:', error);
            yield pico.sendMessage(messageDetails.key.remoteJid, {
                text: '❌ Ocorreu um erro ao tentar deletar a mensagem marcada.',
            });
        }
    });
}
function testeDel(pico, messageDetails, from, quoted) {
    return __awaiter(this, void 0, void 0, function* () {
        // Log para depuração
        console.log(`Dados recebidos para exclusão:`, quoted);
        if (quoted && quoted.key) {
            // Passar apenas a chave para delMarkedMessage
            yield delMarkedMessage(pico, messageDetails);
            console.log(`aqui o key: ${quoted}`);
            console.log('Comando del executado com sucesso.');
        }
        else {
            console.error('Nenhuma mensagem foi marcada para ser apagada.');
        }
    });
}
