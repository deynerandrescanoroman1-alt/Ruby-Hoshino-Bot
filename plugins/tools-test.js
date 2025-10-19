const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } = (await import("@whiskeysockets/baileys"))
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from "chalk"
import util from "util"
import * as ws from "ws"
const { child, spawn, exec } = await import('child_process')
const { CONNECTING } = ws
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'

let rtx = "✿ *Vincula tu cuenta usando el QR.*\n\n[ ✰ ] Sigue las instrucciones:\n*1 » Mas opciones*\n*2 » Dispositivos vinculados*\n*3 » Vincular nuevo dispositivo*\n*4 » Escanea este QR*\n\n> *Nota:* Este código QR expira en 30 segundos."
let rtx2 = "✿ *Vincula tu cuenta usando el codigo.*\n\n[ ✰ ] Sigue las instrucciones:\n*1 » Mas opciones*\n*2 » Dispositivos vinculados*\n*3 » Vincular nuevo dispositivo*\n*4 » Vincular usando numero*\n\n> *Nota:* Este Código solo funciona en el número que lo solicito"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const RubyJBOptions = {}

// Array de códigos personalizados
const codigosPersonalizados = ["SPEE-D3XZ", "2025-3XYZ", "ARLE-TTE3", "SPEE-DUWU"]

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
    
    let mentionedJid = await m.mentionedJid
    let who = mentionedJid && mentionedJid[0] ? mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    let id = `${who.split`@`[0]}`
    let pathRubyJadiBot = path.join('./sessions/', id)
    
    if (!fs.existsSync(pathRubyJadiBot)){
        fs.mkdirSync(pathRubyJadiBot, { recursive: true })
    }
    
    RubyJBOptions.pathRubyJadiBot = pathRubyJadiBot
    RubyJBOptions.m = m
    RubyJBOptions.conn = conn
    RubyJBOptions.args = args
    RubyJBOptions.usedPrefix = usedPrefix
    RubyJBOptions.command = command
    RubyJBOptions.fromCommand = true
    
    RubyJadiBot(RubyJBOptions)
    global.db.data.users[m.sender].Subs = new Date * 1
}

handler.help = ['qr3xz', 'code3xz']
handler.tags = ['serbot']
handler.command = ['qr3xz', 'code3xz']
export default handler 

export async function RubyJadiBot(options) {
    let { pathRubyJadiBot, m, conn, args, usedPrefix, command } = options
    
    // Determinar si es código o QR basado en el comando
    const mcode = command === 'code3xz' ? true : false
    
    let txtCode, codeBot, txtQR
    
    const pathCreds = path.join(pathRubyJadiBot, "creds.json")
    if (!fs.existsSync(pathRubyJadiBot)){
        fs.mkdirSync(pathRubyJadiBot, { recursive: true })
    }
    
    try {
        let { version, isLatest } = await fetchLatestBaileysVersion()
        
        const msgRetry = (MessageRetryMap) => { }
        const msgRetryCache = new NodeCache()
        const { state, saveState, saveCreds } = await useMultiFileAuthState(pathRubyJadiBot)
        
        const connectionOptions = {
            logger: pino({ level: "fatal" }),
            printQRInTerminal: false,
            auth: { 
                creds: state.creds, 
                keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) 
            },
            msgRetry,
            msgRetryCache, 
            browser: ['Windows', 'Firefox'],
            version: version,
            generateHighQualityLinkPreview: true
        }
        
        let sock = makeWASocket(connectionOptions)
        sock.isInit = false
        let isInit = true
        
        setTimeout(async () => {
            if (!sock.user) {
                try { fs.rmSync(pathRubyJadiBot, { recursive: true, force: true }) } catch {}
                try { sock.ws?.close() } catch {}
                sock.ev.removeAllListeners()
                let i = global.conns.indexOf(sock)
                if (i >= 0) global.conns.splice(i, 1)
                console.log(`[AUTO-LIMPIEZA] Sesión ${path.basename(pathRubyJadiBot)} eliminada credenciales invalidos.`)
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
                    }, { quoted: m})
                } else {
                    return 
                }
                if (txtQR && txtQR.key) {
                    setTimeout(() => { conn.sendMessage(m.sender, { delete: txtQR.key })}, 30000)
                }
                return
            } 
            
            if (qr && mcode) {
                // Seleccionar código aleatorio del array
                const secret = codigosPersonalizados[Math.floor(Math.random() * codigosPersonalizados.length)]
                
                // Enviar mensaje de instrucciones
                txtCode = await conn.sendMessage(m.chat, {text : rtx2}, { quoted: m })
                
                // Enviar código
                codeBot = await m.reply(secret)
                
                console.log("Código personalizado generado:", secret)
            }
            
            if (txtCode && txtCode.key) {
                setTimeout(() => { conn.sendMessage(m.sender, { delete: txtCode.key })}, 30000)
            }
            if (codeBot && codeBot.key) {
                setTimeout(() => { conn.sendMessage(m.sender, { delete: codeBot.key })}, 30000)
            }
            
            const endSesion = async (loaded) => {
                if (!loaded) {
                    try {
                        sock.ws.close()
                    } catch {
                    }
                    sock.ev.removeAllListeners()
                    let i = global.conns.indexOf(sock)                
                    if (i < 0) return 
                    delete global.conns[i]
                    global.conns.splice(i, 1)
                }
            }
            
            const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
            
            if (connection === 'close') {
                if (reason === 428) {
                    console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ La conexión (+${path.basename(pathRubyJadiBot)}) fue cerrada inesperadamente. Intentando reconectar...\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
                    await creloadHandler(true).catch(console.error)
                }
                if (reason === 408) {
                    console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ La conexión (+${path.basename(pathRubyJadiBot)}) se perdió o expiró. Razón: ${reason}. Intentando reconectar...\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
                    await creloadHandler(true).catch(console.error)
                }
                if (reason === 440) {
                    console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ La conexión (+${path.basename(pathRubyJadiBot)}) fue reemplazada por otra sesión activa.\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
                    try {
                        if (options.fromCommand) m?.chat ? await conn.sendMessage(m.chat, {text : '⚠︎ Hemos detectado una nueva sesión, borre la antigua sesión para continuar.' }, { quoted: m || null }) : ""
                    } catch (error) {
                        console.error(chalk.bold.yellow(`⚠︎ Error 440 no se pudo enviar mensaje`))
                    }
                }
                if (reason == 405 || reason == 401) {
                    console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ La sesión (+${path.basename(pathRubyJadiBot)}) fue cerrada. Credenciales no válidas o dispositivo desconectado manualmente.\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
                    try {
                        if (options.fromCommand) m?.chat ? await conn.sendMessage(m.chat, {text : '⚠︎ Sesión pendiente.\n\n> ☁︎ Vuelva a intentar nuevamente volver a ser *SUB-BOT*.' }, { quoted: m || null }) : ""
                    } catch (error) {
                        console.error(chalk.bold.yellow(`⚠︎ Error 405 no se pudo enviar mensaje`))
                    }
                    try {
                        fs.rmSync(pathRubyJadiBot, { recursive: true, force: true })
                    } catch {}
                }
                if (reason === 500) {
                    console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ Conexión perdida en la sesión (+${path.basename(pathRubyJadiBot)}). Borrando datos...\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
                    if (options.fromCommand) m?.chat ? await conn.sendMessage(m.chat, {text : '⚠︎ Conexión perdida.\n\n> ☁︎ Intenté conectarse manualmente para volver a ser *SUB-BOT*' }, { quoted: m || null }) : ""
                    return creloadHandler(true).catch(console.error)
                }
                if (reason === 515) {
                    console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ Reinicio automático para la sesión (+${path.basename(pathRubyJadiBot)}).\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
                    await creloadHandler(true).catch(console.error)
                }
                if (reason === 403) {
                    console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ Sesión cerrada o cuenta en soporte para la sesión (+${path.basename(pathRubyJadiBot)}).\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
                    try {
                        fs.rmSync(pathRubyJadiBot, { recursive: true, force: true })
                    } catch {}
                }
            }
            
            if (connection == `open`) {
                await joinChannels(sock)
                
                let userName = sock.authState.creds.me?.name || 'Anónimo'
                let userJid = sock.authState.creds.me?.jid || `${path.basename(pathRubyJadiBot)}@s.whatsapp.net`
                
                console.log(chalk.bold.cyanBright(`\n❒⸺⸺⸺⸺【• SUB-BOT •】⸺⸺⸺⸺❒\n│\n│ ❍ ${userName} (+${path.basename(pathRubyJadiBot)}) conectado exitosamente.\n│\n❒⸺⸺⸺【• CONECTADO •】⸺⸺⸺❒`))
                
                sock.isInit = true
                global.conns.push(sock)
                m?.chat ? await conn.sendMessage(m.chat, { 
                    text: isSubBotConnected(m.sender) ? `@${m.sender.split('@')[0]}, ya estás conectado, leyendo mensajes entrantes...` : `❀ Has registrado un nuevo *Sub-Bot!* [@${m.sender.split('@')[0]}]\n\n> Puedes ver la información del bot usando el comando */infobot*`, 
                    mentions: [m.sender] 
                }, { quoted: m }) : ''
            }
        }
        
        setInterval(async () => {
            if (!sock.user) {
                try { sock.ws.close() } catch (e) {}
                sock.ev.removeAllListeners()
                let i = global.conns.indexOf(sock)
                if (i < 0) return
                delete global.conns[i]
                global.conns.splice(i, 1)
            }
        }, 60000)
        
        let handler = await import('../handler.js')
        let creloadHandler = async function (restatConn) {
            try {
                const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
                if (Object.keys(Handler || {}).length) handler = Handler
            } catch (e) {
                console.error('⚠︎ Nuevo error: ', e)
            }
            
            if (restatConn) {
                const oldChats = sock.chats
                try { sock.ws.close() } catch { }
                sock.ev.removeAllListeners()
                sock = makeWASocket(connectionOptions, { chats: oldChats })
                isInit = true
            }
            
            if (!isInit) {
                sock.ev.off("messages.upsert", sock.handler)
                sock.ev.off("connection.update", sock.connectionUpdate)
                sock.ev.off('creds.update', sock.credsUpdate)
            }
            
            sock.handler = handler.handler.bind(sock)
            sock.connectionUpdate = connectionUpdate.bind(sock)
            sock.credsUpdate = saveCreds.bind(sock, true)
            
            sock.ev.on("messages.upsert", sock.handler)
            sock.ev.on("connection.update", sock.connectionUpdate)
            sock.ev.on("creds.update", sock.credsUpdate)
            
            isInit = false
            return true
        }
        
        creloadHandler(false)
        
    } catch (error) {
        console.error('Error en RubyJadiBot:', error)
        if (m?.chat) {
            await conn.sendMessage(m.chat, { 
                text: '❌ Error al procesar la solicitud. Intenta nuevamente.' 
            }, { quoted: m })
        }
    }
}

function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
    
    hours = (hours < 10) ? '0' + hours : hours
    minutes = (minutes < 10) ? '0' + minutes : minutes
    seconds = (seconds < 10) ? '0' + seconds : seconds
    
    return minutes + ' m y ' + seconds + ' s '
}

async function joinChannels(sock) {
    if (global.ch) {
        for (const value of Object.values(global.ch)) {
            if (typeof value === 'string' && value.endsWith('@newsletter')) {
                await sock.newsletterFollow(value).catch(() => {})
            }
        }
    }
                             }
