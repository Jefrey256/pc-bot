import readline from "readline";
import pino from 'pino';
import pretty from 'pino-pretty';
import fs from "fs"
import path from "path";
import moment from "moment-timezone";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

  const question = (text: string): Promise<string> => {

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
type welkom ={
    nome : string,
    idade: number
}



 const adeuscara: AdeusCara = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../database/grupos/adeuscara.json")).toString());
 const welkom = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../database/grupos/welkom.json")).toString());
 const antifake = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../database/grupos/antifake.json")).toString());
 const welcome_group = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../database/grupos/welcomegp.json")).toString());
 const bye_group = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../database/grupos/bye.json")).toString());
 //
 declare const delay: (ms: number) => Promise<void>;
 //
 const time = moment.tz("America/Sao_Paulo").format("HH:mm:ss");
 //
 const axios = require('axios')

const getBuffer = async (url, opcoes) => {
try {

opcoes ? opcoes : {}
const post = await axios({
method: "get",
url,
headers: {
    'user-agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36', 
	'DNT': 1,
	'Upgrade-Insecure-Request': 1
},
...opcoes,
responseType: 'arraybuffer'
})

return post.data

} catch (erro) {
console.log(`Erro identificado: ${erro}`)
}
}

const getRandom = (ext) => {
	return `${Math.floor(Math.random() * 10000)}${ext}`;
};



 //


export  {
    question,
    getRandom,
    getBuffer,
    time,
    delay,
    welkom,
    adeuscara,
    antifake,
    welcome_group,
    bye_group
}


import i from "../../database/grupos/bye.json"