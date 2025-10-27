import db from '../lib/database.js';

const repairCosts = {
'daga_oxidada': { material: 'iron', mat_cost: 1, coin_cost: 50 },
'espada_acero': { material: 'iron', mat_cost: 2, coin_cost: 150 },
'ropa_tela': { material: 'wood', mat_cost: 2, coin_cost: 30 },
'armadura_cuero': { material: 'goblin_skin', mat_cost: 1, coin_cost: 100 }
};

let handler = async (m, { conn, args, usedPrefix, command }) => {
let user = global.db.data.users[m.sender];
if (!user) return m.reply('No estás registrado.');

let targetItem = args[0] ? args[0].toLowerCase() : null;

if (!targetItem || (targetItem !== 'arma' && targetItem !== 'armadura')) {
return m.reply(`Por favor, especifica qué quieres reparar.
Uso: *${usedPrefix + command} <arma|armadura>*

*Tu equipo actual:*
🗡️ Arma: *${user.equipment.weapon}*
   › Resistencia: ${user.equipment.weapon_durability ?? 'N/A'} / ${weaponStats[user.equipment.weapon]?.durability || '∞'}

🛡️ Armadura: *${user.equipment.armor}*
   › Resistencia: ${user.equipment.armor_durability ?? 'N/A'} / ${armorStats[user.equipment.armor]?.durability || '∞'}
`);
}

let itemName, itemDurability, maxDurability, itemKey, durabilityKey, costData;

if (targetItem === 'arma') {
itemName = user.equipment.weapon;
itemKey = 'weapon';
durabilityKey = 'weapon_durability';
costData = repairCosts[itemName];
maxDurability = weaponStats[itemName]?.durability;
} else {
itemName = user.equipment.armor;
itemKey = 'armor';
durabilityKey = 'armor_durability';
costData = repairCosts[itemName];
maxDurability = armorStats[itemName]?.durability;
}

if (!itemName || itemName === 'none' || !costData) {
return m.reply(`No tienes un(a) *${targetItem}* equipado(a) que se pueda reparar.`);
}

let currentDurability = user.equipment[durabilityKey];
if (currentDurability >= maxDurability) {
return m.reply(`Tu *${itemName}* ya está en perfectas condiciones.`);
}

let durabilityNeeded = maxDurability - currentDurability;
let materialNeeded = costData.material;
let materialCost = durabilityNeeded * costData.mat_cost;
let coinCost = durabilityNeeded * costData.coin_cost;

let userMaterials = user.materials[materialNeeded] || 0;

if (userMaterials < materialCost || user.coin < coinCost) {
return m.reply(`No tienes suficientes recursos para reparar tu *${itemName}*.
Necesitas:
› ${materialCost} x *${materialNeeded}* (Tienes: ${userMaterials})
› ${coinCost.toLocaleString()} *${m.moneda}* (Tienes: ${user.coin.toLocaleString()})`);
}

user.coin -= coinCost;
user.materials[materialNeeded] -= materialCost;
user.equipment[durabilityKey] = maxDurability;

m.reply(`✅ *¡Reparación Completa!*
Tu *${itemName}* ha sido restaurada al 100% de su durabilidad.

Gastaste:
› ${materialCost} x *${materialNeeded}*
› ${coinCost.toLocaleString()} *${m.moneda}*`);

};

handler.help = ['reparar <arma|armadura>'];
handler.tags = ['rpg'];
handler.command = ['reparar', 'repair'];
handler.register = true;

export default handler;

const weaponStats = {
'none': { durability: Infinity },
'daga_oxidada': { durability: 50 },
'espada_acero': { durability: 100 }
};
const armorStats = {
'none': { durability: Infinity },
'ropa_tela': { durability: 40 },
'armadura_cuero': { durability: 80 }
};