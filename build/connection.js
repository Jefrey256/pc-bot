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
const exports_1 = require("./exports");
const path_1 = __importDefault(require("path"));
const exports_2 = require("./exports");
const exports_3 = require("./exports");
const commands_1 = require("./commands");
const messages_1 = require("./exports/messages");
const axios_1 = __importDefault(require("axios"));
function chico() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { state, saveCreds } = yield (0, baileys_1.useMultiFileAuthState)(path_1.default.resolve(__dirname, "..", "database", "qr-code"));
        //komi
        const vcard = 'BEGIN:VCARD\n' // metadata of the contact card
            + 'VERSION:3.0\n'
            + 'FN:Nero\n' // Nome completo
            + 'ORG:Komi-bot;\n' // A organização do contato
            + 'TEL;type=CELL;type=VOICE;waid=${numerodono}:${numerodono}\n' // WhatsApp ID + Número de telefone
            + 'END:VCARD'; // Fim do ctt
        //
        //data store
        const store = (0, baileys_1.makeInMemoryStore)({});
        store.readFromFile('./store.json');
        // const store = makeInMemoryStore({})
        // store.readFromFile(path.resolve(__dirname, "..", "database", "store.json"))
        // setInterval(() => store.writeToFile(path.resolve(__dirname, "..", "database", "store.json")), 10_000 )
        //fim
        // Obtém a versão mais recente do Baileys
        const { version, isLatest } = yield (0, baileys_1.fetchLatestBaileysVersion)();
        //komi
        const teste = exports_1.adeuscara;
        //
        const pico = (0, baileys_1.default)({
            printQRInTerminal: false,
            version,
            logger: exports_3.logger, // Nível de log ajustado para produção
            auth: state,
            browser: ["Ubuntu", "Chrome", "20.0.04"],
            markOnlineOnConnect: true,
            //browser: Browsers.macOS("Desktop"),
            syncFullHistory: true,
        });
        // Verifica se o dispositivo está registrado, caso contrário, inicia o processo de pareamento
        if (!((_a = state.creds) === null || _a === void 0 ? void 0 : _a.registered)) {
            let phoneNumber = yield (0, exports_2.question)("Digite o número de telefone: ");
            phoneNumber = phoneNumber.replace(/[^0-9]/g, "");
            if (!phoneNumber) {
                throw new Error("Número de telefone inválido");
            }
            const code = yield pico.requestPairingCode(phoneNumber);
            console.log(`Código de pareamento: ${code}`);
        }
        //dados da komi
        pico.ev.on('chats.upsert', () => {
            //pode usar "store.chats" como quiser, mesmo depois que o soquete morre
            // "chats" => uma instância keyedDB
            console.log('Tem conversas', store.chats.all());
        });
        function setupParticipantHandler(pico, adeuscara) {
            return __awaiter(this, void 0, void 0, function* () {
                pico.ev.on('group-participants.update', (pi) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b;
                    try {
                        const groupMetadata = yield pico.groupMetadata(pi.id);
                        console.log(pi);
                        // Lista de IDs para funcionalidades
                        const dbackid = [];
                        const antifake = [];
                        const welkom = [];
                        if (dbackid.includes(pi.id) && pi.action === 'add') {
                            const num = pi.participants[0];
                            const ind = dbackid.indexOf(pi.id);
                            if (((_a = adeuscara[ind]) === null || _a === void 0 ? void 0 : _a.actived) && ((_b = adeuscara[ind]) === null || _b === void 0 ? void 0 : _b.number.includes(num.split('@')[0]))) {
                                yield pico.sendMessage(groupMetadata.id, { text: '*Olha quem deu as cara por aqui, sente o poder do ban cabaço*' });
                                yield pico.groupParticipantsUpdate(groupMetadata.id, [num], 'remove');
                                return;
                            }
                        }
                        if (antifake.includes(pi.id) && pi.action === 'add') {
                            const num = pi.participants[0];
                            const participantNumber = num.split('@')[0];
                            if (!participantNumber.startsWith('55') || participantNumber.startsWith('55800')) {
                                yield pico.sendMessage(groupMetadata.id, { text: '⛹️⛹️Bye Bye Estrangeiro...👋🏌️' });
                                yield delay(1000);
                                yield pico.groupParticipantsUpdate(groupMetadata.id, [num], 'remove');
                                return;
                            }
                        }
                        if (welkom.includes(pi.id)) {
                            try {
                                const groupDesc = groupMetadata.desc || 'Sem descrição';
                                const ppimg = yield pico.profilePictureUrl(pi.participants[0]).catch(() => 'https://telegra.ph/file/b5427ea4b8701bc47e751.jpg');
                                const ppgp = yield pico.profilePictureUrl(pi.id).catch(() => 'https://image.flaticon.com/icons/png/512/124/124034.png');
                                const shortpc = yield axios_1.default.get(`https://tinyurl.com/api-create.php?url=${ppimg}`).then(res => res.data).catch(() => ppimg);
                                const shortgc = yield axios_1.default.get(`https://tinyurl.com/api-create.php?url=${ppgp}`).then(res => res.data).catch(() => ppgp);
                                if (pi.action === 'add') {
                                    const teks = `Bem-vindo(a) @${pi.participants[0].split('@')[0]} ao grupo ${groupMetadata.subject}!\nDescrição: ${groupDesc}`;
                                    const imgbuff = yield getBuffer(`https://aleatoryapi.herokuapp.com/welcome?titulo=BEM%20VINDO(A)&nome=${pi.participants[0].split('@')[0]}&perfil=${shortpc}&fundo=https://example.com/background.jpg&grupo=${encodeURIComponent(groupMetadata.subject)}`);
                                    yield pico.sendMessage(groupMetadata.id, {
                                        image: imgbuff,
                                        mentions: [pi.participants[0]],
                                        caption: teks
                                    });
                                }
                                else if (pi.action === 'remove') {
                                    const teks = `Adeus, @${pi.participants[0].split('@')[0]}! Saiu do grupo ${groupMetadata.subject}.`;
                                    const imgbuff = yield getBuffer(`https://aleatoryapi.herokuapp.com/welcome?titulo=Adeus&nome=${pi.participants[0].split('@')[0]}&perfil=${shortpc}&fundo=https://example.com/background.jpg&grupo=${encodeURIComponent(groupMetadata.subject)}`);
                                    yield pico.sendMessage(groupMetadata.id, {
                                        image: imgbuff,
                                        mentions: [pi.participants[0]],
                                        caption: teks
                                    });
                                }
                            }
                            catch (err) {
                                console.error('Erro ao processar mensagem de boas-vindas ou despedida:', err);
                            }
                        }
                    }
                    catch (err) {
                        console.error('Erro ao processar evento de participantes do grupo:', err);
                    }
                }));
                function delay(ms) {
                    return new Promise(resolve => setTimeout(resolve, ms));
                }
                function getBuffer(url) {
                    return __awaiter(this, void 0, void 0, function* () {
                        try {
                            const res = yield axios_1.default.get(url, { responseType: 'arraybuffer' });
                            return Buffer.from(res.data, 'binary');
                        }
                        catch (err) {
                            console.error('Erro ao obter buffer da imagem:', err);
                            throw err;
                        }
                    });
                }
                //
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
                // Salvar credenciais ao atualizar
                pico.ev.on("creds.update", saveCreds);
                // Inicializando o status de presença
                //await pico.sendPresenceUpdate("available");
                // Manipular mensagens recebidas
                pico.ev.on("messages.upsert", (pi) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
                    try {
                        const message = pi.messages[0];
                        if (!message || !message.key.remoteJid)
                            return; // Ignora mensagens inválidas ou sem remetente
                        const from = message.key.remoteJid; // Número ou grupo de origem da mensagem
                        const fromUser = ((_b = (_a = message.key) === null || _a === void 0 ? void 0 : _a.participant) === null || _b === void 0 ? void 0 : _b.split("@")[0]) || ((_d = (_c = message.key) === null || _c === void 0 ? void 0 : _c.remoteJid) === null || _d === void 0 ? void 0 : _d.split("@")[0]);
                        const userName = message.pushName || fromUser; // Nome do usuário ou número
                        const messageType = (message === null || message === void 0 ? void 0 : message.message) ? Object.keys(message.message)[0] : null;
                        const quoted = ((_g = (_f = (_e = message.message) === null || _e === void 0 ? void 0 : _e.extendedTextMessage) === null || _f === void 0 ? void 0 : _f.contextInfo) === null || _g === void 0 ? void 0 : _g.quotedMessage) ||
                            ((_k = (_j = (_h = message.message) === null || _h === void 0 ? void 0 : _h.imageMessage) === null || _j === void 0 ? void 0 : _j.contextInfo) === null || _k === void 0 ? void 0 : _k.quotedMessage) ||
                            ((_o = (_m = (_l = message.message) === null || _l === void 0 ? void 0 : _l.videoMessage) === null || _m === void 0 ? void 0 : _m.contextInfo) === null || _o === void 0 ? void 0 : _o.quotedMessage) ||
                            ((_r = (_q = (_p = message.message) === null || _p === void 0 ? void 0 : _p.audioMessage) === null || _q === void 0 ? void 0 : _q.contextInfo) === null || _r === void 0 ? void 0 : _r.quotedMessage) ||
                            ((_u = (_t = (_s = message.message) === null || _s === void 0 ? void 0 : _s.documentMessage) === null || _t === void 0 ? void 0 : _t.contextInfo) === null || _u === void 0 ? void 0 : _u.quotedMessage);
                        // Extraindo a mensagem completa e verificando se é um comando
                        const { fullMessage, isCommand } = (0, messages_1.extractMessage)(message);
                        console.log(`Mensagem recebida de ${userName}: ${fullMessage}`);
                        console.log(`Tipo de mensagem: ${messageType}`);
                        if (quoted)
                            console.log("Mensagem citada:", quoted);
                        // Ignora mensagens do próprio bot ou que não sejam comandos
                        if (message.key.fromMe || !isCommand)
                            return;
                        // Tratamento de comandos no menu
                        yield (0, commands_1.handleMenuCommand)(pico, from, message);
                        // Resposta automática a "oi" ou "ola"
                        if (messageType === "conversation") {
                            const messageText = message.message.conversation;
                            if (messageText.toLowerCase().includes("oi") ||
                                messageText.toLowerCase().includes("olá")) {
                                yield pico.sendMessage(from, {
                                    text: `Olá ${userName}! Estou aqui para te ajudar a usar o bot!`,
                                });
                            }
                        }
                    }
                    catch (error) {
                        console.error("Erro ao processar a mensagem:", error);
                    }
                }));
                //.bind(pico.ev);
                //await pico.sendPresenceUpdate("available");
            });
        }
    });
} // Chamar a função par
