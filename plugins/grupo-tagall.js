import fetch from 'node-fetch'

const handler = async (m, { isOwner, isAdmin, conn, text, participants, args, command, usedPrefix }) => {
  if (usedPrefix == 'a' || usedPrefix == 'A') return

  const botname = global.botname || 'Ruby Hoshino 💎'
  const packname = global.packname || 'Ruby-Hoshino-Bot-MD'
  const redes = global.redes || 'https://github.com/Dioneibi-rip'
  const icons = global.icons || 'https://telegra.ph/file/f21ddc8fd36a7a4e95c77.jpg'

  if (!(isAdmin || isOwner)) {
    global.dfail('admin', m, conn)
    throw false
  }

  await conn.sendMessage(m.chat, { react: { text: '🔔', key: m.key }})

  let fkontak = null
  try {
    const res = await fetch('https://i.postimg.cc/rFfVL8Ps/image.jpg')
    const thumb2 = Buffer.from(await res.arrayBuffer())
    fkontak = {
      key: {
        participant: '0@s.whatsapp.net',
        remoteJid: 'status@broadcast',
        fromMe: false,
        id: 'RubyTag'
      },
      message: {
        locationMessage: {
          name: '🌸 Ruby Hoshino Tag 🌸',
          jpegThumbnail: thumb2
        }
      },
      participant: '0@s.whatsapp.net'
    }
  } catch {
    fkontak = null
  }

  const emoji = '🌸'
  const mensaje = args.join` ` || '¡Atención a todos los miembros del grupo!'
  const titulo = `💮 *─ᐅ「 𝗔𝗩𝗜𝗦𝗢 𝗚𝗘𝗡𝗘𝗥𝗔𝗟 」*`

  let texto = `╭─⊱『 *${botname} anuncia algo importante* 』⊱─╮\n\n`
  texto += `${titulo}\n\n`
  texto += `💫 *Mensaje:* ${mensaje}\n\n`
  texto += `╭─❖「 *Invocando a todos los miembros* 」\n`

  for (const member of participants) {
    texto += `│ ${emoji} @${member.id.split('@')[0]}\n`
  }

  texto += `╰─❖ 「 ${botname} 」`

  await conn.reply(m.chat, texto, fkontak ? { quoted: fkontak } : m, {
    mentions: participants.map(a => a.id),
    contextInfo: {
      forwardingScore: 2025,
      isForwarded: true,
      externalAdReply: {
        title: packname,
        body: '💠 ¡𝘼𝙩𝙚𝙣𝙘𝙞𝙤́𝙣 𝙖 𝙩𝙤𝙙𝙤𝙨! 💠',
        sourceUrl: redes,
        thumbnailUrl: icons,
        thumbnail: icons,
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  })
}

handler.help = ['tagall *<mensaje opcional>*']
handler.tags = ['group']
handler.command = ['todos', 'invocar', 'tagall']
handler.admin = true
handler.group = true

export default handler
