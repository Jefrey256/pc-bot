

import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore, Browsers, WASocket, delay, Chat } from "baileys";
import d from "../database/grupos/adeuscara.json"


import P from "pino";
import { adeuscara, antifake, bye_group, getBuffer, getRandom, time, welcome_group, welkom } from "./exports";
import path from "path";
import { question } from "./exports";
import { logger } from "./exports";
import { handleMenuCommand } from "./commands";
import { extractMessage } from "./exports/messages";
import axios from "axios";
import cheerio from "cheerio";
import { PREFIX } from "./config";
import fs from "fs";
import encodeUrl from "encodeurl";
import {fundo1} from "../database/neccessarios/necessarios.json"

export async function chico(): Promise<void> {
    const { state, saveCreds } = await useMultiFileAuthState(
        path.resolve(__dirname, "..", "database", "qr-code")
    );
    //komi
    const vcard = 'BEGIN:VCARD\n' // metadata of the contact card
    + 'VERSION:3.0\n' 
    + 'FN:Nero\n' // Nome completo
    + 'ORG:Komi-bot;\n' // A organização do contato
    + 'TEL;type=CELL;type=VOICE;waid=${numerodono}:${numerodono}\n' // WhatsApp ID + Número de telefone
    + 'END:VCARD' // Fim do ctt
//
    //data store
    const store = makeInMemoryStore({})
    store.readFromFile('./store.json')
    // const store = makeInMemoryStore({})
    // store.readFromFile(path.resolve(__dirname, "..", "database", "store.json"))
    // setInterval(() => store.writeToFile(path.resolve(__dirname, "..", "database", "store.json")), 10_000 )
    //fim

    // Obtém a versão mais recente do Baileys
    const { version, isLatest } = await fetchLatestBaileysVersion();
    //komi
    const teste = adeuscara
    
   //

    const pico = makeWASocket({
        printQRInTerminal: false,
        version,
        logger, // Nível de log ajustado para produção
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        markOnlineOnConnect: true,
        //browser: Browsers.macOS("Desktop"),
        syncFullHistory: true,
        
    });

    pico.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
    
        if (connection === "close") {
          const shouldReconnect = (lastDisconnect?.error as any)?.statusCode !== DisconnectReason.loggedOut;
    
          console.log("Conexão fechada devido ao erro:", lastDisconnect?.error, "Tentando reconectar...", shouldReconnect);
    
          if (shouldReconnect) {
            chico(); // Reconecta
          }
        } else if (connection === "open") {
          console.log("Conexão aberta com sucesso!");
        }
      });

    // Verifica se o dispositivo está registrado, caso contrário, inicia o processo de pareamento
    if (!state.creds?.registered) {
        let phoneNumber: string = await question("Digite o número de telefone: ");
        phoneNumber = phoneNumber.replace(/[^0-9]/g, "");

        if (!phoneNumber) {
            throw new Error("Número de telefone inválido");
        }

        const code: string = await pico.requestPairingCode(phoneNumber);
        console.log(`Código de pareamento: ${code}`);
    }

    console.log(`Usando o Baileys v${version}${isLatest ? "" : " (desatualizado)"}`);


    // Manipular atualizações de conexão
   
    // Salvar credenciais ao atualizar
    pico.ev.on("creds.update", saveCreds);




    pico.ev.on("messages.upsert", async (pi) => {
        try {
            const message = pi.messages && pi.messages[0];
            if (!message || !message.message) return; // Ignora mensagens inválidas
    
            const tfrom = message.key.remoteJid;
            const fromUser =
                message.key?.participant?.split("@")[0] || message.key?.remoteJid?.split("@")[0];
            const userName = message.pushName || fromUser; // Nome do usuário ou número
            const messageText = message.message?.conversation || 
                                message.message?.extendedTextMessage?.text || '';
    
            // Ignora mensagens enviadas pelo próprio bot
            if (message.key.fromMe) return;
    
            // Extrai mensagem completa e verifica se é um comando
            const { fullMessage, isCommand } = extractMessage(message);
    
            console.log(`Mensagem recebida de ${userName}: ${fullMessage}`);
            const messageType = message?.message ? Object.keys(message.message)[0] : null;
            if (messageType) console.log(`Tipo de mensagem: ${messageType}`);
            
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (quoted) console.log("Mensagem citada:", quoted);
    
            // Tratamento de comandos
            if (isCommand) {
                console.log("Processando comando...");
                await handleMenuCommand(pico, tfrom, message);
                return;
            }
    
            // Resposta automática para mensagens "oi" ou "ola"
            if (messageText) {
                const toLowerCase = messageText.toLowerCase();
                if (toLowerCase.includes("oi") || toLowerCase.includes("ola")) {
                    console.log("Respondendo a saudação...");
                    await pico.sendMessage(tfrom, { text: "Olá, tudo bem?" });
                }
            }
        } catch (error) {
            console.error("Erro ao processar a mensagem:", error);
        }
    });
    

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
      console.log('Tem conversas', store.chats.all())
      })

      

interface GroupUpdate {
    id: string;
    participants: string[];
    action: 'add' | 'remove';
}

interface AdeuscaraItem {
    groupId: string;
    actived: boolean;
    number: string[];
}


pico.ev.on('group-participants.update', async (pi) => {
    try {
        const groupMetadata = await pico.groupMetadata(pi.id);
        console.log(pi);
        const mdata = await pico.groupMetadata(pi.id);

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
                if (adeuscara[ind]?.actived && adeuscara[ind]?.number.includes(participantNumber)) {
                    await pico.sendMessage(groupMetadata.id, {
                        text: '*Olha quem deu as cara por aqui, sente o poder do ban cabaço*',
                    });
                    await pico.groupParticipantsUpdate(groupMetadata.id, [num], 'remove');
                    return;
                }
            }
            ////////////////////VERCAD///////////////////

            function wallpaper(title, page = '1') {
                return new Promise((resolve, reject) => {
                    axios.get(`https://www.besthdwallpaper.com/search?CurrentPage=${page}&q=${title}`)
                    .then(({ data }) => {
                        let $ = cheerio.load(data)
                        let hasil = []
                        $('div.grid-item').each(function (a, b) {
                            hasil.push({
                                title: $(b).find('div.info > a > h3').text(),
                                type: $(b).find('div.info > a:nth-child(2)').text(),
                                source: 'https://www.besthdwallpaper.com/'+$(b).find('div > a:nth-child(3)').attr('href'),
                                image: [$(b).find('picture > img').attr('data-src') || $(b).find('picture > img').attr('src'), $(b).find('picture > source:nth-child(1)').attr('srcset'), $(b).find('picture > source:nth-child(2)').attr('srcset')]
                            })
                        })
                        resolve(hasil)
                    })
                })
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
        ppimg = await pico.profilePictureUrl(num);
    } catch {
        ppimg = 'https://telegra.ph/file/b5427ea4b8701bc47e751.jpg';
    }

    const welcomeMsg =
        welcome_group.find((obj) => obj.id === pi.id)?.msg ||
        `Bem-vindo, @${participantNumber}! Este é o grupo ${groupName}.`;

    // Lê a imagem local
    const imgBuffer = fs.readFileSync("../assets/imgs/welcome.jpg"); // Certifique-se de usar o caminho correto para a imagem local

    // Envia a mensagem de boas-vindas com a imagem local
    await pico.sendMessage(groupMetadata.id, {
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
                const imgBuffer = fs.readFileSync(localImagePath);
        
                // Envia a mensagem com a imagem local
                await pico.sendMessage(groupMetadata.id, {
                    image: imgBuffer,
                    mentions: [num],
                    caption: byeMsg,
                });
            } catch (err) {
                console.error('Erro ao processar evento de participantes do grupo:', err);
            }
        }
    } catch (err) {
        console.error('Erro ao processar evento de participantes do grupo:', err);
    }
});

    
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    async function getBuffer(url) {
        try {
            const res = await axios.get(url, { responseType: 'arraybuffer' });
            return Buffer.from(res.data, 'binary');
        } catch (err) {
            console.error('Erro ao obter buffer da imagem:', err);
            throw err;
        }
    }
    



    //
    interface Chats {
        chats:[]
        isLastest: boolean
    }

    pico.ev.on('chats.update', async (updates: { id: string; unreadCount: number }[]) => {
        for (const chat of updates) {
          console.log(`Chat atualizado: ${chat.id}, mensagens não lidas: ${chat.unreadCount}`);
        }
      });

     
    
    // Inicializando o status de presença
   //await pico.sendPresenceUpdate("available");

    // Manipular mensagens recebidas
   
    
    //.bind(pico.ev);
    //await pico.sendPresenceUpdate("available");
}

// Chamar a função par