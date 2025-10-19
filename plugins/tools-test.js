const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } = (await import("@whiskeysockets/baileys"))
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from "chalk"
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const encryptedCode = Buffer.from('535045452d44335a5a', 'hex').toString('utf8')
const videoLink = "https://raw.githubusercontent.com/speed3xz/Storage/refs/heads/main/Arlette-Bot/o4EBAjtzqIEqKkyBgAR7QlvYrAyA8hDRfQCYEw.mp4"

let rtx = "✿ *Vincula tu cuenta usando el QR.*\n\n[ ✰ ] Sigue las instrucciones:\n*1 » Mas opciones*\n*2 » Dispositivos vinculados*\n*3 » Vincular nuevo dispositivo*\n*4 » Escanea este QR*\n\n> *Nota:* Este código QR expira en 30 segundos."
let rtx2 = "✿ *Vincula tu cuenta usando el código.*\n\n[ ✰ ] Sigue las instrucciones:\n*1 » Mas opciones*\n*2 » Dispositivos vinculados*\n*3 » Vincular nuevo dispositivo*\n*4 » Vincular usando numero*\n\n> *Nota:* Usa el código personalizado"

if (global.conns instanceof Array) console.log()
else global.conns = []

function isSubBotConnected(jid) { 
    return global.conns.some(sock => sock?.user?.jid && sock.user.jid.split("@")[0] === jid.split("@")[0]) 
}

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
    if (!globalThis.db?.data?.settings[conn.user.jid]?.jadibotmd) {
        return m.reply(`ꕥ El Comando *${command}* está desactivado temporalmente.`)
    }
    
    let time = global.db.data.users[m.sender]?.Subs + 120000 || 0
    if (new Date - (global.db.data.users[m.sender]?.Subs || 0) < 120000) {
        return conn.reply(m.chat, `ꕥ Debes esperar ${msToTime(time - new Date())} para volver a vincular un *Sub-Bot.*`, m)
    }
    
    let socklimit = global.conns.filter(sock => sock?.user).length
    if (socklimit >= 50) {
        return m.reply(`ꕥ No se han encontrado espacios para *Sub-Bots* disponibles.`)
    }
    
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    let id = `${who.split`@`[0]}`
    
    const jadi = 'sessions'
    let pathRubyJadiBot = path.join(`./${jadi}/`, id)
    
    if (!fs.existsSync(pathRubyJadiBot)){
        fs.mkdirSync(pathRubyJadiBot, { recursive: true })
    }
    
    const options = {
        pathRubyJadiBot,
        m, 
        conn, 
        args, 
        usedPrefix, 
        command,
        fromCommand: true
    }
    
    RubyJadiBot(options)
    if (global.db.data.users[m.sender]) {
        global.db.data.users[m.sender].Subs = new Date * 1
    }
}

handler.help = ['qr3xz', 'code3xz']
handler.tags = ['serbot']
handler.command = ['qr3xz', 'code3xz']
export default handler 

export async function RubyJadiBot(options) {
    let { pathRubyJadiBot, m, conn, args, usedPrefix, command } = options
    
    const mcode = command === 'code3xz' ? true : false
    
    let txtCode, codeBot, txtQR
    
    const pathCreds = path.join(pathRubyJadiBot, "creds.json")
    if (!fs.existsSync(pathRubyJadiBot)){
        fs.mkdirSync(pathRubyJadiBot, { recursive: true })
    }
    
    try {
        let { version } = await fetchLatestBaileysVersion()
        
        const { state, saveCreds } = await useMultiFileAuthState(pathRubyJadiBot)
        
        const connectionOptions = {
            logger: pino({ level: "silent" }),
            printQRInTerminal: false,
            auth: { 
                creds: state.creds, 
                keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) 
            },
            browser: ['Windows', 'Firefox'],
            version: version,
        }
        
        let sock = makeWASocket(connectionOptions)
        sock.isInit = false
        
        const cleanupTimeout = setTimeout(() => {
            if (!sock.user) {
                try { 
                    sock.ws?.close() 
                } catch {}
                sock.ev.removeAllListeners()
                let i = global.conns.indexOf(sock)
                if (i >= 0) global.conns.splice(i, 1)
                try {
                    fs.rmSync(pathRubyJadiBot, { recursive: true, force: true })
                } catch {}
                console.log(`[LIMPIADO] Sesión ${path.basename(pathRubyJadiBot)} eliminada.`)
            }
        }, 60000)
        
        async function connectionUpdate(update) {
            const { connection, lastDisconnect, isNewLogin, qr } = update
            
            if (isNewLogin) sock.isInit = false
            
            if (qr && !mcode) {
                if (m?.chat) {
                    txtQR = await conn.sendMessage(m.chat, { 
                        image: await qrcode.toBuffer(qr, { scale: 8 }), 
                        caption: rtx.trim()
                    }, { quoted: m })
                }
                if (txtQR && txtQR.key) {
                    setTimeout(() => { 
                        conn.sendMessage(m.sender, { delete: txtQR.key }) 
                    }, 30000)
                }
                return
            } 
            
            if (qr && mcode) {
                let secret = encryptedCode
                
                txtCode = await conn.sendMessage(m.chat, { 
                    text: rtx2 
                }, { quoted: m })
                
                codeBot = await conn.sendMessage(m.chat, {
                    text: `🔐 *Código de vinculación:* ${secret}`
                }, { quoted: m })
                
                await conn.sendMessage(m.chat, {
                    video: { url: videoLink },
                    caption: `🎬 *Video de ayuda*\n\nUsa el código arriba mostrado para vincular tu cuenta.`
                }, { quoted: m })
                
                console.log("Código personalizado enviado:", secret)
                
                setTimeout(async () => {
                    if (sock.user && !sock.isInit) {
                        sock.isInit = true
                        global.conns.push(sock)
                        if (m?.chat) {
                            await conn.sendMessage(m.chat, { 
                                text: `❀ Has registrado un nuevo *Sub-Bot!* [@${m.sender.split('@')[0]}]\n\n> Código usado: ${secret}\n> Estado: ✅ Conectado`, 
                                mentions: [m.sender] 
                            }, { quoted: m })
                        }
                    }
                }, 5000)
            }
            
            if (txtCode && txtCode.key) {
                setTimeout(() => { 
                    conn.sendMessage(m.sender, { delete: txtCode.key }) 
                }, 30000)
            }
            if (codeBot && codeBot.key) {
                setTimeout(() => { 
                    conn.sendMessage(m.sender, { delete: codeBot.key }) 
                }, 30000)
            }
            
            const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
            
            if (connection === 'close') {
                if (reason === DisconnectReason.connectionClosed) {
                    console.log(chalk.bold.magentaBright(`Conexión cerrada: +${path.basename(pathRubyJadiBot)}`))
                }
                if (reason === DisconnectReason.connectionLost) {
                    console.log(chalk.bold.magentaBright(`Conexión perdida: +${path.basename(pathRubyJadiBot)}`))
                }
                if (reason === DisconnectReason.connectionReplaced) {
                    console.log(chalk.bold.magentaBright(`Conexión reemplazada: +${path.basename(pathRubyJadiBot)}`))
                    try {
                        if (options.fromCommand && m?.chat) {
                            await conn.sendMessage(m.chat, { 
                                text: '⚠️ Sesión reemplazada. Usa el comando nuevamente si necesitas conectar.' 
                            }, { quoted: m })
                        }
                    } catch {}
                }
                if (reason === DisconnectReason.restartRequired) {
                    console.log(chalk.bold.magentaBright(`Reinicio requerido: +${path.basename(pathRubyJadiBot)}`))
                }
                if (reason === DisconnectReason.timedOut) {
                    console.log(chalk.bold.magentaBright(`Timeout: +${path.basename(pathRubyJadiBot)}`))
                }
            }
            
            if (connection === 'open') {
                clearTimeout(cleanupTimeout)
                
                let userName = sock.authState.creds.me?.name || 'Usuario'
                let userJid = sock.authState.creds.me?.jid || `${path.basename(pathRubyJadiBot)}@s.whatsapp.net`
                
                console.log(chalk.bold.cyanBright(`Sub-Bot conectado: ${userName} (+${path.basename(pathRubyJadiBot)})`))
                
                sock.isInit = true
                global.conns.push(sock)
                
                if (m?.chat) {
                    await conn.sendMessage(m.chat, { 
                        text: `❀ *Sub-Bot conectado exitosamente!* [@${m.sender.split('@')[0]}]`, 
                        mentions: [m.sender] 
                    }, { quoted: m })
                }
            }
        }
        
        let handler = await import('../handler.js')
        let creloadHandler = async function (restatConn) {
            try {
                const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
                if (Object.keys(Handler || {}).length) handler = Handler
            } catch (e) {
                console.error('Error cargando handler:', e)
            }
            
            if (restatConn) {
                const oldChats = sock.chats
                try { sock.ws.close() } catch { }
                sock.ev.removeAllListeners()
                sock = makeWASocket(connectionOptions, { chats: oldChats })
            }
            
            sock.handler = handler.handler.bind(sock)
            sock.connectionUpdate = connectionUpdate.bind(sock)
            sock.credsUpdate = saveCreds.bind(sock, true)
            
            sock.ev.on("messages.upsert", sock.handler)
            sock.ev.on("connection.update", sock.connectionUpdate)
            sock.ev.on("creds.update", sock.credsUpdate)
            
            return true
        }
        
        creloadHandler(false)
        
    } catch (error) {
        console.error('Error en RubyJadiBot:', error)
        if (m?.chat) {
            await conn.sendMessage(m.chat, { 
                text: '❌ Error al iniciar la conexión. Intenta nuevamente.' 
            }, { quoted: m })
        }
    }
}

function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60)
    
    minutes = (minutes < 10) ? '0' + minutes : minutes
    seconds = (seconds < 10) ? '0' + seconds : seconds
    
    return minutes + ' m y ' + seconds + ' s '
  }
