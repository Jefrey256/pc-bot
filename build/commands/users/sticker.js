"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSticker = createSticker;
const path_1 = require("path");
const promises_1 = require("fs/promises");
const baileys_1 = require("baileys");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execPromise = (0, util_1.promisify)(child_process_1.exec);
/**
 * Função para criar figurinha a partir de imagem ou vídeo curto.
 */
function createSticker(pico, from, messageDetails) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, e_1, _b, _c;
        var _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
        const mediaMessage = ((_d = messageDetails.message) === null || _d === void 0 ? void 0 : _d.imageMessage) ||
            ((_e = messageDetails.message) === null || _e === void 0 ? void 0 : _e.videoMessage) ||
            ((_j = (_h = (_g = (_f = messageDetails.message) === null || _f === void 0 ? void 0 : _f.extendedTextMessage) === null || _g === void 0 ? void 0 : _g.contextInfo) === null || _h === void 0 ? void 0 : _h.quotedMessage) === null || _j === void 0 ? void 0 : _j.imageMessage) ||
            ((_o = (_m = (_l = (_k = messageDetails.message) === null || _k === void 0 ? void 0 : _k.extendedTextMessage) === null || _l === void 0 ? void 0 : _l.contextInfo) === null || _m === void 0 ? void 0 : _m.quotedMessage) === null || _o === void 0 ? void 0 : _o.videoMessage);
        if (!mediaMessage) {
            yield pico.sendMessage(from, { text: "Envie ou marque uma imagem ou vídeo de até 5 segundos para criar uma figurinha." });
            return;
        }
        try {
            // Diretório de saída
            const outputFolder = "./assets/stickers";
            yield (0, promises_1.mkdir)(outputFolder, { recursive: true });
            const isVideo = !!((_p = messageDetails.message) === null || _p === void 0 ? void 0 : _p.videoMessage) || !!((_t = (_s = (_r = (_q = messageDetails.message) === null || _q === void 0 ? void 0 : _q.extendedTextMessage) === null || _r === void 0 ? void 0 : _r.contextInfo) === null || _s === void 0 ? void 0 : _s.quotedMessage) === null || _t === void 0 ? void 0 : _t.videoMessage);
            const fileExtension = isVideo ? "mp4" : "jpeg";
            const inputPath = (0, path_1.join)(outputFolder, `${Date.now()}.${fileExtension}`);
            const stickerPath = (0, path_1.join)(outputFolder, `${Date.now()}.webp`);
            // Baixar mídia
            const stream = yield (0, baileys_1.downloadContentFromMessage)(mediaMessage, isVideo ? "video" : "image");
            const chunks = [];
            try {
                for (var _u = true, stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = yield stream_1.next(), _a = stream_1_1.done, !_a; _u = true) {
                    _c = stream_1_1.value;
                    _u = false;
                    const chunk = _c;
                    chunks.push(chunk);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_u && !_a && (_b = stream_1.return)) yield _b.call(stream_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            yield (0, promises_1.writeFile)(inputPath, Buffer.concat(chunks));
            // Verificar duração do vídeo (se for vídeo)
            if (isVideo) {
                const { stdout } = yield execPromise(`ffprobe -i ${inputPath} -show_entries format=duration -v quiet -of csv="p=0"`);
                const duration = parseFloat(stdout.trim());
                if (duration > 6) {
                    yield pico.sendMessage(from, { text: "O vídeo deve ter no máximo 5 segundos." });
                    return;
                }
            }
            // Converter mídia para figurinha
            const command = isVideo
                ? `ffmpeg -i ${inputPath} -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:0:0:0x000000,fps=15" -c:v libwebp -qscale 50 -preset default -loop 0 -an -vsync 0 ${stickerPath}`
                : `ffmpeg -i ${inputPath} -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:0:0:0x000000" -c:v libwebp -qscale 50 -preset default -loop 0 -an -vsync 0 ${stickerPath}`;
            yield execPromise(command);
            // Enviar figurinha
            yield pico.sendMessage(from, { sticker: { url: stickerPath } });
            // Remover os arquivos temporários
            yield (0, promises_1.rm)(inputPath);
            yield (0, promises_1.rm)(stickerPath);
            // Remover a pasta, se estiver vazia
            yield (0, promises_1.rm)(outputFolder, { recursive: true, force: true });
        }
        catch (error) {
            yield pico.sendMessage(from, { text: "Erro ao criar figurinha. Certifique-se de que a mídia está correta e tente novamente." });
        }
    });
}
