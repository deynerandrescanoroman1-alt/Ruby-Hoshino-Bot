import db from '../lib/database.js';

const items = {
health_potion: { cost: 750, type: 'inventory' },
luck_potion: { cost: 2500, type: 'inventory' },
lockpick: { cost: 7500, type: 'inventory' },
escape_amulet: { cost: 15000, type: 'inventory' },
mysterious_chest: { cost: 50000, type: 'inventory' },

weapon_daga_oxidada: { cost: 5000, type: 'equipment', slot: 'weapon', value: 'daga_oxidada', stats: { damage: 10 } },
weapon_espada_acero: { cost: 25000, type: 'equipment', slot: 'weapon', value: 'espada_acero', stats: { damage: 50 } },

armor_ropa_tela: { cost: 4000, type: 'equipment', slot: 'armor', value: 'ropa_tela', stats: { defense: 5 } },
armor_armadura_cuero: { cost: 20000, type: 'equipment', slot: 'armor', value: 'armadura_cuero', stats: { defense: 15 } },

tool_kit_ladron: { cost: 30000, type: 'equipment', slot: 'tool', value: 'kit_ladron', stats: { crime_boost: 10 } },
};

let handler = async (m, { conn, args, usedPrefix, command }) => {
let user = global.db.data.users[m.sender];
if (!args[0]) {
return m.reply(`Por favor, especifica el item que deseas comprar.\nUsa *${usedPrefix}shop* para ver la lista.\nEjemplo: *${usedPrefix + command} health_potion*`);
}

let itemName = args[0].toLowerCase();
if (!items[itemName]) {
return m.reply(`El item "${itemName}" no existe en la tienda.`);
}

let item = items[itemName];
let count = args[1] ? parseInt(args[1]) : 1;
if (isNaN(count) || count <= 0) {
return m.reply("La cantidad debe ser un número positivo.");
}

let totalCost = item.cost * count;

if (user.coin < totalCost) {
return m.reply(`No tienes suficientes ${m.moneda}. Necesitas *${totalCost.toLocaleString()} ${m.moneda}* para comprar *${count}x ${itemName}*.\n\nTienes: ${user.coin.toLocaleString()} ${m.moneda}`);
}

user.coin -= totalCost;

if (item.type === 'inventory') {
if (!user.inventory[itemName]) user.inventory[itemName] = 0;
user.inventory[itemName] += count;
m.reply(`✅ Compraste *${count}x ${itemName}* por *${totalCost.toLocaleString()} ${m.moneda}*.\n\nRevisa tu *${usedPrefix}inventario*`);
} 
else if (item.type === 'equipment') {
if (count > 1) return m.reply("Solo puedes comprar 1 pieza de equipamiento a la vez.");

if (user.equipment[item.slot] && user.equipment[item.slot] !== 'none') {
m.reply(`Reemplazaste tu *${user.equipment[item.slot]}* por *${item.value}*.\n*Coste:* ${totalCost.toLocaleString()} ${m.moneda}`);
} else {
m.reply(`✅ Equipaste *${item.value}*.\n*Coste:* ${totalCost.toLocaleString()} ${m.moneda}`);
}
user.equipment[item.slot] = item.value;
}
};

handler.help = ['buyitem <item> [cantidad]'];
handler.tags = ['rpg'];
handler.command = ['buyitem', 'comprar'];
handler.register = true;

export default handler;