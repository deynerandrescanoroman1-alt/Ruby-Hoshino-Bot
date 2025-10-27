import db from '../lib/database.js';

function pickRandom(list) {
return list[Math.floor(Math.random() * list.length)];
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
let user = global.db.data.users[m.sender];
if (!args[0]) {
return m.reply(`Especifica el item que deseas usar.\nEjemplo: *${usedPrefix + command} health_potion*`);
}

let itemName = args[0].toLowerCase();

switch (itemName) {
case 'health_potion':
if (!user.inventory.health_potion || user.inventory.health_potion <= 0) {
return m.reply("No tienes *Pociones de Salud*.");
}
if (user.health >= 100) {
return m.reply("Ya tienes la salud al máximo.");
}
user.inventory.health_potion--;
user.health = Math.min(100, user.health + 50);
m.reply(`❤️ Usaste una *Poción de Salud*.\nTu salud ahora es *${user.health}/100*.`);
break;

case 'luck_potion':
if (!user.inventory.luck_potion || user.inventory.luck_potion <= 0) {
return m.reply("No tienes *Pociones de Suerte*.");
}
if (user.status.is_lucky && user.status.lucky_until > Date.now()) {
return m.reply("Ya estás bajo los efectos de una Poción de Suerte.");
}
user.inventory.luck_potion--;
user.status.is_lucky = true;
user.status.lucky_until = Date.now() + 1000 * 60 * 60;
m.reply(`🍀 ¡Bebiste una *Poción de Suerte*!\nTus probabilidades de éxito mejorarán durante 1 hora.`);
break;

case 'mysterious_chest':
if (!user.inventory.mysterious_chest || user.inventory.mysterious_chest <= 0) {
return m.reply("No tienes *Cofres Misteriosos*.");
}
user.inventory.mysterious_chest--;

let chance = Math.random();
let rewardText = "¡Abriste un *Cofre Misterioso* y obtuviste...\n\n";

if (chance < 0.60) {
let coins = Math.floor(Math.random() * 20000) + 10000;
user.coin += coins;
rewardText += `*Común:* ¡*${coins.toLocaleString()} ${m.moneda}*!`;
} else if (chance < 0.90) {
let amulets = 1;
user.inventory.escape_amulet += amulets;
rewardText += `*Raro:* ¡*${amulets}x Amuleto de Escape*!`;
} else if (chance < 0.99) {
let diamonds = Math.floor(Math.random() * 20) + 10;
user.diamond += diamonds;
rewardText += `*Épico:* ¡*${diamonds} Diamantes* 💎!`;
} else {
let coins = 1000000;
user.coin += coins;
rewardText += `*¡¡LEGENDARIO!!:* ¡Un millón de ${m.moneda} 💸!`;
}
m.reply(rewardText);
break;

default:
m.reply(`El item "${itemName}" no es un consumible o no existe.`);
}
};

handler.help = ['use <item>'];
handler.tags = ['rpg'];
handler.command = ['use', 'usar'];
handler.register = true;

export default handler;