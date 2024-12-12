import { join } from "path";
import { writeFile, mkdir, rm } from "fs/promises";
import { downloadContentFromMessage } from "baileys";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

/**
 * Função para criar figurinha a partir de imagem ou vídeo curto.
 */
export async function createSticker(pico: any, from: string, messageDetails: any) {
  const mediaMessage =
    messageDetails.message?.imageMessage ||
    messageDetails.message?.videoMessage ||
    messageDetails.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ||
    messageDetails.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;

  if (!mediaMessage) {
    
    await pico.sendMessage(from, { text: "Envie ou marque uma imagem ou vídeo de até 5 segundos para criar uma figurinha." });
    return;
  }

  try {
    // Diretório de saída
    const outputFolder = "./assets/stickers";
    await mkdir(outputFolder, { recursive: true });

    const isVideo = !!messageDetails.message?.videoMessage || !!messageDetails.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;
    const fileExtension = isVideo ? "mp4" : "jpeg";
    const inputPath = join(outputFolder, `${Date.now()}.${fileExtension}`);
    const stickerPath = join(outputFolder, `${Date.now()}.webp`);

    // Baixar mídia
    const stream = await downloadContentFromMessage(mediaMessage, isVideo ? "video" : "image");
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    await writeFile(inputPath, Buffer.concat(chunks));
    

    // Verificar duração do vídeo (se for vídeo)
    if (isVideo) {
      const { stdout } = await execPromise(`ffprobe -i ${inputPath} -show_entries format=duration -v quiet -of csv="p=0"`);
      const duration = parseFloat(stdout.trim());
      

      if (duration > 6) {
        
        await pico.sendMessage(from, { text: "O vídeo deve ter no máximo 5 segundos." });
        return;
      }
    }

    // Converter mídia para figurinha
    const command = isVideo
      ? `ffmpeg -i ${inputPath} -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:0:0:0x000000,fps=15" -c:v libwebp -qscale 50 -preset default -loop 0 -an -vsync 0 ${stickerPath}`
      : `ffmpeg -i ${inputPath} -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:0:0:0x000000" -c:v libwebp -qscale 50 -preset default -loop 0 -an -vsync 0 ${stickerPath}`;
    await execPromise(command);
    

    // Enviar figurinha
    await pico.sendMessage(from, { sticker: { url: stickerPath } });
    

    // Remover os arquivos temporários
    await rm(inputPath);
    await rm(stickerPath);
   

    // Remover a pasta, se estiver vazia
    await rm(outputFolder, { recursive: true, force: true });
    

  } catch (error) {
    
    await pico.sendMessage(from, { text: "Erro ao criar figurinha. Certifique-se de que a mídia está correta e tente novamente." });
  }
}