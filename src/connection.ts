import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion} from "baileys";
import  P  from "pino";
import path from "path";
import { question } from "./exports";
import { logger } from "./exports";


export async function chico():Promise <void> {
    //const logger = P({ timestamp: ()=>`"time":"${new Date().toJSON}"`}, P.destination("./database/wa-logs.txt"))
    //logger.level = "trace"

    const {state, saveCreds}  = await useMultiFileAuthState(path.resolve(__dirname, "..", "database", "qr-code"))

    const {version} = await fetchLatestBaileysVersion()

    const pico = makeWASocket({
        printQRInTerminal: false,
        version,
        logger,
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        markOnlineOnConnect: true
    })

    if (!pico.authState.creds.registered){
        let phoneNumber: string = await question("Digite o número de telefone: ")
        phoneNumber = phoneNumber.replace(/[^0-9]/g, "")

        if (!phoneNumber){
            throw new Error("Número de telefone inválido")
        }

        const code: string = await pico.requestPairingCode(phoneNumber)

        console.log(`codigo de pareamento, ${code}`)
    }

    pico.ev.on("connection.update", (update) => {
        const {connection, lastDisconnect} = update

        if (connection === "close"){
            const shouldReconnect = (lastDisconnect?.error as any )?.stausCode !== DisconnectReason.loggedOut

            console.log("connection closed",lastDisconnect?.error,  "tenta reconectar",shouldReconnect)

            if (shouldReconnect){
                chico().catch(console.error)
            }
        } else if (connection === "open"){
            console.log("conexão aberta")
        }
    }
)

    pico.ev.on("creds.update", saveCreds)

    



}