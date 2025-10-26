import db from '../lib/database.js';

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
  { name: 'Goblin', hp: 50, base_damage: 10, coin_reward: 1000, exp_reward: 75, material: 'goblin_skin', mat_chance: 0.6, mat_amount: 1 },
  { name: 'Lobo del Bosque', hp: 80, base_damage: 15, coin_reward: 1500, exp_reward: 100, material: 'wolf_fur', mat_chance: 0.8, mat_amount: 2 },
  { name: 'Orco', hp: 150, base_damage: 25, coin_reward: 3000, exp_reward: 200, material: 'orc_bone', mat_chance: 0.5, mat_amount: 1 },
  { name: 'Golem de Piedra', hp: 250, base_damage: 20, coin_reward: 5000, exp_reward: 300, material: 'stone_fragment', mat_chance: 1.0, mat_amount: 10 }
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

    // Evitar errores si las propiedades no existen
    user.equipment = user.equipment || {};
    user.materials = user.materials || {};
    user.coin = user.coin || 0;
    user.exp = user.exp || 0;
    user.health = user.health ?? 100;

    const moneda = global.moneda || 'Coins';
    const cooldown = 5 * 60 * 1000; // 5 minutos

    // ⏳ Cooldown
    if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < cooldown) {
      const remaining = segundosAHMS(Math.ceil((cooldowns[m.sender] + cooldown - Date.now()) / 1000));
      return m.reply(`⏳ Estás descansando de tu última cacería. Espera *${remaining}* para volver a cazar.`);
    }

    if (user.health <= 20) {
      return m.reply(`❤️ Tienes muy poca salud (*${user.health} HP*). Usa *${usedPrefix}heal* antes de cazar.`);
    }

    // 🗡️ Datos de equipo
    const weapon = user.equipment.weapon || 'none';
    const armor = user.equipment.armor || 'none';
    const weaponData = weaponStats[weapon] || weaponStats['none'];
    const armorData = armorStats[armor] || armorStats['none'];

    // 🐉 Monstruo aleatorio
    const monster = pickRandom(monsters);

    const user_base_damage = weaponData.damage;
    const user_dps = user_base_damage / 2; // Ataca cada 2 segundos
    const monster_base_damage = monster.base_damage;
    const monster_defense_penetration = 1 - (armorData.defense / 100);
    const monster_dps = (monster_base_damage * monster_defense_penetration) / 3; // Monstruo ataca cada 3 seg

    const rounds_to_kill_monster = monster.hp / user_dps;
    const rounds_to_kill_user = user.health / monster_dps;

    let msg = `⚔️ *¡Encuentro Salvaje!* ⚔️\n\n` +
      `Te enfrentaste a un *${monster.name}* (HP: ${monster.hp})\n\n` +
      `*Tu Equipo:*\n` +
      `› 🗡️ Arma: ${weapon}\n` +
      `› 🛡️ Armadura: ${armor}\n\n`;

    // ⚔️ Resultado del combate
    if (rounds_to_kill_monster <= rounds_to_kill_user) {
      let hp_lost = Math.floor(rounds_to_kill_monster * monster_dps);
      if (hp_lost < 1) hp_lost = 1;
      user.health = Math.max(0, user.health - hp_lost);

      const coins_won = monster.coin_reward;
      const exp_won = monster.exp_reward;
      user.coin += coins_won;
      user.exp += exp_won;

      msg += `*¡VICTORIA!* 🎉\n` +
        `Derrotaste al ${monster.name} pero perdiste *${hp_lost} HP*.\n\n` +
        `*Recompensas:*\n` +
        `› 💰 +${coins_won.toLocaleString()} ${moneda}\n` +
        `› ✨ +${exp_won} XP\n`;

      if (Math.random() < monster.mat_chance) {
        const mat_name = monster.material;
        const mat_amount = monster.mat_amount;
        user.materials[mat_name] = (user.materials[mat_name] || 0) + mat_amount;
        msg += `› 📦 +${mat_amount} ${mat_name}\n`;
      }

      msg += `\n❤️ Salud restante: ${user.health}/100`;
      await m.react('🎉');
    } else {
      const hp_lost = Math.floor(user.health * 0.5);
      user.health -= hp_lost;
      const coins_lost = Math.min(Math.floor(user.coin * 0.10), 5000);
      user.coin -= coins_lost;
      user.exp += 10;

      msg += `*¡DERROTA!* 💀\n` +
        `El ${monster.name} te dio una paliza y tuviste que huir.\n\n` +
        `*Penalización:*\n` +
        `› ❤️ -${hp_lost} HP\n` +
        `› 💰 -${coins_lost.toLocaleString()} ${moneda}\n` +
        `› ✨ +10 XP (por el esfuerzo)\n` +
        `\n❤️ Salud restante: ${user.health}/100`;

      await m.react('💀');
    }

    cooldowns[m.sender] = Date.now();
    await conn.reply(m.chat, msg, m);

  } catch (err) {
    let errorMsg = `❌ *Error en el comando ${command}:*\n\n> ${err?.message || String(err)}\n\n📜 *Detalles técnicos:*\n${err?.stack || 'No disponible'}`;
    await conn.reply(m.chat, errorMsg, m);
  }
};

handler.help = ['cazar', 'hunt'];
handler.tags = ['rpg'];
handler.command = ['cazar', 'hunt'];
handler.group = true;
handler.register = true;

export default handler;
