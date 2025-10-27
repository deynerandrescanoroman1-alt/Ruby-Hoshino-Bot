import db from '../lib/database.js';
import fetch from 'node-fetch';

let cooldowns = {};

// --- NUEVAS ESTADÍSTICAS CON DURABILIDAD ---
const weaponStats = {
'none': { damage: 5, crit_chance: 0.05, durability: Infinity },
'daga_oxidada': { damage: 15, crit_chance: 0.10, durability: 50 },
'espada_acero': { damage: 50, crit_chance: 0.15, durability: 100 }
};

const armorStats = {
'none': { defense: 0, durability: Infinity },
'ropa_tela': { defense: 10, durability: 40 }, // Aumentada a 10%
'armadura_cuero': { defense: 25, durability: 80 } // Aumentada a 25%
};
// --- FIN DE ESTADÍSTICAS ---

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

// Inicializa las nuevas propiedades si no existen
user.equipment = user.equipment || {};
user.equipment.weapon_durability = user.equipment.weapon_durability ?? 0;
user.equipment.armor_durability = user.equipment.armor_durability ?? 0;
user.materials = user.materials || {};
user.coin = user.coin || 0;
user.exp = user.exp || 0;
user.health = user.health ?? 100;

const moneda = m.moneda || 'Coins';
const cooldown = 3 * 60 * 1000; // 3 minutos

if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < cooldown) {
const remaining = segundosAHMS(Math.ceil((cooldowns[m.sender] + cooldown - Date.now()) / 1000));
return m.reply(`⏳ Estás descansando de tu última cacería. Espera *${remaining}* para volver a cazar.`);
}

if (user.health <= 20) {
return m.reply(`❤️ Tienes muy poca salud (*${user.health} HP*). Usa *${usedPrefix}heal* antes de cazar.`);
}

let combat_log = []; // Registro de combate
let weapon_name = user.equipment.weapon || 'none';
let armor_name = user.equipment.armor || 'none';

// --- VERIFICACIÓN DE DURABILIDAD ---
// Si el item es nuevo (!user.equipment.weapon_durability), le asigna la durabilidad máxima.
if (weapon_name !== 'none' && user.equipment.weapon_durability <= 0) {
user.equipment.weapon_durability = weaponStats[weapon_name].durability;
}
if (armor_name !== 'none' && user.equipment.armor_durability <= 0) {
user.equipment.armor_durability = armorStats[armor_name].durability;
}

// Si está rota, la trata como 'none' para este combate
if (user.equipment.weapon_durability <= 0 && weapon_name !== 'none') {
combat_log.push(`⚠️ ¡Tu *${weapon_name}* está rota! Peleas con tus puños.`);
weapon_name = 'none';
}
if (user.equipment.armor_durability <= 0 && armor_name !== 'none') {
combat_log.push(`⚠️ ¡Tu *${armor_name}* está rota! No tienes protección.`);
armor_name = 'none';
}

let weaponData = weaponStats[weapon_name];
let armorData = armorStats[armor_name];
// --- FIN VERIFICACIÓN ---

const monster = pickRandom(monsters);
const monsterImage = Buffer.from(await (await fetch(monster.imageUrl)).arrayBuffer());

let roll = Math.random();
let caption = '';

// --- EVENTOS PRE-COMBATE ---
if (roll < 0.05) { // 5% chance de Emboscada
await m.react('🚨');
let dmg_taken = Math.floor(monster.base_damage * (1 - (armorData.defense / 100)));
user.health = Math.max(0, user.health - dmg_taken);
if (armor_name !== 'none' && user.equipment.armor_durability > 0) user.equipment.armor_durability--; // Desgaste
combat_log.push(`🚨 *¡EMBOSCADA!* El ${monster.name} te ataca primero y recibes *${dmg_taken} HP* de daño.`);

} else if (roll > 0.95) { // 5% chance de que el monstruo huya
await m.react('💨');
let exp_won = Math.floor(monster.exp_reward * 0.1);
user.exp += exp_won;
cooldowns[m.sender] = Date.now();
caption = `╭─「 💨 *¡HUYÓ!* 」
┠ 👹 El *${monster.name}* te vio y huyó.
┠ ✨ Ganaste: *+${exp_won} XP* (por asustarlo)
╰────────────`;
await conn.sendMessage(m.chat, { image: monsterImage, caption: caption }, { quoted: m });
return;
}

// --- INICIO DEL COMBATE SIMULADO ---
let user_hp = user.health;
let monster_hp = monster.hp;
let turn = 0;
const MAX_TURNS = 20;

combat_log.push(`⚔️ ¡Comienza el combate contra *${monster.name}* (HP: ${monster_hp})!`);

while (user_hp > 0 && monster_hp > 0 && turn < MAX_TURNS) {
turn++;
combat_log.push(`\n--- *Turno ${turn}* ---`);

// Turno del Usuario
let is_crit = Math.random() < weaponData.crit_chance;
let dmg_dealt = Math.floor(weaponData.damage * (is_crit ? 1.5 : 1)); // Crítico hace 1.5x
monster_hp -= dmg_dealt;
if (weapon_name !== 'none' && user.equipment.weapon_durability > 0) user.equipment.weapon_durability--; // Desgaste

combat_log.push(is_crit ? `💥 ¡GOLPE CRÍTICO! Haces *${dmg_dealt}* de daño.` : `🗡️ Atacas y haces *${dmg_dealt}* de daño.`);
combat_log.push(`(Durabilidad Arma: ${user.equipment.weapon_durability || '∞'})`);

// Turno del Monstruo (si sigue vivo)
if (monster_hp > 0) {
let dmg_taken = Math.floor(monster.base_damage * (1 - (armorData.defense / 100)));
user_hp -= dmg_taken;
if (armor_name !== 'none' && user.equipment.armor_durability > 0) user.equipment.armor_durability--; // Desgaste

combat_log.push(`👹 El ${monster.name} ataca y recibes *${dmg_taken}* de daño.`);
combat_log.push(`(Durabilidad Armadura: ${user.equipment.armor_durability || '∞'})`);
}
}
// --- FIN DEL COMBATE ---

// Actualizar salud del usuario
user.health = Math.max(0, user_hp);

if (monster_hp <= 0) {
// --- VICTORIA ---
await m.react('🎉');
let coins_won = monster.coin_reward;
let exp_won = monster.exp_reward;
user.coin += coins_won;
user.exp += exp_won;

caption = `╭─「 🎉 *¡VICTORIA!* 🎉 」
┠ 🤺 Derrotaste al *${monster.name}*.
┠
┠ *Recompensas:*
┠ 💰 Ganaste: *+${coins_won.toLocaleString()} ${moneda}*
┠ ✨ Ganaste: *+${exp_won} XP*
╰────────────`;

if (Math.random() < monster.mat_chance) {
let mat_name = monster.material;
let mat_amount = monster.mat_amount;
user.materials[mat_name] = (user.materials[mat_name] || 0) + mat_amount;
caption += `\n┠ 📦 Material: *+${mat_amount} ${mat_name}*`;
}

} else if (user_hp <= 0) {
// --- DERROTA ---
await m.react('💀');
let coins_lost = Math.floor(user.coin * 0.10); // Pierde 10% de coins
let exp_won = Math.floor(monster.exp_reward * 0.1); // Gana 10% de exp
user.coin = Math.max(0, user.coin - coins_lost);
user.exp += exp_won;
user.health = 1; // Queda con 1 HP

caption = `╭─「 💀 *¡DERROTA!* 💀 」
┠ 🤕 El *${monster.name}* te ha vencido.
┠ 🩹 Huiste por los pelos, pero quedaste en 1 HP.
┠
┠ *Penalización:*
┠ 💸 Perdiste: *-${coins_lost.toLocaleString()} ${moneda}* (10% de tu cartera)
┠ ✨ Ganaste: *+${exp_won} XP* (por sobrevivir)
╰────────────`;

} else if (turn >= MAX_TURNS) {
// --- EMPATE (Huida por límite de turnos) ---
await m.react('💨');
let exp_won = Math.floor(monster.exp_reward * 0.2);
user.exp += exp_won;

caption = `╭─「 💨 *¡EMPATE!* 💨 」
┠ 🏃‍♂️ El combate contra *${monster.name}* fue muy largo.
┠ 😅 Ambos decidieron huir.
┠
┠ *Resultado:*
┠ ✨ Ganaste: *+${exp_won} XP* (por la resistencia)
╰────────────`;
}

caption += `\n\n--- *Resumen del Combate* ---\n${combat_log.join('\n')}`;
caption += `\n\n❤️ *Tu Salud Final:* ${user.health}/100`;
cooldowns[m.sender] = Date.now();

await conn.sendMessage(
m.chat, 
{ 
image: monsterImage, 
caption: caption 
}, 
{ quoted: m } // Usamos el mensaje del usuario como cita.
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