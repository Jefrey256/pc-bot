import { WASocket } from 'baileys';

export async function delMarkedMessage(pico: WASocket, from: string, quotedKey: { id: string; remoteJid: string; participant?: string }) {
    // Deletar a mensagem marcada
    console.log(`ID da mensagem a ser deletada: ${quotedKey.id}`);
    if (quotedKey) {
        await pico.sendMessage(from, {
            delete: {
                remoteJid: quotedKey.remoteJid,
                id: quotedKey.id,
                participant: quotedKey.participant || undefined, // Necessário para grupos
            },
        });
    } else {
        console.error('Nenhuma mensagem marcada para apagar.');
    }
}

export async function testeDel(pico: WASocket, from: string, quoted: any) {
    // Log para depuração
    console.log(`Dados recebidos para exclusão:`, quoted);

    if (quoted && quoted.key) {
        // Passar apenas a chave para delMarkedMessage
        await delMarkedMessage(pico, from, quoted.key);
        console.log(`aqui o key: ${quoted}`);
        console.log('Comando del executado com sucesso.');
    } else {
        console.error('Nenhuma mensagem foi marcada para ser apagada.');
    }
}
