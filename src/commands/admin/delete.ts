import { WASocket } from 'baileys';

export async function delMarkedMessage(pico: WASocket, from: string, quotedKey: { id: string; remoteJid: string; participant?: string }) {
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
    console.log(`Dados recebidos para exclusão:`, quoted);

    // Verificar se a mensagem contém contextInfo com a mensagem citada
    if (quoted?.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        const contextInfo = quoted.message.extendedTextMessage.contextInfo;

        const quotedKey = {
            id: contextInfo.stanzaId, // ID da mensagem marcada
            remoteJid: contextInfo.participant || from, // JID do remetente da mensagem marcada
            participant: contextInfo.participant, // Para mensagens em grupos
        };

        console.log(`Excluindo mensagem citada: ${quotedKey.id}`);
        await delMarkedMessage(pico, from, quotedKey);
    } else {
        console.error('Nenhuma mensagem citada foi encontrada para exclusão.');
    }
}
