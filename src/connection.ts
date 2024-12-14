import makeWASocket, { 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    makeInMemoryStore, 
    Browsers, 
    WASocket, 
    delay 
} from "baileys";
import encodeUrl from "encodeurl";
import {tapacmd, fundo1, fundo2} from "../database/necessarios/necessarios.json";
import { getBuffer, getRandom } from "./exports";
import axios from "axios";
import t from "../database/data-store/store.json";
import P from "pino";
import { adeuscara, time } from "./exports";
import path from "path";
import { question } from "./exports";
import { logger } from "./exports";
import { handleMenuCommand } from "./commands";
import { extractMessage } from "./exports/messages";
import fs from "fs";
// teste
import { OWNER_NUMBER, PREFIX } from "./config";
import { welkon } from "./exports";
import { antifake } from "./exports";
import { ppid } from "process";
// import { ppimg } from "./exports";
// fim //

export async function chico(): Promise<void> {
    const { state, saveCreds } = await useMultiFileAuthState(
        path.resolve(__dirname, "..", "database", "qr-code")
    );
    
    // komi
    const vcard = 'BEGIN:VCARD\n' // metadata of the contact card
        + 'VERSION:3.0\n' 
        + 'FN:Nero\n' // Nome completo
        + 'ORG:Komi-bot;\n' // A organização do contato
        + `TEL;type=CELL;type=VOICE;waid=${OWNER_NUMBER}:${OWNER_NUMBER}\n` // WhatsApp ID + Número de telefone
        + 'END:VCARD'; // Fim do ctt
    
    // data 
    const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB
    const STORE_PATH = path.resolve(__dirname, "./database/data-store/store.json");

    const store = makeInMemoryStore({});
    store.readFromFile(STORE_PATH);

    setInterval(() => {
        const stats = fs.statSync(path.resolve(__dirname, "../database/data-store/store.json"));
        if (stats.size > MAX_FILE_SIZE) {
            console.log('Compactando arquivo...');
            
            const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../database/data-store/store.json"), 'utf8'));

            if (data.chats) {
                data.chats = data.chats.slice(-10); // Mantém os últimos 10 chats
            }

            fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
        }
    }, 60_000); // Verifica a cada 60 segundos
    
    // Obtém a versão mais recente do Baileys
    const { version, isLatest } = await fetchLatestBaileysVersion();
    
    const pico = makeWASocket({
        printQRInTerminal: true,
        version,
        logger, // Nível de log ajustado para produção
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        markOnlineOnConnect: true,
        syncFullHistory: true,
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

    pico.ev.on('chats.upsert', () => {
        console.log('Tem conversas', store.chats.all());
    });

    store.bind(pico.ev);

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

    pico.ev.on('contacts.upsert', () => {
        console.log('Tem contatos', Object.values(store.contacts));
    });

    pico.ev.on('group-participants.update', async (ale) => {
        const groupMetadata = await pico.groupMetadata(ale.id);

        // anti fake
        if (antifake.includes(ale.id)) {
            if (ale.action === 'add' && !ale.participants[0].startsWith('55')) {
                const num = ale.participants[0];
                pico.sendMessage(groupMetadata.id, { text: ' ⛹️⛹️Bye Bye Estrangeiro...👋🏌️' });
                await delay(1000);
                pico.groupParticipantsUpdate(groupMetadata.id, [ale.participants[0]], 'remove');
            }
        }
        if (antifake.includes(ale.id)) {
            if (ale.action === 'add' && !ale.participants[0].startsWith('55800')) {
                const num = ale.participants[0];
                pico.sendMessage(groupMetadata.id, { text: ' ⛹️⛹️Bye Bye Estrangeiro...👋🏌️' });
                await delay(1000);
                pico.groupParticipantsUpdate(groupMetadata.id, [ale.participants[0]], 'remove');
            }
        }

        // bem vindo
        if (welkon.includes(ale.id)) {
            if (antifake.includes(ale.id) && !ale.participants[0].startsWith('55')) return;

            let ppimg: string | undefined;
            let ppgp: string | undefined;
            let shortgc: string | undefined;
            let shortpc: string | undefined;

            try {
                const groupDesc = await groupMetadata.desc;
                try {
                    ppimg = await pico.profilePictureUrl(ale.participants[0]);
                } catch {
                    ppimg = 'https://telegra.ph/file/b5427ea4b8701bc47e751.jpg';
                }
                try {
                    ppgp = await pico.profilePictureUrl(ale.id);
                } catch {
                    ppgp = 'https://image.flaticon.com/icons/png/512/124/124034.png';
                }
                shortpc = await axios.get(`https://tinyurl.com/api-create.php?url=${ppimg}`);
                shortgc = await axios.get(`https://tinyurl.com/api-create.php?url=${ppgp}`);

                const groupIdWelcomed = [];
                const groupIdBye = [];
                let welcome_group: any | undefined;
                let bye_group: any | undefined;
                let teks: any | undefined;

                for (let obj of welcome_group) groupIdWelcomed.push(obj.id);
                for (let obj of bye_group) groupIdBye.push(obj.id);

                const isByed = groupIdBye.indexOf(ale.id) >= 0;
                const isWelcomed = groupIdWelcomed.indexOf(ale.id) >= 0;

                if (ale.action === 'add') {
                    if (isWelcomed) {
                        var ind = groupIdWelcomed.indexOf(ale.id);
                        teks = welcome_group[ind].msg
                            .replace('#hora', time)
                            .replace('#nomedogp#', groupMetadata.subject)
                            .replace('#numerodele#', '@' + ale.participants[0].split('@')[0])
                            .replace('#numerobot#', pico.user.id)
                            .replace('#prefixo#', PREFIX)
                            .replace('#descrição#', groupDesc);
                    } else {
                        let welcome: any | undefined;
                        teks = welcome(ale.participants[0].split('@')[0], groupMetadata.subject);
                    }

                    let buff = await getBuffer(ppimg, []);
                    let ran = getRandom('.jpg');
                    await fs.writeFileSync(ran, buff);

                    fs.unlinkSync(ran);
                    let imgbuff: any | undefined;
                    imgbuff = await getBuffer([], `https://aleatoryapi.herokuapp.com/welcome?titulo=BEM%20VINDO(A)&nome=${ale.participants[0].split('@')[0]}&perfil=${shortpc.length}&fundo=${fundo1}&grupo=BEM VINDO AO GRUPO ${encodeUrl(groupMetadata.subject)}`);
                    pico.sendMessage(groupMetadata.id, { image: imgbuff, mentions: ale.participants, caption: teks });
                } else if (ale.action === 'remove') {
                    let mem: any | undefined;
                    mem = ale.participants[0];

                    try {
                        ppimg = await pico.profilePictureUrl(`${mem.split('@')[0]}@c.us`);
                    } catch {
                        ppimg = 'https://telegra.ph/file/b5427ea4b8701bc47e751.jpg';
                    }

                    if (isByed) {
                        var ind = groupIdBye.indexOf(ale.id);
                        teks = bye_group[ind].msg
                            .replace('#hora#', time)
                            .replace('#nomedogp#', groupMetadata.subject)
                            .replace('#numerodele#', ale.participants[0].split('@')[0])
                            .replace('#numerobot#', pico.user.id)
                            .replace('#prefixo#', PREFIX)
                            .replace('#descrição#', groupDesc);
                    } else {
                        let bye: any | undefined;
                        teks = bye(ale.participants[0].split('@')[0]);
                    }
                }
            } catch {}
        }
    });

    console.log(`Usando o Baileys v${version}${isLatest ? "" : " (desatualizado)"}`);

    // Manipular atualizações de conexão
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

// Continuação do código

    // Manipula desconexões
    pico.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as any)?.statusCode !== DisconnectReason.loggedOut;
            
            if (shouldReconnect) {
                console.log('Tentando reconectar...');
                chico(); // Reconecta
            }
        } else if (connection === 'open') {
            console.log('Conexão aberta com sucesso!');
        }
    });

    pico.ev.on('messages.upsert', async (m) => {
        try {
            const message = m.messages[0];
            if (!message) return;
            const messageType = message.message ? Object.keys(message.message)[0] : null;
            handleMenuCommand(pico, message.key.remoteJid, message)
            
            // // Se for uma mensagem de texto
            // if (messageType === 'conversation') {
            //     const text = message.message.conversation;
            //     const from = message.key.remoteJid;
            //     const isGroup = from.endsWith('@g.us');
            //     const sender = isGroup ? message.key.participant : message.key.remoteJid;

            //   handleMenuCommand(from, text, message)
            // }
        } catch (err) {
            console.log('Erro ao processar mensagem:', err);
        }
    });

    pico.ev.on('messages.upsert', async (m) => {
        const message = m.messages[0];
        if (!message) return;

        const messageType = message.message ? Object.keys(message.message)[0] : null;
        if (messageType === 'conversation') {
            const messageText = message.message.conversation;
            if (messageText.toLowerCase().includes('oi') || messageText.toLowerCase().includes('olá')) {
                pico.sendMessage(message.key.remoteJid, { text: 'Olá, como posso ajudá-lo?' });
            }
        }
    });

    pico.ev.on('group-participants.update', async (update) => {
        const { action, participants, id } = update;
        const groupMetadata = await pico.groupMetadata(id);

        if (action === 'add') {
            // Envia uma mensagem de boas-vindas
            const welcomeText = `Bem-vindo(a) ao grupo ${groupMetadata.subject}, ${participants[0]}`;
            pico.sendMessage(id, { text: welcomeText, mentions: participants });
        } else if (action === 'remove') {
            // Envia uma mensagem de despedida
            const goodbyeText = `Até logo, ${participants[0]}.`;
            pico.sendMessage(id, { text: goodbyeText });
        }
    });

    // Função que faz a reconexão em caso de desconexão
    pico.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as any)?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log('Tentando reconectar...');
                chico(); // Reinicia a conexão
            }
        } else if (connection === 'open') {
            console.log('Conexão aberta com sucesso!');
        }
    });

    pico.ev.on('contacts.upsert', () => {
        console.log('Contatos atualizados', Object.values(store.contacts));
    });

    // Conexão inicial
    
}

