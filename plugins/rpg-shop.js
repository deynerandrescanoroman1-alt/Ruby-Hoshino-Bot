import db from '../lib/database.js';
const shopItems={
consumibles:`*CONSUMIBLES* (Usar: .use <item>)\n────────────────\n🧪 *Poción de Salud* (health_potion)\n› Cura 50 HP.\n› *Costo:* 750 Coins\n\n🧪 *Poción de Suerte* (luck_potion)\n› Aumenta la suerte en /crimen y /explorar por 1 hora.\n› *Costo:* 2,500 Coins\n\n🗝️ *Ganzúa Maestra* (lockpick)\n› Garantiza 1 éxito en /crimen (no evita cárcel).\n› *Costo:* 7,500 Coins\n\n🛡️ *Amuleto de Escape* (escape_amulet)\n› Evita la cárcel 1 vez (se consume al ser atrapado).\n› *Costo:* 15,000 Coins`,
equipamiento:`*EQUIPAMIENTO* (Se equipa automáticamente)\n────────────────\n*Armas:*\n🗡️ *Daga Oxidada* (weapon_daga_oxidada)\n› Daño Base: 10\n› *Costo:* 5,000 Coins\n\n⚔️ *Espada de Acero* (weapon_espada_acero)\n› Daño Base: 50\n› *Costo:* 25,000 Coins\n\n*Armaduras:*\n👕 *Ropa de Tela* (armor_ropa_tela)\n› Defensa: 5%\n› *Costo:* 4,000 Coins\n\n🧥 *Armadura de Cuero* (armor_armadura_cuero)\n› Defensa: 15%\n› *Costo:* 20,000 Coins\n\n*Herramientas:*\n⛏️ *Kit de Ladrón* (tool_kit_ladron)\n› Aumenta ganancias de /crimen en 10%.\n› *Costo:* 30,000 Coins`,
cofres:`*COFRES Y LOTERÍA* (Usar: .use <item>)\n────────────────\n🎁 *Cofre Misterioso* (mysterious_chest)\n› ¿Qué habrá dentro? Podría ser cualquier cosa...\n› *Costo:* 50,000 Coins`,
mascotas:`*MASCOTAS* (Próximamente...)\n────────────────\n🥚 *Huevo de Lobo*\n› *Costo:* 100,000 Coins\n\n🥚 *Huevo de Grifo*\n› *Costo:* 500,000 Coins`
};

let handler=async(m,{conn,text,usedPrefix,command})=>{
let user=global.db.data.users[m.sender];
if(!user)return m.reply('❌ No estás registrado. Usa .reg para registrarte.');
let moneda=global.moneda||'Coins';
let category=text.trim().toLowerCase();
let categories=['consumibles','equipamiento','cofres','mascotas'];

const contextInfo={
mentionedJid:[m.sender],
externalAdReply:{
title:'Tienda RPG',
body:'Selecciona una categoría',
thumbnailUrl:global.icons||'https://files.catbox.moe/yeojfu.jpg',
mediaType:1,
renderLargerThumbnail:true
}
};

if(category&&categories.includes(category)){
let replyText=shopItems[category].replace(/Coins/g,moneda);
await conn.reply(m.chat,replyText,m,{contextInfo});
return;
}

const buttons=[
{buttonId:`${usedPrefix+command} consumibles`,buttonText:{displayText:'🧃 𝘾𝙤𝙣𝙨𝙪𝙢𝙞𝙗𝙡𝙚𝙨'},type:1},
{buttonId:`${usedPrefix+command} equipamiento`,buttonText:{displayText:'⚔️ 𝙀𝙦𝙪𝙞𝙥𝙖𝙢𝙞𝙚𝙣𝙩𝙤𝙨'},type:1},
{buttonId:`${usedPrefix+command} cofres`,buttonText:{displayText:'🎁 𝘾𝙤𝙛𝙧𝙚𝙨'},type:1},
{buttonId:`${usedPrefix+command} mascotas`,buttonText:{displayText:'🥚 𝙈𝙖𝙨𝙘𝙤𝙩𝙖𝙨'},type:1}
];

const thumbnail=global.icons||'https://files.catbox.moe/yeojfu.jpg';
const introText=`🏪 *TIENDA RPG* 🏪\n\n¡Bienvenido, ${await conn.getName(m.sender)}!\nSelecciona una categoría para ver los objetos.\n\n🪙 Tienes: *${(user.coin||0).toLocaleString()} ${m.moneda}*`;

await conn.sendMessage(m.chat,{
image:{url:thumbnail},
caption:introText,
footer:'🐾 '+(global.packname||'RPG Store'),
buttons:buttons,
headerType:4,
contextInfo
},{quoted:m});
};

handler.help=['shop','tienda'];
handler.tags=['rpg'];
handler.command=['shop','tienda'];
handler.register=true;
handler.group=false;
export default handler;
