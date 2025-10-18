import fs from 'fs'
import { WAMessageStubType } from '@whiskeysockets/baileys'

const newsletterJid = '120363335626706839@newsletter';
const newsletterName = '𖥔ᰔᩚ⋆｡˚ ꒰🍒 ʀᴜʙʏ-ʜᴏꜱʜɪɴᴏ | ᴄʜᴀɴɴᴇʟ-ʙᴏᴛ 💫꒱࣭';
const packname = '⏤͟͞ू⃪  ̸̷͢𝐑𝐮𝐛y͟ 𝐇𝐨𝐬𝐡𝐢n͟ᴏ 𝐁𝐨t͟˚₊·—̳͟͞͞♡̥';

const iconos = [
      'https://qu.ax/kCFBu.jpeg',
      'https://qu.ax/oywhU.jpeg',
      'https://qu.ax/OqruN.jpeg',
      'https://qu.ax/EQNsz.jpeg', 
      'https://qu.ax/zKJLa.jpeg', 
      'https://qu.ax/jSfLz.jpg', 
      'https://qu.ax/vEYfK.jpg', 
      'https://qu.ax/vEYfK.jpg', 
      'https://qu.ax/cQVWG.jpg', 
      'https://qu.ax/aKHwP.jpg', 
      'https://qu.ax/jpdRe.jpg', 
      'https://qu.ax/DomyS.jpg', 
      'https://qu.ax/fwbjQ.jpg', 
      'https://qu.ax/gqMcL.jpg', 
      'https://qu.ax/oYaOd.jpg', 
      'https://qu.ax/krkFy.jpeg', 
];

const getRandomIcono = () => iconos[Math.floor(Math.random() * iconos.length)];


async function generarBienvenida({ conn, userId, groupMetadata, chat }) {
    const username = `@${userId.split('@')[0]}`
    const pp = await conn.profilePictureUrl(userId, 'image').catch(() => 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg')
    const fecha = new Date().toLocaleDateString("es-ES", { timeZone: "America/Mexico_City", day: 'numeric', month: 'long', year: 'numeric' })
    const groupSize = groupMetadata.participants.length // Ya están añadidos, no sumar 1
    const desc = groupMetadata.desc?.toString() || 'Sin descripción'
    const mensaje = (chat.welcomeText || 'Edita con el comando "setwelcome"').replace(/{usuario}/g, `${username}`).replace(/{grupo}/g, `*${groupMetadata.subject}*`).replace(/{desc}/g, `${desc}`)
    const caption = `❀ Bienvenido a *"_${groupMetadata.subject}_"*\n✰ _Usuario_ » ${username}\n● ${mensaje}\n◆ _Ahora somos ${groupSize} Miembros._\nꕥ Fecha » ${fecha}\n૮꒰ ˶• ᴗ •˶꒱ა Disfruta tu estadía en el grupo!\n> *➮ Puedes usar _#help_ para ver la lista de comandos.*`
    return { pp, caption, mentions: [userId] }
}

async function generarDespedida({ conn, userId, groupMetadata, chat }) {
    const username = `@${userId.split('@')[0]}`
    const pp = await conn.profilePictureUrl(userId, 'image').catch(() => 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg')
    const fecha = new Date().toLocaleDateString("es-ES", { timeZone: "America/Mexico_City", day: 'numeric', month: 'long', year: 'numeric' })
    const groupSize = groupMetadata.participants.length // Ya se fueron, no restar 1
    const desc = groupMetadata.desc?.toString() || 'Sin descripción'
    const mensaje = (chat.byeText || 'Edita con el comando "setbye"').replace(/{usuario}/g, `${username}`).replace(/{grupo}/g, `${groupMetadata.subject}`).replace(/{desc}/g, `*${desc}*`)
    const caption = `❀ Adiós de *"_${groupMetadata.subject}_"*\n✰ _Usuario_ » ${username}\n● ${mensaje}\n◆ _Ahora somos ${groupSize} Miembros._\nꕥ Fecha » ${fecha}\n(˶˃⤙˂˶) Te esperamos pronto!\n> *➮ Puedes usar _#help_ para ver la lista de comandos.*`
    return { pp, caption, mentions: [userId] }
}

let handler = m => m
handler.before = async function (m, { conn, participants, groupMetadata }) {
    if (!m.messageStubType || !m.isGroup) return !0
    
    const chat = global.db.data.chats[m.chat]
    if (!chat) return !0; 

    const primaryBot = chat.primaryBot
    if (primaryBot && conn.user.jid !== primaryBot) return !0 

    const userId = m.messageStubParameters[0]

    if (chat.welcome && m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_ADD) {
        const { pp, caption, mentions } = await generarBienvenida({ conn, userId, groupMetadata, chat })
        
        const contextInfo = {
            mentionedJid: mentions,
            isForwarded: true,
            forwardingScore: 999,
            forwardedNewsletterMessageInfo: {
                newsletterJid,
                newsletterName,
                serverMessageId: -1
            },
            externalAdReply: {
                title: packname,
                body: 'I🎀 𓈒꒰ 𝐘𝐚𝐲~ 𝐁𝐢𝐞𝐧𝐯𝐞𝐧𝐢𝐝@! (≧∇≦)/',
                thumbnailUrl: getRandomIcono(),
                sourceUrl: global.redes,
                mediaType: 1,
                renderLargerThumbnail: false
            }
        };

        await conn.sendMessage(m.chat, { image: { url: pp }, caption, contextInfo }, { quoted: null })
    }

    if (chat.welcome && (m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_REMOVE || m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_LEAVE)) {
        const { pp, caption, mentions } = await generarDespedida({ conn, userId, groupMetadata, chat })
        
        const contextInfo = {
            mentionedJid: mentions,
            isForwarded: true,
            forwardingScore: 999,
            forwardedNewsletterMessageInfo: {
                newsletterJid,
                newsletterName,
                serverMessageId: -1
            },
            externalAdReply: {
                title: packname,
                body: 'I🎀 𓈒꒰ 𝐒𝐚𝐲𝐨̄𝐧𝐚𝐫𝐚... (TωT)/',
                thumbnailUrl: getRandomIcono(),
                sourceUrl: global.redes,
                mediaType: 1,
                renderLargerThumbnail: false
            }
        };

        await conn.sendMessage(m.chat, { image: { url: pp }, caption, contextInfo }, { quoted: null })
    }
}

export { generarBienvenida, generarDespedida }
export default handler