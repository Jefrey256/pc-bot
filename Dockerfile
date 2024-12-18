# Use uma imagem base do Node.js
FROM node:20-alpine

# Adiciona o FFmpeg
RUN apk add --no-cache ffmpeg

# Defina o diretório de trabalho no container
WORKDIR /app

# Copie os arquivos do projeto para o container
COPY . .

# Instala as dependências do projeto
RUN yarn install

# Comando para iniciar o bot
CMD ["yarn", "dev"]
