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
const path_1 = __importDefault(require("path"));
const exports_1 = require("./exports");
const exports_2 = require("./exports");
const commands_1 = require("./commands");
const messages_1 = require("./exports/messages");
function chico() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { state, saveCreds } = yield (0, baileys_1.useMultiFileAuthState)(path_1.default.resolve(__dirname, "..", "database", "qr-code"));
        //data store
        // const store = makeInMemoryStore({})
        // store.readFromFile(path.resolve(__dirname, "..", "database", "store.json"))
        // setInterval(() => store.writeToFile(path.resolve(__dirname, "..", "database", "store.json")), 10_000 )
        //fim
        // Obtém a versão mais recente do Baileys
        const { version, isLatest } = yield (0, baileys_1.fetchLatestBaileysVersion)();
        const pico = (0, baileys_1.default)({
            printQRInTerminal: false,
            version,
            logger: exports_2.logger, // Nível de log ajustado para produção
            auth: state,
            browser: ["Ubuntu", "Chrome", "20.0.04"],
            markOnlineOnConnect: true,
        });
        // Verifica se o dispositivo está registrado, caso contrário, inicia o processo de pareamento
        if (!((_a = state.creds) === null || _a === void 0 ? void 0 : _a.registered)) {
            let phoneNumber = yield (0, exports_1.question)("Digite o número de telefone: ");
            phoneNumber = phoneNumber.replace(/[^0-9]/g, "");
            if (!phoneNumber) {
                throw new Error("Número de telefone inválido");
            }
            const code = yield pico.requestPairingCode(phoneNumber);
            console.log(`Código de pareamento: ${code}`);
        }
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
            const { isCommand } = (0, messages_1.extractMessage)(messages[0]);
            const message = messages[0];
            const from = message.key.remoteJid;
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
    });
}
// Chamar a função para iniciar o bot
