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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBuffer = exports.getRandom = exports.date = exports.hora = exports.time = exports.ppimg = exports.antifake = exports.welkon = exports.adeuscara = exports.logger = exports.question = void 0;
const readline_1 = __importDefault(require("readline"));
const pino_1 = __importDefault(require("pino"));
const pino_pretty_1 = __importDefault(require("pino-pretty"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const axios_1 = __importDefault(require("axios"));
const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
const question = (text) => {
    return new Promise((resolve) => {
        rl.question(text, resolve);
    });
};
exports.question = question;
// Configura o fluxo de saída para o arquivo wa-log.txt
const logFile = fs_1.default.createWriteStream('wa-log.txt', { flags: 'a' });
// Configura o logger com pino-pretty para logs formatados
exports.logger = (0, pino_1.default)({
    level: 'fatal', // Define o nível de log
}, (0, pino_pretty_1.default)({
    colorize: false, // Desativa cores no arquivo
    translateTime: 'HH:MM:ss', // Adiciona timestamps legíveis
    ignore: 'pid,hostname', // Ignora campos desnecessários
    destination: logFile, // Redireciona logs para o arquivo
}));
// Configura as variáveis de ambiente
process.env.LANG = 'pt_BR.UTF-8';
process.env.LC_ALL = 'pt_BR.UTF-8';
exports.adeuscara = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(__dirname, "../../database/grupos/adeuscara.json")).toString());
exports.welkon = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(__dirname, "../../database/grupos/welkon.json")).toString());
exports.antifake = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(__dirname, "../../database/grupos/antifake.json")).toString());
exports.time = moment_timezone_1.default.tz("America/Sao_Paulo").format("HH:mm:ss");
exports.hora = moment_timezone_1.default.tz('America/Sao_Paulo').format("HH:mm:ss");
exports.date = moment_timezone_1.default.tz("America/Sao_Paulo").format('DD/MM/YY');
const getRandom = (ext) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`;
};
exports.getRandom = getRandom;
const getBuffer = (url, opcoes) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        opcoes ? opcoes : {};
        const post = yield (0, axios_1.default)(Object.assign(Object.assign({ method: "get", url, headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36',
                'DNT': 1,
                'Upgrade-Insecure-Request': 1
            } }, opcoes), { responseType: 'arraybuffer' }));
        return post.data;
    }
    catch (erro) {
        console.log(`Erro identificado: ${erro}`);
    }
});
exports.getBuffer = getBuffer;
