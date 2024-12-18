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
const cheerio_1 = __importDefault(require("cheerio"));
const fs_1 = __importDefault(require("fs"));
const http = __importStar(require("http"));
function chico() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const PORT = process.env.PORT || 3000;
        http.createServer((req, res) => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Bot está online!');
        }).listen(PORT, () => {
            console.log(`Servidor HTTP escutando na porta ${PORT}`);
        });
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
        console.log(`Usando o Baileys v${version}${isLatest ? "" : " (desatualizado)"}`);
        // Manipular atualizações de conexão
        // Salvar credenciais ao atualizar
        pico.ev.on("creds.update", saveCreds);
        pico.ev.on("messages.upsert", (pi) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            try {
                const message = pi.messages && pi.messages[0];
                if (!message || !message.message)
                    return; // Ignora mensagens inválidas
                const tfrom = message.key.remoteJid;
                const fromUser = ((_b = (_a = message.key) === null || _a === void 0 ? void 0 : _a.participant) === null || _b === void 0 ? void 0 : _b.split("@")[0]) || ((_d = (_c = message.key) === null || _c === void 0 ? void 0 : _c.remoteJid) === null || _d === void 0 ? void 0 : _d.split("@")[0]);
                const userName = message.pushName || fromUser; // Nome do usuário ou número
                const messageText = ((_e = message.message) === null || _e === void 0 ? void 0 : _e.conversation) ||
                    ((_g = (_f = message.message) === null || _f === void 0 ? void 0 : _f.extendedTextMessage) === null || _g === void 0 ? void 0 : _g.text) || '';
                // Ignora mensagens enviadas pelo próprio bot
                if (message.key.fromMe)
                    return;
                // Extrai mensagem completa e verifica se é um comando
                const { fullMessage, isCommand } = (0, messages_1.extractMessage)(message);
                console.log(`Mensagem recebida de ${userName}: ${fullMessage}`);
                const messageType = (message === null || message === void 0 ? void 0 : message.message) ? Object.keys(message.message)[0] : null;
                if (messageType)
                    console.log(`Tipo de mensagem: ${messageType}`);
                const quoted = (_k = (_j = (_h = message.message) === null || _h === void 0 ? void 0 : _h.extendedTextMessage) === null || _j === void 0 ? void 0 : _j.contextInfo) === null || _k === void 0 ? void 0 : _k.quotedMessage;
                if (quoted)
                    console.log("Mensagem citada:", quoted);
                // Tratamento de comandos
                if (isCommand) {
                    console.log("Processando comando...");
                    yield (0, commands_1.handleMenuCommand)(pico, tfrom, message);
                    return;
                }
                // Resposta automática para mensagens "oi" ou "ola"
                if (messageText) {
                    const toLowerCase = messageText.toLowerCase();
                    if (toLowerCase.includes("oi") || toLowerCase.includes("ola")) {
                        console.log("Respondendo a saudação...");
                        //await pico.sendMessage(tfrom, { text: "Olá, tudo bem?" });
                    }
                }
            }
            catch (error) {
                console.error("Erro ao processar a mensagem:", error);
            }
        }));
        // pico.ev.on('messages.upsert', async ({ messages }) => {
        //     const {isCommand} = extractMessage(messages[0]);
        //     try {
        //         const info = messages && messages[0];
        //         if (!info || !info.message) return;
        //         const from = info.key.remoteJid;
        //         const messageText = info.message?.conversation || info.message?.extendedTextMessage?.text || '';
        //         // Verificar se a mensagem é do bot (usando fromMe)
        //         if (!isCommand === info.key.fromMe ) {
        //             // Se for do próprio bot, não responde
        //             console.log("Mensagem do bot, ignorando...");
        //             return;
        //         }
        //         await handleMenuCommand(pico, from, info);
        //         console.log("Mensagem recebida de:", from);
        //         console.log("Conteúdo da mensagem:", messageText);
        //         if (messageText) {
        //             const lowerCaseMessage = messageText.toLowerCase();
        //             if (lowerCaseMessage.includes("oi") || lowerCaseMessage.includes("olá")) {
        //                 console.log("Respondendo ao usuário...");
        //                 await pico.sendMessage(from, {
        //                     text: `Olá! Estou aqui para te ajudar a usar o bot!`,
        //                 });
        //                 console.log("Resposta enviada para:", from);
        //             } else if (lowerCaseMessage.includes("bot") ) {
        //                 console.log("Respondendo ao usuário...");
        //                 await pico.sendMessage(from, {
        //                     text: `oq e desgraça!`,
        //                 });
        //                 console.log("Resposta enviada para:", from);
        //             }
        //         }
        //     } catch (error) {
        //         console.error("Erro ao processar a mensagem:", error);
        //     }
        // });
        //dados da komi
        pico.ev.on('chats.upsert', () => {
            //pode usar "store.chats" como quiser, mesmo depois que o soquete morre
            // "chats" => uma instância keyedDB
            console.log('Tem conversas', store.chats.all());
        });
        pico.ev.on('group-participants.update', (pi) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const groupMetadata = yield pico.groupMetadata(pi.id);
                console.log(pi);
                const mdata = yield pico.groupMetadata(pi.id);
                // Listas de IDs para funcionalidades
                const dbackid = [];
                const antifake = [];
                const welkom = [];
                const adeuscara = []; // Deve ser inicializada com os dados necessários
                const welcome_group = []; // Deve conter objetos {id, msg}
                const bye_group = []; // Deve conter objetos {id}
                if (pi.action === 'add') {
                    const num = pi.participants[0];
                    const participantNumber = num.split('@')[0];
                    // Verificação de banimento (dbackid)
                    if (dbackid.includes(pi.id)) {
                        const ind = dbackid.indexOf(pi.id);
                        if (((_a = adeuscara[ind]) === null || _a === void 0 ? void 0 : _a.actived) && ((_b = adeuscara[ind]) === null || _b === void 0 ? void 0 : _b.number.includes(participantNumber))) {
                            yield pico.sendMessage(groupMetadata.id, {
                                text: '*Olha quem deu as cara por aqui, sente o poder do ban cabaço*',
                            });
                            yield pico.groupParticipantsUpdate(groupMetadata.id, [num], 'remove');
                            return;
                        }
                    }
                    ////////////////////VERCAD///////////////////
                    function wallpaper(title, page = '1') {
                        return new Promise((resolve, reject) => {
                            axios_1.default.get(`https://www.besthdwallpaper.com/search?CurrentPage=${page}&q=${title}`)
                                .then(({ data }) => {
                                let $ = cheerio_1.default.load(data);
                                let hasil = [];
                                $('div.grid-item').each(function (a, b) {
                                    hasil.push({
                                        title: $(b).find('div.info > a > h3').text(),
                                        type: $(b).find('div.info > a:nth-child(2)').text(),
                                        source: 'https://www.besthdwallpaper.com/' + $(b).find('div > a:nth-child(3)').attr('href'),
                                        image: [$(b).find('picture > img').attr('data-src') || $(b).find('picture > img').attr('src'), $(b).find('picture > source:nth-child(1)').attr('srcset'), $(b).find('picture > source:nth-child(2)').attr('srcset')]
                                    });
                                });
                                resolve(hasil);
                            });
                        });
                    }
                    //
                    // Verificação de antifake
                    const fs = require('fs'); // Para manipular arquivos locais
                    // Mensagem de boas-vindas (welkom)
                    if (welkom.includes(pi.id)) {
                        const groupDesc = groupMetadata.desc || 'Sem descrição';
                        const groupName = groupMetadata.subject;
                        const num = pi.participants[0];
                        const participantNumber = num.split('@')[0];
                        let ppimg;
                        try {
                            ppimg = yield pico.profilePictureUrl(num);
                        }
                        catch (_d) {
                            ppimg = 'https://telegra.ph/file/b5427ea4b8701bc47e751.jpg';
                        }
                        const welcomeMsg = ((_c = welcome_group.find((obj) => obj.id === pi.id)) === null || _c === void 0 ? void 0 : _c.msg) ||
                            `Bem-vindo, @${participantNumber}! Este é o grupo ${groupName}.`;
                        // Lê a imagem local
                        const imgBuffer = fs.readFileSync("../assets/imgs/welcome.jpg"); // Certifique-se de usar o caminho correto para a imagem local
                        // Envia a mensagem de boas-vindas com a imagem local
                        yield pico.sendMessage(groupMetadata.id, {
                            image: imgBuffer,
                            mentions: [num],
                            caption: welcomeMsg.replace('#descrição#', groupDesc),
                        });
                    }
                }
                // Mensagem de despedida (bye_group)
                if (pi.action === 'remove') {
                    const num = pi.participants[0];
                    const participantNumber = num.split('@')[0];
                    const groupName = groupMetadata.subject;
                    const byeMsg = `Adeus, @${participantNumber}! Saiu do grupo ${groupName}.`;
                    try {
                        // Caminho da imagem local
                        const localImagePath = "./assets/imgs/bye.jpg";
                        // Lê o arquivo de imagem como um buffer
                        const imgBuffer = fs_1.default.readFileSync(localImagePath);
                        // Envia a mensagem com a imagem local
                        yield pico.sendMessage(groupMetadata.id, {
                            image: imgBuffer,
                            mentions: [num],
                            caption: byeMsg,
                        });
                    }
                    catch (err) {
                        console.error('Erro ao processar evento de participantes do grupo:', err);
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
        pico.ev.on('chats.update', (updates) => __awaiter(this, void 0, void 0, function* () {
            for (const chat of updates) {
                console.log(`Chat atualizado: ${chat.id}, mensagens não lidas: ${chat.unreadCount}`);
            }
        }));
        // Inicializando o status de presença
        //await pico.sendPresenceUpdate("available");
        // Manipular mensagens recebidas
        //.bind(pico.ev);
        //await pico.sendPresenceUpdate("available");
    });
}
// Chamar a função par
