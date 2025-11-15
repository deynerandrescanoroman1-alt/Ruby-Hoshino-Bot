import { existsSync, rmSync } from 'fs'
import path from 'path'
import ws from 'ws'

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
  if (!isOwner) return conn.reply(m.chat, '⚠️ Solo el dueño puede usar este comando.', m)

  if (!args[0]) return conn.reply(m.chat, `⚠️ Uso correcto:\n${usedPrefix}${command} <id_subbot>`, m)

  const subbotId = args[0].toLowerCase()
  const subbotPath = path.join(`./RubyJadiBots`, subbotId)

  if (!existsSync(subbotPath)) {
    return conn.reply(m.chat, `❌ No existe un subbot con ID "${subbotId}".`, m)
  }

  const index = global.conns.findIndex(s => s.user?.id?.startsWith(subbotId))
  if (index !== -1) {
    try {
      const sock = global.conns[index]
      if (sock.ws?.socket?.readyState === ws.OPEN) {
        sock.ws.close()
      }
      global.conns.splice(index, 1)
    } catch (e) {
      console.error('Error cerrando conexión subbot:', e)
    }
  }

  try {
    rmSync(subbotPath, { recursive: true, force: true })
  } catch (e) {
    console.error(e)
    return conn.reply(m.chat, `❌ Error al eliminar los archivos del subbot "${subbotId}".`, m)
  }

  conn.reply(m.chat, `✅ Subbot "${subbotId}" eliminado correctamente y desconectado.`, m)
}

handler.help = ['delsub <id_subbot>']
handler.tags = ['serbot']
handler.command = ['delsub']
handler.owner = true

export default handler