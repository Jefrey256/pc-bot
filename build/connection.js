"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chico = chico;
const baileys_1 = __importStar(require("baileys"));
const encodeurl_1 = __importDefault(require("encodeurl"));
const necessarios_json_1 = require("../database/necessarios/necessarios.json");
const exports_1 = require("./exports");
const axios_1 = __importDefault(require("axios"));
const exports_2 = require("./exports");
const path_1 = __importDefault(require("path"));
const exports_3 = require("./exports");
const exports_4 = require("./exports");
const commands_1 = require("./commands");
const fs_1 = __importDefault(require("fs"));
// teste
const config_1 = require("./config");
const exports_5 = require("./exports");
const exports_6 = require("./exports");
// import { ppimg } from "./exports";
// fim
function chico() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { state, saveCreds } = yield (0, baileys_1.useMultiFileAuthState)(path_1.default.resolve(__dirname, "..", "database", "qr-code"));
        // komi
        const vcard = 'BEGIN:VCARD\n' // metadata of the contact card
            + 'VERSION:3.0\n'
            + 'FN:Nero\n' // Nome completo
            + 'ORG:Komi-bot;\n' // A organização do contato
            + `TEL;type=CELL;type=VOICE;waid=${config_1.OWNER_NUMBER}:${config_1.OWNER_NUMBER}\n` // WhatsApp ID + Número de telefone
            + 'END:VCARD'; // Fim do ctt
        // data 
        const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB
        const STORE_PATH = path_1.default.resolve(__dirname, "./database/data-store/store.json");
        const store = (0, baileys_1.makeInMemoryStore)({});
        store.readFromFile(STORE_PATH);
        setInterval(() => {
            const stats = fs_1.default.statSync(path_1.default.resolve(__dirname, "../database/data-store/store.json"));
            if (stats.size > MAX_FILE_SIZE) {
                console.log('Compactando arquivo...');
                const data = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(__dirname, "../database/data-store/store.json"), 'utf8'));
                if (data.chats) {
                    data.chats = data.chats.slice(-10); // Mantém os últimos 10 chats
                }
                fs_1.default.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
            }
        }, 60000); // Verifica a cada 60 segundos
        // Obtém a versão mais recente do Baileys
        const { version, isLatest } = yield (0, baileys_1.fetchLatestBaileysVersion)();
        const pico = (0, baileys_1.default)({
            printQRInTerminal: true,
            version,
            logger: exports_4.logger, // Nível de log ajustado para produção
            auth: state,
            browser: ["Ubuntu", "Chrome", "20.0.04"],
            markOnlineOnConnect: true,
            syncFullHistory: true,
        });
        // Verifica se o dispositivo está registrado, caso contrário, inicia o processo de pareamento
        if (!((_a = state.creds) === null || _a === void 0 ? void 0 : _a.registered)) {
            let phoneNumber = yield (0, exports_3.question)("Digite o número de telefone: ");
            phoneNumber = phoneNumber.replace(/[^0-9]/g, "");
            if (!phoneNumber) {
                throw new Error("Número de telefone inválido");
            }
            const code = yield pico.requestPairingCode(phoneNumber);
            console.log(`Código de pareamento: ${code}`);
        }
        pico.ev.on('chats.upsert', () => {
            console.log('Tem conversas', store.chats.all());
        });
        store.bind(pico.ev);
        pico.ev.on('contacts.upsert', () => {
            console.log('Tem contatos', Object.values(store.contacts));
        });
        pico.ev.on('group-participants.update', (ale) => __awaiter(this, void 0, void 0, function* () {
            const groupMetadata = yield pico.groupMetadata(ale.id);
            // anti fake
            if (exports_6.antifake.includes(ale.id)) {
                if (ale.action === 'add' && !ale.participants[0].startsWith('55')) {
                    const num = ale.participants[0];
                    pico.sendMessage(groupMetadata.id, { text: ' ⛹️⛹️Bye Bye Estrangeiro...👋🏌️' });
                    yield (0, baileys_1.delay)(1000);
                    pico.groupParticipantsUpdate(groupMetadata.id, [ale.participants[0]], 'remove');
                }
            }
            if (exports_6.antifake.includes(ale.id)) {
                if (ale.action === 'add' && !ale.participants[0].startsWith('55800')) {
                    const num = ale.participants[0];
                    pico.sendMessage(groupMetadata.id, { text: ' ⛹️⛹️Bye Bye Estrangeiro...👋🏌️' });
                    yield (0, baileys_1.delay)(1000);
                    pico.groupParticipantsUpdate(groupMetadata.id, [ale.participants[0]], 'remove');
                }
            }
            // bem vindo
            if (exports_5.welkon.includes(ale.id)) {
                if (exports_6.antifake.includes(ale.id) && !ale.participants[0].startsWith('55'))
                    return;
                let ppimg;
                let ppgp;
                let shortgc;
                let shortpc;
                try {
                    const groupDesc = yield groupMetadata.desc;
                    try {
                        ppimg = yield pico.profilePictureUrl(ale.participants[0]);
                    }
                    catch (_a) {
                        ppimg = 'https://telegra.ph/file/b5427ea4b8701bc47e751.jpg';
                    }
                    try {
                        ppgp = yield pico.profilePictureUrl(ale.id);
                    }
                    catch (_b) {
                        ppgp = 'https://image.flaticon.com/icons/png/512/124/124034.png';
                    }
                    shortpc = yield axios_1.default.get(`https://tinyurl.com/api-create.php?url=${ppimg}`);
                    shortgc = yield axios_1.default.get(`https://tinyurl.com/api-create.php?url=${ppgp}`);
                    const groupIdWelcomed = [];
                    const groupIdBye = [];
                    let welcome_group;
                    let bye_group;
                    let teks;
                    for (let obj of welcome_group)
                        groupIdWelcomed.push(obj.id);
                    for (let obj of bye_group)
                        groupIdBye.push(obj.id);
                    const isByed = groupIdBye.indexOf(ale.id) >= 0;
                    const isWelcomed = groupIdWelcomed.indexOf(ale.id) >= 0;
                    if (ale.action === 'add') {
                        if (isWelcomed) {
                            var ind = groupIdWelcomed.indexOf(ale.id);
                            teks = welcome_group[ind].msg
                                .replace('#hora', exports_2.time)
                                .replace('#nomedogp#', groupMetadata.subject)
                                .replace('#numerodele#', '@' + ale.participants[0].split('@')[0])
                                .replace('#numerobot#', pico.user.id)
                                .replace('#prefixo#', config_1.PREFIX)
                                .replace('#descrição#', groupDesc);
                        }
                        else {
                            let welcome;
                            teks = welcome(ale.participants[0].split('@')[0], groupMetadata.subject);
                        }
                        let buff = yield (0, exports_1.getBuffer)(ppimg, []);
                        let ran = (0, exports_1.getRandom)('.jpg');
                        yield fs_1.default.writeFileSync(ran, buff);
                        fs_1.default.unlinkSync(ran);
                        let imgbuff;
                        imgbuff = yield (0, exports_1.getBuffer)([], `https://aleatoryapi.herokuapp.com/welcome?titulo=BEM%20VINDO(A)&nome=${ale.participants[0].split('@')[0]}&perfil=${shortpc.length}&fundo=${necessarios_json_1.fundo1}&grupo=BEM VINDO AO GRUPO ${(0, encodeurl_1.default)(groupMetadata.subject)}`);
                        pico.sendMessage(groupMetadata.id, { image: imgbuff, mentions: ale.participants, caption: teks });
                    }
                    else if (ale.action === 'remove') {
                        let mem;
                        mem = ale.participants[0];
                        try {
                            ppimg = yield pico.profilePictureUrl(`${mem.split('@')[0]}@c.us`);
                        }
                        catch (_c) {
                            ppimg = 'https://telegra.ph/file/b5427ea4b8701bc47e751.jpg';
                        }
                        if (isByed) {
                            var ind = groupIdBye.indexOf(ale.id);
                            teks = bye_group[ind].msg
                                .replace('#hora#', exports_2.time)
                                .replace('#nomedogp#', groupMetadata.subject)
                                .replace('#numerodele#', ale.participants[0].split('@')[0])
                                .replace('#numerobot#', pico.user.id)
                                .replace('#prefixo#', config_1.PREFIX)
                                .replace('#descrição#', groupDesc);
                        }
                        else {
                            let bye;
                            teks = bye(ale.participants[0].split('@')[0]);
                        }
                    }
                }
                catch (_d) { }
            }
        }));
        console.log(`Usando o Baileys v${version}${isLatest ? "" : " (desatualizado)"}`);
        // Manipular atualizações de conexão
        pico.ev.on("connection.update", (update) => {
            var _a;
            const { connection, lastDisconnect } = update;
            if (connection === "close") {
                const shouldReconnect = ((_a = lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error) === null || _a === void 0 ? void 0 : _a.statusCode) !== baileys_1.DisconnectReason.loggedOut;
                console.log("Conexão fechada devido ao erro:", lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error, "Tentando reconectar...", shouldReconnect);
                if (shouldReconnect) {
                    chico(); // Reconecta
                }
            }
            else if (connection === "open") {
                console.log("Conexão aberta com sucesso!");
            }
        });
        // Continuação do código
        // Manipula desconexões
        pico.ev.on('connection.update', (update) => {
            var _a;
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                const shouldReconnect = ((_a = lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error) === null || _a === void 0 ? void 0 : _a.statusCode) !== baileys_1.DisconnectReason.loggedOut;
                if (shouldReconnect) {
                    console.log('Tentando reconectar...');
                    chico(); // Reconecta
                }
            }
            else if (connection === 'open') {
                console.log('Conexão aberta com sucesso!');
            }
        });
        pico.ev.on('messages.upsert', (m) => __awaiter(this, void 0, void 0, function* () {
            try {
                const message = m.messages[0];
                if (!message)
                    return;
                const messageType = message.message ? Object.keys(message.message)[0] : null;
                (0, commands_1.handleMenuCommand)(pico, message.key.remoteJid, message);
                // // Se for uma mensagem de texto
                // if (messageType === 'conversation') {
                //     const text = message.message.conversation;
                //     const from = message.key.remoteJid;
                //     const isGroup = from.endsWith('@g.us');
                //     const sender = isGroup ? message.key.participant : message.key.remoteJid;
                //   handleMenuCommand(from, text, message)
                // }
            }
            catch (err) {
                console.log('Erro ao processar mensagem:', err);
            }
        }));
        pico.ev.on('messages.upsert', (m) => __awaiter(this, void 0, void 0, function* () {
            const message = m.messages[0];
            if (!message)
                return;
            const messageType = message.message ? Object.keys(message.message)[0] : null;
            if (messageType === 'conversation') {
                const messageText = message.message.conversation;
                if (messageText.toLowerCase().includes('oi') || messageText.toLowerCase().includes('olá')) {
                    pico.sendMessage(message.key.remoteJid, { text: 'Olá, como posso ajudá-lo?' });
                }
            }
        }));
        pico.ev.on('group-participants.update', (update) => __awaiter(this, void 0, void 0, function* () {
            const { action, participants, id } = update;
            const groupMetadata = yield pico.groupMetadata(id);
            if (action === 'add') {
                // Envia uma mensagem de boas-vindas
                const welcomeText = `Bem-vindo(a) ao grupo ${groupMetadata.subject}, ${participants[0]}`;
                pico.sendMessage(id, { text: welcomeText, mentions: participants });
            }
            else if (action === 'remove') {
                // Envia uma mensagem de despedida
                const goodbyeText = `Até logo, ${participants[0]}.`;
                pico.sendMessage(id, { text: goodbyeText });
            }
        }));
        // Função que faz a reconexão em caso de desconexão
        pico.ev.on('connection.update', (update) => {
            var _a;
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                const shouldReconnect = ((_a = lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error) === null || _a === void 0 ? void 0 : _a.statusCode) !== baileys_1.DisconnectReason.loggedOut;
                if (shouldReconnect) {
                    console.log('Tentando reconectar...');
                    chico(); // Reinicia a conexão
                }
            }
            else if (connection === 'open') {
                console.log('Conexão aberta com sucesso!');
            }
        });
        pico.ev.on('contacts.upsert', () => {
            console.log('Contatos atualizados', Object.values(store.contacts));
        });
        // Conexão inicial
    });
}
