"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuCaption = menuCaption;
const config_1 = require("../../config");
function menuCaption(fromUser) {
    return `╭─═════༻-༺════─╮
[ ✧ ]  Me: ${config_1.BOT_NAME}
[ ✧ ]  Prefix: (${config_1.PREFIX})
[ ✧ ]  Status: Online
[ ✧ ]  Usuário: ${fromUser}
         
[ ✧ ]  Comandos: s
[ ✧ ]  Comandos: ping
[ ✧ ]  Comandos: help
╰─═════༻-༺════─╯`;
}
