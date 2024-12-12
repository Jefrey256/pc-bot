import { PREFIX, BOT_NAME, } from "../../config";
import { setupMessagingServices } from "../../exports/messages";

export  function menuCaption(fromUser) {
  

<<<<<<< HEAD
export function menuCaption(userName) {
  console.log(userName)
=======
>>>>>>> a47e49dcef713a24a8c215fe71a475a315269cbc
  return `╭─═════༻-༺════─╮
[ ✧ ]  Me: ${BOT_NAME}
[ ✧ ]  Prefix: (${PREFIX})
[ ✧ ]  Status: Online
[ ✧ ]  Usuário: ${fromUser}
╰─═════༻-༺════─╯`;
}
