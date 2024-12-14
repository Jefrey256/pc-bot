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
                pico.ev.on('group-participants.update', (ale) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        const groupMetadata = yield pico.groupMetadata(ale.id);
                        const dbackid = adeuscara.map(item => item.groupId);
                        console.log(ale);
                        if (dbackid.includes(ale.id)) {
                            if (ale.action === 'add') {
                                const num = ale.participants[0];
                                const ind = dbackid.indexOf(ale.id);
                                if (adeuscara[ind].actived && adeuscara[ind].number.includes(num.split('@')[0])) {
                                    yield pico.sendMessage(groupMetadata.id, { text: '*Olha quem deu as cara por aqui, sente o poder do ban cabaço*' });
                                    yield pico.groupParticipantsUpdate(groupMetadata.id, [num], 'remove');
                                    return;
                                }
                            }
                        }
                    }
                    catch (error) {
                        console.error('Erro no evento group-participants.update:', error);
                    }
                }));
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
        pico.ev.on("messages.upsert", (_a) => __awaiter(this, [_a], void 0, function* ({ messages }) {
            var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
            const { isCommand } = (0, messages_1.extractMessage)(messages[0]);
            const message = messages[0];
            const from = message.key.remoteJid;
            const fromUser = ((_c = (_b = message.key) === null || _b === void 0 ? void 0 : _b.participant) === null || _c === void 0 ? void 0 : _c.split("@")[0]) || ((_e = (_d = message.key) === null || _d === void 0 ? void 0 : _d.remoteJid) === null || _e === void 0 ? void 0 : _e.split("@")[0]);
            const userName = message.pushName || fromUser;
            const quoted = ((_h = (_g = (_f = message.message) === null || _f === void 0 ? void 0 : _f.extendedTextMessage) === null || _g === void 0 ? void 0 : _g.contextInfo) === null || _h === void 0 ? void 0 : _h.quotedMessage) ||
                ((_l = (_k = (_j = message.message) === null || _j === void 0 ? void 0 : _j.imageMessage) === null || _k === void 0 ? void 0 : _k.contextInfo) === null || _l === void 0 ? void 0 : _l.quotedMessage) ||
                ((_p = (_o = (_m = message.message) === null || _m === void 0 ? void 0 : _m.videoMessage) === null || _o === void 0 ? void 0 : _o.contextInfo) === null || _p === void 0 ? void 0 : _p.quotedMessage) ||
                ((_s = (_r = (_q = message.message) === null || _q === void 0 ? void 0 : _q.audioMessage) === null || _r === void 0 ? void 0 : _r.contextInfo) === null || _s === void 0 ? void 0 : _s.quotedMessage) ||
                ((_v = (_u = (_t = message.message) === null || _t === void 0 ? void 0 : _t.documentMessage) === null || _u === void 0 ? void 0 : _u.contextInfo) === null || _v === void 0 ? void 0 : _v.quotedMessage);
            const { fullMessage } = (0, messages_1.extractMessage)(messages[0]);
            //console.log(`aki e o quoted: ${userName}`);
            //console.log(`Mensagem recebida: ${fullMessage}`);
            //console.log(`ele e o from: ${from}`);
            if (!message.key.remoteJid)
                return;
            //if ( message.key.fromMe || !isCommand) return; // Ignora mensagens enviadas pelo próprio bot
            try {
                yield (0, commands_1.handleMenuCommand)(pico, message.key.remoteJid, message);
            }
            catch (error) {
                console.error("Erro ao processar a mensagem:", error);
            }
        }));
        //.bind(pico.ev);
        //await pico.sendPresenceUpdate("available");
    });
}
// Chamar a função para iniciar o bot
