import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from "baileys";
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

    const { version } = await fetchLatestBaileysVersion();

    const pico = makeWASocket({
        printQRInTerminal: false,
        version,
        logger,// Altere o nível para "info" em produção
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        markOnlineOnConnect: true,
    });

    // Verificar registro antes de solicitar o código de pareamento
    if (!state.creds?.registered) {
        let phoneNumber: string = await question("Digite o número de telefone: ");
        phoneNumber = phoneNumber.replace(/[^0-9]/g, "");

        if (!phoneNumber) {
            throw new Error("Número de telefone inválido");
        }

        const code: string = await pico.requestPairingCode(phoneNumber);
        console.log(`Código de pareamento: ${code}`);
    }

    // Manipular atualizações de conexão
    pico.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
            const shouldReconnect =
                (lastDisconnect?.error as any)?.statusCode !== DisconnectReason.loggedOut;

            console.log(
                "Conexão fechada devido ao erro:",
                lastDisconnect?.error,
                "Tentando reconectar...",
                shouldReconnect
            );

            if (shouldReconnect) {
                setTimeout(() => chico(), 5000); // Tentar reconectar após 5 segundos
            }
        } else if (connection === "open") {
            console.log("Conexão aberta com sucesso!");
            pico.sendPresenceUpdate("available"); // Atualizar presença ao conectar
        }
    });

    // Salvar credenciais ao atualizar
    pico.ev.on("creds.update", saveCreds);

    // Manipular mensagens recebidas
    pico.ev.on("messages.upsert", async ({ messages }) => {
        await handleMenuCommand(pico, messages[0].key.remoteJid, messages[0]);
    });
}
