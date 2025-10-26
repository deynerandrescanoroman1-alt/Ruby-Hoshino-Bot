import db from '../lib/database.js';

let handler = async (m, { conn, text, usedPrefix, command }) => {
let user = global.db.data.users[m.sender];
let categories = ['consumibles', 'equipamiento', 'cofres', 'mascotas'];
let category = text.trim().toLowerCase();

if (!category || !categories.includes(category)) {
let msg = `🏪 *TIENDA RPG* 🏪\n\nUsa *${usedPrefix + command} <categoria>* para ver los objetos.\n\n*Categorías Disponibles:*\n`;
categories.forEach(cat => {
msg += `› *${cat.charAt(0).toUpperCase() + cat.slice(1)}*\n`;
});
msg += `\nEjemplo: *${usedPrefix + command} consumibles*`;
return m.reply(msg);
}

let shopItems = {
consumibles: `
*CONSUMIBLES* (Usar: ${usedPrefix}use <item>)
────────────────
🧪 *Poción de Salud* (health_potion)
   › Cura 50 HP.
   › *Costo:* 750 ${m.moneda}
   
🧪 *Poción de Suerte* (luck_potion)
   › Aumenta la suerte en /crimen y /explorar por 1 hora.
   › *Costo:* 2,500 ${m.moneda}
   
🗝️ *Ganzúa Maestra* (lockpick)
   › Garantiza 1 éxito en /crimen (no evita cárcel).
   › *Costo:* 7,500 ${m.moneda}
   
🛡️ *Amuleto de Escape* (escape_amulet)
   › Evita la cárcel 1 vez (se consume al ser atrapado).
   › *Costo:* 15,000 ${m.moneda}
`,
equipamiento: `
*EQUIPAMIENTO* (Se equipa automáticamente)
────────────────
*Armas:*
🗡️ *Daga Oxidada* (weapon_daga_oxidada)
   › Daño Base: 10
   › *Costo:* 5,000 ${m.moneda}
   
⚔️ *Espada de Acero* (weapon_espada_acero)
   › Daño Base: 50
   › *Costo:* 25,000 ${m.moneda}
   
*Armaduras:*
👕 *Ropa de Tela* (armor_ropa_tela)
   › Defensa: 5%
   › *Costo:* 4,000 ${m.moneda}
   
🧥 *Armadura de Cuero* (armor_armadura_cuero)
   › Defensa: 15%
   › *Costo:* 20,000 ${m.moneda}
   
*Herramientas:*
⛏️ *Kit de Ladrón* (tool_kit_ladron)
   › Aumenta ganancias de /crimen en 10%.
   › *Costo:* 30,000 ${m.moneda}
`,
cofres: `
*COFRES Y LOTERÍA* (Usar: ${usedPrefix}use cofre)
────────────────
🎁 *Cofre Misterioso* (mysterious_chest)
   › ¿Qué habrá dentro? Podría ser cualquier cosa...
   › *Costo:* 50,000 ${m.moneda}
`,
mascotas: `
*MASCOTAS* (Próximamente...)
────────────────
🥚 *Huevo de Lobo*
   › *Costo:* 100,000 ${m.moneda}
   
🥚 *Huevo de Grifo*
   › *Costo:* 500,000 ${m.moneda}
`
};

let replyText = shopItems[category];
await conn.reply(m.chat, replyText, m, {
contextInfo: {
externalAdReply: {
title: `Tienda - ${category.toUpperCase()}`,
body: `Usa ${usedPrefix}buyitem <nombre_item> para comprar.`,
thumbnail: "https://qu.ax/fRMNm.jpg",
mediaType: 1,
sourceUrl: ''
}
}
});
};

handler.help = ['shop [categoria]'];
handler.tags = ['rpg'];
handler.command = ['shop', 'tienda'];
handler.register = true;

export default handler;