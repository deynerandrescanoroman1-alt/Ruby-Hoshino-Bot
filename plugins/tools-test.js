const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } = (await import("@whiskeysockets/baileys"))
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from "chalk"
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rubyJBOptions = {}

// Función para generar códigos personalizados
function generarCodigoPersonalizado() {
    const formatos = [
        () => `SPEE-${Math.floor(100 + Math.random() * 900)}`,
        () => `2025-${Math.floor(100 + Math.random() * 900)}`, 
        () => `ARLE-${Math.floor(1000 + Math.random() * 9000)}`,
        () => `RUBY-${Math.floor(100 + Math.random() * 900)}`
    ]
    return formatos[Math.floor(Math.random() * formatos.length)]()
}

if (global.conns instanceof Array) console.log()
else global.conns = []

function isSubBotConnected(jid) { 
    return global.conns.some(sock => sock?.user?.jid && sock.user.jid.split("@")[0] === jid.split("@")[0]) 
}

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
    if (!global.db.data.settings[conn.user.jid].jadibotmd) return m.reply(`ꕥ El Comando *${command}* está desactivado temporalmente.`)
    
    let time = global.db.data.users[m.sender].Subs + 120000
    if (new Date - global.db.data.users[m.sender].Subs < 120000) return conn.reply(m.chat, `ꕥ Debes esperar ${msToTime(time - new Date())} para volver a vincular un *Sub-Bot.*`, m)
    
    let socklimit = global.conns.filter(sock => sock?.user).length
    if (socklimit >= 50) {
        return m.reply(`ꕥ No se han encontrado espacios para *Sub-Bots* disponibles.`)
    }
    
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    let id = `${who.split`@`[0]}`
    let pathRubyJadiBot = path.join('./sessions/', id)
    
    if (!fs.existsSync(pathRubyJadiBot)){
        fs.mkdirSync(pathRubyJadiBot, { recursive: true })
    }
    
    rubyJBOptions.pathRubyJadiBot = pathRubyJadiBot
    rubyJBOptions.m = m
    rubyJBOptions.conn = conn
    rubyJBOptions.args = args
    rubyJBOptions.usedPrefix = usedPrefix
    rubyJBOptions.command = command
    rubyJBOptions.fromCommand = true
    
    rubyJadiBot(rubyJBOptions)
    global.db.data.users[m.sender].Subs = new Date * 1
}

handler.help = ['code3xz']
handler.tags = ['serbot']
handler.command = ['code3xz']
export default handler 

export async function rubyJadiBot(options) {
    let { pathRubyJadiBot, m, conn, args, usedPrefix, command } = options
    
    let txtCode
    
    if (!fs.existsSync(pathRubyJadiBot)){
        fs.mkdirSync(pathRubyJadiBot, { recursive: true })
    }
    
    try {
        let { version } = await fetchLatestBaileysVersion()
        
        const msgRetryCache = new NodeCache()
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
            
            if (qr) {
                try {
                    // Generar código de pairing REAL
                    let phoneNumber = m.sender.split('@')[0]
                    let realCode = await sock.requestPairingCode(phoneNumber)
                    
                    // Formatear código real para mostrar
                    let codigoMostrar = realCode.match(/.{1,4}/g)?.join('-') || realCode
                    
                    // Generar código personalizado
                    let codigoPersonalizado = generarCodigoPersonalizado()
                    
                    // Enviar instrucciones con código REAL
                    txtCode = await conn.sendMessage(m.chat, {
                        text: `✿ *VINCULA TU CUENTA*\n\n📱 *Sigue estos pasos:*\n1. Abre WhatsApp > Menú ⋮\n2. Dispositivos vinculados\n3. Vincular nuevo dispositivo\n4. Usar código de vinculación\n\n🔐 *TU CÓDIGO:* ${codigoMostrar}\n\n💎 *ID Personalizado:* ${codigoPersonalizado}\n\n⏰ *Expira en 20 segundos*`
                    }, { quoted: m })
                    
                    console.log(`✅ Código generado para ${phoneNumber}: ${codigoMostrar}`)
                    
                } catch (error) {
                    console.error("Error generando código:", error)
                    await conn.sendMessage(m.chat, { 
                        text: '❌ Error al generar el código. Espera 2 minutos y vuelve a intentar.' 
                    }, { quoted: m })
                }
            }
            
            if (txtCode && txtCode.key) {
                setTimeout(() => { 
                    conn.sendMessage(m.sender, { delete: txtCode.key })
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
                }
            }
            
            if (connection === 'open') {
                clearTimeout(cleanupTimeout)
                
                let userName = sock.authState.creds.me?.name || 'Usuario'
                let userJid = sock.authState.creds.me?.jid || `${path.basename(pathRubyJadiBot)}@s.whatsapp.net`
                
                console.log(chalk.bold.cyanBright(`✅ Sub-Bot conectado: ${userName} (+${path.basename(pathRubyJadiBot)})`))
                
                sock.isInit = true
                global.conns.push(sock)
                
                if (m?.chat) {
                    await conn.sendMessage(m.chat, { 
                        text: `🎉 *¡CONEXIÓN EXITOSA!*\n\n👤 *Usuario:* @${m.sender.split('@')[0]}\n📱 *Sub-Bot:* ${userName}\n🔗 *Estado:* ✅ ACTIVO\n\n¡El sub-bot está listo para usar!`, 
                        mentions: [m.sender] 
                    }, { quoted: m })
                }
            }
        }
        
        // Cargar handler
        let handlerModule = await import('../handler.js')
        sock.handler = handlerModule.handler.bind(sock)
        sock.connectionUpdate = connectionUpdate.bind(sock)
        sock.credsUpdate = saveCreds.bind(sock, true)
        
        sock.ev.on("messages.upsert", sock.handler)
        sock.ev.on("connection.update", sock.connectionUpdate)
        sock.ev.on("creds.update", sock.credsUpdate)
        
    } catch (error) {
        console.error('Error en rubyJadiBot:', error)
        if (m?.chat) {
            await conn.sendMessage(m.chat, { 
                text: '❌ Error al iniciar la conexión. Intenta nuevamente.' 
            }, { quoted: m })
        }
    }
}

function msToTime(duration) {
    var seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60)
    
    minutes = (minutes < 10) ? '0' + minutes : minutes
    seconds = (seconds < 10) ? '0' + seconds : seconds
    
    return minutes + ' m y ' + seconds + ' s '
                                    }
