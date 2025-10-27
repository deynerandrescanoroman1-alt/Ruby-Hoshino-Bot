import db from '../lib/database.js';

// item_a_fabricar: {
//   materials: { material_requerido: cantidad },
//   result: { type: 'inventory' | 'equipment', item: 'nombre_del_item', count: 1 }
// }
const recipes = {
'health_potion': {
materials: { 'wood': 5, 'goblin_skin': 2 },
result: { type: 'inventory', item: 'health_potion', count: 1 },
description: 'Cura 50 HP. (Requiere: 5 Wood, 2 Goblin Skin)'
},
'lockpick': {
materials: { 'iron': 3, 'stone': 5 },
result: { type: 'inventory', item: 'lockpick', count: 1 },
description: 'Garantiza 1 éxito en /crimen. (Requiere: 3 Iron, 5 Stone)'
},
'escape_amulet': {
materials: { 'gold': 5, 'gem': 1, 'orc_bone': 1 },
result: { type: 'inventory', item: 'escape_amulet', count: 1 },
description: 'Evita la cárcel 1 vez. (Requiere: 5 Gold, 1 Gem, 1 Orc Bone)'
},
'daga_oxidada': {
materials: { 'iron': 10, 'wood': 5 },
result: { type: 'equipment', slot: 'weapon', value: 'daga_oxidada' },
description: 'Arma básica, 15 Daño. (Requiere: 10 Iron, 5 Wood)'
}
};

let handler = async (m, { conn, args, usedPrefix, command }) => {
let user = global.db.data.users[m.sender];
let itemToCraft = args[0] ? args[0].toLowerCase() : null;

if (!itemToCraft) {
let msg = `📜 *Libro de Fabricación*\n\nUsa *${usedPrefix + command} <item>* para fabricar.\n\n*Recetas Disponibles:*\n`;
for (let item in recipes) {
msg += `\n› *${item}*\n  ${recipes[item].description}\n`;
}
return m.reply(msg);
}

let recipe = recipes[itemToCraft];
if (!recipe) {
return m.reply(`No existe la receta para "${itemToCraft}".`);
}

let canCraft = true;
let missingMaterials = '';
for (let mat in recipe.materials) {
let userMatAmount = user.materials[mat] || 0;
let requiredAmount = recipe.materials[mat];
if (userMatAmount < requiredAmount) {
canCraft = false;
missingMaterials += `\n› Faltan ${requiredAmount - userMatAmount} de *${mat}*`;
}
}

if (!canCraft) {
return m.reply(`No tienes suficientes materiales para fabricar *${itemToCraft}*.\n${missingMaterials}`);
}

for (let mat in recipe.materials) {
user.materials[mat] -= recipe.materials[mat];
}

if (recipe.result.type === 'inventory') {
let itemName = recipe.result.item;
let itemCount = recipe.result.count;
if (!user.inventory[itemName]) user.inventory[itemName] = 0;
user.inventory[itemName] += itemCount;
await m.reply(`✅ ¡Fabricaste *${itemCount}x ${itemName}*!`);
} 
else if (recipe.result.type === 'equipment') {
let slot = recipe.result.slot;
let value = recipe.result.value;
user.equipment[slot] = value;
await m.reply(`✅ ¡Fabricaste y equipaste *${value}*!`);
}
};

handler.help = ['fabricar [item]', 'craft [item]'];
handler.tags = ['rpg'];
handler.command = ['fabricar', 'craft'];
handler.register = true;

export default handler;