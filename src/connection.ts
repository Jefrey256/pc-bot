import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore, Browsers, WASocket } from "baileys";
import d from "../database/grupos/adeuscara.json"

import P from "pino";
import { adeuscara } from "./exports";
import path from "path";
import { question } from "./exports";
import { logger } from "./exports";
import { handleMenuCommand } from "./commands";
import { extractMessage } from "./exports/messages";

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
    pico.ev.on('group-participants.update', async (ale) => {
        try {
            const groupMetadata = await pico.groupMetadata(ale.id);
            const dbackid = adeuscara.map(item => item.groupId);

            console.log(ale);

            if (dbackid.includes(ale.id)) {
                if (ale.action === 'add') {
                    const num = ale.participants[0];
                    const ind = dbackid.indexOf(ale.id);

                    if (adeuscara[ind].actived && adeuscara[ind].number.includes(num.split('@')[0])) {
                        await pico.sendMessage(groupMetadata.id, { text: '*Olha quem deu as cara por aqui, sente o poder do ban cabaço*' });
                        await pico.groupParticipantsUpdate(groupMetadata.id, [num], 'remove');
                        return;
                    }
                }
            }
        } catch (error) {
            console.error('Erro no evento group-participants.update:', error);
        }
    });
}



    //

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
    // Salvar credenciais ao atualizar
    pico.ev.on("creds.update", saveCreds);

    // Inicializando o status de presença
   //await pico.sendPresenceUpdate("available");

    // Manipular mensagens recebidas
    pico.ev.on("messages.upsert",  async ({ messages }) => {
      const {isCommand} = extractMessage(messages[0]);
      const message = messages[0];
      const from = message.key.remoteJid;
      const fromUser = message.key?.participant?.split("@")[0] || message.key?.remoteJid?.split("@")[0];
      const userName = message.pushName || fromUser;
      const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || 
               message.message?.imageMessage?.contextInfo?.quotedMessage ||
               message.message?.videoMessage?.contextInfo?.quotedMessage ||
               message.message?.audioMessage?.contextInfo?.quotedMessage ||
               message.message?.documentMessage?.contextInfo?.quotedMessage;

      const {fullMessage} = extractMessage(messages[0]);

      //console.log(`aki e o quoted: ${userName}`);

      //console.log(`Mensagem recebida: ${fullMessage}`);
      
     

      //console.log(`ele e o from: ${from}`);
      
      
        if (!message.key.remoteJid) return;
      //if ( message.key.fromMe || !isCommand) return; // Ignora mensagens enviadas pelo próprio bot


        try {
            await handleMenuCommand(pico, message.key.remoteJid, message);
        } catch (error) {
            console.error("Erro ao processar a mensagem:", error);
        }
    });
    
    //.bind(pico.ev);
    //await pico.sendPresenceUpdate("available");
}

// Chamar a função para iniciar o bot
