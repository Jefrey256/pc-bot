"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adeuscara = exports.logger = exports.question = void 0;
const readline_1 = __importDefault(require("readline"));
const pino_1 = __importDefault(require("pino"));
const pino_pretty_1 = __importDefault(require("pino-pretty"));
const fs_1 = __importDefault(require("fs"));
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
exports.adeuscara = JSON.parse(fs_1.default.readFileSync('./datab/grupos/adeuscara.json').toString());
