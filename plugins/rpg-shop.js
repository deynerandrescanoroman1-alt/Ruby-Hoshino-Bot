import db from '../lib/database.js';

const shopItems = {
consumibles: `
*CONSUMIBLES* (Usar: .use <item>)
────────────────
🧪 *Poción de Salud* (health_potion)
   › Cura 50 HP.
   › *Costo:* 750 Coins
   
🧪 *Poción de Suerte* (luck_potion)
   › Aumenta la suerte en /crimen y /explorar por 1 hora.
   › *Costo:* 2,500 Coins
   
🗝️ *Ganzúa Maestra* (lockpick)
   › Garantiza 1 éxito en /crimen (no evita cárcel).
   › *Costo:* 7,500 Coins
   
🛡️ *Amuleto de Escape* (escape_amulet)
   › Evita la cárcel 1 vez (se consume al ser atrapado).
   › *Costo:* 15,000 Coins
`,
equipamiento: `
*EQUIPAMIENTO* (Se equipa automáticamente)
────────────────
*Armas:*
🗡️ *Daga Oxidada* (weapon_daga_oxidada)
   › Daño Base: 10
   › *Costo:* 5,000 Coins
   
⚔️ *Espada de Acero* (weapon_espada_acero)
   › Daño Base: 50
   › *Costo:* 25,000 Coins
   
*Armaduras:*
👕 *Ropa de Tela* (armor_ropa_tela)
   › Defensa: 5%
   › *Costo:* 4,000 Coins
   
🧥 *Armadura de Cuero* (armor_armadura_cuero)
   › Defensa: 15%
   › *Costo:* 20,000 Coins
   
*Herramientas:*
⛏️ *Kit de Ladrón* (tool_kit_ladron)
   › Aumenta ganancias de /crimen en 10%.
   › *Costo:* 30,000 Coins
`,
cofres: `
*COFRES Y LOTERÍA* (Usar: .use <item>)
────────────────
🎁 *Cofre Misterioso* (mysterious_chest)
   › ¿Qué habrá dentro? Podría ser cualquier cosa...
   › *Costo:* 50,000 Coins
`,
mascotas: `
*MASCOTAS* (Próximamente...)
────────────────
🥚 *Huevo de Lobo*
   › *Costo:* 100,000 Coins
   
🥚 *Huevo de Grifo*
   › *Costo:* 500,000 Coins
`
};

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender];
    if (!user) return m.reply('No estás registrado. Usa .reg para registrarte.');

    let category = text.trim().toLowerCase();
    let categories = ['consumibles', 'equipamiento', 'cofres', 'mascotas'];

    const contextInfo = {
        mentionedJid: [m.sender],
        externalAdReply: {
            title: global.packname || 'Tienda RPG',
            body: global.dev || 'Elige una opción',
            thumbnail: global.icons ? (await conn.getFile(global.icons)).data : null,
            sourceUrl: global.redes || '',
            mediaType: 1,
            renderLargerThumbnail: true
        }
    };

    if (category && categories.includes(category)) {
        let replyText = shopItems[category].replace(/Coins/g, m.moneda);
        
        let categoryContextInfo = {
             mentionedJid: [m.sender],
             externalAdReply: {
                title: `Tienda - ${category.toUpperCase()}`,
                body: `Usa ${usedPrefix}buyitem <nombre_item> para comprar.`,
                thumbnail: global.icons ? (await conn.getFile(global.icons)).data : null,
                sourceUrl: global.redes || '',
                mediaType: 1,
                renderLargerThumbnail: false
            }
        };

        await conn.reply(m.chat, replyText, m, { contextInfo: categoryContextInfo });
        return; 
    }

    const buttons = [
        { buttonId: `${usedPrefix + command} consumibles`, buttonText: { displayText: '🧃 𝙘𝙤𝙣𝙨𝙪𝙢𝙞𝙗𝙡𝙚𝙨' }, type: 1 },
        { buttonId: `${usedPrefix + command} equipamiento`, buttonText: { displayText: '⚔️ 𝙚𝙦𝙪𝙞𝙥𝙖𝙢𝙞𝙚𝙣𝙩𝙤' }, type: 1 },
        { buttonId: `${usedPrefix + command} cofres`, buttonText: { displayText: '🎁 𝙘𝙤𝙛𝙧𝙚𝙨' }, type: 1 },
        { buttonId: `${usedPrefix + command} mascotas`, buttonText: { displayText: '🥚 𝙢𝙖𝙨𝙘𝙤𝙩𝙖𝙨' }, type: 1 }
    ];

    const thumbnail = global.icons || 'https://files.catbox.moe/yeojfu.jpg';
    const introText = `🏪 *TIENDA RPG* 🏪\n\n¡Bienvenido, ${conn.getName(m.sender)}!\nSelecciona una categoría para ver los objetos.\n\n🪙 Tienes: *${user.coin.toLocaleString()} ${m.moneda}*`;

    const buttonMessage = {
        image: { url: thumbnail },
        caption: introText,
        footer: '🐾 ' + (global.packname || 'Tu Bot RPG'),
        buttons: buttons,
        headerType: 4,
        contextInfo: contextInfo
    };
    
    await conn.sendMessage(m.chat, buttonMessage, { quoted: m });
};

handler.help = ['shop', 'tienda'];
handler.tags = ['rpg'];
handler.command = ['shop', 'tienda'];
handler.register = true;
handler.group = true;

export default handler;