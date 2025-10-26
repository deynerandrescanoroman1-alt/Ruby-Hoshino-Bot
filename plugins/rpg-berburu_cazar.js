import db from '../lib/database.js';
import fetch from 'node-fetch';

let cooldowns = {};

const weaponStats = {
'none': { damage: 5, crit_chance: 0.05 },
'daga_oxidada': { damage: 15, crit_chance: 0.10 },
'espada_acero': { damage: 50, crit_chance: 0.15 }
};

const armorStats = {
'none': { defense: 0 },
'ropa_tela': { defense: 5 },
'armadura_cuero': { defense: 15 }
};

const monsters = [
{ name: 'Slime', hp: 30, base_damage: 5, coin_reward: 500, exp_reward: 50, material: 'slime_goo', mat_chance: 0.9, mat_amount: 2, imageUrl: 'https://files.catbox.moe/4o2m4a.jpeg' },
{ name: 'Goblin', hp: 50, base_damage: 10, coin_reward: 1000, exp_reward: 75, material: 'goblin_skin', mat_chance: 0.6, mat_amount: 1, imageUrl: 'https://files.catbox.moe/j5lf45.jpg' },
{ name: 'Esqueleto', hp: 70, base_damage: 15, coin_reward: 1200, exp_reward: 90, material: 'orc_bone', mat_chance: 0.7, mat_amount: 2, imageUrl: 'https://files.catbox.moe/d5k195.jpg' },
{ name: 'Lobo del Bosque', hp: 80, base_damage: 18, coin_reward: 1500, exp_reward: 100, material: 'wolf_fur', mat_chance: 0.8, mat_amount: 1, imageUrl: 'https://files.catbox.moe/2i4gz2.jpg' },
{ name: 'Arpía', hp: 100, base_damage: 22, coin_reward: 2000, exp_reward: 130, material: 'harpy_feather', mat_chance: 0.6, mat_amount: 3, imageUrl: 'https://files.catbox.moe/c89ydj.jpg' },
{ name: 'Orco', hp: 150, base_damage: 25, coin_reward: 3000, exp_reward: 200, material: 'orc_bone', mat_chance: 0.5, mat_amount: 1, imageUrl: 'https://files.catbox.moe/s53u7p.jpg' },
{ name: 'Cangrejo Gigante', hp: 180, base_damage: 20, coin_reward: 2500, exp_reward: 180, material: 'chitin_shell', mat_chance: 0.9, mat_amount: 1, imageUrl: 'https://i.postimg.cc/9F7B0S9T/crab.jpg' },
{ name: 'Golem de Piedra', hp: 250, base_damage: 20, coin_reward: 5000, exp_reward: 300, material: 'stone', mat_chance: 1.0, mat_amount: 10, imageUrl: 'https://i.postimg.cc/8PzFB4W0/golem.jpg' },
{ name: 'Liche', hp: 200, base_damage: 40, coin_reward: 8000, exp_reward: 500, material: 'lich_phylactery', mat_chance: 0.2, mat_amount: 1, imageUrl: 'https://i.postimg.cc/tRYgq1P7/lich.jpg' },
{ name: 'Treant Antiguo', hp: 300, base_damage: 30, coin_reward: 7000, exp_reward: 450, material: 'wood', mat_chance: 1.0, mat_amount: 20, imageUrl: 'https://i.postimg.cc/1XGbnKCy/treant.jpg' }
];

function pickRandom(list) {
return list[Math.floor(Math.random() * list.length)];
}

function segundosAHMS(segundos) {
let minutos = Math.floor(segundos / 60);
let segundosRestantes = segundos % 60;
return minutos === 0 ? `${segundosRestantes}s` : `${minutos}m ${segundosRestantes}s`;
}

let handler = async (m, { conn, usedPrefix, command }) => {
try {
let user = global.db.data.users[m.sender];
if (!user) return m.reply('❌ No estás registrado. Usa *.reg* para registrarte.');

user.equipment = user.equipment || {};
user.materials = user.materials || {};
user.coin = user.coin || 0;
user.exp = user.exp || 0;
user.health = user.health ?? 100;

const moneda = m.moneda || 'Coins';
const cooldown = 3 * 60 * 1000; 

if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < cooldown) {
const remaining = segundosAHMS(Math.ceil((cooldowns[m.sender] + cooldown - Date.now()) / 1000));
return m.reply(`⏳ Estás descansando de tu última cacería. Espera *${remaining}* para volver a cazar.`);
}

if (user.health <= 20) {
return m.reply(`❤️ Tienes muy poca salud (*${user.health} HP*). Usa *${usedPrefix}heal* antes de cazar.`);
}

const weapon = user.equipment.weapon || 'none';
const armor = user.equipment.armor || 'none';
const weaponData = weaponStats[weapon] || weaponStats['none'];
const armorData = armorStats[armor] || armorStats['none'];

const monster = pickRandom(monsters);

const monsterImage = Buffer.from(await (await fetch(monster.imageUrl)).arrayBuffer());
const fkontak = { 
key: { 
participant: '0@s.whatsapp.net', 
remoteJid: 'status@broadcast', 
fromMe: false, 
id: 'Caceria' 
}, 
message: { 
locationMessage: { 
name: `⚔️ Cacería: ${monster.name}`, 
jpegThumbnail: monsterImage 
} 
}, 
participant: '0@s.whatsapp.net' 
};

let crit_chance = weaponData.crit_chance + (user.level / 500);
let defense_mult = 1 - (armorData.defense / 100);
let roll = Math.random();
let caption = '';

let hp_lost = 0;
let coins_won = 0;
let exp_won = 0;
let coins_lost = 0;
let mat_name = null;
let mat_amount = 0;

if (roll < crit_chance) {
await m.react('💥');
hp_lost = Math.floor(monster.base_damage * 0.5 * defense_mult);
coins_won = Math.floor(monster.coin_reward * 2.5);
exp_won = Math.floor(monster.exp_reward * 2);

caption = `╭─「 💥 *¡GOLPE CRÍTICO!* 💥 」
┠ 🎯 ¡Un golpe perfecto!
┠ 👹 Monstruo: *${monster.name}*
┠ 💔 Daño Recibido: *-${hp_lost} HP*
┠
┠ *¡Botín Doble!*
┠ 💰 Ganaste: *+${coins_won.toLocaleString()} ${moneda}*
┠ ✨ Ganaste: *+${exp_won} XP*
╰────────────`;

if (Math.random() < (monster.mat_chance + 0.2)) {
mat_name = monster.material;
mat_amount = monster.mat_amount * 2;
caption += `\n┠ 📦 Material: *+${mat_amount} ${mat_name}*`;
}

} else if (roll < (0.55 + crit_chance)) {
await m.react('🎉');
hp_lost = Math.floor(monster.base_damage * defense_mult);
coins_won = monster.coin_reward;
exp_won = monster.exp_reward;

caption = `╭─「 🎉 *¡VICTORIA!* 🎉 」
┠ 🤺 Derrotaste al *${monster.name}*.
┠ 💔 Daño Recibido: *-${hp_lost} HP*
┠
┠ *Recompensas:*
┠ 💰 Ganaste: *+${coins_won.toLocaleString()} ${moneda}*
┠ ✨ Ganaste: *+${exp_won} XP*
╰────────────`;

if (Math.random() < monster.mat_chance) {
mat_name = monster.material;
mat_amount = monster.mat_amount;
caption += `\n┠ 📦 Material: *+${mat_amount} ${mat_name}*`;
}

} else if (roll < (0.75 + (defense_mult / 10))) {
await m.react('💨');
exp_won = Math.floor(monster.exp_reward * 0.1); 
caption = `╭─「 💨 *¡ESCAPÓ!* 💨 」
┠ 🏃‍♂️ El *${monster.name}* fue muy ágil.
┠ 😅 Lograste evadir el combate.
┠
┠ *Resultado:*
┠ ✨ Ganaste: *+${exp_won} XP* (por el intento)
┠ ❤️ Salud: Sin cambios
╰────────────`;

} else if (roll < (0.90 + (defense_mult / 5))) {
await m.react('💀');
hp_lost = Math.floor(monster.base_damage * 1.5 * defense_mult);
coins_lost = Math.floor(user.coin * 0.05); 
exp_won = Math.floor(monster.exp_reward * 0.05); 

caption = `╭─「 💀 *¡DERROTA!* 💀 」
┠ 🤕 El *${monster.name}* te superó.
┠ 🩹 Tuviste que huir malherido.
┠
┠ *Penalización:*
┠ 💔 Perdiste: *-${hp_lost} HP*
┠ 💸 Perdiste: *-${coins_lost.toLocaleString()} ${moneda}* (5% de tu cartera)
┠ ✨ Ganaste: *+${exp_won} XP* (por sobrevivir)
╰────────────`;

} else {
await m.react('🚨');
hp_lost = Math.floor(monster.base_damage * 2.5 * defense_mult);
coins_lost = Math.floor(user.coin * 0.10); 
exp_won = 1;

caption = `╭─「 🚨 *¡EMBOSCADA!* 🚨 」
┠ 😱 ¡El *${monster.name}* te tomó por sorpresa!
┠ 💥 Te dio un golpe brutal antes de que pudieras reaccionar.
┠
┠ *Penalización Grave:*
┠ 💔 Perdiste: *-${hp_lost} HP*
┠ 💸 Perdiste: *-${coins_lost.toLocaleString()} ${moneda}* (10% de tu cartera)
┠ ✨ Ganaste: *+${exp_won} XP* (por... estar vivo?)
╰────────────`;
}

user.health = Math.max(0, user.health - hp_lost);
user.coin = Math.max(0, user.coin - coins_lost);
user.coin += coins_won;
user.exp += exp_won;
if (mat_name) {
user.materials[mat_name] = (user.materials[mat_name] || 0) + mat_amount;
}

caption += `\n\n❤️ *Tu Salud:* ${user.health}/100`;
cooldowns[m.sender] = Date.now();

await conn.sendMessage(
m.chat, 
{ 
image: monsterImage, 
caption: caption 
}, 
{ quoted: fkontak }
);

} catch (err) {
console.error(err);
let errorMsg = `❌ *Error en el comando ${command}:*\n\n> ${String(err)}`;
await conn.reply(m.chat, errorMsg, m);
}
};

handler.help = ['cazar', 'hunt'];
handler.tags = ['rpg'];
handler.command = ['cazar', 'hunt'];
handler.group = true;
handler.register = true;

export default handler;