import readline from "readline";
import pino from 'pino';
import pretty from 'pino-pretty';
import fs from "fs"
import path from "path";
import moment from "moment-timezone";
import axios from "axios";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

export  const question = (text: string): Promise<string> => {

    return new Promise((resolve) => {
        rl.question(text, resolve)
    })
}

//



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
type Welkon = {
    nome: string;
    idade: number;
    includes: any
    // outros campos esperados...
}

type Antifake ={
    includes: any
}
import r from "../../database/grupos/welkon.json"



export const adeuscara: AdeusCara = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../database/grupos/adeuscara.json")).toString());

export const welkon: Welkon = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../database/grupos/welkon.json" )).toString())

export const antifake: Antifake  = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../database/grupos/antifake.json" )).toString())

//

declare function moment1(inp?: moment.MomentInput, strict?: boolean): moment.Moment;
export let ppimg: string | undefined 



export const time = moment.tz("America/Sao_Paulo").format("HH:mm:ss");
export const hora = moment.tz('America/Sao_Paulo').format("HH:mm:ss");
export const date = moment.tz("America/Sao_Paulo").format('DD/MM/YY');


const getRandom = (ext) => {
	return `${Math.floor(Math.random() * 10000)}${ext}`;
};
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


    declare function encodeUrl(url: string): string;


export  {
    
    getRandom,
    getBuffer,
    

}
