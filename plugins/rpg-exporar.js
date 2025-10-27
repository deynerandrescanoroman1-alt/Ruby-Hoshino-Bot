let cooldowns = {}

let handler = async (m, { conn, text, command }) => {
let users = global.db.data.users
let senderId = m.sender
let user = users[senderId]

let tiempoEspera = 5 * 60

if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempoEspera * 1000) {
let tiempoRestante = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempoEspera * 1000 - Date.now()) / 1000))
m.reply(`${emoji} Ya exploraste el bosque recientemente.\n⏳ Espera *${tiempoRestante}* antes de aventurarte de nuevo.`)
return
}

cooldowns[m.sender] = Date.now()

const eventos = [
{ nombre: '🌲 Tesoro bajo el Árbol Sagrado', coin: 15000, exp: 120, health: 0, materials: { wood: 10, gem: 1 }, mensaje: `¡Descubriste un cofre antiguo lleno de ${m.moneda} y materiales!` },
{ nombre: '🐺 Ataque de Lobos Hambrientos', coin: -8000, exp: 40, health: -25, materials: null, mensaje: `¡Fuiste atacado por una manada y escapaste perdiendo valiosas ${m.moneda}!` },
{ nombre: '🔮 Encuentro con una Hechicera', coin: 8000, exp: 60, health: +10, materials: { gem: 2 }, mensaje: 'Una hechicera te bendijo con riquezas, experiencia y gemas.' },
{ nombre: '☠️ Trampa Mortal de los Duendes', coin: -12000, exp: 20, health: -30, materials: null, mensaje: 'Caíste en una trampa y perdiste casi todo tu botín.' },
{ nombre: '🏹 Cazador Errante', coin: 6000, exp: 50, health: 0, materials: { wood: 5 }, mensaje: 'Un cazador te regaló provisiones y madera por ayudarlo.' },
{ nombre: '💎 Veta de Gemas', coin: 5000, exp: 150, health: 0, materials: { gem: 5, stone: 10 }, mensaje: `¡Encontraste una veta de gemas brillantes!` },
{ nombre: '🦴 Huesos Mágicos', coin: 4000, exp: 40, health: +5, materials: { orc_bone: 1 }, mensaje: 'Unos huesos antiguos brillaron y te otorgaron fortuna.' },
{ nombre: '🕳️ Foso sin Fondo', coin: -10000, exp: 0, health: -40, materials: null, mensaje: 'Resbalaste y caíste perdiendo buena parte de tu botín.' },
{ nombre: '🌿 Curandera del Bosque', coin: 0, exp: 60, health: +30, materials: null, mensaje: 'Una mujer misteriosa sanó tus heridas con magia natural.' },
{ nombre: '🪙 Mercader Ambulante', coin: 10000, exp: 70, health: 0, materials: null, mensaje: 'Vendiste objetos recolectados y ganaste buenas monedas.' },
{ nombre: '🧌 Troll del Puente', coin: -6000, exp: 20, health: -15, materials: { orc_bone: 2 }, mensaje: 'El troll te cobró peaje... a golpes, pero dejó caer unos huesos.' },
{ nombre: '🪵 Arboleda Tranquila', coin: 3000, exp: 40, health: +10, materials: { wood: 15 }, mensaje: 'Descansaste en una arboleda y recolectaste mucha madera.' },
{ nombre: '🗺️ Mapa de un Explorador Perdido', coin: 17000, exp: 90, health: 0, materials: null, mensaje: 'Encontraste un mapa secreto con una gran recompensa.' },
]

let evento = eventos[Math.floor(Math.random() * eventos.length)]

users[senderId].coin += evento.coin
users[senderId].exp += evento.exp
users[senderId].health += evento.health

let mat_msg = '';
if (evento.materials) {
for (let mat in evento.materials) {
if (!user.materials[mat]) user.materials[mat] = 0;
user.materials[mat] += evento.materials[mat];
mat_msg += `\n│ ✦ Material: +${evento.materials[mat]} ${mat}`;
}
}

let img = 'https://files.catbox.moe/357gtl.jpg'
let info = `╭─「 *🌲 Exploración del Bosque Mágico* 」─
│ ✦ Misión: *${evento.nombre}*
│ ✦ Evento: ${evento.mensaje}
│ ✦ Recompensa: ${evento.coin >= 0 ? `+¥${evento.coin.toLocaleString()} ${m.moneda}` : `-¥${Math.abs(evento.coin).toLocaleString()} ${m.moneda}`}
│ ✦ Exp: +${evento.exp} XP
│ ✦ Salud: ${evento.health >= 0 ? `+${evento.health}` : `-${Math.abs(evento.health)}`} ❤️${mat_msg}
╰─────────────────────────`

await conn.sendFile(m.chat, img, 'exploracion.jpg', info, fkontak)
global.db.write()
}

handler.tags = ['rpg']
handler.help = ['explorar']
handler.command = ['explorar', 'bosque']
handler.register = true
handler.group = true

export default handler

function segundosAHMS(segundos) {
let minutos = Math.floor(segundos / 60)
let segundosRestantes = segundos % 60
return `${minutos} minutos y ${segundosRestantes} segundos`
}