import { proto, downloadContentFromMessage } from 'baileys';
//import { Buffer } from 'buffer';
import { extractMessage } from './messages';
import * as internal from 'stream'; // Importação para `internal.Transform`

/**
 * Faz o download de conteúdo de uma mensagem de mídia.
 * @param buffer Define se o retorno será um Buffer (true) ou Transform (false).
 * @param messageDetails Detalhes da mensagem para extração da mídia. Caso não seja fornecido, usa `media`.
 * @returns Buffer se `buffer` for `true`, ou Transform se for `false`.
 */
export const getMediaContent = async <AllowBuffer extends boolean = false>(
  buffer: AllowBuffer = false as AllowBuffer,
  messageDetails?: proto.IMessage // Alterado para `messageDetails`, que contém os detalhes da mensagem.
): Promise<AllowBuffer extends true ? Buffer : internal.Transform> => {
  
  // Extração da mídia se não for fornecida diretamente
  const { media } = extractMessage(messageDetails)
  const {} = extractMessage(messageDetails)  // Usando a função `extractMessage` para pegar a mídia da mensagem.

  // Verifique se a mídia foi extraída corretamente
  if (!media) {
    console.log("Nenhuma mídia encontrada. Detalhes da mensagem:", messageDetails); // Log para verificar os detalhes
    throw new Error("Mídia não fornecida.");
  }

  let transform: internal.Transform;

  // Lógica para download do conteúdo baseado no tipo de mídia
  if (media instanceof proto.Message.ImageMessage) {
    transform = await downloadContentFromMessage(media, "image");
  } else if (media instanceof proto.Message.VideoMessage) {
    transform = await downloadContentFromMessage(media, "video");
  } else if (media instanceof proto.Message.AudioMessage) {
    transform = await downloadContentFromMessage(media, "audio");
  } else if (media instanceof proto.Message.StickerMessage) {
    transform = await downloadContentFromMessage(media, "sticker");
  } else if (media instanceof proto.Message.DocumentMessage) {
    transform = await downloadContentFromMessage(media, "document");
  } else {
    console.log("Tipo de mídia não suportado:", media); // Log para verificar o tipo de mídia
    throw new Error("Tipo de mídia não suportado.");
  }

  // Se `buffer` for `false`, retorna o transform diretamente
  if (!buffer) return transform as any;

  // Caso contrário, converte o transform para um Buffer
  let content = Buffer.from([]);
  for await (const chunk of transform) {
    content = Buffer.concat([content, chunk]); // Corrigido o erro de digitação aqui
  }

  return content as any;
};