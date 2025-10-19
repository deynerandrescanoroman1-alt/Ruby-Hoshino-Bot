import fs from 'fs'
import { WAMessageStubType } from '@whiskeysockets/baileys'
const newsletterJid = '120363335626706839@newsletter';
const newsletterName = '𖥔ᰔᩚ⋆｡˚ ꒰🍒 ʀᴜʙʏ-ʜᴏꜱʜɪɴᴏ | ᴄʜᴀɴɴᴇʟ-ʙᴏᴛ 💫꒱࣭';
const packname = '⏤͟͞ू⃪  ̸̷͢𝐑𝐮𝐛y͟ 𝐇𝐨𝐬𝐡𝐢n͟ᴏ 𝐁𝐨t͟˚₊·—̳͟͞͞♡̥';
const iconos = [
'https://qu.ax/wwbar.jpg',
'https://qu.ax/iFzQw.jpeg',
'https://qu.ax/dsZyo.jpeg',
'https://qu.ax/eNdBB.jpeg',
'https://qu.ax/MSzGw.jpeg',
'https://qu.ax/JqMBW.jpeg',
'https://qu.ax/HKcSr.jpeg',
'https://qu.ax/HOuUU.jpeg',
'https://qu.ax/ojUNn.jpeg',
'https://qu.ax/HtqBi.jpeg',
'https://qu.ax/bmQOA.jpeg',
'https://qu.ax/nTFtU.jpeg',
'https://qu.ax/PYKgC.jpeg',
'https://qu.ax/exeBy.jpeg',
'https://qu.ax/SCxhf.jpeg',
'https://qu.ax/sqxSO.jpeg',
'https://qu.ax/cdSYJ.jpeg',
'https://qu.ax/dRmZY.jpeg',
'https://qu.ax/ubwLP.jpg',
'https://qu.ax/JSgSc.jpg',
'https://qu.ax/FUXJo.jpg',
'https://qu.ax/qhKUf.jpg',
'https://qu.ax/mZKgt.jpg'
];
const getRandomIcono = () => iconos[Math.floor(Math.random() * iconos.length)];
async function generarBienvenida({ conn, userId, groupMetadata, chat }) {
const username = `@${userId.split('@')[0]}`;
const pp = await conn.profilePictureUrl(userId, 'image').catch(() => 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg');
const fecha = new Date().toLocaleDateString("es-ES", { timeZone: "America/Santo_Domingo", day: 'numeric', month: 'long', year: 'numeric' });
const groupSize = groupMetadata.participants.length;
const desc = groupMetadata.desc?.toString() || 'Sin descripción';
let caption;
if (chat.welcomeText) {
caption = chat.welcomeText
.replace(/@user/g, username)
.replace(/@subject/g, groupMetadata.subject)
.replace(/@desc/g, desc);
} else {
.replace(/@user/g, username)
.replace(/@subject/g, groupMetadata.subject);
caption = `𝆺𝅥 𝆭    ִ ֗ 𝆺𝅥 𝆭    ִ ֗ 𝆺𝅥 𝆭    ִ ֗ 𝆺𝅥 𝆭    ִ ֗ 𝆺𝅥 𝆭  𝆺𝅥 𝆭    ִ ֗ 𝆺𝅥 𝆭    ִ ֗ 𝆺𝅥 𝆭𝆺𝅥 𝆭    ִ ֗ 𝆺𝅥 𝆭    ִ ֗ 𝆺𝅥 𝆭    ִ ֗ 𝆺𝅥 𝆭    ִ ֗ 𝆺𝅥 𝆭  𝆺𝅥 𝆭    ִ ֗ 𝆺𝅥 𝆭    ִ ֗ 𝆺𝅥 𝆭𝆺𝅥 
𝙃𝙤𝙡𝙖, @user! ✨\n𝘽𝙄𝙀𝙉𝙑𝙀𝙉𝙄𝘿𝙊/𝘼@ 𝘼𝙇 𝙂𝙍𝙐𝙋𝙊:\n *@subject* \n\n¡𝙀𝙨𝙥𝙚𝙧𝙖𝙢𝙤𝙨 𝙦𝙪𝙚 𝙙𝙞𝙨𝙛𝙧𝙪𝙩𝙚𝙨 𝙩𝙪 𝙚𝙨𝙩𝙖𝙙𝙞𝙖! 💖

.   ͜ ︵𝅽◌⃘࣪۟୭۪۪ׄꪆ 漢̸𝅮 ◌⃘࣪۟୭۪۪ׄꪆ︵ ͜    .
「 𝐈𝐍𝐅𝐎 𝐃𝐄𝐋 𝐆𝐑𝐔𝐏𝐎 」
.ֶָ֢❀⃝🪷  *𝙈𝙞𝙚𝙢𝙗𝙧𝙤𝙨:* ${groupSize}
.ֶָ֢❀⃝🪷  *𝙁𝙚𝙘𝙝𝙖:* ${fecha}

ㅤ  ㅤׄ ׅ ׄ ⋱＼ ׄ   ׅ ⡇ ׅ ׄ   ／⋰ ׄ   ׅ ׄ
> ᴘᴜᴇᴅᴇs crear un mensaje de bienvenida
> ᴜsᴀɴᴅᴏ: *#setwelcome*
ㅤ ︶ ྀི◟ ͜◞˚̣̣̣  ⋰ ⫶ ⋱    ˚̣̣̣◟ ͜◞ ྀི︶`;
}
return { pp, caption, mentions: [userId] };
}
async function generarDespedida({ conn, userId, groupMetadata, chat }) {
const username = `@${userId.split('@')[0]}`;
const pp = await conn.profilePictureUrl(userId, 'image').catch(() => 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg');
const fecha = new Date().toLocaleDateString("es-ES", { timeZone: "America/Santo_Domingo", day: 'numeric', month: 'long', year: 'numeric' });
const groupSize = groupMetadata.participants.length;
let caption;
if (chat.byeText) {
caption = chat.byeText
.replace(/@user/g, username)
.replace(/@subject/g, groupMetadata.subject);
} else {
.replace(/@user/g, username)
.replace(/@subject/g, groupMetadata.subject);
caption = `૮꒰ී ◞ ◟ ꒱ა 𝙃𝙖𝙨𝙩𝙖 𝙋𝙧𝙤𝙣𝙩𝙤.. 

𓍯 ꒰ 𝙎𝙀 𝙃𝘼 𝙄𝘿𝙊 @user ꒱ 🌸
𝘿𝙚𝙡 𝙂𝙍𝙐𝙋𝙊 *@subject* 𝗣𝗔𝗥𝗔 𝗩𝗘𝗥 𝗢𝗦𝗛𝗜 𝗡𝗢 𝗞𝗢 

𝘼𝙝𝙤𝙧𝙖 𝙎𝙤𝙢𝙤𝙨 ${groupSize} 𝙈𝙞𝙚𝙢𝙗𝙧𝙤𝙨
¡𝙑𝙐𝙀𝙇𝙑𝙀 𝙋𝙍𝙊𝙉𝙏𝙊! ૮₍ ˃ ⤙ ˂ ₎ა

> ᴘᴜᴇᴅᴇs ᴄʀᴇᴀʀ ᴜɴ ᴍᴇɴsᴀᴊᴇ ᴅᴇ ᴅᴇsᴘᴇᴅɪᴅᴀ
> ᴜsᴀɴᴅᴏ: *#setbye*`;
}
return { pp, caption, mentions: [userId] };
}
let handler = m => m
handler.before = async function (m, { conn, participants, groupMetadata }) {
if (!m.messageStubType || !m.isGroup) return !0
const chat = global.db.data.chats[m.chat]
if (!chat) return !0;
const primaryBot = chat.botPrimario
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
