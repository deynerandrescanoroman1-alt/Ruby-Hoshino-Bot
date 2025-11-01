const handler = async (m, { isOwner, isAdmin, conn, text, participants, args, command, usedPrefix }) => {
  if (usedPrefix == 'a' || usedPrefix == 'A') return

  const botname = global.botname || '💎 Ruby Hoshino Bot 💎'
  const packname = global.packname || 'Ruby-Hoshino-Bot-MD'
  const redes = global.redes || 'https://github.com/Dioneibi-rip'
  const icons = global.icons || 'https://telegra.ph/file/f21ddc8fd36a7a4e95c77.jpg'

  if (!(isAdmin || isOwner)) {
    global.dfail('admin', m, conn)
    throw false
  }

  await conn.sendMessage(m.chat, { react: { text: '📣', key: m.key }})

  const mensaje = args.join(' ') || '¡Atención a todos los miembros del grupo!'

  const titulo = `🌸 *─ᐅ「 𝗔𝗩𝗜𝗦𝗢 𝗚𝗘𝗡𝗘𝗥𝗔𝗟 」*`
  const encabezado = `╭─❖「 *Invocando a todos los miembros* 」\n`
  const pie = `╰─❖ 「 ${botname} 」`

  const mentions = participants.map(p => p.id)
  const listaMenciones = participants.map(p => `@${p.id.split('@')[0]}`).join('\n')

  const texto = `${titulo}\n\n💫 *Mensaje:* ${mensaje}\n\n${encabezado}${listaMenciones}\n${pie}`

  await conn.sendMessage(m.chat, {
    text: texto,
    mentions,
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
        renderLargerThumbnail: true,
      },
    },
  })
}

handler.help = ['tagall *<mensaje opcional>*']
handler.tags = ['group']
handler.command = ['todos', 'invocar', 'tagall']
handler.admin = true
handler.group = true

export default handler
