# Base image
FROM node:18

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos necessários
COPY package*.json ./
COPY tsconfig.json ./

# Instala dependências
RUN yarn install

# Copia o restante do código
COPY . .

# Compila o TypeScript
RUN yarn build

# Porta que o bot usará
EXPOSE 3000

# Comando para iniciar o bot
CMD ["node", "build/bot.js"]
