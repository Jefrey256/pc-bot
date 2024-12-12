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

    // Configuração do armazenamento em memória
    const store = makeInMemoryStore({});
    store.readFromFile(path.resolve(__dirname, "..", "database", "store.json"));
    setInterval(() => {
        store.writeToFile(path.resolve(__dirname, "..", "database", "store.json"));
    }, 10000); // Salva o estado do armazenamento a cada 10 segundos

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
    store.bind(pico.ev); // Vincula o armazenamento às atualizações de eventos

    // Manipular atualizações de conexão
    pico.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
            const error = (lastDisconnect?.error as any) || {};
            const reason = error.output?.statusCode || DisconnectReason.connectionClosed;

            if (reason === DisconnectReason.loggedOut) {
                console.error("Sessão desconectada. Por favor, escaneie o QR Code novamente.");
                return;
            }

            console.error(
                `Conexão fechada. Código: ${reason}. Tentando reconectar...`
            );
            setTimeout(() => chico(), 5000); // Tentar reconectar após 5 segundos
        }

        if (connection === "open") {
            console.log("Conexão estabelecida com sucesso!");
            pico.sendPresenceUpdate("available");
        }
    });

    // Salvar credenciais ao atualizar
    pico.ev.on("creds.update", saveCreds);

    // Manipular mensagens recebidas
    pico.ev.on("messages.upsert", async ({ messages }) => {
        const message = messages[0];
        if (!message.key.remoteJid) return;

        try {
            await handleMenuCommand(pico, message.key.remoteJid, message);
        } catch (error) {
            console.error("Erro ao processar a mensagem:", error);
        }
    });
}
