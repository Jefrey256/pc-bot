import { watch } from "chokidar";

// Caminho do arquivo principal do seu bot
const botPath = "./index";

// Função para carregar o bot
let bot: any;
const loadBot = () => {
  try {
    delete require.cache[require.resolve(botPath)];
    bot = require(botPath);
    bot.runBot();
    console.log("Bot recarregado com sucesso!");
  } catch (error) {
    console.error("Erro ao recarregar o bot:", error);
  }
};

// Configurando o watcher para monitorar mudanças
watch(botPath).on("change", (path) => {
  console.log(`Arquivo ${path} modificado. Recarregando...`);
  loadBot();
});

// Inicializando o bot pela primeira vez
loadBot();
