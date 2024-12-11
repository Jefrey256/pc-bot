import { PREFIX, BOT_NAME, USER } from "../../config";
import { extractMessage } from "../../exports/messages";

export  function menuCaption() {
  

  return `╭─═════༻-༺════─╮
[ ✧ ]  Me: ${BOT_NAME}
[ ✧ ]  Prefix: (${PREFIX})
[ ✧ ]  Status: Online
[ ✧ ]  Usuário: ${USER}
╰─═════༻-༺════─╯`;
}
