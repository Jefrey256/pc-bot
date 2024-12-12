import { PREFIX, BOT_NAME, } from "../../config";
import { setupMessagingServices } from "../../exports/messages";

export  function menuCaption(fromUser) {
  

  return `╭─═════༻-༺════─╮
[ ✧ ]  Me: ${BOT_NAME}
[ ✧ ]  Prefix: (${PREFIX})
[ ✧ ]  Status: Online
[ ✧ ]  Usuário: ${fromUser}
         
[ ✧ ]  Comandos: s, f, sticker
[ ✧ ]  Comandos: ping
[ ✧ ]  Comandos: help
╰─═════༻-༺════─╯`;
}
