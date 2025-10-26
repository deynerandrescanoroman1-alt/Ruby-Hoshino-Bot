import db from '../lib/database.js';
import moment from 'moment-timezone';

let handler = async (m, { conn, usedPrefix }) => {
let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.sender;

if (!(who in global.db.data.users)) {
return conn.reply(m.chat, `${emoji} El usuario no se encuentra en mi base de Datos.`, m);
}

let img = 'https://qu.ax/fRMNm.jpg';
let user = global.db.data.users[who];
let name = conn.getName(who);
let premium = user.premium ? '✅' : '❌';
let coin = user.coin || 0;
let bank = user.bank || 0;

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

let equip = user.equipment || {};
let equipment_text = `*Equipamiento:*
  › 🗡️ Arma: ${capitalize(equip.weapon || 'none')}
  › 🛡️ Armadura: ${capitalize(equip.armor || 'none')}
  › 🛠️ Herramienta: ${capitalize(equip.tool || 'none')}\n`;

let inv = user.inventory || {};
let inventory_text = `*Consumibles:*
  › 🧪 Poción de Salud: ${inv.health_potion || 0}
  › 🍀 Poción de Suerte: ${inv.luck_potion || 0}
  › 🛡️ Amuleto de Escape: ${inv.escape_amulet || 0}
  › 🗝️ Ganzúa: ${inv.lockpick || 0}
  › 🎁 Cofre Misterioso: ${inv.mysterious_chest || 0}\n`;

let mat = user.materials || {};
let materials_text = `*Materiales:*
  › 🔩 Hierro: ${user.iron || 0}
  › 🏅 Oro: ${user.gold || 0}
  › 🕋 Carbón: ${user.coal || 0}
  › 🪨 Piedra: ${user.stone || 0}
  › 🪵 Madera: ${mat.wood || 0}
  › 💎 Diamantes: ${user.diamond || 0}
  › ♦️ Esmeraldas: ${user.emerald || 0}\n`;

let economy_text = `*Economía y Stats:*
  › 💸 ${m.moneda} (Cartera): ${coin.toLocaleString()}
  › 🏦 ${m.moneda} (Banco): ${bank.toLocaleString()}
  › 🌟 Nivel: ${user.level || 0}
  › ✨ Experiencia: ${user.exp || 0}
  › ❤️ Salud: ${user.health || 100} / 100
  › 🎟️ Tokens: ${user.joincount || 0}
  › 🍬 Dulces: ${user.candies || 0}
  › 🎁 Regalos: ${user.gifts || 0}
  › ⚜️ Premium: ${premium}\n`;

let status_text = `*Estado:*
  › ⏳ Últ. Aventura: ${user.lastadventure ? moment(user.lastadventure).fromNow() : 'Nunca'}
  › 🍀 Con Suerte: ${user.status.is_lucky && user.status.lucky_until > Date.now() ? '✅' : '❌'}
  › 🚔 Encarcelado: ${user.status.is_jailed && user.status.jailed_until > Date.now() ? '✅' : '❌'}\n`;

let text = `╭━〔 Inventario de ${name} 〕⬣\n` +
`┠───「 Equipamiento 」\n` +
`┋ ${equipment_text.replace(/\n/g, '\n┋ ')}\n` +
`┠───「 Consumibles 」\n` +
`┋ ${inventory_text.replace(/\n/g, '\n┋ ')}\n` +
`┠───「 Materiales 」\n` +
`┋ ${materials_text.replace(/\n/g, '\n┋ ')}\n` +
`┠───「 Economía y Stats 」\n` +
`┋ ${economy_text.replace(/\n/g, '\n┋ ')}\n` +
`┠───「 Estado Actual 」\n` +
`┋ ${status_text.replace(/\n/g, '\n┋ ')}\n` +
`╰━━━━━━━━━━━━⬣\n` +
`📅 ${new Date().toLocaleString('id-ID')}`;

await conn.sendFile(m.chat, img, 'inventory.jpg', text, fkontak);
}

handler.help = ['inventario', 'inv'];
handler.tags = ['rpg'];
handler.command = ['inventario', 'inv']; 
handler.group = true;
handler.register = true;

export default handler;