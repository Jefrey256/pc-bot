import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore, Browsers, WASocket, delay } from "baileys";
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

 async function setupParticipantHandler(pico: WASocket, adeuscara: AdeuscaraItem[]) {
    pico.ev.on('group-participants.update', async (pi) => {
        try {
            const groupMetadata = await pico.groupMetadata(pi.id);
            console.log(pi);
    
            // Lista de IDs para funcionalidades
            const dbackid = [];
            const antifake = [];
            const welkom = [];
    
            if (dbackid.includes(pi.id) && pi.action === 'add') {
                const num = pi.participants[0];
                const ind = dbackid.indexOf(pi.id);
    
                if (adeuscara[ind]?.actived && adeuscara[ind]?.number.includes(num.split('@')[0])) {
                    await pico.sendMessage(groupMetadata.id, { text: '*Olha quem deu as cara por aqui, sente o poder do ban cabaço*' });
                    await pico.groupParticipantsUpdate(groupMetadata.id, [num], 'remove');
                    return;
                }
            }
    
            if (antifake.includes(pi.id) && pi.action === 'add') {
                const num = pi.participants[0];
                const participantNumber = num.split('@')[0];
    
                if (!participantNumber.startsWith('55') || participantNumber.startsWith('55800')) {
                    await pico.sendMessage(groupMetadata.id, { text: '⛹️⛹️Bye Bye Estrangeiro...👋🏌️' });
                    await delay(1000);
                    await pico.groupParticipantsUpdate(groupMetadata.id, [num], 'remove');
                    return;
                }
            }
    
            if (welkom.includes(pi.id)) {
                try {
                    const groupDesc = groupMetadata.desc || 'Sem descrição';
    
                    const ppimg = await pico.profilePictureUrl(pi.participants[0]).catch(() => 'https://telegra.ph/file/b5427ea4b8701bc47e751.jpg');
                    const ppgp = await pico.profilePictureUrl(pi.id).catch(() => 'https://image.flaticon.com/icons/png/512/124/124034.png');
    
                    const shortpc = await axios.get(`https://tinyurl.com/api-create.php?url=${ppimg}`).then(res => res.data).catch(() => ppimg);
                    const shortgc = await axios.get(`https://tinyurl.com/api-create.php?url=${ppgp}`).then(res => res.data).catch(() => ppgp);
    
                    if (pi.action === 'add') {
                        const teks = `Bem-vindo(a) @${pi.participants[0].split('@')[0]} ao grupo ${groupMetadata.subject}!\nDescrição: ${groupDesc}`;
    
                        const imgbuff = await getBuffer(`https://aleatoryapi.herokuapp.com/welcome?titulo=BEM%20VINDO(A)&nome=${pi.participants[0].split('@')[0]}&perfil=${shortpc}&fundo=https://example.com/background.jpg&grupo=${encodeURIComponent(groupMetadata.subject)}`);
    
                        await pico.sendMessage(groupMetadata.id, {
                            image: imgbuff,
                            mentions: [pi.participants[0]],
                            caption: teks
                        });
                    } else if (pi.action === 'remove') {
                        const teks = `Adeus, @${pi.participants[0].split('@')[0]}! Saiu do grupo ${groupMetadata.subject}.`; 
    
                        const imgbuff = await getBuffer(`https://aleatoryapi.herokuapp.com/welcome?titulo=Adeus&nome=${pi.participants[0].split('@')[0]}&perfil=${shortpc}&fundo=https://example.com/background.jpg&grupo=${encodeURIComponent(groupMetadata.subject)}`);
    
                        await pico.sendMessage(groupMetadata.id, {
                            image: imgbuff,
                            mentions: [pi.participants[0]],
                            caption: teks
                        });
                    }
                } catch (err) {
                    console.error('Erro ao processar mensagem de boas-vindas ou despedida:', err);
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

    
    // Inicializando o status de presença
   //await pico.sendPresenceUpdate("available");

    // Manipular mensagens recebidas
    pico.ev.on("messages.upsert", async (pi) => {
        try {
            const message = pi.messages[0];
            if (!message || !message.key.remoteJid) return; // Ignora mensagens inválidas ou sem remetente
    
            const from = message.key.remoteJid; // Número ou grupo de origem da mensagem
            const fromUser =
                message.key?.participant?.split("@")[0] || message.key?.remoteJid?.split("@")[0];
            const userName = message.pushName || fromUser; // Nome do usuário ou número
            const messageType = message?.message ? Object.keys(message.message)[0] : null;
    
            const quoted =
                message.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
                message.message?.imageMessage?.contextInfo?.quotedMessage ||
                message.message?.videoMessage?.contextInfo?.quotedMessage ||
                message.message?.audioMessage?.contextInfo?.quotedMessage ||
                message.message?.documentMessage?.contextInfo?.quotedMessage;
    
            // Extraindo a mensagem completa e verificando se é um comando
            const { fullMessage, isCommand } = extractMessage(message);
    
            console.log(`Mensagem recebida de ${userName}: ${fullMessage}`);
            console.log(`Tipo de mensagem: ${messageType}`);
            if (quoted) console.log("Mensagem citada:", quoted);
    
            // Ignora mensagens do próprio bot ou que não sejam comandos
            if (message.key.fromMe || !isCommand) return;
    
            // Tratamento de comandos no menu
            await handleMenuCommand(pico, from, message);
    
            // Resposta automática a "oi" ou "ola"
            if (messageType === "conversation") {
                const messageText = message.message.conversation;
    
                if (
                    messageText.toLowerCase().includes("oi") ||
                    messageText.toLowerCase().includes("olá")
                ) {
                    await pico.sendMessage(from, {
                        text: `Olá ${userName}! Estou aqui para te ajudar a usar o bot!`,
                    });
                }
            }
        } catch (error) {
            console.error("Erro ao processar a mensagem:", error);
        }
    });
    
    
    //.bind(pico.ev);
    //await pico.sendPresenceUpdate("available");
}

}// Chamar a função par