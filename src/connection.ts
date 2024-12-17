import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore, Browsers } from "baileys";
import * as http from "http";
import path from "path";
import { logger, question, extractMessage, handleMenuCommand } from "./exports"; // Exporte funções necessárias
import fs from "fs";
import axios from "axios";
import cheerio from "cheerio";

export async function chico(): Promise<void> {
    // Criar o servidor HTTP para manter o bot online
    const PORT = process.env.PORT || 3000;
    http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Bot está online!');
    }).listen(PORT, () => {
        console.log(`Servidor HTTP escutando na porta ${PORT}`);
    });

    // Configuração do estado de autenticação
    const { state, saveCreds } = await useMultiFileAuthState(path.resolve(__dirname, "..", "database", "qr-code"));
    
    // Configuração do bot
    const { version, isLatest } = await fetchLatestBaileysVersion();
    const pico = makeWASocket({
        printQRInTerminal: false,
        version,
        logger, // Nível de log ajustado para produção
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        markOnlineOnConnect: true,
        syncFullHistory: true,
    });

    pico.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
            const shouldReconnect = (lastDisconnect?.error as any)?.statusCode !== DisconnectReason.loggedOut;
            console.log("Conexão fechada devido ao erro:", lastDisconnect?.error, "Tentando reconectar...", shouldReconnect);
            if (shouldReconnect) {
                chico(); // Reconectar
            }
        } else if (connection === "open") {
            console.log("Conexão aberta com sucesso!");
        }
    });

    // Salvar credenciais ao atualizar
    pico.ev.on("creds.update", saveCreds);

    pico.ev.on("messages.upsert", async (pi) => {
        try {
            const message = pi.messages && pi.messages[0];
            if (!message || !message.message) return; // Ignora mensagens inválidas

            const tfrom = message.key.remoteJid;
            const messageText = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

            // Ignora mensagens enviadas pelo próprio bot
            if (message.key.fromMe) return;

            // Extrai mensagem completa e verifica se é um comando
            const { fullMessage, isCommand } = extractMessage(message);
            console.log(`Mensagem recebida: ${fullMessage}`);

            // Tratamento de comandos
            if (isCommand) {
                await handleMenuCommand(pico, tfrom, message);
                return;
            }

            // Resposta automática para mensagens "oi" ou "ola"
            if (messageText) {
                const toLowerCase = messageText.toLowerCase();
                if (toLowerCase.includes("oi") || toLowerCase.includes("ola")) {
                    await pico.sendMessage(tfrom, { text: "Olá, tudo bem?" });
                }
            }
        } catch (error) {
            console.error("Erro ao processar a mensagem:", error);
        }
    });

    pico.ev.on("group-participants.update", async (pi) => {
        // Processa eventos de participantes do grupo
        try {
            const groupMetadata = await pico.groupMetadata(pi.id);
            const num = pi.participants[0];
            const participantNumber = num.split('@')[0];

            if (pi.action === 'add') {
                // Processamento de boas-vindas
                await pico.sendMessage(groupMetadata.id, { text: `Bem-vindo(a), @${participantNumber}!` });
            } else if (pi.action === 'remove') {
                // Processamento de despedida
                await pico.sendMessage(groupMetadata.id, { text: `Adeus, @${participantNumber}!` });
            }
        } catch (err) {
            console.error("Erro ao processar evento de participantes:", err);
        }
    });

    // Manter o status de presença atualizado
    // await pico.sendPresenceUpdate("available");
}
