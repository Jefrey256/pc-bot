import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore } from "baileys";
import P from "pino";
import path from "path";
import { question } from "./exports";
import { logger } from "./exports";
import { handleMenuCommand } from "./commands";
import { extractMessage } from "./exports/messages";

export async function chico(): Promise<void> {
    const { state, saveCreds } = await useMultiFileAuthState(
        path.resolve(__dirname, "..", "database", "qr-code")
    );
    //data store
    // const store = makeInMemoryStore({})
    // store.readFromFile(path.resolve(__dirname, "..", "database", "store.json"))
    // setInterval(() => store.writeToFile(path.resolve(__dirname, "..", "database", "store.json")), 10_000 )
    //fim

    // Obtém a versão mais recente do Baileys
    const { version, isLatest } = await fetchLatestBaileysVersion();

    const pico = makeWASocket({
        printQRInTerminal: false,
        version,
        logger, // Nível de log ajustado para produção
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        markOnlineOnConnect: true,
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
        
        if (!message.key.remoteJid) return;
        //if ( message.key.fromMe || !isCommand) return; // Ignora mensagens enviadas pelo próprio bot


        try {
            await handleMenuCommand(pico, message.key.remoteJid, message);
        } catch (error) {
            console.error("Erro ao processar a mensagem:", error);
        }
    });
    
    //.bind(pico.ev);
}

// Chamar a função para iniciar o bot
