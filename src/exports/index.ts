import readline from "readline";
import pino from 'pino';
import pretty from 'pino-pretty';
import fs from "fs"
import path from "path";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

export  const question = (text: string): Promise<string> => {

    return new Promise((resolve) => {
        rl.question(text, resolve)
    })
}





// Configura o fluxo de saída para o arquivo wa-log.txt
const logFile = fs.createWriteStream('wa-log.txt', { flags: 'a' });

// Configura o logger com pino-pretty para logs formatados
export const logger = pino(
    {
        level: 'fatal', // Define o nível de log
    },
    pretty({
        colorize: false, // Desativa cores no arquivo
        translateTime: 'HH:MM:ss', // Adiciona timestamps legíveis
        ignore: 'pid,hostname', // Ignora campos desnecessários
        destination: logFile, // Redireciona logs para o arquivo
    })
);

// Configura as variáveis de ambiente
process.env.LANG = 'pt_BR.UTF-8';
process.env.LC_ALL = 'pt_BR.UTF-8';



//komi
type AdeusCara = {
    nome: string;
    idade: number;
    // outros campos esperados...
};



export const adeuscara: AdeusCara = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../database/grupos/adeuscara.json")).toString());
