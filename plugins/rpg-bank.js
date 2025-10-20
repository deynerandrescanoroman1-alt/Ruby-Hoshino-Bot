let handler = async (m, { conn, usedPrefix }) => {
  // Obtener el usuario mencionado, citado o el mismo autor
  let who = m.mentionedJid && m.mentionedJid[0]
    ? m.mentionedJid[0]
    : m.quoted
    ? m.quoted.sender
    : m.sender

  // Verificar si el usuario existe en la base de datos
  if (!global.db.data.users[who])
    return m.reply(`ꕥ El usuario no se encuentra en mi base de datos.`)

  let user = global.db.data.users[who]
  let name
  try {
    name = (await conn.getName(who)) || who.split('@')[0]
  } catch {
    name = who.split('@')[0]
  }

  // Moneda del bot (puedes cambiarla)
  let currency = global.db.data.settings?.[conn.user.jid]?.currency || '💴'

  // Datos de usuario
  let coin = user.coin || 0
  let bank = user.bank || 0
  let total = coin + bank

  // Mensaje final
  const texto = `
ᥫ᭡  𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐜𝐢𝐨́𝐧  -  𝐁𝐚𝐥𝐚𝐧𝐜𝐞  ❀

ᰔᩚ  𝐔𝐬𝐮𝐚𝐫𝐢𝐨 » *${name}*  
⛀  𝐂𝐚𝐫𝐭𝐞𝐫𝐚 » *${currency}${coin.toLocaleString()}*
⚿  𝐁𝐚𝐧𝐜𝐨 » *${currency}${bank.toLocaleString()}*
⛁  𝐓𝐨𝐭𝐚𝐥 » *${currency}${total.toLocaleString()}*

> 〣 *Para proteger tu dinero, depósitalo en el banco usando ${usedPrefix}deposit*
`

  await conn.reply(m.chat, texto, m)
}

handler.help = ['bal']
handler.tags = ['rpg']
handler.command = ['bal', 'balance', 'bank']
handler.group = true

export default handler
