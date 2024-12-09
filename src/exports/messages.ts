

export const extractMessage = (messageDetails: any) => {
    if (!messageDetails ||  !messageDetails.message) {
        return{
            media: null,
            text: null,
            args: [],
            fullMessage: null,
            mentions: null,
            from: null,
            fromUser: null,
            isGroupMsg: null,
            isCommand: null,
            commandName: null,
            userName: null,
            participant: null,

        }
    }

    const textMessage = messageDetails.message?.conversation || ""
    const extendedTextMessage = messageDetails.message?.extendedTextMessage?.text || ""
     


}